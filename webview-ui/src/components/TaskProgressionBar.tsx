import React, { memo } from 'react';
import type { TaskInfo, TaskProgressionState } from '../hooks/useExtensionMessages';
import { extractPhaseFromCycle, PHASE_COLORS } from '../hooks/taskProgressionUtils';

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
  /** CSS class suffix appended to the base section class */
  classSuffix: string;
  /** Whether to render the PDLC phase badge */
  showPhaseBadge: boolean;
}

const SECTION_CONFIG: Readonly<Record<SectionType, SectionConfig>> = {
  previous: {
    icon: '✅',
    iconTestId: 'icon-completed',
    fallbackText: 'No previous task',
    classSuffix: ' opacity-75',
    showPhaseBadge: false,
  },
  current: {
    icon: '🔄',
    iconTestId: 'icon-in-progress',
    fallbackText: 'No current task',
    classSuffix: ' border-2 border-blue-500',
    showPhaseBadge: true,
  },
  next: {
    icon: '⏭️',
    iconTestId: 'icon-next',
    fallbackText: 'No upcoming task',
    classSuffix: ' opacity-50',
    showPhaseBadge: false,
  },
} as const;

/** Base CSS classes shared by every section. */
const BASE_SECTION_CLASS = 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all';

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
  const phaseColor = phase ? PHASE_COLORS[phase] : null;

  return (
    <>
      <div className="task-section-story-id">{task.storyId}</div>
      <div className="task-section-title">{task.title}</div>
      {task.layer && <div className="task-section-layer">{task.layer}</div>}
      {task.cycle && <div className="task-section-cycle">{task.cycle}</div>}
      {phase && phaseColor && (
        <span
          data-testid="phase-badge"
          className="task-section-phase-badge"
          style={{ backgroundColor: phaseColor }}
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
      <div className="task-section-empty">N/A</div>
      <div className="task-section-empty-detail">{fallbackText}</div>
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
 *   1 (base) + 1 (handleClick guard) + 1 (Enter key) + 1 (task?) + 1 (layer) + 1 (cycle)
 *   Phase badge path is handled in TaskContent with its own budget (≤ 3).
 */
function TaskSection({ sectionType, task, label, onTaskClick }: TaskSectionProps) {
  const { icon, iconTestId, fallbackText, classSuffix, showPhaseBadge } =
    SECTION_CONFIG[sectionType];

  const sectionClass = `${BASE_SECTION_CLASS}${classSuffix}`;
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
      className={sectionClass}
      aria-label={`${label} task`}
      tabIndex={0}
      title={titleAttr}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="task-section-header">{label}</div>
      <span data-testid={iconTestId}>{icon}</span>
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
}

/**
 * Task Progression Bar — renders a horizontal three-section bar showing
 * previous (✅), current (🔄), and next (⏭️) workflow tasks at the top of
 * the Pixel Agents dashboard.
 *
 * Wrapped in React.memo to avoid unnecessary re-renders when parent state
 * unrelated to task progression changes.
 *
 * BDD scenarios covered: US-001-001 task-progression-bar.feature
 */
export const TaskProgressionBar = memo(function TaskProgressionBar({
  taskProgression,
  onTaskClick,
}: TaskProgressionBarProps) {
  const { previous, current, next } = taskProgression;

  return (
    <div
      data-testid="task-progression-bar"
      className="task-progression-bar flex gap-4"
      role="region"
      aria-label="Task progression"
    >
      <TaskSection sectionType="previous" task={previous} label="Previous" onTaskClick={onTaskClick} />
      <TaskSection sectionType="current" task={current} label="Current" onTaskClick={onTaskClick} />
      <TaskSection sectionType="next" task={next} label="Next" onTaskClick={onTaskClick} />
    </div>
  );
});

