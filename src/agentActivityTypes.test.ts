/**
 * Layer 1 Tests: Agent Activity Types & Validation
 * Story: US-001-002 - Real-Time Agent Activity Monitor with Code Snippets
 * 
 * Tests validate type contracts for ActionBubbleMessage, AgentActivityState,
 * and CodeSnippetInfo following BDD scenarios from features/agent-activity-display.feature
 */

import {
  CodeSnippetInfo,
  AgentActivityState,
  ActionBubbleMessage,
  isValidCodeSnippet,
  isValidActivityState,
  isValidActionBubbleMessage,
  TDDPhase,
  AgentStatus,
  CODE_DISPLAY_CONFIG,
} from './agentActivityTypes';

describe('Agent Activity Types - Layer 1', () => {
  describe('CodeSnippetInfo Type', () => {
    it('should validate a valid code snippet', () => {
      const snippet: CodeSnippetInfo = {
        language: 'typescript',
        content: 'const foo = "bar";',
        lineNumbers: [42, 43],
      };
      
      expect(isValidCodeSnippet(snippet)).toBe(true);
    });
    
    it('should support all valid languages', () => {
      const languages = ['typescript', 'javascript', 'css', 'html'] as const;
      
      languages.forEach(lang => {
        const snippet: CodeSnippetInfo = {
          language: lang,
          content: 'code',
          lineNumbers: [1],
        };
        expect(isValidCodeSnippet(snippet)).toBe(true);
      });
    });
    
    it('should reject invalid language', () => {
      const snippet = {
        language: 'python', // Not supported
        content: 'print("hello")',
        lineNumbers: [1],
      };
      
      expect(isValidCodeSnippet(snippet as any)).toBe(false);
    });
    
    it('should reject content exceeding max chars per line (AC7)', () => {
      const longLine = 'x'.repeat(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE + 1);
      const snippet: CodeSnippetInfo = {
        language: 'typescript',
        content: longLine,
        lineNumbers: [1],
      };
      
      expect(isValidCodeSnippet(snippet)).toBe(false);
    });
    
    it('should allow content within max chars per line', () => {
      const validLine = 'x'.repeat(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE);
      const snippet: CodeSnippetInfo = {
        language: 'typescript',
        content: validLine,
        lineNumbers: [1],
      };
      
      expect(isValidCodeSnippet(snippet)).toBe(true);
    });
    
    it('should handle optional lineNumbers', () => {
      const snippet: CodeSnippetInfo = {
        language: 'javascript',
        content: 'const x = 1;',
      };
      
      expect(isValidCodeSnippet(snippet)).toBe(true);
    });
    
    it('should reject empty content', () => {
      const snippet: CodeSnippetInfo = {
        language: 'typescript',
        content: '',
        lineNumbers: [1],
      };
      
      expect(isValidCodeSnippet(snippet)).toBe(false);
    });
  });
  
  describe('AgentActivityState Type', () => {
    it('should validate a complete activity state', () => {
      const state: AgentActivityState = {
        activeAgent: {
          name: 'dev-tdd-red',
          role: 'RED Phase Agent',
          spriteColor: '#FF5500',
          icon: '🔴',
        },
        currentAction: {
          type: 'RED',
          cycle: 1,
          description: 'Write failing test for email validation',
        },
        codeSnippet: {
          language: 'typescript',
          content: 'expect(validateEmail("invalid")).toBe(false);',
          lineNumbers: [42],
        },
        status: 'in-progress',
        timestamp: '2026-04-24T20:00:00Z',
      };
      
      expect(isValidActivityState(state)).toBe(true);
    });
    
    it('should support all TDD phases (AC3)', () => {
      const phases: TDDPhase[] = ['RED', 'GREEN', 'REFACTOR', 'DOCUMENTATION'];
      
      phases.forEach(phase => {
        const state: AgentActivityState = {
          activeAgent: null,
          currentAction: {
            type: phase,
            cycle: 1,
            description: `Test ${phase} phase`,
          },
          codeSnippet: null,
          status: 'idle',
          timestamp: '2026-04-24T20:00:00Z',
        };
        
        expect(isValidActivityState(state)).toBe(true);
      });
    });
    
    it('should support all agent statuses (AC6)', () => {
      const statuses: AgentStatus[] = ['in-progress', 'success', 'failed', 'idle'];
      
      statuses.forEach(status => {
        const state: AgentActivityState = {
          activeAgent: null,
          currentAction: {
            type: 'RED',
            cycle: 1,
            description: 'Test',
          },
          codeSnippet: null,
          status,
          timestamp: '2026-04-24T20:00:00Z',
        };
        
        expect(isValidActivityState(state)).toBe(true);
      });
    });
    
    it('should allow null activeAgent when no agent is active', () => {
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'RED',
          cycle: 1,
          description: 'Manual TDD cycle',
        },
        codeSnippet: null,
        status: 'idle',
        timestamp: '2026-04-24T20:00:00Z',
      };
      
      expect(isValidActivityState(state)).toBe(true);
    });
    
    it('should allow null codeSnippet when no code is available (AC7)', () => {
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'DOCUMENTATION',
          cycle: 1,
          description: 'Write README',
        },
        codeSnippet: null,
        status: 'in-progress',
        timestamp: '2026-04-24T20:00:00Z',
      };
      
      expect(isValidActivityState(state)).toBe(true);
    });
    
    it('should validate cycle is positive integer', () => {
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'GREEN',
          cycle: 0, // Invalid: must be >= 1
          description: 'Implement code',
        },
        codeSnippet: null,
        status: 'in-progress',
        timestamp: '2026-04-24T20:00:00Z',
      };
      
      expect(isValidActivityState(state)).toBe(false);
    });
    
    it('should validate timestamp is ISO8601 format', () => {
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'REFACTOR',
          cycle: 1,
          description: 'Clean code',
        },
        codeSnippet: null,
        status: 'success',
        timestamp: 'invalid-date', // Invalid ISO8601
      };
      
      expect(isValidActivityState(state)).toBe(false);
    });
    
    it('should reject empty action description', () => {
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'RED',
          cycle: 1,
          description: '', // Invalid: must have description
        },
        codeSnippet: null,
        status: 'in-progress',
        timestamp: '2026-04-24T20:00:00Z',
      };
      
      expect(isValidActivityState(state)).toBe(false);
    });
    
    it('should support optional historySnapshots', () => {
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'GREEN',
          cycle: 2,
          description: 'Pass test',
        },
        codeSnippet: null,
        status: 'success',
        timestamp: '2026-04-24T20:30:00Z',
        historySnapshots: [
          {
            action: { type: 'RED', cycle: 1, description: 'Write test' },
            codeSnippet: null,
            status: 'success',
            timestamp: '2026-04-24T20:00:00Z',
          },
        ],
      };
      
      expect(isValidActivityState(state)).toBe(true);
    });
    
    it('should enforce max history snapshots limit (AC8)', () => {
      const tooManySnapshots = Array.from({ length: CODE_DISPLAY_CONFIG.MAX_HISTORY_SNAPSHOTS + 1 }, (_, i) => ({
        action: { type: 'RED' as TDDPhase, cycle: i + 1, description: `Cycle ${i + 1}` },
        codeSnippet: null,
        status: 'success' as AgentStatus,
        timestamp: '2026-04-24T20:00:00Z',
      }));
      
      const state: AgentActivityState = {
        activeAgent: null,
        currentAction: {
          type: 'GREEN',
          cycle: 100,
          description: 'Latest',
        },
        codeSnippet: null,
        status: 'in-progress',
        timestamp: '2026-04-24T21:00:00Z',
        historySnapshots: tooManySnapshots,
      };
      
      expect(isValidActivityState(state)).toBe(false);
    });
  });
  
  describe('ActionBubbleMessage Type', () => {
    it('should validate a complete message', () => {
      const message: ActionBubbleMessage = {
        type: 'agent-activity-update',
        payload: {
          activeAgent: null,
          currentAction: {
            type: 'RED',
            cycle: 1,
            description: 'Write failing test',
          },
          codeSnippet: null,
          status: 'in-progress',
          timestamp: '2026-04-24T20:00:00Z',
        },
      };
      
      expect(isValidActionBubbleMessage(message)).toBe(true);
    });
    
    it('should reject incorrect message type', () => {
      const message = {
        type: 'wrong-type', // Invalid
        payload: {
          activeAgent: null,
          currentAction: {
            type: 'RED',
            cycle: 1,
            description: 'Test',
          },
          codeSnippet: null,
          status: 'idle',
          timestamp: '2026-04-24T20:00:00Z',
        },
      };
      
      expect(isValidActionBubbleMessage(message as any)).toBe(false);
    });
    
    it('should validate nested payload', () => {
      const message: ActionBubbleMessage = {
        type: 'agent-activity-update',
        payload: {
          activeAgent: null,
          currentAction: {
            type: 'GREEN',
            cycle: 0, // Invalid cycle
            description: 'Implement',
          },
          codeSnippet: null,
          status: 'in-progress',
          timestamp: '2026-04-24T20:00:00Z',
        },
      };
      
      expect(isValidActionBubbleMessage(message)).toBe(false);
    });
  });
  
  describe('CODE_DISPLAY_CONFIG Constants', () => {
    it('should define MAX_CHARS_PER_LINE (AC7)', () => {
      expect(CODE_DISPLAY_CONFIG.MAX_CHARS_PER_LINE).toBe(200);
    });
    
    it('should define MAX_HISTORY_SNAPSHOTS (AC8)', () => {
      expect(CODE_DISPLAY_CONFIG.MAX_HISTORY_SNAPSHOTS).toBe(50);
    });
    
    it('should define TRUNCATION_INDICATOR', () => {
      expect(CODE_DISPLAY_CONFIG.TRUNCATION_INDICATOR).toBe('...');
    });
    
    it('should define DEBOUNCE_MS for preventing spam (AC9)', () => {
      expect(CODE_DISPLAY_CONFIG.DEBOUNCE_MS).toBe(300);
    });
  });
});
