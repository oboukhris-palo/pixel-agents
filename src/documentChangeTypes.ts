/**
 * Layer 1: Document Change Types & Validators (US-001-003)
 *
 * Purpose: Define TypeScript types for file watcher events, parse results,
 * and validation functions.
 * BDD Mapping:
 *   - AC1: File extension detection (markdown, yaml, feature files)
 *   - AC4: Event type classification (add / modify / delete)
 */

// ── Event type enum ───────────────────────────────────────────────────────────

/** Change event types emitted by the document watcher */
export enum FileChangeEvent {
  Added    = 'added',
  Modified = 'modified',
  Deleted  = 'deleted',
  All      = 'all',
}

const VALID_CHANGE_EVENTS = new Set<string>(Object.values(FileChangeEvent));

// ── Core interfaces ───────────────────────────────────────────────────────────

/**
 * Represents a single file-system change detected in the /docs/ folder.
 */
export interface DocumentChange {
  /** Absolute path to the changed file */
  path: string;
  /** Type of change */
  changeType: FileChangeEvent;
  /** Unix timestamp (ms) when the change was detected */
  timestamp: number;
  /** Whether the file is a markdown document */
  isMarkdown: boolean;
  /** Whether the file is a YAML/YML config */
  isYaml: boolean;
  /** Whether the file is a BDD feature file */
  isFeature: boolean;
}

/**
 * Parsed metrics extracted from /docs/05-implementation/user-stories.md.
 */
export interface ParsedMetrics {
  /** Number of user stories found */
  storyCount: number;
  /** Number of epics found */
  epicsCount: number;
  /** Project completion percentage (0–100) */
  completionPercent: number;
  /** Timestamp of the last update (ISO string) */
  lastUpdated: string;
}

// ── File-type predicates ──────────────────────────────────────────────────────

/** Returns true when the file path ends with .md (case-insensitive). */
export function isMarkdownFile(filePath: string): boolean {
  return /\.md$/i.test(filePath);
}

/** Returns true when the file path ends with .yml or .yaml (case-insensitive). */
export function isYamlFile(filePath: string): boolean {
  return /\.ya?ml$/i.test(filePath);
}

/** Returns true when the file path ends with .feature (case-insensitive). */
export function isFeatureFile(filePath: string): boolean {
  return /\.feature$/i.test(filePath);
}

/**
 * Returns true when the file is any monitored document type
 * (markdown, yaml, or feature).
 */
export function isDocumentFile(filePath: string): boolean {
  return isMarkdownFile(filePath) || isYamlFile(filePath) || isFeatureFile(filePath);
}

// ── Type guard ────────────────────────────────────────────────────────────────

/**
 * Type guard that validates whether a value is a well-formed DocumentChange.
 */
export function isValidDocumentChange(value: unknown): value is DocumentChange {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }
  const c = value as Record<string, unknown>;
  return (
    typeof c['path'] === 'string' &&
    c['path'].length > 0 &&
    typeof c['changeType'] === 'string' &&
    VALID_CHANGE_EVENTS.has(c['changeType']) &&
    typeof c['timestamp'] === 'number'
  );
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a DocumentChange with file-type flags and a current timestamp.
 *
 * @param filePath   - Absolute path to the changed file
 * @param changeType - FileChangeEvent describing the mutation
 */
export function createDocumentChange(
  filePath: string,
  changeType: FileChangeEvent,
): DocumentChange {
  return {
    path: filePath,
    changeType,
    timestamp: Date.now(),
    isMarkdown: isMarkdownFile(filePath),
    isYaml: isYamlFile(filePath),
    isFeature: isFeatureFile(filePath),
  };
}

// ── Defaults ──────────────────────────────────────────────────────────────────

/** Returns a zeroed-out ParsedMetrics instance. */
export function getDefaultParsedMetrics(): ParsedMetrics {
  return {
    storyCount: 0,
    epicsCount: 0,
    completionPercent: 0,
    lastUpdated: new Date().toISOString(),
  };
}
