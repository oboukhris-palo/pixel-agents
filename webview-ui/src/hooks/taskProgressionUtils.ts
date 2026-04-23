/**
 * Shared utilities for the Task Progression Bar feature (US-001-001).
 * Extracted here to satisfy DRY — both the component and the hook need
 * phase derivation and phase-colour lookup without cross-importing each other.
 */

/** PDLC TDD phase names derived from a task's cycle string. */
export type PDLCPhase = 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENTATION';

/**
 * PDLC phase colour palette matching design-systems.md design tokens.
 * Keys are PDLCPhase values; values are hex colour strings.
 */
export const PHASE_COLORS: Readonly<Record<PDLCPhase, string>> = {
  RED: '#E81C3F',
  GREEN: '#107C10',
  REFACTOR: '#8661C5',
  DOCUMENTATION: '#0078D4',
} as const;

/**
 * Extracts the PDLC phase from a TDD cycle string (e.g. "RED-01", "GREEN-02").
 * Returns "DOCUMENTATION" for non-TDD tasks or absent / unrecognised values.
 *
 * Cyclomatic complexity: 5 (1 base + 4 branches)
 */
export function extractPhaseFromCycle(cycle?: string): PDLCPhase {
  if (!cycle) return 'DOCUMENTATION';
  if (cycle.startsWith('RED')) return 'RED';
  if (cycle.startsWith('GREEN')) return 'GREEN';
  if (cycle.startsWith('REFACTOR')) return 'REFACTOR';
  return 'DOCUMENTATION';
}
