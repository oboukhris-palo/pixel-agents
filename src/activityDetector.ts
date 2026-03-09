import * as path from 'path';
import * as vscode from 'vscode';
import type { AgentState } from './types.js';
import {
	ACTIVITY_IDLE_THRESHOLD_MS,
	EDIT_BATCH_WINDOW_MS,
	TOOL_DONE_DELAY_MS,
} from './constants.js';

// ── Internal State ──────────────────────────────────────────

/** Currently active synthetic tool ID for file edit batching */
let currentEditToolId: string | null = null;
let currentEditAgentId: number | null = null;
let editBatchTimer: ReturnType<typeof setTimeout> | null = null;

/** Map of active terminal execution tool IDs (pid → toolId) */
const activeTerminalTools = new Map<number, { agentId: number; toolId: string }>();

/** Idle detection interval */
let idleInterval: ReturnType<typeof setInterval> | null = null;

/** Guard: listeners registered only once */
let registered = false;

// ── Public API ──────────────────────────────────────────────

/**
 * Register all VS Code event listeners for activity detection.
 * Call once after the first agent is created. Idempotent — subsequent calls are no-ops.
 *
 * Routes activity to whichever agent was most recently active (highest `lastActivityTimestamp`).
 * Falls back to the first agent when timestamps are tied.
 */
export function registerActivityListeners(
	context: vscode.ExtensionContext,
	agents: Map<number, AgentState>,
	waitingTimers: Map<number, ReturnType<typeof setTimeout>>,
	permissionTimers: Map<number, ReturnType<typeof setTimeout>>,
	getWebview: () => vscode.Webview | undefined,
): void {
	if (registered) {return;}
	registered = true;

	// ── File Edit Detection ────────────────────────────────────
	// Fires whenever any text document changes (user OR Copilot edits).
	// We treat all edits as potential agent activity — see migration plan §Phase 2 notes.
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((e) => {
			if (e.contentChanges.length === 0) {return;}
			// Skip non-file schemes (output panels, untitled docs, etc.)
			if (e.document.uri.scheme !== 'file') {return;}
			// Skip if no agents exist
			const agentId = pickActiveAgent(agents);
			if (agentId === null) {return;}

			const fileName = path.basename(e.document.uri.fsPath);
			touchActivity(agentId, agents, waitingTimers, getWebview());
			batchEditActivity(agentId, fileName, agents, getWebview());
		}),
	);

	// ── File Creation Detection ────────────────────────────────
	context.subscriptions.push(
		vscode.workspace.onDidCreateFiles((e) => {
			const agentId = pickActiveAgent(agents);
			if (agentId === null) {return;}
			for (const file of e.files) {
				const fileName = path.basename(file.fsPath);
				const toolId = `write_${Date.now()}`;
				touchActivity(agentId, agents, waitingTimers, getWebview());
				emitToolStart(agentId, toolId, `Writing ${fileName}`, 'Write', agents, getWebview());
				setTimeout(() => emitToolDone(agentId, toolId, agents, getWebview()), TOOL_DONE_DELAY_MS);
			}
		}),
	);

	// ── File Deletion Detection ────────────────────────────────
	context.subscriptions.push(
		vscode.workspace.onDidDeleteFiles((e) => {
			const agentId = pickActiveAgent(agents);
			if (agentId === null) {return;}
			for (const file of e.files) {
				const fileName = path.basename(file.fsPath);
				const toolId = `delete_${Date.now()}`;
				touchActivity(agentId, agents, waitingTimers, getWebview());
				emitToolStart(agentId, toolId, `Deleting ${fileName}`, 'Bash', agents, getWebview());
				setTimeout(() => emitToolDone(agentId, toolId, agents, getWebview()), TOOL_DONE_DELAY_MS);
			}
		}),
	);

	// ── File Open Detection (Read) ─────────────────────────────
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((doc) => {
			if (doc.uri.scheme !== 'file') {return;}
			const agentId = pickActiveAgent(agents);
			if (agentId === null) {return;}

			const fileName = path.basename(doc.uri.fsPath);
			const toolId = `read_${Date.now()}`;
			touchActivity(agentId, agents, waitingTimers, getWebview());
			emitToolStart(agentId, toolId, `Reading ${fileName}`, 'Read', agents, getWebview());
			// Reads are visible slightly longer than writes
			setTimeout(() => emitToolDone(agentId, toolId, agents, getWebview()), TOOL_DONE_DELAY_MS * 3);
		}),
	);

	// ── Terminal Command Start Detection (Bash) ──────────────
	// Stable VS Code API since 1.93 — fires when a command runs in any terminal.
	context.subscriptions.push(
		vscode.window.onDidStartTerminalShellExecution((e) => {
			const agentId = pickActiveAgent(agents);
			if (agentId === null) {return;}

			const command = e.execution.commandLine?.value || 'command';
			const truncated = command.length > 30 ? command.slice(0, 30) + '…' : command;
			const toolId = `bash_${Date.now()}`;

			touchActivity(agentId, agents, waitingTimers, getWebview());
			emitToolStart(agentId, toolId, `Running: ${truncated}`, 'Bash', agents, getWebview());

			// Track pid → toolId so we can complete it when the command ends
			void e.terminal.processId.then((pid) => {
				if (pid !== undefined) {
					activeTerminalTools.set(pid, { agentId, toolId });
				}
			});
		}),
	);

	// ── Terminal Command End Detection ─────────────────────────
	context.subscriptions.push(
		vscode.window.onDidEndTerminalShellExecution((e) => {
			void e.terminal.processId.then((pid) => {
				if (pid === undefined) {return;}
				const entry = activeTerminalTools.get(pid);
				if (!entry) {return;}
				activeTerminalTools.delete(pid);
				const { agentId, toolId } = entry;
				touchActivity(agentId, agents, waitingTimers, getWebview());
				emitToolDone(agentId, toolId, agents, getWebview());
			});
		}),
	);

	// ── Idle Detection ─────────────────────────────────────────
	// Polls every 2s; marks an agent as "waiting" after ACTIVITY_IDLE_THRESHOLD_MS of silence.
	idleInterval = setInterval(() => {
		for (const [agentId, agent] of agents) {
			if (agent.isWaiting) {continue;}
			if (agent.activeToolIds.size > 0) {continue;}
			const elapsed = Date.now() - agent.lastActivityTimestamp;
			if (elapsed > ACTIVITY_IDLE_THRESHOLD_MS) {
				agent.isWaiting = true;
				getWebview()?.postMessage({
					type: 'agentStatus',
					id: agentId,
					status: 'waiting',
				});
			}
		}
	}, 2000);

	context.subscriptions.push({
		dispose: () => {
			if (idleInterval) {
				clearInterval(idleInterval);
				idleInterval = null;
			}
			// Reset module-level state so tests / re-activation work cleanly
			registered = false;
		},
	});
}

