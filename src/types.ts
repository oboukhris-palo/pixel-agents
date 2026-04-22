/**
 * LAYER 1: Task Progression Bar - Type Definitions
 * BDD Mapping: Display task progression with previous, current, next tasks
 */

/** Task status enumeration */
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'implemented' | 'delivered';

/** PDLC phase enumeration */
export type PDLCPhase = 'Documentation' | 'RED' | 'GREEN' | 'REFACTOR';

/** Individual task information */
export interface TaskInfo {
	/** User story ID (e.g., US-001-001) */
	storyId: string;
	/** Story title */
	title: string;
	/** Current status */
	status: TaskStatus;
	/** Parent epic (e.g., EPIC-001) */
	epic: string;
	/** Current implementation layer (e.g., "Layer 1: Database & Domain") */
	layer?: string;
	/** Current TDD cycle (e.g., "RED-01") */
	cycle?: string;
}

/** Task progression state (previous, current, next) */
export interface TaskProgressionState {
	/** Previously completed task */
	previous: TaskInfo | null;
	/** Currently active task (required) */
	current: TaskInfo;
	/** Next task to execute */
	next: TaskInfo | null;
}

/**
 * Type guard to validate TaskInfo structure
 * @param value Unknown value to validate
 * @returns True if value is a valid TaskInfo object
 */
export function isValidTaskInfo(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false;
	const obj = value as Record<string, unknown>;
	
	// Check for required fields
	if (typeof obj.storyId !== 'string') return false;
	if (typeof obj.title !== 'string') return false;
	if (typeof obj.epic !== 'string') return false;
	
	// Validate status if present
	if (obj.status !== undefined) {
		const validStatuses: TaskStatus[] = ['not-started', 'in-progress', 'completed', 'implemented', 'delivered'];
		if (!validStatuses.includes(obj.status as TaskStatus)) return false;
	}
	
	// Validate layer and cycle are strings if present
	if (obj.layer !== undefined && typeof obj.layer !== 'string') return false;
	if (obj.cycle !== undefined && typeof obj.cycle !== 'string') return false;
	
	return true;
}

/**
 * Get default empty task progression state
 * Used when no task data is available yet
 * @returns Default TaskProgressionState with "Unknown" placeholders
 */
export function getDefaultTaskState(): TaskProgressionState {
	return {
		previous: null,
		current: {
			storyId: 'Unknown',
			title: 'N/A',
			status: 'not-started',
			epic: 'Unknown',
		},
		next: null,
	};
}

/**
 * Map PDLC phase to visual color
 * @param phase PDLC phase name
 * @returns Color string (blue, red, green, purple, gray)
 */
export function getPhaseColor(phase: string): string {
	const normalizedPhase = phase.toLowerCase();
	
	switch (normalizedPhase) {
		case 'documentation':
			return 'blue';
		case 'red':
			return 'red';
		case 'green':
			return 'green';
		case 'refactor':
			return 'purple';
		default:
			return 'gray';
	}
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


