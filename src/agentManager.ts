import * as path from 'path';
import * as vscode from 'vscode';
import type { AgentState, PersistedAgent } from './types.js';
import { cancelWaitingTimer, cancelPermissionTimer } from './timerManager.js';
import { TERMINAL_NAME_PREFIX, WORKSPACE_KEY_AGENTS, WORKSPACE_KEY_AGENT_SEATS } from './constants.js';
import { migrateAndLoadLayout } from './layoutPersistence.js';

export async function launchNewAgent(
nextAgentIdRef: { current: number },
agents: Map<number, AgentState>,
	waitingTimers: Map<number, ReturnType<typeof setTimeout>>,
	permissionTimers: Map<number, ReturnType<typeof setTimeout>>,
	webview: vscode.Webview | undefined,
	persistAgents: () => void,
	folderPath?: string,
): Promise<void> {
	const folders = vscode.workspace.workspaceFolders;
	const cwd = folderPath || folders?.[0]?.uri.fsPath;
	const isMultiRoot = !!(folders && folders.length > 1);

	const id = nextAgentIdRef.current++;
	const folderName = isMultiRoot && cwd ? path.basename(cwd) : undefined;
	const agent: AgentState = {
		id,
		activeToolIds: new Set(),
		activeToolStatuses: new Map(),
		activeToolNames: new Map(),
		isWaiting: false,
		permissionSent: false,
		lastActivityTimestamp: Date.now(),
		folderName,
	};

	agents.set(id, agent);
	persistAgents();
	console.log(`[Pixel Agents] Agent ${id} created (${TERMINAL_NAME_PREFIX} #${id})`);
	webview?.postMessage({ type: 'agentCreated', id, folderName });

	// Open Copilot Chat panel so the user can interact with it
	await vscode.commands.executeCommand('workbench.action.chat.open');
}

export function removeAgent(
agentId: number,
agents: Map<number, AgentState>,
	waitingTimers: Map<number, ReturnType<typeof setTimeout>>,
	permissionTimers: Map<number, ReturnType<typeof setTimeout>>,
	persistAgents: () => void,
): void {
	if (!agents.has(agentId)) {return;}

	cancelWaitingTimer(agentId, waitingTimers);
	cancelPermissionTimer(agentId, permissionTimers);
	agents.delete(agentId);
	persistAgents();
}

export function persistAgents(
agents: Map<number, AgentState>,
	context: vscode.ExtensionContext,
): void {
	const persisted: PersistedAgent[] = [];
	for (const agent of agents.values()) {
		persisted.push({
id: agent.id,
folderName: agent.folderName,
});
	}
	context.workspaceState.update(WORKSPACE_KEY_AGENTS, persisted);
}

export function restoreAgents(
context: vscode.ExtensionContext,
nextAgentIdRef: { current: number },
agents: Map<number, AgentState>,
	webview: vscode.Webview | undefined,
	doPersist: () => void,
): void {
	const persisted = context.workspaceState.get<PersistedAgent[]>(WORKSPACE_KEY_AGENTS, []);
	if (persisted.length === 0) {return;}

	let maxId = 0;

	for (const p of persisted) {
		const agent: AgentState = {
			id: p.id,
			activeToolIds: new Set(),
			activeToolStatuses: new Map(),
			activeToolNames: new Map(),
			isWaiting: false,
			permissionSent: false,
			lastActivityTimestamp: Date.now(),
			folderName: p.folderName,
		};

		agents.set(p.id, agent);
		console.log(`[Pixel Agents] Restored agent ${p.id}`);
		if (p.id > maxId) {maxId = p.id;}
	}

	// Advance counter past restored IDs
	if (maxId >= nextAgentIdRef.current) {
		nextAgentIdRef.current = maxId + 1;
	}

	doPersist();
}

export function sendExistingAgents(
agents: Map<number, AgentState>,
	context: vscode.ExtensionContext,
	webview: vscode.Webview | undefined,
): void {
	if (!webview) {return;}
	const agentIds: number[] = [];
	for (const id of agents.keys()) {
		agentIds.push(id);
	}
	agentIds.sort((a, b) => a - b);

	const agentMeta = context.workspaceState.get<Record<string, { palette?: number; seatId?: string }>>(WORKSPACE_KEY_AGENT_SEATS, {});

	const folderNames: Record<number, string> = {};
	for (const [id, agent] of agents) {
		if (agent.folderName) {
			folderNames[id] = agent.folderName;
		}
	}
	console.log(`[Pixel Agents] sendExistingAgents: agents=${JSON.stringify(agentIds)}, meta=${JSON.stringify(agentMeta)}`);

	webview.postMessage({
type: 'existingAgents',
agents: agentIds,
agentMeta,
folderNames,
});

	sendCurrentAgentStatuses(agents, webview);
}

export function sendCurrentAgentStatuses(
agents: Map<number, AgentState>,
	webview: vscode.Webview | undefined,
): void {
	if (!webview) {return;}
	for (const [agentId, agent] of agents) {
		// Re-send active tools
		for (const [toolId, status] of agent.activeToolStatuses) {
			webview.postMessage({
type: 'agentToolStart',
id: agentId,
toolId,
status,
});
		}
		// Re-send waiting status
		if (agent.isWaiting) {
			webview.postMessage({
type: 'agentStatus',
id: agentId,
status: 'waiting',
});
		}
	}
}

export function sendLayout(
context: vscode.ExtensionContext,
webview: vscode.Webview | undefined,
defaultLayout?: Record<string, unknown> | null,
): void {
	if (!webview) {return;}
	const layout = migrateAndLoadLayout(context, defaultLayout);
	webview.postMessage({
type: 'layoutLoaded',
layout,
});
}
