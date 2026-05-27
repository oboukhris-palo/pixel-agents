/**
 * Framework Configuration Types
 * 
 * Defines the mode flags and project parameters for gene2-core framework integration.
 * These settings control agent behavior, workflow enforcement, and PRU optimization.
 * 
 * Based on gene2-core v2.0.1 framework-config.mjs pattern
 */

/**
 * Framework mode configuration
 * Controls agent behavior and workflow enforcement per project
 */
export interface FrameworkConfig {
	/** Enforce RED→GREEN→REFACTOR per implementation layer */
	tddMode: boolean;
	
	/** BA generates .feature files; RED phase uses them as test scaffolding */
	bddMode: boolean;
	
	/** DDD patterns enforced (aggregates, value objects, domain events) */
	dddMode: boolean;
	
	/** Orchestrator/decision agents use 'grill-me' skill for Q&A-driven validation */
	grillMeMode: boolean;
	
	/** TDD agents use 'caveman' skill (~75% fewer tokens) */
	cavemanMode: boolean;
	
	/** Auto-set when tddMode=false && bddMode=false && dddMode=false (YOLO mode) */
	approvalMode: boolean;
}

/**
 * PRU (Prompt Resource Units) consumption tracking
 * Monitors token usage and cost across agent sessions
 */
export interface PRUMetrics {
	/** Current PRU consumption for this project */
	currentConsumption: number;
	
	/** Estimated PRU needed to complete remaining work */
	estimatedCompletion: number;
	
	/** Total PRU budget for project (if set) */
	totalBudget?: number;
	
	/** PRU consumed per completed story (average) */
	averagePerStory?: number;
	
	/** Last updated timestamp */
	lastUpdated: Date;
}

/**
 * Default framework configuration (all modes disabled = YOLO/approval mode)
 */
export function getDefaultFrameworkConfig(): FrameworkConfig {
	return {
		tddMode: false,
		bddMode: false,
		dddMode: false,
		grillMeMode: false,
		cavemanMode: false,
		approvalMode: true, // Auto-enabled when TDD/BDD/DDD all false
	};
}

/**
 * Default PRU metrics (zero state)
 */
export function getDefaultPRUMetrics(): PRUMetrics {
	return {
		currentConsumption: 0,
		estimatedCompletion: 0,
		lastUpdated: new Date(),
	};
}

/**
 * Framework configuration message sent from extension to webview
 */
export interface FrameworkConfigMessage {
	type: 'framework.config';
	config: FrameworkConfig;
	pruMetrics: PRUMetrics;
}
