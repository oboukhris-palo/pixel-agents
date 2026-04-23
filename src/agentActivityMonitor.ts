/**
 * Layer 2: Agent Activity Monitor Service (US-001-002)
 * 
 * Purpose: Monitor git activity and broadcast ActionBubbleMessage to webview
 * BDD Mapping:
 *   - AC2: Extract code snippet from git diff (last 5-15 lines)
 *   - AC3: Parse commit message for TDD phase + cycle
 *   - AC4: Broadcast ActionBubbleMessage via EventEmitter (async)
 *   - AC6: Include status in broadcasts
 */

import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import {
  ActionBubbleMessage,
  AgentActivityState,
  AgentAction,
  CodeSnippetInfo,
  CodeLanguage,
  TDDPhase,
  getDefaultAgentActivityState,
} from './agentActivityTypes.js';
import { CODE_DISPLAY_CONFIG } from './constants.js';

// ── TDD commit message pattern ────────────────────────────────────────────────
// Matches: TDD-EPIC-XXX-US-XXX-RED-01: description
const TDD_COMMIT_RE = /TDD-[A-Z0-9-]+-(?:US-[\d-]+-)?(RED|GREEN|REFACTOR)-(\d+):\s*(.*)/i;

// ── File extension → language mapping ────────────────────────────────────────
const EXT_TO_LANGUAGE: Record<string, CodeLanguage> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  css: 'css',
  scss: 'css',
  html: 'html',
  htm: 'html',
};

// ── Git adapter interface (injectable for testability) ────────────────────────
export interface GitAdapter {
  getGitDiff: () => Promise<string>;
  getLatestCommitMessage: () => Promise<string>;
}

/**
 * AgentActivityMonitor
 * 
 * Extends EventEmitter to broadcast ActionBubbleMessage events.
 * Accepts optional ExtensionContext for VS Code integration (optional for testability).
 * Accepts optional GitAdapter for dependency injection in tests.
 */
export class AgentActivityMonitor extends EventEmitter {
  private readonly workspaceFolder: string;
  private readonly vsCodeContext: vscode.ExtensionContext | undefined;
  private readonly gitAdapter: GitAdapter;

  constructor(
    workspaceFolder: string,
    vsCodeContext?: vscode.ExtensionContext,
    gitAdapter?: GitAdapter,
  ) {
    super();
    this.workspaceFolder = workspaceFolder;
    this.vsCodeContext = vsCodeContext;
    this.gitAdapter = gitAdapter ?? this.createDefaultGitAdapter();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Parse a git commit message and extract TDD action context.
   * Returns DOCUMENTATION action for non-TDD commits.
   */
  parseCommitMessage(message: string): AgentAction {
    if (!message) {
      return { type: 'DOCUMENTATION', cycle: 1, description: '' };
    }

    const match = message.match(TDD_COMMIT_RE);
    if (!match) {
      return { type: 'DOCUMENTATION', cycle: 1, description: message.trim() };
    }

    const phaseRaw = match[1].toUpperCase() as TDDPhase;
    const cycle = parseInt(match[2], 10);
    const description = match[3].trim();

    return { type: phaseRaw, cycle: Math.max(1, cycle), description };
  }

  /**
   * Extract the latest code snippet from git diff output.
   * Returns null if no added lines are found.
   */
  async extractCodeSnippet(): Promise<CodeSnippetInfo | null> {
    let diffOutput: string;
    try {
      diffOutput = await this.gitAdapter.getGitDiff();
    } catch {
      return null;
    }

    if (!diffOutput.trim()) return null;

    // Detect file language from diff header
    const language = this.detectLanguageFromDiff(diffOutput);

    // Extract added lines (lines starting with '+' but not '+++')
    const addedLines = diffOutput
      .split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1)) // remove leading '+'
      .filter(line => line.trim().length > 0);

    if (addedLines.length === 0) return null;

    // Limit to MAX_LINES
    const limitedLines = addedLines.slice(-CODE_DISPLAY_CONFIG.MAX_LINES);

    // Truncate long lines
    const processedLines = limitedLines.map(line =>
      line.length > CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE
        ? line.slice(0, CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE) + CODE_DISPLAY_CONFIG.TRUNCATION_SUFFIX
        : line,
    );

    return {
      language,
      content: processedLines.join('\n'),
    };
  }

  /**
   * Gather current agent activity state and emit an ActionBubbleMessage.
   */
  async broadcastUpdate(): Promise<void> {
    try {
      const [commitMessage, codeSnippet] = await Promise.all([
        this.gitAdapter.getLatestCommitMessage().catch(() => ''),
        this.extractCodeSnippet(),
      ]);

      const action = this.parseCommitMessage(commitMessage);

      const payload: AgentActivityState = {
        activeAgent: null, // Agent metadata resolved separately when VS Code API available
        currentAction: action,
        codeSnippet,
        status: 'in-progress',
        timestamp: this.nowISO(),
      };

      const message: ActionBubbleMessage = {
        type: 'agent-activity-update',
        payload,
      };

      this.emit('agent-activity-update', message);
    } catch {
      // Graceful degradation: emit idle state
      const idle = getDefaultAgentActivityState();
      const message: ActionBubbleMessage = {
        type: 'agent-activity-update',
        payload: idle,
      };
      this.emit('agent-activity-update', message);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private detectLanguageFromDiff(diff: string): CodeLanguage {
    const headerMatch = diff.match(/diff --git a\/.+\.(\w+) b\//);
    if (headerMatch) {
      const ext = headerMatch[1].toLowerCase();
      return EXT_TO_LANGUAGE[ext] ?? 'typescript';
    }
    return 'typescript';
  }

  private nowISO(): string {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  private createDefaultGitAdapter(): GitAdapter {
    const { execFile } = require('child_process') as typeof import('child_process');
    const { promisify } = require('util') as typeof import('util');
    const execFileAsync = promisify(execFile);
    const cwd = this.workspaceFolder;

    return {
      getGitDiff: async () => {
        try {
          const { stdout } = await execFileAsync('git', ['diff', 'HEAD~1', 'HEAD', '--unified=2'], { cwd });
          return stdout;
        } catch {
          return '';
        }
      },
      getLatestCommitMessage: async () => {
        try {
          const { stdout } = await execFileAsync('git', ['log', '-1', '--pretty=%s'], { cwd });
          return stdout.trim();
        } catch {
          return '';
        }
      },
    };
  }
}
