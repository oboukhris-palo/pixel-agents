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


