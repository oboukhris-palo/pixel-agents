// ── Timing (ms) ──────────────────────────────────────────────
export const ACTIVITY_IDLE_THRESHOLD_MS = 8000;  // Time before marking agent as waiting after last event
export const ACTIVITY_POLL_INTERVAL_MS = 2000;   // Idle detection polling interval
export const EDIT_BATCH_WINDOW_MS = 500;          // Batch rapid file edits into single activity event
export const TOOL_DONE_DELAY_MS = 300;
export const PERMISSION_TIMER_DELAY_MS = 7000;
export const TEXT_IDLE_DELAY_MS = 5000;

// ── Task Progression Bar (Layer 1) ──────────────────────────
export const TASK_PROGRESSION_UPDATE_DEBOUNCE_MS = 500;  // Debounce file changes
export const TASK_PROGRESSION_REFRESH_INTERVAL_MS = 1000; // Update UI every 1 second max

// ── Action Bubble / Agent Activity Monitor (US-001-002) ─────
export const ACTION_BUBBLE_DEBOUNCE_MS = 300;    // Debounce rapid agent updates (AC9)
export const SNIPPET_HISTORY_MAX = 50;           // Circular buffer size for code history (AC8)

// Agent status values
export const AGENT_STATUS = {
	IN_PROGRESS: 'in-progress',
	SUCCESS: 'success',
	FAILED: 'failed',
	IDLE: 'idle',
} as const;

// Code display configuration
export const CODE_DISPLAY_CONFIG = {
	MAX_LINES: 15,              // Maximum lines to extract from git diff
	MAX_CHARS_PER_LINE: 200,    // Truncate lines beyond this length (AC7)
	TRUNCATION_SUFFIX: '...',   // Suffix appended to truncated lines
} as const;

// PDLC Phase to Color Mapping
// Used for visual color-coding in Task Progression Bar
export const PDLC_PHASE_COLORS: Record<string, string> = {
	'documentation': '#0078D4',  // VS Code Blue
	'red': '#E81C3F',            // VS Code Red
	'green': '#107C10',          // VS Code Green
	'refactor': '#8661C5',       // VS Code Purple
	'unknown': '#CCCCCC',        // Gray
};

// Valid Task Statuses for validation
export const VALID_TASK_STATUSES = [
	'not-started',
	'in-progress',
	'completed',
	'implemented',
	'delivered',
] as const;

// ── Display Truncation ──────────────────────────────────────
export const BASH_COMMAND_DISPLAY_MAX_LENGTH = 30;
export const TASK_DESCRIPTION_DISPLAY_MAX_LENGTH = 40;

// ── PNG / Asset Parsing ─────────────────────────────────────
export const PNG_ALPHA_THRESHOLD = 128;
export const WALL_PIECE_WIDTH = 16;
export const WALL_PIECE_HEIGHT = 32;
export const WALL_GRID_COLS = 4;
export const WALL_BITMASK_COUNT = 16;
export const FLOOR_PATTERN_COUNT = 7;
export const FLOOR_TILE_SIZE = 16;
export const CHARACTER_DIRECTIONS = ['down', 'up', 'right'] as const;
export const CHAR_FRAME_W = 16;
export const CHAR_FRAME_H = 32;
export const CHAR_FRAMES_PER_ROW = 7;
export const CHAR_COUNT = 6;

// ── User-Level Layout Persistence ─────────────────────────────
export const LAYOUT_FILE_DIR = '.pixel-agents';
export const LAYOUT_FILE_NAME = 'layout.json';
export const LAYOUT_FILE_POLL_INTERVAL_MS = 2000;

// ── Settings Persistence ────────────────────────────────────
export const GLOBAL_KEY_SOUND_ENABLED = 'pixel-agents.soundEnabled';

// ── VS Code Identifiers ─────────────────────────────────────
export const VIEW_ID = 'pixel-agents.panelView';
export const COMMAND_SHOW_PANEL = 'pixel-agents.showPanel';
export const COMMAND_EXPORT_DEFAULT_LAYOUT = 'pixel-agents.exportDefaultLayout';
export const WORKSPACE_KEY_AGENTS = 'pixel-agents.agents';
export const WORKSPACE_KEY_AGENT_SEATS = 'pixel-agents.agentSeats';
export const WORKSPACE_KEY_LAYOUT = 'pixel-agents.layout';
export const TERMINAL_NAME_PREFIX = 'Copilot Agent';

// ── Agent Handoff Configuration ──────────────────────────────
// Mapping of agent roles to their next handoff target
// When an agent completes a task, trigger handoff animation to next agent
export const AGENT_HANDOFF_MAP: Record<string, string> = {
	'orchestrator': 'po',                // Orchestrator → Product Owner
	'po': 'dev-lead',                    // Product Owner → Tech Lead
	'dev-lead': 'dev-tdd-red',           // Tech Lead → TDD RED
	'dev-tdd-red': 'dev-tdd-green',      // TDD RED → TDD GREEN
	'dev-tdd-green': 'dev-tdd-refactor', // TDD GREEN → TDD REFACTOR
	'dev-tdd-refactor': 'dev-lead',      // TDD REFACTOR → Tech Lead (next layer)
	'architect': 'dev-lead',             // Architect → Tech Lead
	'ba': 'dev-tdd',                     // Business Analyst → TDD
	'ux': 'dev-lead',                    // UX Designer → Tech Lead
};

export const HANDOFF_ANIMATION_DURATION_MS = 3000; // Handoff indicator display time
