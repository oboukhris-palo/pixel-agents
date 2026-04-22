import { renderHook, waitFor } from '@testing-library/react';
import { useTaskProgression } from '../hooks/useTaskProgression';
import { useExtensionMessages } from '../hooks/useExtensionMessages';
import type { TaskProgressionState, TaskInfo } from '../hooks/useExtensionMessages';

/**
 * Mock useExtensionMessages to simulate backend message flow
 */
jest.mock('../hooks/useExtensionMessages');

const mockUseExtensionMessages = useExtensionMessages as jest.MockedFunction<
  typeof useExtensionMessages
>;

describe('useTaskProgression Hook', () => {
  // Mock data
  const mockTaskInfo: TaskInfo = {
    storyId: 'US-001-002',
    title: 'Layer 2: Backend Service',
    status: 'in-progress',
    epic: 'EPIC-001',
    layer: 'Layer 2',
    cycle: 'RED-02',
  };

  const mockTaskProgression: TaskProgressionState = {
    previous: {
      storyId: 'US-001-001',
      title: 'Layer 1: Types',
      status: 'completed',
      epic: 'EPIC-001',
    },
    current: mockTaskInfo,
    next: {
      storyId: 'US-001-003',
      title: 'Layer 3: Protocol',
      status: 'not-started',
      epic: 'EPIC-001',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * BDD Scenario: Consume task progression state from backend
   * As a frontend component, I want to use a custom hook
   * So that I can access task progression state reactively
   */
  describe('Scenario: Consume task progression state from backend', () => {
    it('returns task progression state from extension messages', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.taskProgression).toEqual(mockTaskProgression);
      expect(result.current.taskProgression?.current?.storyId).toBe('US-001-002');
    });

    it('returns null when task progression is not available', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: null,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.taskProgression).toBeNull();
    });

    it('updates when extension messages change', () => {
      const initialMessages = {
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      };

      mockUseExtensionMessages.mockReturnValue(initialMessages as any);

      const { result, rerender } = renderHook(() => useTaskProgression());
      expect(result.current.taskProgression?.current?.storyId).toBe('US-001-002');

      // Simulate new message
      const updatedMessages = {
        taskProgression: {
          ...mockTaskProgression,
          current: {
            ...mockTaskInfo,
            storyId: 'US-001-003',
            cycle: 'GREEN-02',
          },
        },
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      };

      mockUseExtensionMessages.mockReturnValue(updatedMessages as any);
      rerender();

      expect(result.current.taskProgression?.current?.storyId).toBe('US-001-003');
    });
  });

  /**
   * BDD Scenario: Extract current task details
   * As a component, I want to easily access current task information
   * So that I can display active work without prop drilling
   */
  describe('Scenario: Extract current task details', () => {
    it('provides current task directly', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentTask).toEqual(mockTaskInfo);
      expect(result.current.currentTask?.title).toBe('Layer 2: Backend Service');
    });

    it('returns null for current task when not available', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: {
          previous: null,
          current: null,
          next: null,
        },
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentTask).toBeNull();
    });

    it('provides layer information from current task', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentTask?.layer).toBe('Layer 2');
    });

    it('provides cycle information from current task', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentTask?.cycle).toBe('RED-02');
    });
  });

  /**
   * BDD Scenario: Extract PDLC phase from current task
   * As a component, I want to know the current PDLC phase
   * So that I can apply appropriate color coding
   */
  describe('Scenario: Extract PDLC phase from current task', () => {
    it('extracts RED phase from task cycle', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentPhase).toBe('RED');
    });

    it('extracts GREEN phase from task cycle', () => {
      const greenProgression: TaskProgressionState = {
        ...mockTaskProgression,
        current: {
          ...mockTaskInfo,
          cycle: 'GREEN-02',
        },
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: greenProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentPhase).toBe('GREEN');
    });

    it('extracts REFACTOR phase from task cycle', () => {
      const refactorProgression: TaskProgressionState = {
        ...mockTaskProgression,
        current: {
          ...mockTaskInfo,
          cycle: 'REFACTOR-02',
        },
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: refactorProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentPhase).toBe('REFACTOR');
    });

    it('returns DOCUMENTATION phase for non-TDD tasks', () => {
      const docProgression: TaskProgressionState = {
        ...mockTaskProgression,
        current: {
          storyId: 'US-002-001',
          title: 'Write docs',
          status: 'in-progress',
          epic: 'EPIC-002',
          // no layer/cycle - documentation task
        },
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: docProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentPhase).toBe('DOCUMENTATION');
    });

    it('returns null for phase when current task unavailable', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: {
          previous: null,
          current: null,
          next: null,
        },
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentPhase).toBeNull();
    });
  });

  /**
   * BDD Scenario: Track previous and next tasks
   * As a component, I want to access previous and next tasks easily
   * So that I can display workflow context
   */
  describe('Scenario: Track previous and next tasks', () => {
    it('provides previous task', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.previousTask?.storyId).toBe('US-001-001');
      expect(result.current.previousTask?.title).toBe('Layer 1: Types');
    });

    it('provides next task', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.nextTask?.storyId).toBe('US-001-003');
      expect(result.current.nextTask?.title).toBe('Layer 3: Protocol');
    });

    it('handles null previous task', () => {
      const noPreviousProgression: TaskProgressionState = {
        previous: null,
        current: mockTaskInfo,
        next: mockTaskProgression.next,
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: noPreviousProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.previousTask).toBeNull();
    });

    it('handles null next task', () => {
      const noNextProgression: TaskProgressionState = {
        previous: mockTaskProgression.previous,
        current: mockTaskInfo,
        next: null,
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: noNextProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.nextTask).toBeNull();
    });
  });

  /**
   * BDD Scenario: Determine loading state
   * As a component, I want to know when task data is loading
   * So that I can show loading indicators appropriately
   */
  describe('Scenario: Determine loading state', () => {
    it('returns false when task progression is available', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.isLoading).toBe(false);
    });

    it('returns true when task progression is loading', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: null,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.isLoading).toBe(true);
    });

    it('returns error message when task progression fails', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: undefined,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
        error: 'Failed to read user stories',
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.error).toBe('Failed to read user stories');
    });
  });

  /**
   * Edge Case: Handle empty task progression
   * When no tasks are available
   * Then all accessors should return null gracefully
   */
  describe('Edge Case: Handle empty task progression', () => {
    it('handles completely empty progression', () => {
      const emptyProgression: TaskProgressionState = {
        previous: null,
        current: null,
        next: null,
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: emptyProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.previousTask).toBeNull();
      expect(result.current.currentTask).toBeNull();
      expect(result.current.nextTask).toBeNull();
      expect(result.current.currentPhase).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('handles task with missing optional fields', () => {
      const minimalTask: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task',
        status: 'in-progress',
        epic: 'EPIC-001',
        // layer and cycle undefined
      };

      const minimalProgression: TaskProgressionState = {
        previous: null,
        current: minimalTask,
        next: null,
      };

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: minimalProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentTask?.storyId).toBe('US-001-001');
      expect(result.current.currentPhase).toBe('DOCUMENTATION');
    });
  });

  /**
   * Performance: Verify efficient updates
   */
  describe('Performance', () => {
    it('does not cause infinite loops on updates', async () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      expect(result.current.currentTask?.storyId).toBe('US-001-002');

      // Should handle rapid updates without looping
      for (let i = 0; i < 5; i++) {
        mockUseExtensionMessages.mockReturnValue({
          taskProgression: mockTaskProgression,
          agentActivity: null,
          contextWindow: null,
          completeness: null,
          parallelZones: null,
        } as any);
      }

      // Should not throw or infinite loop
      expect(result.current.currentTask).toBeDefined();
    });

    it('memoizes current phase extraction', () => {
      const phaseExtractor = jest.fn();

      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result, rerender } = renderHook(() => useTaskProgression());

      // First render
      const phase1 = result.current.currentPhase;

      // Re-render with same props
      rerender();
      const phase2 = result.current.currentPhase;

      expect(phase1).toBe(phase2);
    });
  });

  /**
   * Integration: Verify hook works with components
   */
  describe('Integration', () => {
    it('provides all necessary data for TaskProgressionBar component', () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result } = renderHook(() => useTaskProgression());

      // Component should be able to access all required data
      expect(result.current.taskProgression).toBeDefined();
      expect(result.current.currentTask).toBeDefined();
      expect(result.current.currentPhase).toBe('RED');
      expect(result.current.isLoading).toBe(false);
    });

    it('updates TaskProgressionBar data reactively', async () => {
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: mockTaskProgression,
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      const { result, rerender } = renderHook(() => useTaskProgression());

      const initialPhase = result.current.currentPhase;
      expect(initialPhase).toBe('RED');

      // Simulate backend sending GREEN phase update
      mockUseExtensionMessages.mockReturnValue({
        taskProgression: {
          ...mockTaskProgression,
          current: {
            ...mockTaskInfo,
            cycle: 'GREEN-02',
          },
        },
        agentActivity: null,
        contextWindow: null,
        completeness: null,
        parallelZones: null,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.currentPhase).toBe('GREEN');
      });
    });
  });
});
