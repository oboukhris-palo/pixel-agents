/**
 * Layer 1: Agent Activity - Type Definitions (US-001-002)
 * 
 * Purpose: Define ActionBubbleMessage contract and supporting types for agent activity metadata
 * BDD Mapping:
 *   - AC1: AgentMetadata type includes name, role, spriteColor, icon
 *   - AC3: Action type includes TDD phase + cycle number
 *   - AC6: Status field supports success / in-progress / failed / idle
 *   - AC7: Null/empty code handled via CodeSnippetInfo | null
 */

/** Supported code snippet languages for syntax highlighting */
export type CodeLanguage = 'typescript' | 'javascript' | 'css' | 'html';

/** TDD phase or documentation phase */
export type TDDPhase = 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENTATION';

/** Agent activity status */
export type AgentActivityStatus = 'in-progress' | 'success' | 'failed' | 'idle';

/**
 * Code snippet from agent's current work
 */
export interface CodeSnippetInfo {
  /** Programming language for syntax highlighting */
  language: CodeLanguage;
  /** Code content (should respect CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE) */
  content: string;
  /** Optional line numbers for display */
  lineNumbers?: number[];
}

/**
 * Agent metadata from .github/agents/ YAML frontmatter
 */
export interface AgentActivityMetadata {
  /** Agent ID / filename (e.g., 'dev-tdd-red') */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short description of agent capabilities */
  description: string;
  /** Sprite color for visual identity (hex color) */
  spriteColor?: string;
  /** Role icon (emoji) */
  icon?: string;
}

/**
 * Current agent action context
 */
export interface AgentAction {
  /** TDD phase or documentation */
  type: TDDPhase;
  /** Cycle number (1-based) */
  cycle: number;
  /** Human-readable description */
  description: string;
}

/**
 * Full agent activity state broadcasted to webview
 */
export interface AgentActivityState {
  /** Active agent metadata (null if no agent is active) */
  activeAgent: AgentActivityMetadata | null;
  /** Current action being performed */
  currentAction: AgentAction;
  /** Code snippet being written (null if none available) */
  codeSnippet: CodeSnippetInfo | null;
  /** Agent work status */
  status: AgentActivityStatus;
  /** ISO8601 UTC timestamp of last update */
  timestamp: string;
  /** Optional history snapshots for circular buffer */
  historySnapshots?: AgentActivityState[];
}

/**
 * Message sent from backend AgentActivityMonitor to frontend webview
 */
export interface ActionBubbleMessage {
  /** Message type discriminator */
  type: 'agent-activity-update';
  /** Agent activity payload */
  payload: AgentActivityState;
}

// ── ISO8601 timestamp validator ───────────────────────────────────────────────
const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

// ── Supported languages set for fast lookup ───────────────────────────────────
const VALID_LANGUAGES = new Set<string>(['typescript', 'javascript', 'css', 'html']);

// ── Valid statuses set ────────────────────────────────────────────────────────
const VALID_STATUSES = new Set<string>(['in-progress', 'success', 'failed', 'idle']);

// ── Valid TDD phases ──────────────────────────────────────────────────────────
const VALID_PHASES = new Set<string>(['RED', 'GREEN', 'REFACTOR', 'DOCUMENTATION']);

/**
 * Type guard for CodeSnippetInfo
 */
export function isValidCodeSnippetInfo(value: unknown): value is CodeSnippetInfo {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.content !== 'string') return false;
  if (!VALID_LANGUAGES.has(obj.language as string)) return false;
  return true;
}

/**
 * Type guard for AgentAction
 */
function isValidAgentAction(value: unknown): value is AgentAction {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  if (!VALID_PHASES.has(obj.type as string)) return false;
  if (typeof obj.cycle !== 'number' || obj.cycle < 1) return false;
  if (typeof obj.description !== 'string') return false;
  return true;
}

/**
 * Type guard for AgentActivityState
 */
export function isValidAgentActivityState(value: unknown): value is AgentActivityState {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;

  // activeAgent: null or object
  if (obj.activeAgent !== null && obj.activeAgent !== undefined) {
    if (typeof obj.activeAgent !== 'object') return false;
  }

  // currentAction required
  if (!isValidAgentAction(obj.currentAction)) return false;

  // codeSnippet: null or valid snippet
  if (obj.codeSnippet !== null && obj.codeSnippet !== undefined) {
    if (!isValidCodeSnippetInfo(obj.codeSnippet)) return false;
  }

  // status required
  if (!VALID_STATUSES.has(obj.status as string)) return false;

  // timestamp required and ISO8601
  if (typeof obj.timestamp !== 'string' || !ISO8601_REGEX.test(obj.timestamp)) return false;

  return true;
}

/**
 * Type guard for ActionBubbleMessage
 */
export function isValidActionBubbleMessage(value: unknown): value is ActionBubbleMessage {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  if (obj.type !== 'agent-activity-update') return false;
  if (!isValidAgentActivityState(obj.payload)) return false;
  return true;
}

/**
 * Returns a safe default AgentActivityState (idle, no agent, no snippet)
 */
export function getDefaultAgentActivityState(): AgentActivityState {
  return {
    activeAgent: null,
    currentAction: {
      type: 'DOCUMENTATION',
      cycle: 1,
      description: '',
    },
    codeSnippet: null,
    status: 'idle',
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  };
}
