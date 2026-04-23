/**
 * Layer 1: Agent Activity - Type Definitions Tests (RED phase)
 * 
 * Purpose: Validate TypeScript types for ActionBubble feature (US-001-002)
 * BDD Mapping:
 *   - AC1: AgentMetadata type includes name, role, spriteColor, icon
 *   - AC3: Action type includes TDD phase + cycle number
 *   - AC6: Status field supports success / in-progress / failed
 *   - AC7: Null/empty code handled via type (CodeSnippetInfo | null)
 */

import {
  isValidActionBubbleMessage,
  isValidAgentActivityState,
  isValidCodeSnippetInfo,
  getDefaultAgentActivityState,
  ActionBubbleMessage,
  AgentActivityState,
  CodeSnippetInfo,
  AgentActivityStatus,
  TDDPhase,
} from '../agentActivityTypes';

import {
  AGENT_STATUS,
  CODE_DISPLAY_CONFIG,
  ACTION_BUBBLE_DEBOUNCE_MS,
  SNIPPET_HISTORY_MAX,
} from '../constants';

describe('Layer 1: Agent Activity Types', () => {
  // ── Constants ────────────────────────────────────────────────────────────────

  describe('Constants', () => {
    it('AGENT_STATUS defines valid status values', () => {
      expect(AGENT_STATUS).toEqual(
        expect.objectContaining({
          IN_PROGRESS: 'in-progress',
          SUCCESS: 'success',
          FAILED: 'failed',
          IDLE: 'idle',
        }),
      );
    });

    it('CODE_DISPLAY_CONFIG defines max lines and max chars', () => {
      expect(CODE_DISPLAY_CONFIG.MAX_LINES).toBeGreaterThan(0);
      expect(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE).toBeGreaterThanOrEqual(200);
    });

    it('ACTION_BUBBLE_DEBOUNCE_MS is 300ms', () => {
      expect(ACTION_BUBBLE_DEBOUNCE_MS).toBe(300);
    });

    it('SNIPPET_HISTORY_MAX is 50', () => {
      expect(SNIPPET_HISTORY_MAX).toBe(50);
    });
  });

  // ── CodeSnippetInfo ──────────────────────────────────────────────────────────

  describe('CodeSnippetInfo', () => {
    it('validates a correct snippet', () => {
      const snippet: CodeSnippetInfo = {
        language: 'typescript',
        content: 'const x = 1;',
      };
      expect(isValidCodeSnippetInfo(snippet)).toBe(true);
    });

    it('rejects null', () => {
      expect(isValidCodeSnippetInfo(null)).toBe(false);
    });

    it('rejects missing content', () => {
      expect(isValidCodeSnippetInfo({ language: 'typescript' })).toBe(false);
    });

    it('rejects invalid language', () => {
      expect(isValidCodeSnippetInfo({ language: 'ruby', content: 'puts 1' })).toBe(false);
    });

    it('accepts all supported languages', () => {
      const langs = ['typescript', 'javascript', 'css', 'html'];
      for (const lang of langs) {
        expect(isValidCodeSnippetInfo({ language: lang, content: 'x' })).toBe(true);
      }
    });
  });

  // ── AgentActivityState ───────────────────────────────────────────────────────

  describe('AgentActivityState', () => {
    const validState: AgentActivityState = {
      activeAgent: {
        id: 'dev-tdd-red',
        name: 'TDD RED Phase Agent',
        description: 'Writes failing tests',
        spriteColor: '#E81C3F',
        icon: '🔴',
      },
      currentAction: {
        type: 'RED',
        cycle: 1,
        description: 'Write failing test for email validation',
      },
      codeSnippet: {
        language: 'typescript',
        content: 'expect(validate(email)).toBe(true);',
      },
      status: 'in-progress',
      timestamp: '2026-04-23T09:45:33Z',
    };

    it('validates a complete state', () => {
      expect(isValidAgentActivityState(validState)).toBe(true);
    });

    it('validates state with null activeAgent', () => {
      expect(isValidAgentActivityState({ ...validState, activeAgent: null })).toBe(true);
    });

    it('validates state with null codeSnippet (AC7)', () => {
      expect(isValidAgentActivityState({ ...validState, codeSnippet: null })).toBe(true);
    });

    it('rejects missing status', () => {
      const { status, ...withoutStatus } = validState;
      expect(isValidAgentActivityState(withoutStatus)).toBe(false);
    });

    it('rejects invalid status', () => {
      expect(isValidAgentActivityState({ ...validState, status: 'running' })).toBe(false);
    });

    it('validates all TDD phase action types (AC3)', () => {
      const phases: TDDPhase[] = ['RED', 'GREEN', 'REFACTOR', 'DOCUMENTATION'];
      for (const type of phases) {
        const s = { ...validState, currentAction: { ...validState.currentAction, type } };
        expect(isValidAgentActivityState(s)).toBe(true);
      }
    });

    it('rejects cycle number < 1', () => {
      const s = { ...validState, currentAction: { ...validState.currentAction, cycle: 0 } };
      expect(isValidAgentActivityState(s)).toBe(false);
    });

    it('validates timestamp is ISO8601', () => {
      expect(isValidAgentActivityState(validState)).toBe(true);
    });

    it('rejects invalid timestamp', () => {
      expect(isValidAgentActivityState({ ...validState, timestamp: 'not-a-date' })).toBe(false);
    });
  });

  // ── ActionBubbleMessage ──────────────────────────────────────────────────────

  describe('ActionBubbleMessage', () => {
    const validMsg: ActionBubbleMessage = {
      type: 'agent-activity-update',
      payload: {
        activeAgent: null,
        currentAction: { type: 'DOCUMENTATION', cycle: 1, description: '' },
        codeSnippet: null,
        status: 'idle',
        timestamp: '2026-04-23T09:45:33Z',
      },
    };

    it('validates a correct message', () => {
      expect(isValidActionBubbleMessage(validMsg)).toBe(true);
    });

    it('rejects wrong message type discriminator', () => {
      expect(isValidActionBubbleMessage({ ...validMsg, type: 'other' })).toBe(false);
    });

    it('rejects missing payload', () => {
      expect(isValidActionBubbleMessage({ type: 'agent-activity-update' })).toBe(false);
    });

    it('rejects invalid payload', () => {
      expect(isValidActionBubbleMessage({ ...validMsg, payload: null })).toBe(false);
    });
  });

  // ── getDefaultAgentActivityState ─────────────────────────────────────────────

  describe('getDefaultAgentActivityState', () => {
    it('returns a valid default state with idle status', () => {
      const state = getDefaultAgentActivityState();
      expect(state.status).toBe('idle');
      expect(state.activeAgent).toBeNull();
      expect(state.codeSnippet).toBeNull();
    });

    it('returns state that passes isValidAgentActivityState', () => {
      expect(isValidAgentActivityState(getDefaultAgentActivityState())).toBe(true);
    });
  });

  // ── AgentActivityStatus type guard ───────────────────────────────────────────

  describe('Status type constraints', () => {
    it('accepts all valid status values (AC6)', () => {
      const statuses: AgentActivityStatus[] = ['in-progress', 'success', 'failed', 'idle'];
      for (const status of statuses) {
        const s: AgentActivityState = {
          activeAgent: null,
          currentAction: { type: 'DOCUMENTATION', cycle: 1, description: '' },
          codeSnippet: null,
          status,
          timestamp: '2026-04-23T00:00:00Z',
        };
        expect(isValidAgentActivityState(s)).toBe(true);
      }
    });
  });
});
