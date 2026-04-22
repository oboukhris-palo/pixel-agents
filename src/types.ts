/**
 * LAYER 1: Task Progression Bar - Type Definitions
 * 
 * Purpose: Define TypeScript types and utilities for task progression state management
 * Used by: TaskProgressionBar component (Layer 4), TaskProgressionTracker service (Layer 2)
 * BDD Mapping:
 *   - Display task progression bar with 3 sections (Previous, Current, Next)
 *   - Show task details with story ID, title, layer, cycle, epic
 *   - Color-code by PDLC phase (Documentation, RED, GREEN, REFACTOR)
 *   - Update within 500ms of file changes
 *   - Handle missing/incomplete data gracefully
 */

import { VALID_TASK_STATUSES, PDLC_PHASE_COLORS } from './constants';

/** Task status enumeration */
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'implemented' | 'delivered';

/** PDLC phase enumeration */
export type PDLCPhase = 'Documentation' | 'RED' | 'GREEN' | 'REFACTOR';

/**
 * Individual task information
 * Represents a user story or work item in the project workflow
 * @example
 * {
 *   storyId: 'US-001-001',
 *   title: 'Task Progression Bar Implementation',
 *   status: 'in-progress',
 *   epic: 'EPIC-001',
 *   layer: 'Layer 1: Database & Domain',
 *   cycle: 'RED-01'
 * }
 */
export interface TaskInfo {
	/** User story ID (e.g., US-001-001, must be non-empty) */
	storyId: string;
	/** Story title/name */
	title: string;
	/** Current status of the task */
	status: TaskStatus;
	/** Parent epic identifier (e.g., EPIC-001) */
	epic: string;
	/** Current implementation layer (optional, e.g., "Layer 1: Database & Domain") */
	layer?: string;
	/** Current TDD cycle (optional, e.g., "RED-01", "GREEN-01", "REFACTOR-01") */
	cycle?: string;
}

/**
 * Task progression state representing workflow context
 * Shows previous (completed), current (active), and next (upcoming) tasks
 * @example
 * {
 *   previous: { storyId: 'US-000-001', title: 'Kickoff', ... },
 *   current: { storyId: 'US-001-001', title: 'Task Bar', layer: 'Layer 1', cycle: 'RED-01' },
 *   next: { storyId: 'US-001-002', title: 'Status Bar', ... }
 * }
 */
export interface TaskProgressionState {
	/** Previously completed task (null if no history) */
	previous: TaskInfo | null;
	/** Currently active task (always present, never null) */
	current: TaskInfo;
	/** Next task in queue (null if no upcoming task) */
	next: TaskInfo | null;
}

/**
 * LAYER 3: Message Protocol - Task Progression Message
 * 
 * Message sent from backend (TaskProgressionTracker) to frontend webview
 * for real-time task progression updates.
 * 
 * @example
 * const message: TaskProgressionMessage = {
 *   type: 'taskProgression',
 *   previous: { storyId: 'US-001-001', title: 'Task Bar', status: 'completed', epic: 'EPIC-001' },
 *   current: { storyId: 'US-001-002', title: 'Context Window', status: 'in-progress', epic: 'EPIC-001', layer: 'Layer 2', cycle: 'GREEN-01' },
 *   next: { storyId: 'US-001-003', title: 'Completeness Meter', status: 'not-started', epic: 'EPIC-001' }
 * };
 * 
 * // Backend sends:
 * provider.sendTaskProgressionUpdate(state);
 * 
 * // Frontend receives:
 * vscode.postMessage(message);
 */
export interface TaskProgressionMessage {
	/** Message type discriminator for webview message routing */
	type: 'taskProgression';
	/** Previously completed task (null if no history) */
	previous: TaskInfo | null;
	/** Currently active task (always present, never null) */
	current: TaskInfo;
	/** Next task in queue (null if no upcoming task) */
	next: TaskInfo | null;
}

/**
 * Type guard to validate TaskInfo structure at runtime
 * Ensures required fields are present and have correct types
 * @param value Unknown value to validate
 * @returns True if value conforms to TaskInfo interface
 * @example
 * if (isValidTaskInfo(someData)) {
 *   // TypeScript now narrows type to TaskInfo
 *   console.log(someData.storyId);
 * }
 */
