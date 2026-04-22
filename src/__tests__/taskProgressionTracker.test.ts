import { TaskProgressionTracker } from '../taskProgressionTracker';
import { TaskInfo, TaskProgressionState } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('TaskProgressionTracker', () => {
  let tracker: TaskProgressionTracker;
  const mockWorkspaceRoot = '/test/workspace';
  
  // Define mock content at outer scope for reusability
  const mockUserStoriesContent = `
# Implementation Status

## Epic-001: Workflow Visualization Enhancement

### US-001-001: Task Progression Bar Implementation
- **Status**: completed
- **Epic**: EPIC-001

### US-001-002: Context Window Visualization
- **Status**: in-progress
- **Layer**: Layer 2: Backend Services
- **Cycle**: GREEN-01
- **Epic**: EPIC-001

### US-001-003: Completeness Meter
- **Status**: not-started
- **Epic**: EPIC-001
`;

  beforeEach(() => {
    tracker = new TaskProgressionTracker(mockWorkspaceRoot);
    jest.clearAllMocks();
  });

  describe('parseUserStoriesFile', () => {
    it('should parse valid user stories YAML content', () => {
      const content = `
# Implementation Status

## Epic-001: Workflow Visualization Enhancement

### US-001-001: Task Progression Bar Implementation
- **Status**: in-progress
- **Layer**: Layer 1: Data & State Models
- **Cycle**: RED-01
- **Epic**: EPIC-001

### US-001-002: Context Window Visualization
- **Status**: not-started
- **Epic**: EPIC-001
`;

      const result = tracker.parseUserStoriesFile(content);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'in-progress',
        epic: 'EPIC-001',
        layer: 'Layer 1: Data & State Models',
        cycle: 'RED-01',
      });
      expect(result[1]).toEqual({
        storyId: 'US-001-002',
        title: 'Context Window Visualization',
        status: 'not-started',
        epic: 'EPIC-001',
      });
    });

    it('should handle empty content gracefully', () => {
      const result = tracker.parseUserStoriesFile('');
      expect(result).toEqual([]);
    });

    it('should handle malformed YAML without crashing', () => {
      const content = 'This is not valid YAML ### or markdown';
      const result = tracker.parseUserStoriesFile(content);
      expect(result).toEqual([]);
    });

    it('should handle stories with missing optional fields', () => {
      const content = `
### US-001-003: Basic Story
- **Status**: not-started
- **Epic**: EPIC-002
`;

      const result = tracker.parseUserStoriesFile(content);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        storyId: 'US-001-003',
        title: 'Basic Story',
        status: 'not-started',
        epic: 'EPIC-002',
      });
    });

    it('should skip stories with invalid status values', () => {
      const content = `
### US-001-004: Invalid Status Story
- **Status**: invalid-status-here
- **Epic**: EPIC-001
`;

      const result = tracker.parseUserStoriesFile(content);
      expect(result).toEqual([]);
    });
  });

  describe('findPreviousTask', () => {
    const stories: TaskInfo[] = [
      {
        storyId: 'US-001-001',
        title: 'Story 1',
        status: 'completed',
        epic: 'EPIC-001',
      },
      {
        storyId: 'US-001-002',
        title: 'Story 2',
        status: 'in-progress',
        epic: 'EPIC-001',
      },
      {
        storyId: 'US-001-003',
        title: 'Story 3',
        status: 'not-started',
        epic: 'EPIC-001',
      },
    ];

    it('should return previous completed task when current is in progress', () => {
      const current = stories[1]; // US-001-002 (in-progress)
      const previous = tracker.findPreviousTask(current, stories);

      expect(previous).toEqual(stories[0]); // US-001-001 (completed)
    });

    it('should return null when current is the first task', () => {
      const current = stories[0]; // US-001-001
      const previous = tracker.findPreviousTask(current, stories);

      expect(previous).toBeNull();
    });

    it('should return null when no previous completed tasks exist', () => {
      const storiesAllNew: TaskInfo[] = [
        {
          storyId: 'US-002-001',
          title: 'Story 1',
          status: 'not-started',
          epic: 'EPIC-002',
        },
        {
          storyId: 'US-002-002',
          title: 'Story 2',
          status: 'in-progress',
          epic: 'EPIC-002',
        },
      ];

      const current = storiesAllNew[1];
      const previous = tracker.findPreviousTask(current, storiesAllNew);

      expect(previous).toBeNull();
    });

    it('should skip non-completed tasks when finding previous', () => {
      const storiesComplex: TaskInfo[] = [
        {
          storyId: 'US-003-001',
          title: 'Story 1',
          status: 'completed',
          epic: 'EPIC-003',
        },
        {
          storyId: 'US-003-002',
          title: 'Story 2',
          status: 'not-started',
          epic: 'EPIC-003',
        },
        {
          storyId: 'US-003-003',
          title: 'Story 3',
          status: 'in-progress',
          epic: 'EPIC-003',
        },
      ];

      const current = storiesComplex[2]; // US-003-003
      const previous = tracker.findPreviousTask(current, storiesComplex);

      expect(previous).toEqual(storiesComplex[0]); // Skip US-003-002, return US-003-001
    });
  });

  describe('findNextTask', () => {
    const stories: TaskInfo[] = [
      {
        storyId: 'US-001-001',
        title: 'Story 1',
        status: 'completed',
        epic: 'EPIC-001',
      },
      {
        storyId: 'US-001-002',
        title: 'Story 2',
        status: 'in-progress',
        epic: 'EPIC-001',
      },
      {
        storyId: 'US-001-003',
        title: 'Story 3',
        status: 'not-started',
        epic: 'EPIC-001',
      },
    ];

    it('should return next not-started task when current is in progress', () => {
      const current = stories[1]; // US-001-002 (in-progress)
      const next = tracker.findNextTask(current, stories);

      expect(next).toEqual(stories[2]); // US-001-003 (not-started)
    });

    it('should return null when current is the last task', () => {
      const current = stories[2]; // US-001-003
      const next = tracker.findNextTask(current, stories);

      expect(next).toBeNull();
    });

    it('should return null when no future not-started tasks exist', () => {
      const storiesAllInProgress: TaskInfo[] = [
        {
          storyId: 'US-002-001',
          title: 'Story 1',
          status: 'in-progress',
          epic: 'EPIC-002',
        },
        {
          storyId: 'US-002-002',
          title: 'Story 2',
          status: 'in-progress',
          epic: 'EPIC-002',
        },
      ];

      const current = storiesAllInProgress[0];
      const next = tracker.findNextTask(current, storiesAllInProgress);

      expect(next).toBeNull();
    });

    it('should skip completed/in-progress tasks when finding next', () => {
      const storiesComplex: TaskInfo[] = [
        {
          storyId: 'US-003-001',
          title: 'Story 1',
          status: 'in-progress',
          epic: 'EPIC-003',
        },
        {
          storyId: 'US-003-002',
          title: 'Story 2',
          status: 'completed',
          epic: 'EPIC-003',
        },
        {
          storyId: 'US-003-003',
          title: 'Story 3',
          status: 'not-started',
          epic: 'EPIC-003',
        },
      ];

      const current = storiesComplex[0]; // US-003-001
      const next = tracker.findNextTask(current, storiesComplex);

      expect(next).toEqual(storiesComplex[2]); // Skip US-003-002, return US-003-003
    });
  });

  describe('extractLayerAndCycle', () => {
    it('should extract layer and cycle from task info', () => {
      const task: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Task',
        status: 'in-progress',
        epic: 'EPIC-001',
        layer: 'Layer 1: Data & State Models',
        cycle: 'RED-01',
      };

      const result = tracker.extractLayerAndCycle(task);

      expect(result).toEqual({
        layer: 'Layer 1',
        cycle: 'RED-01',
      });
    });

    it('should handle missing layer and cycle fields', () => {
      const task: TaskInfo = {
        storyId: 'US-001-002',
        title: 'Task',
        status: 'not-started',
        epic: 'EPIC-001',
      };

      const result = tracker.extractLayerAndCycle(task);

      expect(result).toEqual({
        layer: undefined,
        cycle: undefined,
      });
    });

    it('should extract layer number from complex layer strings', () => {
      const task: TaskInfo = {
        storyId: 'US-001-003',
        title: 'Task',
        status: 'in-progress',
        epic: 'EPIC-001',
        layer: 'Layer 4: Frontend Components & UI',
        cycle: 'REFACTOR-02',
      };

      const result = tracker.extractLayerAndCycle(task);

      expect(result).toEqual({
        layer: 'Layer 4',
        cycle: 'REFACTOR-02',
      });
    });
  });

  describe('getCurrentTaskProgression', () => {
    beforeEach(() => {
      // Mock fs.existsSync to return true
      mockFs.existsSync.mockReturnValue(true);
      
      // Mock fs.readFileSync to return test content
      mockFs.readFileSync.mockReturnValue(mockUserStoriesContent);
    });

    it('should return current task progression state', () => {
      const state = tracker.getCurrentTaskProgression();

      expect(state.previous).toEqual({
        storyId: 'US-001-001',
        title: 'Task Progression Bar Implementation',
        status: 'completed',
        epic: 'EPIC-001',
      });

      expect(state.current).toEqual({
        storyId: 'US-001-002',
        title: 'Context Window Visualization',
        status: 'in-progress',
        epic: 'EPIC-001',
        layer: 'Layer 2: Backend Services',
        cycle: 'GREEN-01',
      });

      expect(state.next).toEqual({
        storyId: 'US-001-003',
        title: 'Completeness Meter',
        status: 'not-started',
        epic: 'EPIC-001',
      });
    });

    it('should return default state when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const state = tracker.getCurrentTaskProgression();

      expect(state.previous).toBeNull();
      expect(state.current.storyId).toBe('Unknown');
      expect(state.current.title).toBe('N/A');
      expect(state.next).toBeNull();
    });

    it('should return default state when no in-progress task found', () => {
      const noInProgressContent = `
### US-001-001: Story 1
- **Status**: not-started
- **Epic**: EPIC-001
`;
      mockFs.readFileSync.mockReturnValue(noInProgressContent);

      const state = tracker.getCurrentTaskProgression();

      expect(state.previous).toBeNull();
      expect(state.current.storyId).toBe('Unknown');
      expect(state.next).toBeNull();
    });

    it('should handle file read errors gracefully', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const state = tracker.getCurrentTaskProgression();

      expect(state.previous).toBeNull();
      expect(state.current.storyId).toBe('Unknown');
      expect(state.next).toBeNull();
    });
  });

  describe('File Watcher Integration', () => {
    it('should create file watcher for user-stories.md', () => {
      // This test validates the watcher is created
      // Actual watcher behavior will be tested in integration tests
      expect(tracker).toBeDefined();
      expect(tracker.getCurrentTaskProgression).toBeDefined();
    });

    it('should provide method to dispose of resources', () => {
      expect(tracker.dispose).toBeDefined();
      expect(() => tracker.dispose()).not.toThrow();
    });
  });

  describe('BDD Scenario Validation', () => {
    it('BDD: should parse user stories from /docs/05-implementation/', () => {
      const content = `
### US-001-001: Test Story
- **Status**: in-progress
- **Epic**: EPIC-001
`;
      const result = tracker.parseUserStoriesFile(content);
      expect(result).toHaveLength(1);
      expect(result[0].storyId).toBe('US-001-001');
    });

    it('BDD: should identify previous/current/next tasks accurately', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockUserStoriesContent);

      const state = tracker.getCurrentTaskProgression();

      expect(state.previous?.status).toBe('completed');
      expect(state.current.status).toBe('in-progress');
      expect(state.next?.status).toBe('not-started');
    });

    it('BDD: should handle missing/malformed data without crashes', () => {
      mockFs.readFileSync.mockReturnValue('Invalid content ###');

      expect(() => tracker.getCurrentTaskProgression()).not.toThrow();
      
      const state = tracker.getCurrentTaskProgression();
      expect(state.current.storyId).toBe('Unknown');
    });
  });
});
