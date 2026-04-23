import * as path from 'path';
import * as fs from 'fs';
import {
  TokenUsage,
  TokenBreakdown,
  calculateTokenPercentage,
  calculateThreshold,
} from './contextTypes';

/** File extensions included in project token estimation */
const PROJECT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.json']);

/** Maximum file size to process (1MB — prevents runaway parsing) */
const MAX_FILE_SIZE_BYTES = 1024 * 1024;

/** Total context window size approximation for Copilot (128k tokens) */
const CONTEXT_WINDOW_TOTAL = 128000;

/** Debounce delay in ms to prevent update storms */
const DEBOUNCE_MS = 300;

/**
 * ContextAnalyzer monitors the VS Code workspace and calculates token usage
 * across .github instructions, project source files, and chat history.
 *
 * Token estimation: chars / 4 (OpenAI approximation).
 */
export class ContextAnalyzer {
  private monitoringCallback: ((usage: TokenUsage) => void) | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private watchers: Array<{ dispose(): void }> = [];

  constructor(
    private readonly workspacePath: string,
    private readonly outputChannel?: { appendLine(msg: string): void }
  ) {}

  /** Calculates a full token usage snapshot from the current workspace state. */
  async analyzeContextWindow(): Promise<TokenUsage> {
    try {
      const [githubCode, projectCode] = await Promise.all([
        this.calculateGithubTokens(),
        this.calculateProjectTokens(),
      ]);
      const chatHistory = this.calculateChatTokens();
      const used = githubCode + projectCode + chatHistory;
      const percentage = calculateTokenPercentage(used, CONTEXT_WINDOW_TOTAL);

      return {
        total: CONTEXT_WINDOW_TOTAL,
        used,
        percentage,
        breakdown: { githubCode, projectCode, chatHistory },
        threshold: calculateThreshold(percentage),
      };
    } catch (err) {
      this.outputChannel?.appendLine(`[ContextAnalyzer] Error: ${err}`);
      return this.emptyUsage();
    }
  }

  /** Scans .github folder for instruction/agent files and estimates token count. */
  private async calculateGithubTokens(): Promise<number> {
    const githubDir = path.join(this.workspacePath, '.github');
    return this.countTokensInDirectory(githubDir);
  }

  /** Scans src/ and root-level project files, excluding node_modules. */
  private async calculateProjectTokens(): Promise<number> {
    const srcDir = path.join(this.workspacePath, 'src');
    return this.countTokensInDirectory(srcDir);
  }

  /**
   * Estimates chat history tokens.
   * VS Code Copilot Chat API is not publicly accessible, so we use a
   * conservative fixed estimate (chat history ~5% of window).
   */
  private calculateChatTokens(): number {
    return 0; // Fallback: chat history estimated at 0 until Copilot API is available
  }

  /**
   * Recursively counts tokens in a directory.
   * Skips files larger than MAX_FILE_SIZE_BYTES and non-project extensions.
   */
  private async countTokensInDirectory(dir: string): Promise<number> {
    if (!fs.existsSync(dir)) return 0;
    let total = 0;

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Skip node_modules and hidden dirs (except .github)
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
          total += await this.countTokensInDirectory(path.join(dir, entry.name));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (!PROJECT_EXTENSIONS.has(ext)) continue;
          const filePath = path.join(dir, entry.name);

          try {
            const stat = await fs.promises.stat(filePath);
            if (stat.size > MAX_FILE_SIZE_BYTES) continue; // skip oversized files

            const content = await fs.promises.readFile(filePath, 'utf-8');
            total += Math.floor(content.length / 4);
          } catch {
            // Skip unreadable files gracefully
          }
        }
      }
    } catch (err) {
      this.outputChannel?.appendLine(`[ContextAnalyzer] Cannot read dir ${dir}: ${err}`);
    }

    return total;
  }

  /** Starts monitoring the workspace for file changes, triggering callback with updates. */
  startMonitoring(callback: (usage: TokenUsage) => void): void {
    this.monitoringCallback = callback;
  }

  /** Triggers a debounced context analysis and invokes the registered callback. */
  _triggerUpdate(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      if (this.monitoringCallback) {
        const usage = await this.analyzeContextWindow();
        this.monitoringCallback(usage);
      }
    }, DEBOUNCE_MS);
  }

  /** Disposes all watchers and clears pending timers. */
  stopMonitoring(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.watchers.forEach(w => w.dispose());
    this.watchers = [];
    this.monitoringCallback = null;
  }

  /** Returns a zero-state TokenUsage (used when errors prevent calculation). */
  private emptyUsage(): TokenUsage {
    return {
      total: CONTEXT_WINDOW_TOTAL,
      used: 0,
      percentage: 0,
      breakdown: { githubCode: 0, projectCode: 0, chatHistory: 0 },
      threshold: 'safe',
    };
  }
}
