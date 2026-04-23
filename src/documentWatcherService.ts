/**
 * Layer 2: Document Watcher Service (US-001-003)
 *
 * Purpose: Monitor /docs/ directory for file-system changes, batch events
 * with a configurable debounce window, and notify registered listeners.
 *
 * Design notes:
 * - Uses VS Code's FileSystemWatcher when a workspace root is supplied with
 *   enableWatcher=true (runtime).  When running in tests the watcher is omitted
 *   and events are injected via simulateChange() for pure-unit testing.
 * - Follows the pattern established by TaskProgressionTracker (dependency-
 *   injected watcher, debounced event emission via NodeJS.Timeout).
 * - Never crashes: errors are caught, logged, and the service continues.
 *
 * BDD Mapping:
 *   - AC2: Dashboard latency <500ms — service emits within 300ms debounce window
 *   - AC3: Debouncing batches events in 300ms window
 *   - AC4: Added / Modified / Deleted classified correctly
 *   - AC5: Performance — no synchronous heavy work on hot path
 *   - AC6: Permission errors caught, service continues
 *   - AC8: Concurrent writes batched into single update
 *   - AC9: parseMetricsFromContent runs <50ms
 */

import * as vscode from 'vscode';
import {
  FileChangeEvent,
  createDocumentChange,
  getDefaultParsedMetrics,
  isDocumentFile,
  type DocumentChange,
  type ParsedMetrics,
} from './documentChangeTypes.js';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Debounce window (ms) — matches AC3 requirement of 300ms */
const DEBOUNCE_WINDOW_MS = 300;

/** Maximum queue size to prevent unbounded memory growth */
const MAX_QUEUE_SIZE = 100;

// ── Patterns for metrics parsing ──────────────────────────────────────────────
// Designed to prevent ReDoS: no nested quantifiers, bounded repetition
const STORY_HEADER_PATTERN = /###\s+(US-[\w-]+):/g;
const STATUS_COMPLETED_PATTERN = /\*\*Status\*\*:\s*(?:completed|implemented|delivered)/gi;

/** Maximum content length to parse (prevent DoS via massive files) */
const MAX_CONTENT_LENGTH = 1_000_000; // 1MB

// ── Type for listener callbacks ───────────────────────────────────────────────
type ChangesListener = (changes: DocumentChange[]) => void;

/**
 * DocumentWatcherService
 *
 * Monitors the /docs/ directory for .md, .yml, .yaml, and .feature changes.
 * Events are debounced and broadcast to all registered listeners.
 *
 * @example
 * const svc = new DocumentWatcherService('/workspace', true);
 * const unsubscribe = svc.onChanges(changes => console.log(changes));
 * svc.start();
 * // … later
 * svc.stop();
 * unsubscribe();
 */
export class DocumentWatcherService {
  private readonly workspaceRoot: string;
  private readonly enableVSCodeWatcher: boolean;

  private watching = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private eventQueue: DocumentChange[] = [];
  private readonly listeners = new Set<ChangesListener>();
  private vsCodeWatcher: vscode.FileSystemWatcher | null = null;

