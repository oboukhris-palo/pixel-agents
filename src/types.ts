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
}

export interface PersistedAgent {
	id: number;
	/** Workspace folder name (only set for multi-root workspaces) */
	folderName?: string;
}


