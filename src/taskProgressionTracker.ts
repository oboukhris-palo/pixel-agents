import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TaskInfo, TaskProgressionState, TaskStatus, getDefaultTaskState, isValidTaskInfo } from './types';
import { VALID_TASK_STATUSES, TASK_PROGRESSION_UPDATE_DEBOUNCE_MS } from './constants';

// Regular expression patterns for parsing user stories
const STORY_HEADER_PATTERN = /### (US-\d+-\d+): (.+)/g;
const STATUS_PATTERN = /\*\*Status\*\*:\s*(\S+)/;
const EPIC_PATTERN = /\*\*Epic\*\*:\s*(\S+)/;
const LAYER_PATTERN = /\*\*Layer\*\*:\s*(.+)/;
const CYCLE_PATTERN = /\*\*Cycle\*\*:\s*(\S+)/;
const LAYER_EXTRACTION_PATTERN = /(Layer \d+)/;

/**
 * TaskProgressionTracker Service
 * 
 * Monitors and tracks task progression by:
 * - Parsing user-stories.md file for current project state
 * - Watching for file changes with debounced updates (when VS Code context available)
 * - Identifying previous, current, and next tasks based on status
 * - Emitting events when task progression changes
 * 
 * @example
 * // In VS Code extension context
 * const tracker = new TaskProgressionTracker('/workspace', true);
 * 
 * // Register update listener (only available when enableWatcher=true)
 * tracker.onDidChangeProgression?.(state => {
 *   console.log('Task changed:', state.current.title);
 * });
 * 
 * // Get current state (works with or without watcher)
 * const state = tracker.getCurrentTaskProgression();
 * console.log(state.current.title); // "Task Progression Bar Implementation"
 * 
 * // Cleanup when done
 * tracker.dispose();
 */
export class TaskProgressionTracker {
  private workspaceRoot: string;
  private userStoriesPath: string;
  private fileWatcher: vscode.FileSystemWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private eventEmitter: vscode.EventEmitter<TaskProgressionState> | null = null;
  
  /**
   * Event fired when task progression state changes
   * Debounced to prevent excessive updates (500ms minimum)
   * Only available when file watcher is enabled
   */
  readonly onDidChangeProgression?: vscode.Event<TaskProgressionState>;

  /**
   * Creates a new TaskProgressionTracker instance
   * @param workspaceRoot - Absolute path to workspace root directory
   * @param enableWatcher - Enable file watching and event emitting (default: false for testing)
   */
  constructor(workspaceRoot: string, enableWatcher: boolean = false) {
    this.workspaceRoot = workspaceRoot;
    this.userStoriesPath = path.join(
      workspaceRoot,
      'docs',
      '05-implementation',
      'user-stories.md'
    );
    
    // Initialize file watcher only when requested (VS Code extension context)
    if (enableWatcher) {
      this.eventEmitter = new vscode.EventEmitter<TaskProgressionState>();
      this.onDidChangeProgression = this.eventEmitter.event;
      this.initializeFileWatcher();
    }
  }
  
  /**
   * Initializes file system watcher for user-stories.md with debounced updates
   * @private
   */
  private initializeFileWatcher(): void {
    if (!this.eventEmitter) {
      return; // Watcher not enabled
    }
    
    try {
      const pattern = new vscode.RelativePattern(
        this.workspaceRoot,
        'docs/05-implementation/user-stories.md'
      );
      
      this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
      
      // Handle file changes with debouncing
      const handleChange = () => {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
          const state = this.getCurrentTaskProgression();
          this.eventEmitter?.fire(state);
        }, TASK_PROGRESSION_UPDATE_DEBOUNCE_MS);
      };
      
      this.fileWatcher.onDidChange(handleChange);
      this.fileWatcher.onDidCreate(handleChange);
      
      console.log('[TaskProgressionTracker] File watcher initialized');
    } catch (error) {
      console.error('[TaskProgressionTracker] Failed to initialize file watcher:', error);
    }
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
      const matches = Array.from(content.matchAll(STORY_HEADER_PATTERN));

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const storyId = match[1];
        const title = match[2].trim();

        // Extract content between this story and next story (or end of file)
        const startIndex = match.index! + match[0].length;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
        const storyContent = content.substring(startIndex, endIndex);

        // Parse fields from story content using extracted patterns
        const statusMatch = storyContent.match(STATUS_PATTERN);
        const epicMatch = storyContent.match(EPIC_PATTERN);
        const layerMatch = storyContent.match(LAYER_PATTERN);
        const cycleMatch = storyContent.match(CYCLE_PATTERN);

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
      const layerMatch = task.layer.match(LAYER_EXTRACTION_PATTERN);
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
   * Disposes of resources (file watcher, event emitter, debounce timer)
   * Call this when the tracker is no longer needed
   */
  dispose(): void {
    // Clear debounce timer if running
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    // Dispose file watcher
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
      this.fileWatcher = null;
    }
    
    // Dispose event emitter if it was initialized
    if (this.eventEmitter) {
      this.eventEmitter.dispose();
      this.eventEmitter = null;
    }
    
    console.log('[TaskProgressionTracker] Resources disposed');
  }
}
