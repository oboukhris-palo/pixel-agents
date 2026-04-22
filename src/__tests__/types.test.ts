/**
 * Layer 1: Data & State Models Tests
 * Purpose: Validate TypeScript types for Task Progression Bar feature
 * BDD Mapping: @priority-p1 scenarios (display, sections, colors, navigation)
 */

import {
  TaskInfo,
  TaskProgressionState,
  PDLCPhase,
  TaskStatus,
  isValidTaskInfo,
  getDefaultTaskState,
  getPhaseColor,
} from '../types';

describe('Layer 1: Data & State Models - Task Progression Types', () => {
  describe('TaskInfo Interface', () => {
    it('should define a TaskInfo interface with required fields', () => {
      const task: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'in-progress' as TaskStatus,
        epic: 'EPIC-001',
        layer: 'Layer 1',
        cycle: 'RED-01',
      };

      expect(task.storyId).toBe('US-001-001');
      expect(task.title).toBe('Task Progression Bar Implementation');
      expect(task.status).toBe('in-progress');
      expect(task.epic).toBe('EPIC-001');
      expect(task.layer).toBe('Layer 1');
      expect(task.cycle).toBe('RED-01');
    });

    it('should allow optional fields on TaskInfo', () => {
      const task: TaskInfo = {
        storyId: 'US-001-002',
        title: 'Workflow Status Bar Implementation',
        status: 'not-started' as TaskStatus,
        epic: 'EPIC-001',
        layer: undefined,
        cycle: undefined,
      };

      expect(task.layer).toBeUndefined();
      expect(task.cycle).toBeUndefined();
    });
  });

  describe('TaskProgressionState Interface', () => {
    it('should define a TaskProgressionState with previous, current, and next tasks', () => {
      const state: TaskProgressionState = {
        previous: {
          storyId: 'US-000-001',
          title: 'Kickoff Planning',
          status: 'completed' as TaskStatus,
          epic: 'EPIC-001',
        },
        current: {
          storyId: 'US-001-001',
          title: 'Task Progression Bar Implementation',
          status: 'in-progress' as TaskStatus,
          epic: 'EPIC-001',
          layer: 'Layer 1',
          cycle: 'RED-01',
        },
        next: {
          storyId: 'US-001-002',
          title: 'Workflow Status Bar Implementation',
          status: 'not-started' as TaskStatus,
          epic: 'EPIC-001',
        },
      };

      expect(state.previous?.storyId).toBe('US-000-001');
      expect(state.current.storyId).toBe('US-001-001');
      expect(state.next?.storyId).toBe('US-001-002');
    });

    it('should allow null values for previous and next tasks', () => {
      const state: TaskProgressionState = {
        previous: null,
        current: {
          storyId: 'US-001-001',
          title: 'Task Progression Bar Implementation',
          status: 'in-progress' as TaskStatus,
          epic: 'EPIC-001',
          layer: 'Layer 1',
          cycle: 'RED-01',
        },
        next: null,
      };

      expect(state.previous).toBeNull();
      expect(state.current).toBeDefined();
      expect(state.next).toBeNull();
    });
  });

  describe('PDLCPhase Enum', () => {
    it('should define PDLCPhase enum with correct values', () => {
      const phases: PDLCPhase[] = [
        'Documentation' as PDLCPhase,
        'RED' as PDLCPhase,
        'GREEN' as PDLCPhase,
        'REFACTOR' as PDLCPhase,
      ];

      expect(phases).toContain('Documentation');
      expect(phases).toContain('RED');
      expect(phases).toContain('GREEN');
      expect(phases).toContain('REFACTOR');
    });
  });

  describe('TaskStatus Enum', () => {
    it('should define TaskStatus enum with correct values', () => {
      const statuses: TaskStatus[] = [
        'not-started' as TaskStatus,
        'in-progress' as TaskStatus,
        'completed' as TaskStatus,
        'implemented' as TaskStatus,
        'delivered' as TaskStatus,
      ];

      expect(statuses).toContain('not-started');
      expect(statuses).toContain('in-progress');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('implemented');
      expect(statuses).toContain('delivered');
    });
  });

  describe('Type Guard: isValidTaskInfo()', () => {
    it('should validate a well-formed TaskInfo object', () => {
      const validTask: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'in-progress' as TaskStatus,
        epic: 'EPIC-001',
        layer: 'Layer 1',
        cycle: 'RED-01',
      };

      expect(isValidTaskInfo(validTask)).toBe(true);
    });

    it('should reject TaskInfo with missing required fields', () => {
      const invalidTask = {
        storyId: 'US-001-001',
        // missing title
        status: 'in-progress',
        epic: 'EPIC-001',
      };

      expect(isValidTaskInfo(invalidTask)).toBe(false);
    });

    it('should reject TaskInfo with null current task in state', () => {
      const invalidState = {
        previous: null,
        current: null, // current should never be null
        next: null,
      };

      expect(isValidTaskInfo(invalidState)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(isValidTaskInfo(null)).toBe(false);
      expect(isValidTaskInfo(undefined)).toBe(false);
      expect(isValidTaskInfo('not an object')).toBe(false);
      expect(isValidTaskInfo(123)).toBe(false);
    });

    it('should accept TaskInfo with optional layer and cycle missing', () => {
      const taskWithoutLayer: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'not-started' as TaskStatus,
        epic: 'EPIC-001',
        // layer and cycle optional
      };

      expect(isValidTaskInfo(taskWithoutLayer)).toBe(true);
    });
  });

  describe('Default State: getDefaultTaskState()', () => {
    it('should return a default TaskProgressionState with null previous/next', () => {
      const defaultState = getDefaultTaskState();

      expect(defaultState.previous).toBeNull();
      expect(defaultState.current).toBeDefined();
      expect(defaultState.next).toBeNull();
    });

    it('should have a current task with "unknown" values', () => {
      const defaultState = getDefaultTaskState();

      expect(defaultState.current.storyId).toBe('Unknown');
      expect(defaultState.current.title).toBe('N/A');
      expect(defaultState.current.status).toBe('not-started');
      expect(defaultState.current.epic).toBe('Unknown');
    });

    it('should handle empty/incomplete story information gracefully', () => {
      const defaultState = getDefaultTaskState();

      // Should not throw errors when accessing properties
      expect(() => {
        const { storyId, title, epic } = defaultState.current;
        return `${storyId} - ${title} - ${epic}`;
      }).not.toThrow();
    });
  });

  describe('Phase Color Mapping: getPhaseColor()', () => {
    it('should map Documentation phase to Blue', () => {
      expect(getPhaseColor('Documentation')).toBe('#0078D4');
    });

    it('should map RED phase to Red', () => {
      expect(getPhaseColor('RED')).toBe('#E81C3F');
    });

    it('should map GREEN phase to Green', () => {
      expect(getPhaseColor('GREEN')).toBe('#107C10');
    });

    it('should map REFACTOR phase to Purple', () => {
      expect(getPhaseColor('REFACTOR')).toBe('#8661C5');
    });

    it('should return gray for unknown phase', () => {
      expect(getPhaseColor('UNKNOWN')).toBe('#CCCCCC');
    });

    it('should be case-insensitive for phase names', () => {
      expect(getPhaseColor('red')).toBe('#E81C3F');
      expect(getPhaseColor('GREEN')).toBe('#107C10');
      expect(getPhaseColor('refactor')).toBe('#8661C5');
    });
  });

  describe('BDD Scenario Mapping: Color-Coded Task Sections', () => {
    it('should support the 4 PDLC phases required by BDD scenario', () => {
      const phaseColorMap = {
        'Documentation': getPhaseColor('Documentation'),
        'RED': getPhaseColor('RED'),
        'GREEN': getPhaseColor('GREEN'),
        'REFACTOR': getPhaseColor('REFACTOR'),
      };

      expect(phaseColorMap['Documentation']).toBe('#0078D4');
      expect(phaseColorMap['RED']).toBe('#E81C3F');
      expect(phaseColorMap['GREEN']).toBe('#107C10');
      expect(phaseColorMap['REFACTOR']).toBe('#8661C5');
    });
  });

  describe('BDD Scenario Mapping: Task Information Completeness', () => {
    it('should validate all required fields for displaying task details', () => {
      const completeTask: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'in-progress' as TaskStatus,
        epic: 'EPIC-001',
        layer: 'Layer 1',
        cycle: 'RED-01',
      };

      // BDD: "Show current task details with layer and cycle information"
      expect(completeTask.storyId).toBeDefined();
      expect(completeTask.title).toBeDefined();
      expect(completeTask.epic).toBeDefined();
      expect(completeTask.layer).toBeDefined();
      expect(completeTask.cycle).toBeDefined();
    });

    it('should handle missing optional fields without crashing', () => {
      const incompleteTask: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'not-started' as TaskStatus,
        epic: 'EPIC-001',
        // layer and cycle not provided
      };

      // Should not throw
      expect(() => {
        return {
          layer: incompleteTask.layer || 'N/A',
          cycle: incompleteTask.cycle || 'N/A',
        };
      }).not.toThrow();
    });
  });
});
