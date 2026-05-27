/**
 * Layer 1: Implementation Plan Types (Domain Model)
 * Story: Pixel Agents v1.0.5 - UI/UX Enhancement
 *
 * Defines types for parsing implementation-plan.md files and tracking checkbox states.
 * Also extends agent activity types to include file operation tracking.
 */

import type { AgentAction } from './agentActivityTypes';

// ── Regex pattern constants ───────────────────────────────────────────────────

/** Matches a markdown checkbox line: "- [x] text" or "- [ ] text" */
export const CHECKBOX_LINE_PATTERN = /^- \[([ x])\] (.+)$/;

/** Matches phase-cycle patterns: "RED Phase - Cycle 1: description" */
export const LAYER_PHASE_PATTERN = /^(RED|GREEN|REFACTOR) Phase - Cycle (\d+):\s*(.+)$/;

/** Matches layer header lines: "## Layer 1: Title" */
export const LAYER_HEADER_PATTERN = /^#{1,3} Layer (\d+):/;

// ── Valid value sets ──────────────────────────────────────────────────────────

const VALID_LAYERS = new Set([1, 2, 3, 4]);
const VALID_PHASES = new Set(['RED', 'GREEN', 'REFACTOR']);
const VALID_FILE_OP_TYPES = new Set(['read', 'write', 'delete', 'rename']);

// ── Type definitions ──────────────────────────────────────────────────────────

/** TDD phase for implementation plan checkboxes */
export type PlanPhase = 'RED' | 'GREEN' | 'REFACTOR';

/** Layer number constrained to architectural layers 1-4 */
export type LayerNumber = 1 | 2 | 3 | 4;

/**
 * A single checkbox item parsed from an implementation-plan.md file.
 * Represents one TDD sub-task within a phase cycle.
 */
export interface ImplementationPlanCheckbox {
  /** Architectural layer this task belongs to (1=Types, 2=Services, 3=Integration, 4=UI) */
  layerNumber: LayerNumber;
  /** TDD phase (RED=failing test, GREEN=implementation, REFACTOR=quality) */
  phase: PlanPhase;
  /** Cycle number within this layer (1-based) */
  cycleNumber: number;
  /** Human-readable task description */
  description: string;
  /** Whether the checkbox is checked [x] */
  completed: boolean;
  /** 1-based line number in the source file */
  lineNumber: number;
}

/**
 * A user story's complete implementation plan parsed from implementation-plan.md.
 * Aggregates all checkboxes with summary counts.
 */
export interface ImplementationPlanTask {
  /** User story reference (e.g. "US-002-001") */
  storyRef: string;
  /** Epic reference (e.g. "EPIC-001") */
  epicRef: string;
  /** Plan title extracted from the H1 heading */
  title: string;
  /** All parsed checkboxes in document order */
  checkboxes: ImplementationPlanCheckbox[];
  /** Total checkbox count */
  totalCheckboxes: number;
  /** Number of completed (checked) checkboxes */
  completedCheckboxes: number;
  /** First unchecked checkbox — the "current" task, null if all complete */
  currentCheckbox: ImplementationPlanCheckbox | null;
}

/**
 * Enhanced task progression that includes implementation-plan.md context.
 * Extends the base TaskInfo to add plan checkpoint details.
 */
export interface TaskProgressionEnhanced {
  /** Path to the implementation-plan.md file */
  planPath: string;
  /** The current (first unchecked) checkbox, null if complete */
  currentCheckbox: ImplementationPlanCheckbox | null;
  /** The next checkbox after current, null if none */
  nextCheckbox: ImplementationPlanCheckbox | null;
  /** Total / completed counts for display badge */
  totalCheckboxes: number;
  completedCheckboxes: number;
}

/**
 * A single file system operation tracked from VS Code editor events.
 * Used to display "what the agent is doing" in the action bubble.
 */
