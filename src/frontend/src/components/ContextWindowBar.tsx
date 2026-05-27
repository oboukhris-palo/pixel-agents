import { useState, useMemo, useEffect, useRef, memo } from 'react';
import type { TokenUsage } from '../../../backend/contextTypes';

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
  
  // Safe percentage calculation with fallback
  const safePct = (value: number, total: number): string => {
    if (!total || total === 0) return '0';
    return Math.round((value / total) * 100).toString();
  };
  
  return (
    <div 
      role="tooltip" 
      className={styles.tooltip || 'tooltip'}
      style={{
        position: 'absolute',
        right: '40px',
        top: '0',
        backgroundColor: '#2D2D30',
        border: '1px solid #3E3E42',
        borderRadius: '4px',
        padding: '8px 12px',
        width: '180px',
        zIndex: 1000,
        fontSize: '11px',
        lineHeight: '1.4',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#CCCCCC' }}>Token Usage Breakdown</div>
      <hr style={{ border: 'none', borderTop: '1px solid #3E3E42', margin: '8px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 16px', color: '#CCCCCC' }}>
        <span>GitHub (.github)</span>
        <strong>{safePct(breakdown.githubCode, total)}%</strong>
        
        <span>Project Code</span>
        <strong>{safePct(breakdown.projectCode, total)}%</strong>
        
        <span>Chat History</span>
        <strong>{safePct(breakdown.chatHistory, total)}%</strong>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #3E3E42', margin: '8px 0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 16px', color: '#CCCCCC' }}>
        <span>Total Tokens</span>
        <strong>{fmt(used)}</strong>
      </div>
    </div>
  );
}

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
  const firedThresholds = useRef<Set<'warning' | 'critical'>>(new Set());
  
  // Debug logging to trace tokenUsage prop
  useEffect(() => {
    console.log('[ContextWindowBar] tokenUsage prop:', tokenUsage);
  }, [tokenUsage]);

  // Fire onThresholdReached once per threshold level when crossed (AC: notification callbacks)
  useEffect(() => {
    if (!onThresholdReached || !tokenUsage) return;
    const total = tokenUsage.percentage / 100;
    if (total >= 0.9 && !firedThresholds.current.has('critical')) {
      firedThresholds.current.add('critical');
      onThresholdReached('critical');
    } else if (total >= 0.7 && !firedThresholds.current.has('warning')) {
      firedThresholds.current.add('warning');
      onThresholdReached('warning');
    }
  }, [tokenUsage, onThresholdReached]);

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

  const percentageClass = {
    safe: 'percentageSafe',
    warning: 'percentageWarning',
    critical: 'percentageCritical',
  }[threshold];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <div
        className={`${styles['context-window-bar'] || 'context-window-bar'} context-window-bar`}
      >
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
      </div>

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
      {tooltipVisible && tokenUsage && (
        <ContextTooltip usage={tokenUsage} />
      )}
    </div>
  );
});
