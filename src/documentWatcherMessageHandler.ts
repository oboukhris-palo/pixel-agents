/**
 * Layer 3: Document Watcher Message Handler (US-001-003)
 *
 * Purpose: Bridge DocumentWatcherService (backend) to the webview via the
 * strongly-typed DocumentWatcherMessage protocol.  Follows the pattern
 * established by AgentActivityMonitor (EventEmitter + postMessage broadcast).
 *
 * BDD Mapping:
 *   - AC2: Message broadcast latency <500ms (service + handler overhead is minimal)
 *   - AC10: Backwards-compatible integration — existing components unaffected
 */

import {
  type DocumentChange,
  type ParsedMetrics,
  getDefaultParsedMetrics,
} from './documentChangeTypes.js';
import type { DocumentWatcherService, OutputChannelLike } from './documentWatcherService.js';

// ── Message protocol ──────────────────────────────────────────────────────────

/**
 * Message sent from the extension backend to the webview when docs/ files
 * change.  Consumed by the useDocumentWatcher React hook.
 */
export interface DocumentWatcherMessage {
  type: 'document-changed';
  /** Batch of document changes detected in the debounce window */
  changes: DocumentChange[];
  /** Recalculated project metrics (story count, completion %) */
  metrics: ParsedMetrics;
  /** Unix timestamp (ms) when this message was generated */
  timestamp: number;
  /** Debounce window used (ms), for UI information */
  debounceDelayMs: number;
}

// ── Webview interface (injectable for testability) ────────────────────────────
export interface WebviewLike {
  postMessage(message: unknown): void;
}

/**
 * DocumentWatcherMessageHandler
 *
 * Registers a listener on DocumentWatcherService, transforms batched change
 * events into a DocumentWatcherMessage, and posts it to the webview.
 *
 * @example
 * const handler = new DocumentWatcherMessageHandler(watcherService, webviewPanel.webview);
 * handler.start();
 * // … later
 * handler.stop();
 */
export class DocumentWatcherMessageHandler {
  private readonly service: DocumentWatcherService;
  private readonly webview: WebviewLike;
  private readonly outputChannel: OutputChannelLike | undefined;
  private unsubscribe: (() => void) | null = null;

  constructor(
    service: DocumentWatcherService,
    webview: WebviewLike,
    outputChannel?: OutputChannelLike
  ) {
    this.service = service;
    this.webview = webview;
    this.outputChannel = outputChannel;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  /**
   * Start listening to the watcher service and broadcasting messages.
   * Idempotent — calling start() twice registers only one listener.
   */
  start(): void {
    if (this.unsubscribe !== null) {
      return; // Already started
    }

    this.unsubscribe = this.service.onChanges((changes) => {
      this.broadcast(changes);
    });
  }

  /**
   * Stop listening and broadcasting.  Safe to call before start().
   */
  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  /**
   * Build a DocumentWatcherMessage from the batch and send it to the webview.
   * Errors from postMessage are caught and logged — never propagated.
   */
  private broadcast(changes: DocumentChange[]): void {
    const message: DocumentWatcherMessage = {
      type: 'document-changed',
      changes,
      metrics: this.buildMetrics(changes),
      timestamp: Date.now(),
      debounceDelayMs: 300,
    };

    try {
      this.webview.postMessage(message);
    } catch (err) {
      const errorMessage = `[DocumentWatcherMessageHandler] Failed to post message to webview: ${err instanceof Error ? err.message : String(err)}`;
      if (this.outputChannel) {
        this.outputChannel.appendLine(errorMessage);
      } else {
        console.error(errorMessage, err);
      }
    }
  }

  /**
   * Build ParsedMetrics from the batch.  For non-user-stories files we return
   * default metrics; for user-stories.md we delegate to the service parser.
   */
  private buildMetrics(changes: DocumentChange[]): ParsedMetrics {
    const userStoriesChange = changes.find((c) =>
      c.path.includes('user-stories.md'),
    );

    if (userStoriesChange && userStoriesChange.changeType !== 'deleted') {
      try {
        const fs = require('fs') as typeof import('fs');
        const content = fs.readFileSync(userStoriesChange.path, 'utf8');
        return this.service.parseMetricsFromContent(content);
      } catch {
        // File unreadable — return defaults
      }
    }

    return getDefaultParsedMetrics();
  }
}
