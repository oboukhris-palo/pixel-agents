import { useState, useEffect, useRef, memo, useMemo } from 'react';
import type { TokenUsage, TokenThreshold } from '../../../src/contextTypes';

// CSS module — mocked as identity-obj-proxy in Jest, loaded by Vite in production
import styles from './ContextWindowBar.module.css';

export interface ContextWindowBarProps {
  tokenUsage?: TokenUsage | null;
  onThresholdReached?: (threshold: 'warning' | 'critical') => void;
}

/** Formats a number with locale-aware thousands separator */
function fmt(n: number): string {
  return n.toLocaleString();
}

/** Calculate percentage of total for legend display */
function pct(value: number, total: number): number {
  return Math.round((value / total) * 100);
}

/** Calculate segment height as percentage of used tokens */
function segmentHeight(value: number, used: number): number {
  return Math.round((value / used) * 100);
}

/** Tooltip showing breakdown of token usage by source */
function ContextTooltip({ usage }: { usage: TokenUsage }) {
  const { breakdown, used, total } = usage;
  return (
    <div role="tooltip" className={styles.tooltip || 'tooltip'}>
      <div className={styles['tooltip-title'] || 'tooltip-title'}>Context Window Usage</div>
      <div className={styles['tooltip-row'] || 'tooltip-row'}>
        <span>Total used</span>
        <strong>{fmt(used)} / {fmt(total)}</strong>
      </div>
      <hr className={styles['tooltip-divider'] || 'tooltip-divider'} />
      <div className={styles['tooltip-row'] || 'tooltip-row'}>
        <span>.github instructions</span>
        <span>{fmt(breakdown.githubCode)} tokens</span>
      </div>
      <div className={styles['tooltip-row'] || 'tooltip-row'}>
        <span>project source</span>
        <span>{fmt(breakdown.projectCode)} tokens</span>
      </div>
      <div className={styles['tooltip-row'] || 'tooltip-row'}>
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
 * Design System v2.0.0 (US-004-003):
 * AC1: "CTX" label uses micro typography (9px, #F59E0B, weight 600)
 * AC2: Bar dimensions exact (30×180px, border-radius: 4px)
 * AC3: Segmented progress (.github: #3B82F6, project: #10B981, chat: #F59E0B)
 * AC4: Percentage label uses threshold colors (green/amber/red)
 * AC5: Legend items below bar (8px font)
 * AC6: Tooltip with detailed breakdown
 * AC7: All spacing uses design tokens
 */
export const ContextWindowBar = memo(function ContextWindowBar({
  tokenUsage,
  onThresholdReached,
}: ContextWindowBarProps) {
  const percentage = tokenUsage?.percentage ?? 0;
  const threshold = tokenUsage?.threshold ?? 'safe';
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const notifiedThreshold = useRef<TokenThreshold | null>(null);

  // Memoize segment height calculations (AC3)
  const segmentHeights = useMemo(() => {
    if (!tokenUsage) return { github: 0, project: 0, chat: 0 };
    return {
      github: segmentHeight(tokenUsage.breakdown.githubCode, tokenUsage.used),
      project: segmentHeight(tokenUsage.breakdown.projectCode, tokenUsage.used),
      chat: segmentHeight(tokenUsage.breakdown.chatHistory, tokenUsage.used),
    };
  }, [tokenUsage]);

  // Memoize legend percentages (AC5)
  const legendPercentages = useMemo(() => {
    if (!tokenUsage) return { github: 0, project: 0, chat: 0 };
    return {
      github: pct(tokenUsage.breakdown.githubCode, tokenUsage.total),
      project: pct(tokenUsage.breakdown.projectCode, tokenUsage.total),
      chat: pct(tokenUsage.breakdown.chatHistory, tokenUsage.total),
    };
  }, [tokenUsage]);

  // Fire onThresholdReached once per threshold crossing (no spam)
  useEffect(() => {
    if (!onThresholdReached || !tokenUsage) return;
    if (threshold !== 'safe' && notifiedThreshold.current !== threshold) {
      notifiedThreshold.current = threshold;
      onThresholdReached(threshold as 'warning' | 'critical');
    }
  }, [threshold, tokenUsage, onThresholdReached]);

  const icon = THRESHOLD_ICON[threshold];

  // Determine percentage label class based on threshold
  const percentageClass = {
    safe: 'percentageSafe',
    warning: 'percentageWarning',
    critical: 'percentageCritical',
  }[threshold];

  return (
    <div className={`${styles['context-window-bar'] || 'context-window-bar'} context-window-bar`}>
      {/* CTX label (AC1) */}
      <div className={styles.ctxLabel || 'ctxLabel'}>CTX</div>

      {/* Progress track with segmented display (AC2, AC3) */}
      <div
        role="progressbar"
        aria-label={`Context window: ${percentage}% used`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`${styles['progress-track'] || 'progress-track'} threshold-${threshold}`}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
        tabIndex={0}
      >
        {/* Segmented progress fill */}
        {tokenUsage && (
          <>
            {/* Chat history segment (top) */}
            <div
              className={styles['segment-chat'] || 'segment-chat'}
              data-testid="segment-chat"
              style={{ height: `${segmentHeights.chat}%` }}
            />
            {/* Project code segment (middle) */}
            <div
              className={styles['segment-project'] || 'segment-project'}
              data-testid="segment-project"
              style={{ height: `${segmentHeights.project}%` }}
            />
            {/* .github segment (bottom) */}
            <div
              className={styles['segment-github'] || 'segment-github'}
              data-testid="segment-github"
              style={{ height: `${segmentHeights.github}%` }}
            />
          </>
        )}
      </div>

      {/* Text percentage label with threshold-based color (AC4) */}
      <span className={`${styles['percentage-label'] || 'percentage-label'} ${percentageClass}`}>
        {percentage}%
      </span>

      {/* Threshold warning icon */}
      {icon && <span className={styles['threshold-icon'] || 'threshold-icon'}>{icon}</span>}

      {/* Legend display (AC5) */}
      {tokenUsage && (
        <div className={styles.legend || 'legend'} data-testid="context-legend">
          <div className={styles['legend-item'] || 'legend-item'}>
            <span className={styles['legend-dot-github'] || 'legend-dot-github'} />
            <span>.github {legendPercentages.github}%</span>
          </div>
          <div className={styles['legend-item'] || 'legend-item'}>
            <span className={styles['legend-dot-project'] || 'legend-dot-project'} />
            <span>code {legendPercentages.project}%</span>
          </div>
          <div className={styles['legend-item'] || 'legend-item'}>
            <span className={styles['legend-dot-chat'] || 'legend-dot-chat'} />
            <span>chat {legendPercentages.chat}%</span>
          </div>
        </div>
      )}

      {/* Tooltip with breakdown */}
      {tooltipVisible && tokenUsage && <ContextTooltip usage={tokenUsage} />}
    </div>
  );
});
