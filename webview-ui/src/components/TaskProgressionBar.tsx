import React, { memo } from 'react';
import type { TaskInfo, TaskProgressionState } from '../hooks/useExtensionMessages';
import { extractPhaseFromCycle, PHASE_COLORS, PHASE_BG_COLORS, PHASE_GLOW } from '../hooks/taskProgressionUtils';
import styles from './TaskProgressionBar.module.css';

// ── Section configuration lookup ─────────────────────────────────────────────
// Using a Record keyed by SectionType eliminates three separate multi-branch
// ternary chains (OCP: adding a new section type requires only one new entry).

type SectionType = 'previous' | 'current' | 'next';

interface SectionConfig {
  /** Status emoji rendered as the section icon */
  icon: string;
  /** data-testid for the icon span */
  iconTestId: string;
  /** Fallback copy shown when the task is null */
  fallbackText: string;
  /** Whether to render the PDLC phase badge */
  showPhaseBadge: boolean;
}

const SECTION_CONFIG: Readonly<Record<SectionType, SectionConfig>> = {
  previous: {
    icon: '✅',
    iconTestId: 'icon-completed',
    fallbackText: 'No previous task',
    showPhaseBadge: false,
  },
  current: {
    icon: '🔄',
    iconTestId: 'icon-in-progress',
    fallbackText: 'No current task',
    showPhaseBadge: true,
  },
  next: {
    icon: '⏭️',
    iconTestId: 'icon-next',
    fallbackText: 'No upcoming task',
    showPhaseBadge: false,
  },
} as const;

// ── Sub-components ─────────────────────────────────────────────────────────────
// Splitting populated vs. empty rendering satisfies SRP — each component has
// exactly one reason to change.

interface TaskContentProps {
  task: TaskInfo;
  showPhaseBadge: boolean;
}

/** Renders the populated content of a section when a task is available. */
function TaskContent({ task, showPhaseBadge }: TaskContentProps) {
  const phase = showPhaseBadge ? extractPhaseFromCycle(task.cycle) : null;

  return (
    <>
      <div className={styles.storyId}>{task.storyId}</div>
      <div className={styles.title}>{task.title}</div>
      {task.layer && <div className={styles.layer}>{task.layer}</div>}
      {task.cycle && <div className={styles.cycle}>{task.cycle}</div>}
      {phase && (
        <span
          data-testid="phase-badge"
          className={styles.phasePill}
          style={{
            border: `2px solid ${PHASE_COLORS[phase]}`,
            background: `color-mix(in srgb, ${PHASE_COLORS[phase]} 15%, transparent)`,
            color: PHASE_COLORS[phase],
          }}
        >
          {phase}
        </span>
      )}
    </>
  );
}

interface EmptyTaskContentProps {
  fallbackText: string;
}

/** Renders the fallback content of a section when no task is available. */
function EmptyTaskContent({ fallbackText }: EmptyTaskContentProps) {
  return (
    <>
      <div className={styles.emptyState}>N/A</div>
      <div className={styles.emptyStateDetail}>{fallbackText}</div>
    </>
  );
}

// ── TaskSection ────────────────────────────────────────────────────────────────

interface TaskSectionProps {
  sectionType: SectionType;
  task: TaskInfo | null;
  label: string;
  onTaskClick?: (task: TaskInfo) => void;
}

/**
 * Renders one section (Previous / Current / Next) of the Task Progression Bar.
 *
 * Cyclomatic complexity: 6
 *   1 (base) + 1 (handleClick guard) + 1 (Enter key) + 1 (task?) + 1 (sectionType current) + 1 (phase)
 *   Phase badge path is handled in TaskContent with its own budget (≤ 3).
 */