  constructor(workspaceRoot: string, enableVSCodeWatcher = false) {
    this.workspaceRoot = workspaceRoot;
    this.enableVSCodeWatcher = enableVSCodeWatcher;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /** True while the watcher is active. */
  get isWatching(): boolean {
    return this.watching;
  }

  /**
   * Start watching the /docs/ directory.
   * Idempotent — safe to call multiple times.
   */
  start(): void {
    if (this.watching) {
      return;
    }
    this.watching = true;

    if (this.enableVSCodeWatcher) {
      this.attachVSCodeWatcher();
    }
  }

  /**
   * Stop watching and release all resources.
   * Idempotent — safe to call when not started.
   */
  stop(): void {
    if (!this.watching && this.vsCodeWatcher === null) {
      return;
    }
    this.watching = false;
    this.clearDebounce();
    this.vsCodeWatcher?.dispose();
    this.vsCodeWatcher = null;
  }

  /**
   * Register a listener that is called with each debounced batch of changes.
   * Returns an unsubscribe function.
   */
  onChanges(listener: ChangesListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Inject a change event directly (used in tests and for VS Code callbacks).
   * Events are enqueued and emitted after the debounce window.
   */
  simulateChange(change: DocumentChange): void {
    this.enqueueChange(change);
  }

  /**
   * Handle an error from the file system (e.g. permission denied).
   * Logs the error without interrupting the watcher.
   */
  notifyError(error: Error): void {
    console.error('[DocumentWatcher] File system error:', error);
  }

  /**
   * Parse high-level project metrics from the content of user-stories.md.
   * Designed to run in <50ms (AC9).
   *
   * Security: Input is sanitized to prevent ReDoS attacks and malicious content.
   *
   * @param content - Raw file content string
   */
  parseMetricsFromContent(content: string): ParsedMetrics {
    if (!content) {
      return getDefaultParsedMetrics();
    }

    // Sanitize input: truncate to max length (prevent DoS)
    const sanitized = content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH)
      : content;

    // Additional sanitization: remove potential control characters that could cause regex issues
    const cleaned = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    try {
      // Count story headers
      const storyMatches = Array.from(cleaned.matchAll(STORY_HEADER_PATTERN));
      const storyCount = storyMatches.length;

      // Count completed / implemented / delivered stories
      const completedMatches = Array.from(cleaned.matchAll(STATUS_COMPLETED_PATTERN));
      const completedCount = completedMatches.length;

      const completionPercent =
        storyCount > 0 ? Math.round((completedCount / storyCount) * 100) : 0;

      return {
        storyCount,
        epicsCount: 0, // Populated by a higher-level parser if needed
        completionPercent,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      // If regex throws (unlikely with safe patterns), return defaults
      console.error('[DocumentWatcher] Error parsing metrics:', error);
      return getDefaultParsedMetrics();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Enqueue a document change and reset the debounce timer.
   * Once the window elapses, the accumulated batch is broadcast.
   */
  private enqueueChange(change: DocumentChange): void {
    if (this.eventQueue.length < MAX_QUEUE_SIZE) {
      this.eventQueue.push(change);
    }
    this.clearDebounce();
    this.debounceTimer = setTimeout(() => this.flush(), DEBOUNCE_WINDOW_MS);
  }

  /** Broadcast the current event queue to all listeners and reset. */
  private flush(): void {
    const batch = [...this.eventQueue];
    this.eventQueue = [];
    this.debounceTimer = null;

    if (batch.length === 0) {
      return;
    }

    for (const listener of this.listeners) {
      try {
        listener(batch);
      } catch (err) {
        console.error('[DocumentWatcher] Listener threw an error:', err);
      }
    }
  }

  private clearDebounce(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /** Attach VS Code FileSystemWatcher to /docs/**  */
  private attachVSCodeWatcher(): void {
    try {
      this.vsCodeWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(this.workspaceRoot, 'docs/**/*.{md,yml,yaml,feature}'),
      );

      this.vsCodeWatcher.onDidCreate((uri) => {
        this.handleVSCodeEvent(uri.fsPath, FileChangeEvent.Added);
      });

      this.vsCodeWatcher.onDidChange((uri) => {
        this.handleVSCodeEvent(uri.fsPath, FileChangeEvent.Modified);
      });

      this.vsCodeWatcher.onDidDelete((uri) => {
        this.handleVSCodeEvent(uri.fsPath, FileChangeEvent.Deleted);
      });
    } catch (err) {
      this.notifyError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private handleVSCodeEvent(filePath: string, changeType: FileChangeEvent): void {
    if (!isDocumentFile(filePath)) {
      return;
    }
    const change = createDocumentChange(filePath, changeType);
    this.enqueueChange(change);
  }
}
