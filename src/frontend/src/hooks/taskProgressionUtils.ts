/**
 * Shared utilities for the Task Progression Bar feature (US-001-001).
 * Extracted here to satisfy DRY — both the component and the hook need
 * phase derivation and phase-colour lookup without cross-importing each other.
 */

/** PDLC TDD phase names derived from a task's cycle string. */
export type PDLCPhase = 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENTATION';

/**
 * PDLC phase colour palette matching design-systems.md v2.0.0 design tokens (Palo IT branding).
 * Keys are PDLCPhase values; values reference CSS custom properties from tokens.css.
 * 
 * TDD Phase Colors (Phase 8 Implementation):
 * - RED: var(--tdd-red) #FF5500 (bg #3E1D00) - Test Writing Phase
 * - GREEN: var(--tdd-green) #10B981 (bg #052E16) - Implementation Phase  
 * - REFACTOR: var(--tdd-refactor) #8B5CF6 (bg #1E0A3C) - Code Cleanup Phase
 * - DOCUMENTATION: var(--tdd-document) #06B6D4 (bg #0A2530) - Documentation Phase
 */
export const PHASE_COLORS: Readonly<Record<PDLCPhase, string>> = {
  RED: 'var(--tdd-red)',
  GREEN: 'var(--tdd-green)',
  REFACTOR: 'var(--tdd-refactor)',
  DOCUMENTATION: 'var(--tdd-document)',
} as const;

/**
 * PDLC phase background colours for current task cards.
 * Uses semi-transparent versions for visual depth while maintaining legibility.
 */
export const PHASE_BG_COLORS: Readonly<Record<PDLCPhase, string>> = {
  RED: 'var(--tdd-red-bg)',
  GREEN: 'var(--tdd-green-bg)',
  REFACTOR: 'var(--tdd-refactor-bg)',
  DOCUMENTATION: 'var(--tdd-document-bg)',
} as const;

/**
 * PDLC phase glow effects for current task emphasis.
 * Applied as box-shadow to create visual prominence.
 */
export const PHASE_GLOW: Readonly<Record<PDLCPhase, string>> = {
  RED: 'var(--glow-red)',
  GREEN: 'var(--glow-green)',
  REFACTOR: 'var(--glow-purple)',
  DOCUMENTATION: 'var(--glow-blue)',
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
