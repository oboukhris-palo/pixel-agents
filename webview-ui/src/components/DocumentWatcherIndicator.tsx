/**
 * Layer 4: DocumentWatcherIndicator Component (US-001-003)
 *
 * Purpose: Display real-time document watcher status (active/error), the last
 *          update timestamp, and the number of files changed.  Provides
 *          accessible feedback to developers watching the dashboard.
 *
 * BDD Mapping:
 *   - AC1: Indicator shows watcher is active
 *   - AC6: Error state shown if watcher encounters permission denied
 *   - AC10: Non-breaking addition — existing components unaffected
 */

import { memo } from 'react';
import type { DocumentWatcherState } from '../hooks/useExtensionMessages.js';

// ── Color constants ────────────────────────────────────────────────────────────
const COLOR_ACTIVE  = '#10b981'; // Tailwind green-500
const COLOR_INACTIVE = '#6b7280'; // Tailwind gray-500
const COLOR_ERROR   = '#ef4444'; // Tailwind red-500

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Component ──────────────────────────────────────────────────────────────────

export interface DocumentWatcherIndicatorProps {
  /** Current watcher state, or null if not yet initialised */
  watcherState: DocumentWatcherState | null;
}

/**
 * DocumentWatcherIndicator
 *
 * A small status badge that shows whether the document watcher is active, and
 * when the last /docs/ file change was detected.
 *
 * @example
 * <DocumentWatcherIndicator watcherState={documentWatcherState} />
 */
export const DocumentWatcherIndicator = memo(function DocumentWatcherIndicator({
  watcherState,
}: DocumentWatcherIndicatorProps) {
  if (watcherState === null) {
    // Not yet initialised — render nothing (AC10: no breaking change)
    return null;
  }

  const { isWatching, error, lastUpdateTime, changes, metrics } = watcherState;

  // Determine display colour
  const dotColor = error
    ? COLOR_ERROR
    : isWatching
      ? COLOR_ACTIVE
      : COLOR_INACTIVE;

  // Accessible label
  const statusLabel = error
    ? `Document watcher error: ${error}`
    : isWatching
      ? 'Document watcher active'
      : 'Document watcher inactive';

  const lastUpdateText = lastUpdateTime > 0
    ? `Last update: ${formatTimestamp(lastUpdateTime)}`
    : 'No updates yet';

  const changesText = changes.length > 0
    ? `${changes.length} file${changes.length !== 1 ? 's' : ''} changed`
    : '';

  const tooltipText = [statusLabel, lastUpdateText, changesText].filter(Boolean).join(' · ');

  return (
    <div
      data-testid="document-watcher-indicator"
      role="status"
      aria-label={statusLabel}
      title={tooltipText}
      className="flex items-center gap-1 p-1 rounded"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px' }}
    >
      {/* Status dot */}
      <span
        data-testid="watcher-status-dot"
        aria-hidden="true"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />

      {/* Label text */}
      <span
        data-testid="watcher-label"
        style={{ fontSize: '11px', color: 'var(--vscode-descriptionForeground, #6b7280)' }}
      >
        {error
          ? 'Error'
          : isWatching
            ? lastUpdateTime > 0
              ? `Updated ${formatTimestamp(lastUpdateTime)}`
              : 'Watching'
            : 'Paused'}
      </span>

      {/* Completion percent badge (shown only when metrics available) */}
      {metrics.completionPercent > 0 && (
        <span
          data-testid="completion-badge"
          aria-label={`Project ${metrics.completionPercent}% complete`}
          style={{
            fontSize: '10px',
            color: COLOR_ACTIVE,
            marginLeft: '2px',
          }}
        >
          {metrics.completionPercent}%
        </span>
      )}
    </div>
  );
});