export function isValidTaskInfo(value: unknown): boolean {
	// Reject non-objects and null
	if (!value || typeof value !== 'object') return false;
	const obj = value as Record<string, unknown>;
	
	// Validate required fields: storyId, title, epic (string)
	if (typeof obj.storyId !== 'string' || obj.storyId.length === 0) return false;
	if (typeof obj.title !== 'string') return false;
	if (typeof obj.epic !== 'string' || obj.epic.length === 0) return false;
	
	// Validate status if present (must be in VALID_TASK_STATUSES)
	if (obj.status !== undefined) {
		const validStatuses = VALID_TASK_STATUSES as readonly string[];
		if (!validStatuses.includes(obj.status as string)) return false;
	}
	
	// Validate optional fields are strings when present
	if (obj.layer !== undefined && typeof obj.layer !== 'string') return false;
	if (obj.cycle !== undefined && typeof obj.cycle !== 'string') return false;
	
	return true;
}

/**
 * Get default empty task progression state
 * Used when no task data is available yet (e.g., on initial load, no active story)
 * Shows "Unknown" placeholders to handle gracefully missing information
 * @returns TaskProgressionState with safe default values
 * @example
 * const defaultState = getDefaultTaskState();
 * // { previous: null, current: { storyId: 'Unknown', title: 'N/A', ... }, next: null }
 */
export function getDefaultTaskState(): TaskProgressionState {
	return {
		previous: null,
		current: {
			storyId: 'Unknown',
			title: 'N/A',
			status: 'not-started',
			epic: 'Unknown',
			// layer and cycle intentionally omitted for empty state
		},
		next: null,
	};
}

/**
 * Map PDLC phase to visual color for Task Progression Bar UI
 * Case-insensitive phase matching
 * @param phase PDLC phase name (e.g., 'Documentation', 'RED', 'GREEN', 'REFACTOR')
 * @returns CSS color value or hex code (e.g., '#0078D4' for blue, '#E81C3F' for red)
 * @example
 * const color = getPhaseColor('RED');        // '#E81C3F' (red)
 * const color = getPhaseColor('Documentation');  // '#0078D4' (blue)
 * const color = getPhaseColor('UNKNOWN');     // '#CCCCCC' (gray)
 */
export function getPhaseColor(phase: string): string {
	const normalizedPhase = phase.toLowerCase();
	return PDLC_PHASE_COLORS[normalizedPhase] || PDLC_PHASE_COLORS['unknown'];
}

export interface WorkflowState {
	/** Current workflow type */
	workflow: 'PDLC' | 'Implementation' | 'CI/CD' | 'None';
	/** PDLC stage (1-8) if in PDLC workflow */
	pdlcStage?: number;
	/** Total PDLC stages */
	pdlcTotal?: number;
	/** PDLC stage completion percentage */
	pdlcProgress?: number;
	/** PRD documents status (which docs exist) */
	prdDocuments?: {
		'requirements': boolean;
		'personas': boolean;
		'architecture-design': boolean;
		'user-stories': boolean;
		'tech-spec': boolean;
		'test-strategies': boolean;
		'deployment-plan': boolean;
		'release-notes': boolean;
	};
	/** PRD maturity score (0-100) based on document completeness */
	maturityScore?: number;
	/** List of missing PRD documents */
	missingDocuments?: string[];
	/** Whether project is ready for implementation (maturity >= 75%) */
	readyForImplementation?: boolean;
	/** Implementation phase substep */
	implementationPhase?: 'Planning' | 'TDD-RED' | 'TDD-GREEN' | 'TDD-REFACTOR' | 'Validation';
	/** Current user story being worked on */
	activeUserStory?: string;
	/** Current TDD layer (Database/Backend/Config/Frontend) */
	activeTddLayer?: string;
	/** Active documents being created/edited */
	activeDocuments?: string[];
	/** Project completion percentage */
	projectCompletion?: number;
	/** Total user stories */
	totalStories?: number;
	/** Completed stories */
	completedStories?: number;
	/** Current sprint info */
	currentSprint?: string;
	/** Epic progress data */
	epicProgress?: Array<{ name: string; completion: number }>;
	/** Last update timestamp */
	lastUpdate?: number;
}

export interface AgentState {
	id: number;
	activeToolIds: Set<string>;
	activeToolStatuses: Map<string, string>;
	activeToolNames: Map<string, string>;
	isWaiting: boolean;
	permissionSent: boolean;
	lastActivityTimestamp: number;
	/** Workspace folder name (only set for multi-root workspaces) */
	folderName?: string;
	/** Agent role/name from .github/agents/*.agent.md */
	agentRole?: string;
	/** Currently accessed file path (for .github highlighting) */
	currentFilePath?: string;
}

export interface PersistedAgent {
	id: number;
	/** Workspace folder name (only set for multi-root workspaces) */
	folderName?: string;
}


