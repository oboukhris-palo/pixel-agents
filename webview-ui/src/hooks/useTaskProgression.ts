import { useExtensionMessages, type TaskProgressionState, type TaskInfo } from './useExtensionMessages';
import { extractPhaseFromCycle, type PDLCPhase } from './taskProgressionUtils';

// Re-export PDLCPhase so consumers can import it from a single location.
export type { PDLCPhase };

export interface UseTaskProgressionResult {
  /** Full task progression state (previous, current, next) */
  taskProgression: TaskProgressionState | null | undefined;
  /** The currently active task, or null if unavailable */
  currentTask: TaskInfo | null;
  /** The previously completed task, or null if none */
  previousTask: TaskInfo | null;
  /** The next predicted task, or null if unavailable */
  nextTask: TaskInfo | null;
  /** PDLC phase derived from current task cycle (RED/GREEN/REFACTOR/DOCUMENTATION) */
  currentPhase: PDLCPhase | null;
  /** True while task progression data has not yet been received (null, not just empty) */
  isLoading: boolean;
  /** Error message if task progression loading failed */
  error: string | undefined;
}

/**
 * Custom hook that provides task progression state for the Task Progression Bar.
 * Wraps useExtensionMessages and exposes derived, semantically named accessors so
 * components do not need to understand the raw message shape.
 *
 * Note: useExtensionMessages is jest.mock'd in unit tests so the
 * `() => null as any` stub for getOfficeState is never invoked during testing.
 */
export function useTaskProgression(): UseTaskProgressionResult {
  // useExtensionMessages is called without getOfficeState callback since useTaskProgression
  // only needs task progression messages, not office/layout state.
  const messages = useExtensionMessages();

  const taskProgression = messages.taskProgression as TaskProgressionState | null | undefined;
  // `error` is not part of the declared ExtensionMessageState shape but may be
  // injected by test mocks to verify error-state handling. The double cast
  // through `unknown` is intentional — it explicitly acknowledges this is an
  // escape hatch for the test mock pattern, not a production code path.
  const error = (messages as unknown as Record<string, unknown>).error as string | undefined;

  const currentTask: TaskInfo | null = taskProgression?.current ?? null;
  const previousTask: TaskInfo | null = taskProgression?.previous ?? null;
  const nextTask: TaskInfo | null = taskProgression?.next ?? null;

  // Phase is derived solely from the current task's TDD cycle string.
  const currentPhase: PDLCPhase | null = currentTask
    ? extractPhaseFromCycle(currentTask.cycle)
    : null;

  // isLoading distinguishes "not yet received" (null) from "received but empty" (object with nulls).
  const isLoading = taskProgression === null;

  return { taskProgression, currentTask, previousTask, nextTask, currentPhase, isLoading, error };
}
