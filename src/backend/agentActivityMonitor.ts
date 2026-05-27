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
  CODE_DISPLAY_CONFIG,
} from './agentActivityTypes.js';
import type { FileOperation } from './implementationPlanTypes.js';

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
  private monitoring: boolean = false;
  private fileWatcher: vscode.FileSystemWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private currentState: AgentActivityState;

  /** FIFO buffer of recent file operations (max MAX_FILE_OPS) */
  private fileOperationBuffer: FileOperation[] = [];
  private fileOpDebounceTimer: NodeJS.Timeout | null = null;
  private pendingFileOp: FileOperation | null = null;
  private static readonly MAX_FILE_OPS = 10;
  private static readonly FILE_OP_DEBOUNCE_MS = 300;

  constructor(
    workspaceFolder: string,
    vsCodeContext?: vscode.ExtensionContext,
    gitAdapter?: GitAdapter,
  ) {
    super();
    this.workspaceFolder = workspaceFolder;
    this.vsCodeContext = vsCodeContext;
    this.gitAdapter = gitAdapter ?? this.createDefaultGitAdapter();
    this.currentState = getDefaultAgentActivityState();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Start monitoring git commits and file system activity
   */
  async startMonitoring(): Promise<void> {
    this.monitoring = true;

    // Trigger an initial update from git history
    try {
      await this.triggerUpdate();
    } catch {
      // Ignore initial git errors (repo might be empty)
    }

    // Watch docs/**/*.md and src/**/*.{ts,tsx} for file changes
    if (this.workspaceFolder) {
      const workspaceUri = vscode.Uri.file(this.workspaceFolder);
      const pattern = new vscode.RelativePattern(
        workspaceUri,
        '{docs/**/*.md,src/**/*.{ts,tsx},webview-ui/src/**/*.{ts,tsx}}'
      );
      this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
      this.fileWatcher.onDidChange(uri => this.handleFileChange(uri));
      this.fileWatcher.onDidCreate(uri => this.handleFileChange(uri));
    }
  }

  /**
   * Infer the active agent name from a changed file path.
   * Returns the closest-matching agent name or 'dev-tdd' as fallback.
   */
  private inferAgentFromPath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/');

    if (normalized.includes('docs/00-assessment')) { return 'orchestrator'; }
    if (normalized.includes('docs/01-requirements')) { return 'ba'; }
    if (normalized.includes('docs/02-architecture')) { return 'architect'; }
    if (normalized.includes('docs/03-testing')) { return 'qa'; }
    if (normalized.includes('docs/04-planning')) { return 'project-manager'; }
    if (normalized.includes('docs/05-implementation') && normalized.endsWith('implementation-plan.md')) {
      return 'dev-lead';
    }
    if (/\.test\.(ts|tsx)$/.test(normalized)) { return 'dev-tdd-red'; }
    if (/webview-ui\/src\/.*\.(ts|tsx)$/.test(normalized)) { return 'dev-tdd-green'; }
    if (/src\/.*\.(ts|tsx)$/.test(normalized)) { return 'dev-tdd-green'; }

    return 'dev-tdd';
  }

  /**
   * Handle a file-system change by synthesising an activity state and broadcasting it.
   */
  private handleFileChange(uri: vscode.Uri): void {
    const filePath = uri.fsPath;
    const agentId = this.inferAgentFromPath(filePath);
    const fileName = filePath.split(/[\\/]/).pop() ?? filePath;

    this.currentState = {
      activeAgent: { id: agentId, name: agentId, description: `Agent: ${agentId}` },
      currentAction: {
        type: 'DOCUMENTATION',
        cycle: 1,
        description: `Editing ${fileName}`,
      },
      codeSnippet: null,
      status: 'in-progress',
      timestamp: this.nowISO(),
    };

    this.scheduleDebouncedBroadcast();
  }
  
  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoring;
  }
  
  /**
   * Stop monitoring and cleanup
   */
  dispose(): void {
    this.monitoring = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.fileOpDebounceTimer) {
      clearTimeout(this.fileOpDebounceTimer);
      this.fileOpDebounceTimer = null;
    }
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
      this.fileWatcher = null;
    }
    this.fileOperationBuffer = [];
    this.pendingFileOp = null;
    this.removeAllListeners();
  }

  /**
   * Record a file operation in the FIFO buffer (max 10).
   * Debounced by 300ms to prevent update storms when many files change rapidly.
   * Used to populate the "what the agent is doing" action bubble.
   */
  trackFileOperation(op: FileOperation): void {
    // Flush immediately — debounce is handled at the VS Code event level in
    // the VS Code layer (Layer 3 wiring). The buffer itself is synchronous.
    if (this.fileOperationBuffer.length >= AgentActivityMonitor.MAX_FILE_OPS) {
      this.fileOperationBuffer.shift();
    }
    this.fileOperationBuffer.push(op);
  }

  /**
   * Return a copy of the recent file operations buffer.
   */
  getRecentFileOperations(): FileOperation[] {
    return [...this.fileOperationBuffer];
  }
  
  /**
   * Get current activity state
   */
  getCurrentState(): AgentActivityState {
    return { ...this.currentState };
  }
  
  /**
   * Get debounce duration in ms
   */
  getDebounceMs(): number {
    return CODE_DISPLAY_CONFIG.DEBOUNCE_MS;
  }
  
  /**
   * Manual trigger for testing (simulates git commit detection)
   */
  async triggerUpdate(): Promise<void> {
    try {
      const [commitMessage, codeSnippet] = await Promise.all([
        this.gitAdapter.getLatestCommitMessage().catch(() => ''),
        this.extractCodeSnippet(),
      ]);

      const state = await this.parseCommitMessage(commitMessage);

      this.currentState = {
        ...state,
        codeSnippet,
      };

      // Debounced broadcast
      this.scheduleDebouncedBroadcast();
    } catch (error) {
      this.emit('error', error);
    }
  }
  
  /**
   * Query agent metadata from .github/agents/<name>.agent.md
   */
  async getAgentMetadata(agentName: string): Promise<any | null> {
    try {
      const fs = require('fs') as typeof import('fs');
      const path = require('path') as typeof import('path');
      
      const agentFilePath = path.join(this.workspaceFolder, '.github', 'agents', `${agentName}.agent.md`);
      
      if (!fs.existsSync(agentFilePath)) {
        return null;
      }
      
      const content = fs.readFileSync(agentFilePath, 'utf-8');
      
      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (!yamlMatch) {
        return null;
      }
      
      const yaml = yamlMatch[1];
      
      // Parse YAML manually (simple key: value pairs)
      const nameMatch = yaml.match(/name:\s*(.+)/);
      const roleMatch = yaml.match(/role:\s*(.+)/);
      const colorMatch = yaml.match(/spriteColor:\s*['"]*([#\w]+)['"]*/)

;
      const iconMatch = yaml.match(/icon:\s*['"]*(.+?)['"]*$/m);
      
      if (!nameMatch || !roleMatch) {
        return null;
      }
      
      return {
        id: agentName,
        name: nameMatch[1].trim().replace(/['"]/g, ''),
        description: roleMatch[1].trim().replace(/['"]/g, ''),
        role: roleMatch[1].trim().replace(/['"]/g, ''),
        spriteColor: colorMatch ? colorMatch[1].trim() : undefined,
        icon: iconMatch ? iconMatch[1].trim() : undefined,
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Alias for extractCodeSnippet (test compatibility)
   */
  async extractLatestCodeSnippet(): Promise<CodeSnippetInfo | null> {
    return this.extractCodeSnippet();
  }

  /**
   * Parse a git commit message and construct AgentActivityState.
   * Returns state with DOCUMENTATION action for non-TDD commits.
   */
  async parseCommitMessage(message: string): Promise<AgentActivityState> {
    let action: AgentAction;
    
    if (!message) {
      action = { type: 'DOCUMENTATION', cycle: 1, description: '' };
    } else {
      const match = message.match(TDD_COMMIT_RE);
      if (!match) {
        action = { type: 'DOCUMENTATION', cycle: 1, description: message.trim() };
      } else {
        const phaseRaw = match[1].toUpperCase() as TDDPhase;
        const cycle = parseInt(match[2], 10);
        const description = match[3].trim();
        action = { type: phaseRaw, cycle: Math.max(1, cycle), description };
      }
    }

    // Construct full state
    const state: AgentActivityState = {
      activeAgent: action.type !== 'DOCUMENTATION' ? await this.inferAgentFromPhase(action.type) : null,
      currentAction: action,
      codeSnippet: null, // Will be populated by caller if needed
      status: 'in-progress',
      timestamp: this.nowISO(),
    };

    return state;
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

    if (!diffOutput.trim()) {return null;}

    // Detect file language from diff header
    const language = this.detectLanguageFromDiff(diffOutput);

    // Extract added lines (lines starting with '+' but not '+++')
    const addedLines = diffOutput
      .split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .map(line => line.slice(1)) // remove leading '+'
      .filter(line => line.trim().length > 0);

    if (addedLines.length === 0) {return null;}

    // Limit to MAX 15 LINES (AC2)
    const limitedLines = addedLines.slice(-15);

    // Truncate long lines
    const processedLines = limitedLines.map(line =>
      line.length > CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE
        ? line.slice(0, CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE) + CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR
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

      const state = await this.parseCommitMessage(commitMessage);

      const payload: AgentActivityState = {
        ...state,
        codeSnippet,
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

  /**
   * Infer active agent from TDD phase
   */
  private async inferAgentFromPhase(phase: TDDPhase): Promise<any | null> {
    const agentMap: Record<string, string> = {
      'RED': 'dev-tdd-red',
      'GREEN': 'dev-tdd-green',
      'REFACTOR': 'dev-tdd-refactor',
      'DOCUMENTATION': 'dev-lead',
    };
    
    const agentName = agentMap[phase];
    return this.getAgentMetadata(agentName);
  }
  
  /**
   * Schedule debounced broadcast (300ms)
   */
  private scheduleDebouncedBroadcast(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      const message: ActionBubbleMessage = {
        type: 'agent-activity-update',
        payload: this.currentState,
      };
      
      this.emit('activity-update', message);
    }, CODE_DISPLAY_CONFIG.DEBOUNCE_MS);
  }

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
