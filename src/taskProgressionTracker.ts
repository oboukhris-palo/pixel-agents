import * as fs from 'fs';
import * as path from 'path';
import { TaskInfo, TaskProgressionState, TaskStatus, getDefaultTaskState, isValidTaskInfo } from './types';
import { VALID_TASK_STATUSES } from './constants';

/**
 * TaskProgressionTracker Service
 * 
 * Monitors and tracks task progression by parsing user-stories.md file
 * and identifying previous, current, and next tasks based on their status.
 * 
 * @example
 * const tracker = new TaskProgressionTracker('/workspace');
 * const state = tracker.getCurrentTaskProgression();
 * console.log(state.current.title); // "Task Progression Bar Implementation"
 */
export class TaskProgressionTracker {
  private workspaceRoot: string;
  private userStoriesPath: string;

  /**
   * Creates a new TaskProgressionTracker instance
   * @param workspaceRoot - Absolute path to workspace root directory
   */
  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.userStoriesPath = path.join(
      workspaceRoot,
      'docs',
      '05-implementation',
      'user-stories.md'
    );
  }

  /**
   * Parses user stories markdown file content into structured TaskInfo objects
   * 
   * Expected format:
   * ```markdown
   * ### US-001-001: Task Title
   * - **Status**: in-progress
   * - **Epic**: EPIC-001
   * - **Layer**: Layer 1: Description (optional)
   * - **Cycle**: RED-01 (optional)
   * ```
   * 
   * @param content - Raw markdown content from user-stories.md
   * @returns Array of parsed TaskInfo objects (empty array if parsing fails)
   */
  parseUserStoriesFile(content: string): TaskInfo[] {
    const tasks: TaskInfo[] = [];

    try {
      // Split content by story headers (### US-XXX-XXX: Title)
      const storyPattern = /### (US-\d+-\d+): (.+)/g;
      const matches = Array.from(content.matchAll(storyPattern));

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const storyId = match[1];
        const title = match[2].trim();

        // Extract content between this story and next story (or end of file)
        const startIndex = match.index! + match[0].length;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
        const storyContent = content.substring(startIndex, endIndex);

        // Parse fields from story content
        const statusMatch = storyContent.match(/\*\*Status\*\*:\s*(\S+)/);
        const epicMatch = storyContent.match(/\*\*Epic\*\*:\s*(\S+)/);
        const layerMatch = storyContent.match(/\*\*Layer\*\*:\s*(.+)/);
        const cycleMatch = storyContent.match(/\*\*Cycle\*\*:\s*(\S+)/);

        // Validate required fields
        if (!statusMatch || !epicMatch) {
          continue; // Skip story with missing required fields
        }

        const status = statusMatch[1] as TaskStatus;
        const epic = epicMatch[1];

        // Validate status value
        if (!VALID_TASK_STATUSES.includes(status)) {
          continue; // Skip story with invalid status
        }

        const task: TaskInfo = {
          storyId,
          title,
          status,
          epic,
        };

        // Add optional fields if present
        if (layerMatch) {
          task.layer = layerMatch[1].trim();
        }
        if (cycleMatch) {
          task.cycle = cycleMatch[1].trim();
        }

        tasks.push(task);
      }
    } catch (error) {
      // Return empty array on parsing errors (graceful degradation)
      console.error('[TaskProgressionTracker] Parse error:', error);
      return [];
    }

    return tasks;
  }

  /**
   * Finds the most recent completed task before the current task
   * 
   * @param current - Current task being worked on
   * @param allTasks - Complete list of tasks from user-stories.md
   * @returns Previous completed task, or null if none exists
   */
  findPreviousTask(current: TaskInfo, allTasks: TaskInfo[]): TaskInfo | null {
    const currentIndex = allTasks.findIndex(t => t.storyId === current.storyId);
    
    if (currentIndex <= 0) {
      return null; // No previous tasks exist
    }

    // Search backwards for most recent completed task
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (allTasks[i].status === 'completed' || allTasks[i].status === 'delivered') {
        return allTasks[i];
      }
    }

    return null; // No completed tasks found before current
  }

  /**
   * Finds the next not-started task after the current task
   * 
   * @param current - Current task being worked on
   * @param allTasks - Complete list of tasks from user-stories.md
   * @returns Next not-started task, or null if none exists
   */
  findNextTask(current: TaskInfo, allTasks: TaskInfo[]): TaskInfo | null {
    const currentIndex = allTasks.findIndex(t => t.storyId === current.storyId);
    
    if (currentIndex === -1 || currentIndex >= allTasks.length - 1) {
      return null; // Current task not found or is last task
    }

    // Search forwards for next not-started task
    for (let i = currentIndex + 1; i < allTasks.length; i++) {
      if (allTasks[i].status === 'not-started') {
        return allTasks[i];
      }
    }

    return null; // No not-started tasks found after current
  }

  /**
   * Extracts simplified layer and cycle information from task
   * 
   * @param task - Task with optional layer and cycle fields
   * @returns Object with extracted layer number and cycle (or undefined)
   * 
   * @example
   * extractLayerAndCycle({
   *   ...,
   *   layer: "Layer 1: Data & State Models",
   *   cycle: "RED-01"
   * })
   * // Returns: { layer: "Layer 1", cycle: "RED-01" }
   */
  extractLayerAndCycle(task: TaskInfo): { layer?: string; cycle?: string } {
    const result: { layer?: string; cycle?: string } = {};

    if (task.layer) {
      // Extract just "Layer N" from "Layer N: Description"
      const layerMatch = task.layer.match(/(Layer \d+)/);
      result.layer = layerMatch ? layerMatch[1] : undefined;
    }

    if (task.cycle) {
      result.cycle = task.cycle;
    }

    return result;
  }

  /**
   * Gets current task progression state by reading and parsing user-stories.md
   * 
   * Identifies:
   * - Previous task: Most recent completed task
   * - Current task: First in-progress task found
   * - Next task: Next not-started task after current
   * 
   * @returns TaskProgressionState with previous, current, next tasks
   * 
   * @example
   * const state = tracker.getCurrentTaskProgression();
   * console.log(state.current.storyId); // "US-001-002"
   * console.log(state.previous?.title); // "Task Progression Bar"
   * console.log(state.next?.title); // "Completeness Meter"
   */
  getCurrentTaskProgression(): TaskProgressionState {
    try {
      // Check if file exists
      if (!fs.existsSync(this.userStoriesPath)) {
        console.warn('[TaskProgressionTracker] user-stories.md not found');
        return getDefaultTaskState();
      }

      // Read and parse file
      const content = fs.readFileSync(this.userStoriesPath, 'utf-8');
      const allTasks = this.parseUserStoriesFile(content);

      if (allTasks.length === 0) {
        return getDefaultTaskState();
      }

      // Find current task (first in-progress)
      const current = allTasks.find(t => t.status === 'in-progress');

      if (!current) {
        // No in-progress task found
        return getDefaultTaskState();
      }

      // Find previous and next tasks
      const previous = this.findPreviousTask(current, allTasks);
      const next = this.findNextTask(current, allTasks);

      return {
        previous,
        current,
        next,
      };
    } catch (error) {
      console.error('[TaskProgressionTracker] Error reading task progression:', error);
      return getDefaultTaskState();
    }
  }

  /**
   * Disposes of resources (placeholder for future file watcher cleanup)
   */
  dispose(): void {
    // Placeholder for file watcher disposal
    // Will be implemented in REFACTOR phase with actual file watching
  }
}
