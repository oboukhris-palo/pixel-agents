import type { TokenUsage } from './contextTypes';

/** Warning entry included in message when usage crosses a threshold */
export interface ContextWarning {
  threshold: 70 | 90;
  message: string;
}

/** Strongly-typed message sent from backend to webview */
export interface ContextWindowMessage {
  type: 'context.window.update';
  data: {
    tokenUsage: TokenUsage;
    timestamp: string;
    warnings: ContextWarning[];
  };
}

/**
 * Type guard: checks if an unknown value is a ContextWindowMessage.
 */
export function isContextWindowMessage(value: unknown): value is ContextWindowMessage {
  if (!value || typeof value !== 'object') {return false;}
  const msg = value as Record<string, unknown>;
  return msg['type'] === 'context.window.update' && 'data' in msg;
}

/**
 * ContextMessageHandler bridges the ContextAnalyzer backend to the webview frontend.
 * Formats token usage into a typed message and posts it via the provided transport.
 */
export class ContextMessageHandler {
  private readonly postMessage: (message: ContextWindowMessage) => void;

  constructor(postMessage: (message: ContextWindowMessage) => void) {
    this.postMessage = postMessage;
  }

  /**
   * Sends a context window update to the webview.
   * Includes warnings when usage crosses 70% or 90% thresholds.
   */
  sendUpdate(tokenUsage: TokenUsage): void {
    const message: ContextWindowMessage = {
      type: 'context.window.update',
      data: {
        tokenUsage,
        timestamp: new Date().toISOString(),
        warnings: this.buildWarnings(tokenUsage),
      },
    };
    this.postMessage(message);
  }

  /** Builds warning entries for threshold crossings. */
  private buildWarnings(usage: TokenUsage): ContextWarning[] {
    if (usage.threshold === 'critical') {
      return [{ threshold: 90, message: '⛔ Context window 90%+ full — consider starting a new chat.' }];
    }
    if (usage.threshold === 'warning') {
      return [{ threshold: 70, message: '⚠️ Context window 70%+ full — approaching limit.' }];
    }
    return [];
  }
}
