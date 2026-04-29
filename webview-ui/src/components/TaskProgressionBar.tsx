import React, { memo } from 'react';
import type { TaskInfo, TaskProgressionState } from '../hooks/useExtensionMessages';
import { extractPhaseFromCycle } from '../hooks/taskProgressionUtils';
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
    fallbackText: 'No previous activity',
    showPhaseBadge: false,
  },
  current: {
    icon: '🔄',
    iconTestId: 'icon-in-progress',
    fallbackText: 'Ready - Use Copilot Chat to start',
    showPhaseBadge: true,
  },
  next: {
    icon: '⏭️',
    iconTestId: 'icon-next',
    fallbackText: 'No planned tasks',
    showPhaseBadge: false,
  },
} as const;

// ── Sub-components ─────────────────────────────────────────────────────────────
// Splitting populated vs. empty rendering satisfies SRP — each component has
// exactly one reason to change.

interface TaskContentProps {
  task: TaskInfo;
  checkpointProgress?: string | null; // e.g., "(4/12)" or null
}

/** Renders the populated content of a section when a task is available. */
function TaskContent({ task, checkpointProgress }: TaskContentProps) {
  // In the compact design, we don't show individual phase badges - the main phase pill shows the current phase
  // Task content is just: icon + storyId + · + layer/title + optional checkpoint count
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }}>
      <span className={styles.storyId}>{task.storyId}</span>
      <span style={{ color: 'inherit', opacity: 0.7 }}>·</span>
      <span className={styles.title}>{task.layer || task.title}</span>
      {task.cycle && (
        <>
          <span style={{ color: 'inherit', opacity: 0.7 }}>·</span>
          <span className={styles.cycle}>{task.cycle}</span>
        </>
      )}
      {checkpointProgress && (
        <>
          <span style={{ color: 'inherit', opacity: 0.7 }}>·</span>
          <span className={styles.cycle} title="Implementation plan checkpoint progress">
            {checkpointProgress}
          </span>
        </>
      )}
    </div>
  );
}

interface EmptyTaskContentProps {
  fallbackText: string;
}

/** Renders the fallback content of a section when no task is available. */
function EmptyTaskContent({ fallbackText }: EmptyTaskContentProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
      <span className={styles.emptyState}>{fallbackText}</span>
    </div>
  );
}

// ── TaskSection ────────────────────────────────────────────────────────────────

interface TaskSectionProps {
  sectionType: SectionType;
  task: TaskInfo | null;
  label: string;
  onTaskClick?: (task: TaskInfo) => void;
  checkpointProgress?: string | null; // v1.0.5: Checkpoint count for current section
}

/**
 * Renders one section (Previous / Current / Next) of the Task Progression Bar.
 *
 * Cyclomatic complexity: 6
 *   1 (base) + 1 (handleClick guard) + 1 (Enter key) + 1 (task?) + 1 (sectionType current) + 1 (phase)
 *   Phase badge path is handled in TaskContent with its own budget (≤ 3).
 */
function TaskSection({ sectionType, task, label, onTaskClick, checkpointProgress }: TaskSectionProps) {
  const { icon, iconTestId, fallbackText } = SECTION_CONFIG[sectionType];

  // Determine CSS module class based on section type
  const cardClass =
    sectionType === 'previous'
      ? styles.taskCardPrevious
      : sectionType === 'current'
      ? styles.taskCardCurrent
      : styles.taskCardNext;

  // No dynamic styling - colors are set in CSS to match Penpot design exactly
  const cardStyle: React.CSSProperties = {};

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
      <span className={styles.statusIcon} data-testid={iconTestId}>
        {icon}
      </span>
      {task ? (
        <TaskContent task={task} checkpointProgress={checkpointProgress} />
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

  // Extract current phase for the phase pill (shown for all tasks, not just current)
  const currentPhase = current ? extractPhaseFromCycle(current.cycle) : null;

  // v1.0.5: Format checkpoint progress as "(X/Y)" for current task
  const checkpointProgress = taskProgression.planCheckpoint
    ? `(${taskProgression.planCheckpoint.completedCheckboxes}/${taskProgression.planCheckpoint.totalCheckboxes})`
    : null;

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
      {/* Palo IT Logo - aligned with phase pill */}
      {(() => {
        // Fix #1: Use webview URI injected by backend (asWebviewUri)
        // VS Code webview security blocks /palo-it-logo.png paths
        const logoUri = (typeof window !== 'undefined' && 
          (window as Window & { __pixelAgentsVars?: { logoUri?: string } }).__pixelAgentsVars?.logoUri);
        
        return logoUri ? (
          <img 
            src={logoUri} 
            alt="Palo IT" 
            className={styles.logo}
            style={{ height: '24px', width: 'auto', opacity: 0.95 }}
            onError={(e) => {
              console.error('[TaskProgressionBar] Logo failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null;
      })()}

      {/* Phase Pill - 80×24px pill showing current phase */}
      <span className={styles.phasePill} data-testid="phase-pill">
        {currentPhase ? `8 ${currentPhase}` : '8 Impl'}
      </span>

      {/* Separator line - 1×20px vertical bar */}
      <div className={styles.separator} aria-hidden="true" />

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
        checkpointProgress={checkpointProgress}
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
      {/* v1.0.5: Plan checkpoint badge — shows completed/total checkbox count */}
      {taskProgression.planCheckpoint != null && (
        <span
          data-testid="checkpoint-badge"
          className={styles.checkpointBadge}
          title={`Implementation plan: ${taskProgression.planCheckpoint.completedCheckboxes} of ${taskProgression.planCheckpoint.totalCheckboxes} checkboxes complete`}
          aria-label={`Plan progress: ${taskProgression.planCheckpoint.completedCheckboxes} of ${taskProgression.planCheckpoint.totalCheckboxes}`}
        >
          {taskProgression.planCheckpoint.completedCheckboxes}/{taskProgression.planCheckpoint.totalCheckboxes}
        </span>
      )}
      {/* v1.0.5: Current checkpoint description (shown adjacent to current task section) */}
      {taskProgression.planCheckpoint?.currentCheckbox != null && (
        <span
          data-testid="current-checkpoint-desc"
          className={styles.checkpointDesc}
          title={taskProgression.planCheckpoint.currentCheckbox.description}
        >
          {taskProgression.planCheckpoint.currentCheckbox.description}
        </span>
      )}
    </div>
  );
});