export interface FileOperation {
  /** The kind of operation inferred from VS Code editor events */
  type: 'read' | 'write' | 'delete' | 'rename';
  /** Workspace-relative file path */
  filePath: string;
  /** Unix millisecond timestamp */
  timestamp: number;
}

/**
 * Extended agent action that carries file operation history.
 * Extends the base AgentAction from agentActivityTypes.ts.
 */
export interface AgentActionEnhanced extends AgentAction {
  /** File operations performed during this action (FIFO, max 10) */
  fileOperations: FileOperation[];
  /** Optional code snippet associated with this action */
  codeSnippet?: string;
  /** Unix millisecond timestamp of the last update */
  lastUpdated: number;
}

// ── Type guards ───────────────────────────────────────────────────────────────

/**
 * Validates that a value conforms to the ImplementationPlanCheckbox contract.
 */
export function isValidCheckbox(value: unknown): value is ImplementationPlanCheckbox {
  if (!value || typeof value !== 'object') { return false; }
  const v = value as Record<string, unknown>;

  if (!VALID_LAYERS.has(v['layerNumber'] as number)) { return false; }
  if (!VALID_PHASES.has(v['phase'] as string)) { return false; }
  if (typeof v['cycleNumber'] !== 'number' || v['cycleNumber'] < 1) { return false; }
  if (typeof v['description'] !== 'string' || v['description'].trim() === '') { return false; }
  if (typeof v['completed'] !== 'boolean') { return false; }
  if (typeof v['lineNumber'] !== 'number') { return false; }

  return true;
}

/**
 * Validates that a value conforms to the FileOperation contract.
 */
export function isValidFileOperation(value: unknown): value is FileOperation {
  if (!value || typeof value !== 'object') { return false; }
  const v = value as Record<string, unknown>;

  if (!VALID_FILE_OP_TYPES.has(v['type'] as string)) { return false; }
  if (typeof v['filePath'] !== 'string' || v['filePath'].trim() === '') { return false; }
  if (typeof v['timestamp'] !== 'number' || v['timestamp'] < 0) { return false; }

  return true;
}

// ── Parsing utilities ─────────────────────────────────────────────────────────

/**
 * Parses a single markdown line and returns an ImplementationPlanCheckbox
 * if the line matches the "- [x] PHASE Phase - Cycle N: description" pattern.
 *
 * @param line     - Raw line text from implementation-plan.md
 * @param lineNumber - 1-based line number for traceability
 * @returns Parsed checkbox, or null if the line doesn't match
 */
export function parseCheckboxLine(
  line: string,
  lineNumber: number,
): ImplementationPlanCheckbox | null {
  const checkboxMatch = CHECKBOX_LINE_PATTERN.exec(line.trimEnd());
  if (!checkboxMatch) { return null; }

  const completed = checkboxMatch[1] === 'x';
  const content = checkboxMatch[2].trim();

  const phaseMatch = LAYER_PHASE_PATTERN.exec(content);
  if (!phaseMatch) { return null; }

  const phase = phaseMatch[1] as PlanPhase;
  const cycleNumber = parseInt(phaseMatch[2], 10);
  const description = phaseMatch[3].trim();

  // Layer is determined by context (the surrounding "## Layer N:" header).
  // Callers such as ImplementationPlanParser (Layer 2) must override layerNumber
  // after parsing the header.  We use 1 as a safe default here.
  return {
    layerNumber: 1,
    phase,
    cycleNumber,
    description,
    completed,
    lineNumber,
  };
}

/**
 * Returns the first unchecked checkbox from a list, or null if all are checked.
 * This is the "current" task in the progression bar.
 *
 * @param checkboxes - Array of checkboxes in document order
 * @returns First unchecked checkbox, or null
 */
export function calculateCurrentCheckbox(
  checkboxes: ImplementationPlanCheckbox[],
): ImplementationPlanCheckbox | null {
  return checkboxes.find(cb => !cb.completed) ?? null;
}
