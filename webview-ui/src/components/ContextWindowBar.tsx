import React, { useState, useEffect, useRef, memo } from 'react';
import type { TokenUsage, TokenThreshold } from '../../../src/contextTypes';

// CSS module — mocked as identity-obj-proxy in Jest, loaded by Vite in production
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles: Record<string, string> =
  typeof require !== 'undefined'
    ? (() => { try { return require('./ContextWindowBar.module.css'); } catch { return {}; } })()
    : {};

export interface ContextWindowBarProps {
  tokenUsage?: TokenUsage | null;
  onThresholdReached?: (threshold: 'warning' | 'critical') => void;
}

/** Formats a number with locale-aware thousands separator */
function fmt(n: number): string {
  return n.toLocaleString();
}

/** Tooltip showing breakdown of token usage by source */
function ContextTooltip({ usage }: { usage: TokenUsage }) {
  const { breakdown, used, total } = usage;
  return (
    <div role="tooltip" className={styles.tooltip}>
      <div className={styles['tooltip-title']}>Context Window Usage</div>
      <div className={styles['tooltip-row']}>
        <span>Total used</span>
        <strong>{fmt(used)} / {fmt(total)}</strong>
      </div>
      <hr className={styles['tooltip-divider']} />
      <div className={styles['tooltip-row']}>
        <span>.github instructions</span>
        <span>{fmt(breakdown.githubCode)} tokens</span>
      </div>
      <div className={styles['tooltip-row']}>
        <span>project source</span>
        <span>{fmt(breakdown.projectCode)} tokens</span>
      </div>
      <div className={styles['tooltip-row']}>
        <span>chat history</span>
        <span>{fmt(breakdown.chatHistory)} tokens</span>
      </div>
    </div>
  );
}

const THRESHOLD_ICON: Record<TokenThreshold, string> = {
  safe: '',
  warning: '⚠️',
  critical: '⛔',
};

/**
 * ContextWindowBar — vertical progress bar on the left side of the Pixel Agents panel.
 * Visualises Copilot Chat context window consumption with color-coded thresholds.
 *
 * AC1: Visible on left side  |  AC2: 0-100% indicator  |  AC3: Color-coded thresholds
 * AC4: Breakdown by category |  AC5: <100ms updates     |  AC6: Tooltip with counts
 * AC7: Warning notifications at 70% and 90%
 */
export const ContextWindowBar = memo(function ContextWindowBar({
  tokenUsage,
  onThresholdReached,
}: ContextWindowBarProps) {
  const percentage = tokenUsage?.percentage ?? 0;
  const threshold = tokenUsage?.threshold ?? 'safe';
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const notifiedThreshold = useRef<TokenThreshold | null>(null);

  // Fire onThresholdReached once per threshold crossing (no spam)
  useEffect(() => {
    if (!onThresholdReached || !tokenUsage) return;
    if (threshold !== 'safe' && notifiedThreshold.current !== threshold) {
      notifiedThreshold.current = threshold;
      onThresholdReached(threshold as 'warning' | 'critical');
    }
  }, [threshold, tokenUsage, onThresholdReached]);

  const icon = THRESHOLD_ICON[threshold];

  return (
    <div className={`${styles['context-window-bar']} context-window-bar`}>
      {/* Progress track */}
      <div
        role="progressbar"
        aria-label={`Context window: ${percentage}% used`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`${styles['progress-track']} threshold-${threshold}`}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
        tabIndex={0}
      >
        <div
          className={styles['progress-fill']}
          style={{ height: `${percentage}%` }}
        />
      </div>

      {/* Text percentage label (not color alone — WCAG requirement) */}
      <span className={styles['percentage-label']}>{percentage}%</span>

      {/* Threshold warning icon */}
      {icon && <span className={styles['threshold-icon']}>{icon}</span>}

      {/* Tooltip with breakdown */}
      {tooltipVisible && tokenUsage && <ContextTooltip usage={tokenUsage} />}
    </div>
  );
});