// ── Internal Helpers ────────────────────────────────────────

/**
 * Pick which agent should receive the next activity event.
 * Returns the agent with the most recent `lastActivityTimestamp`, or null if no agents.
 */
function pickActiveAgent(agents: Map<number, AgentState>): number | null {
	if (agents.size === 0) {return null;}
	if (agents.size === 1) {return [...agents.keys()][0];}

	let latestId: number | null = null;
	let latestTs = -1;
	for (const [id, agent] of agents) {
		if (agent.lastActivityTimestamp > latestTs) {
			latestTs = agent.lastActivityTimestamp;
			latestId = id;
		}
	}
	return latestId;
}

/** Update an agent's last-activity timestamp and resume from waiting state. */
function touchActivity(
	agentId: number,
	agents: Map<number, AgentState>,
	waitingTimers: Map<number, ReturnType<typeof setTimeout>>,
	webview: vscode.Webview | undefined,
): void {
	const agent = agents.get(agentId);
	if (!agent) {return;}
	agent.lastActivityTimestamp = Date.now();
	// Clear any pending waiting timer
	const timer = waitingTimers.get(agentId);
	if (timer) {
		clearTimeout(timer);
		waitingTimers.delete(agentId);
	}
	if (agent.isWaiting) {
		// Agent resumed from waiting — activity will implicitly signal active via toolStart
		agent.isWaiting = false;
	}
	// Suppress unused-parameter warning; webview may be needed for future wake messages
	void webview;
}

/**
 * Batch rapid file edits into a single synthetic "Editing" tool activity.
 * Extends the batch window on each new edit, completing after EDIT_BATCH_WINDOW_MS silence.
 */
function batchEditActivity(
	agentId: number,
	fileName: string,
	agents: Map<number, AgentState>,
	webview: vscode.Webview | undefined,
): void {
	// If the batch belongs to a different agent, close it first
	if (currentEditAgentId !== null && currentEditAgentId !== agentId && currentEditToolId) {
		if (editBatchTimer) {
			clearTimeout(editBatchTimer);
			editBatchTimer = null;
		}
		emitToolDone(currentEditAgentId, currentEditToolId, agents, webview);
		currentEditToolId = null;
		currentEditAgentId = null;
	}

	// Extend existing batch timer
	if (editBatchTimer) {
		clearTimeout(editBatchTimer);
	}

	if (!currentEditToolId) {
		currentEditToolId = `edit_${Date.now()}`;
		currentEditAgentId = agentId;
		emitToolStart(agentId, currentEditToolId, `Editing ${fileName}`, 'Edit', agents, webview);
	}

	const toolId = currentEditToolId;
	editBatchTimer = setTimeout(() => {
		emitToolDone(agentId, toolId, agents, webview);
		currentEditToolId = null;
		currentEditAgentId = null;
		editBatchTimer = null;
	}, EDIT_BATCH_WINDOW_MS);
}

function emitToolStart(
	agentId: number,
	toolId: string,
	status: string,
	toolName: string,
	agents: Map<number, AgentState>,
	webview: vscode.Webview | undefined,
): void {
	const agent = agents.get(agentId);
	if (!agent) {return;}

	agent.activeToolIds.add(toolId);
	agent.activeToolStatuses.set(toolId, status);
	agent.activeToolNames.set(toolId, toolName);

	webview?.postMessage({ type: 'agentStatus', id: agentId, status: 'active' });
	webview?.postMessage({ type: 'agentToolStart', id: agentId, toolId, status });
}

function emitToolDone(
	agentId: number,
	toolId: string,
	agents: Map<number, AgentState>,
	webview: vscode.Webview | undefined,
): void {
	const agent = agents.get(agentId);
	if (!agent) {return;}

	agent.activeToolIds.delete(toolId);
	agent.activeToolStatuses.delete(toolId);
	agent.activeToolNames.delete(toolId);

	// Small delay prevents React from batching away brief active states
	setTimeout(() => {
		webview?.postMessage({ type: 'agentToolDone', id: agentId, toolId });
	}, TOOL_DONE_DELAY_MS);
}