function TaskSection({ sectionType, task, label, onTaskClick }: TaskSectionProps) {
  const { icon, iconTestId, fallbackText, showPhaseBadge } = SECTION_CONFIG[sectionType];

  // Determine CSS module class based on section type
  const cardClass =
    sectionType === 'previous'
      ? styles.taskCardPrevious
      : sectionType === 'current'
      ? styles.taskCardCurrent
      : styles.taskCardNext;

  // Apply dynamic phase styling for current card
  const cardStyle: React.CSSProperties = {};
  if (sectionType === 'current' && task && showPhaseBadge) {
    const phase = extractPhaseFromCycle(task.cycle);
    cardStyle.background = PHASE_BG_COLORS[phase];
    cardStyle.borderColor = PHASE_COLORS[phase];
    cardStyle.color = PHASE_COLORS[phase];
    cardStyle.boxShadow = PHASE_GLOW[phase];
    cardStyle.borderWidth = '2px';
    cardStyle.borderStyle = 'solid';
  }

  const titleAttr = task ? `${task.storyId}: ${task.title}` : label;

  const handleClick = () => {
    if (task && onTaskClick) onTaskClick(task);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') handleClick();
  };

  return (
    <div
      data-testid={`task-section-${sectionType}`}
      className={cardClass}
      style={cardStyle}
      aria-label={`${label} task`}
      tabIndex={0}
      title={titleAttr}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.sectionHeader}>{label}</div>
      <span className={styles.statusIcon} data-testid={iconTestId}>
        {icon}
      </span>
      {task ? (
        <TaskContent task={task} showPhaseBadge={showPhaseBadge} />
      ) : (
        <EmptyTaskContent fallbackText={fallbackText} />
      )}
    </div>
  );
}

// ── TaskProgressionBar ─────────────────────────────────────────────────────────

export interface TaskProgressionBarProps {
  /**
   * Task progression state with previous, current, and next tasks.
   * Received from the VS Code extension backend via the message protocol.
   */
  taskProgression: TaskProgressionState;
  /**
   * Optional callback invoked when a task section is clicked or activated
   * via keyboard. Receives the TaskInfo for the clicked section.
   */
  onTaskClick?: (task: TaskInfo) => void;
  /**
   * Context window usage percentage (0-100).
   * Used for compact metrics display in top-right corner.
   * Optional - metrics hidden if not provided.
   */
  contextUsage?: number;
  /**
   * Project completeness percentage (0-100).
   * Used for compact metrics display in top-right corner.
   * Optional - metrics hidden if not provided.
   */
  completeness?: number;
}

/**
 * Task Progression Bar — renders a horizontal three-section bar showing
 * previous (✅), current (🔄), and next (⏭️) workflow tasks at the top of
 * the Pixel Agents dashboard.
 *
 * Design System v2.0.0 aligned with:
 * - Exact card dimensions (240px / 300px / 240px)
 * - Phase-specific colors and glow effects
 * - Compact metrics display (CTX%, Done%)
 * - Arrow separators between cards
 *
 * Wrapped in React.memo to avoid unnecessary re-renders when parent state
 * unrelated to task progression changes.
 *
 * BDD scenarios covered: US-001-001 task-progression-bar.feature
 */
export const TaskProgressionBar = memo(function TaskProgressionBar({
  taskProgression,
  onTaskClick,
  contextUsage,
  completeness,
}: TaskProgressionBarProps) {
  const { previous, current, next } = taskProgression;

  // Determine context usage status for styling
  const contextStatus =
    contextUsage !== undefined
      ? contextUsage >= 90
        ? 'critical'
        : contextUsage >= 71
        ? 'warning'
        : 'normal'
      : undefined;

  return (
    <div
      data-testid="task-progression-bar"
      className={styles.container}
      role="region"
      aria-label="Task progression"
    >
      <TaskSection
        sectionType="previous"
        task={previous}
        label="Previous"
        onTaskClick={onTaskClick}
      />
      <span className={styles.arrowSeparator} aria-hidden="true">
        →
      </span>
      <TaskSection
        sectionType="current"
        task={current}
        label="Current"
        onTaskClick={onTaskClick}
      />
      <span className={styles.arrowSeparator} aria-hidden="true">
        →
      </span>
      <TaskSection sectionType="next" task={next} label="Next" onTaskClick={onTaskClick} />

      {/* Compact metrics in top-right corner */}
      {(contextUsage !== undefined || completeness !== undefined) && (
        <div className={styles.compactMetrics} data-testid="compact-metrics">
          {contextUsage !== undefined && (
            <span
              className={contextStatus === 'critical' ? styles.critical : contextStatus === 'warning' ? styles.warning : ''}
              data-testid="context-metric"
            >
              CTX {contextUsage}%
              {contextStatus === 'critical' && ' 🔴'}
              {contextStatus === 'warning' && ' ⚠️'}
            </span>
          )}
          {contextUsage !== undefined && completeness !== undefined && (
            <span className={styles.separator}>|</span>
          )}
          {completeness !== undefined && (
            <span data-testid="completeness-metric">Done {completeness}%</span>
          )}
        </div>
      )}
    </div>
  );
});

