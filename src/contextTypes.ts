/**
 * Token usage types and calculation utilities for the Context Window Bar.
 * Tracks Copilot Chat context consumption across .github, project, and chat sources.
 */

// --- Constants ---

/** Threshold boundaries (%) for context usage levels */
export const THRESHOLD_SAFE_MAX = 69;
export const THRESHOLD_WARNING_MAX = 89;

/** Color codes for each threshold level (matches VS Code status bar conventions) */
export const THRESHOLD_COLORS: Record<TokenThreshold, string> = {
  safe: '#28a745',
  warning: '#ffc107',
  critical: '#dc3545',
};

// --- Types ---

export type TokenThreshold = 'safe' | 'warning' | 'critical';

/** Breakdown of token usage by source category */
export interface TokenBreakdown {
  /** Tokens consumed by .github instructions and agent files */
  githubCode: number;
  /** Tokens consumed by src/ and project source files */
  projectCode: number;
  /** Tokens consumed by Copilot Chat conversation history */
  chatHistory: number;
}

/** Complete token usage snapshot */
export interface TokenUsage {
  /** Total available tokens in the context window */
  total: number;
  /** Currently consumed tokens */
  used: number;
  /** Usage as a percentage (0-100) */
  percentage: number;
  /** Breakdown by source category */
  breakdown: TokenBreakdown;
  /** Current usage level */
  threshold: TokenThreshold;
}

// --- Calculation Functions ---

/**
 * Calculates token usage as a percentage, clamped to [0, 100].
 * Uses OpenAI approximation: chars / 4 ≈ tokens.
 */
export function calculateTokenPercentage(used: number, total: number): number {
  if (total <= 0) return 0;
  const clamped = Math.max(0, Math.min(used, total));
  return Math.round((clamped / total) * 100);
}

/**
 * Determines threshold level based on usage percentage.
 * - safe:     0-69%
 * - warning:  70-89%
 * - critical: 90-100%
 */
export function calculateThreshold(percentage: number): TokenThreshold {
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'safe';
}

/**
 * Returns the display color for a given threshold level.
 */
export function getThresholdColor(threshold: TokenThreshold): string {
  return THRESHOLD_COLORS[threshold];
}

/**
 * Type guard: validates a TokenUsage object is internally consistent.
 * Checks that breakdown sum equals used, and all values are non-negative.
 */
export function isValidTokenUsage(usage: TokenUsage): boolean {
  const { used, breakdown } = usage;
  if (used < 0 || usage.total < 0) return false;
  const breakdownSum =
    breakdown.githubCode + breakdown.projectCode + breakdown.chatHistory;
  return breakdownSum === used;
}
