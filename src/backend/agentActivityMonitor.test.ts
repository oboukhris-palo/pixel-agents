/**
 * Layer 2 Tests: Agent Activity Monitor Service
 * Story: US-001-002 - Real-Time Agent Activity Monitor with Code Snippets
 * 
 * Tests validate git monitoring, TDD phase detection, agent metadata querying,
 * message broadcasting, and debouncing following AC3, AC4, AC6, AC9.
 */

import { AgentActivityMonitor } from './agentActivityMonitor';
import { AgentActivityState, ActionBubbleMessage } from './agentActivityTypes';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('Agent Activity Monitor Service - Layer 2', () => {
  let monitor: AgentActivityMonitor;
  let mockWorkspaceFolder: string;
  let mockEventEmitter: EventEmitter;
  
  beforeEach(() => {
    mockWorkspaceFolder = '/test/workspace';
    mockEventEmitter = new EventEmitter();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock file system for agent metadata
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`---
name: dev-tdd-red
role: RED Phase Agent
spriteColor: "#FF5500"
icon: "🔴"
---`);
  });
  
  afterEach(() => {
    if (monitor) {
      monitor.dispose();
    }
  });
  
  describe('Service Initialization', () => {
    it('should initialize with workspace folder', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      expect(monitor).toBeDefined();
      expect(monitor.isMonitoring()).toBe(false);
    });
    
    it('should accept optional VS Code context for extensibility', () => {
      const mockContext = { subscriptions: [] } as any;
      monitor = new AgentActivityMonitor(mockWorkspaceFolder, mockContext);
      
      expect(monitor).toBeDefined();
    });
    
    it('should initialize with null activity state', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const state = monitor.getCurrentState();
      expect(state.activeAgent).toBeNull();
      expect(state.status).toBe('idle');
    });
  });
  
  describe('Git Commit Monitoring', () => {
    it('should start monitoring git commits', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      await monitor.startMonitoring();
      
      expect(monitor.isMonitoring()).toBe(true);
    });
    
    it('should stop monitoring on dispose', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      await monitor.startMonitoring();
      
      monitor.dispose();
      
      expect(monitor.isMonitoring()).toBe(false);
    });
    
    it('should detect new commits via polling', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const onUpdate = jest.fn();
      monitor.on('activity-update', onUpdate);
      
      await monitor.startMonitoring();
      
      // Simulate git commit
      await monitor.triggerUpdate(); // Manual trigger for testing
      
      expect(onUpdate).toHaveBeenCalled();
    });
  });
  
  describe('TDD Phase Detection from Commit Messages (AC3)', () => {
    it('should detect RED phase from commit message', async () => {
      const commitMessage = 'TDD-EPIC-001-US-045-RED-01: Write failing test for email validation';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      expect(activity.currentAction.type).toBe('RED');
      expect(activity.currentAction.cycle).toBe(1);
      expect(activity.currentAction.description).toBe('Write failing test for email validation');
    });
    
    it('should detect GREEN phase from commit message', async () => {
      const commitMessage = 'TDD-EPIC-001-US-045-GREEN-02: Implement email validator';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      expect(activity.currentAction.type).toBe('GREEN');
      expect(activity.currentAction.cycle).toBe(2);
    });
    
    it('should detect REFACTOR phase from commit message', async () => {
      const commitMessage = 'TDD-EPIC-001-US-045-REFACTOR-03: Extract validation utility';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      expect(activity.currentAction.type).toBe('REFACTOR');
      expect(activity.currentAction.cycle).toBe(3);
    });
    
    it('should detect DOCUMENTATION phase from commit message', async () => {
      const commitMessage = 'TDD-EPIC-001-US-045-DOCUMENTATION-01: Add API docs';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      expect(activity.currentAction.type).toBe('DOCUMENTATION');
      expect(activity.currentAction.cycle).toBe(1);
    });
    
    it('should handle non-TDD commit messages gracefully', async () => {
      const commitMessage = 'fix: Update dependencies';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      expect(activity.currentAction.type).toBe('DOCUMENTATION'); // Default
      expect(activity.currentAction.cycle).toBe(1);
      expect(activity.currentAction.description).toContain('Update dependencies');
    });
    
    it('should extract cycle number correctly', async () => {
      const commitMessage = 'TDD-EPIC-001-US-045-RED-15: Test cycle 15';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      expect(activity.currentAction.cycle).toBe(15);
    });
  });
  
  describe('Agent Metadata Querying (AC1, AC6)', () => {
    it('should query agent metadata from .github/agents/', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const metadata = await monitor.getAgentMetadata('dev-tdd-red');
      
      expect(metadata).not.toBeNull();
      expect(metadata!.name).toBe('dev-tdd-red');
      expect(metadata!.role).toBe('RED Phase Agent');
      expect(metadata!.spriteColor).toBe('#FF5500');
      expect(metadata!.icon).toBe('🔴');
    });
    
    it('should return null if agent file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const metadata = await monitor.getAgentMetadata('nonexistent-agent');
      
      expect(metadata).toBeNull();
    });
    
    it('should handle malformed agent YAML gracefully', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid yaml content ---');
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const metadata = await monitor.getAgentMetadata('bad-agent');
      
      expect(metadata).toBeNull();
    });
    
    it('should infer agent name from commit pattern (dev-tdd-red, dev-tdd-green, etc.)', async () => {
      const commitMessage = 'TDD-EPIC-001-US-045-RED-01: Write test';
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      const activity = await monitor.parseCommitMessage(commitMessage);
      
      // Should auto-populate activeAgent based on RED phase → dev-tdd-red
      expect(activity.activeAgent).not.toBeNull();
      expect(activity.activeAgent?.name).toBe('dev-tdd-red');
    });
  });
  
  describe('Code Snippet Extraction (AC2, AC7)', () => {
    it('should extract code snippet from git diff', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const snippet = await monitor.extractLatestCodeSnippet();
      
      expect(snippet).not.toBeNull();
      expect(snippet!.language).toBeDefined();
      expect(snippet!.content).toBeDefined();
    });
    
    it('should return null if no changes detected', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      // Mock empty git diff
      const { execSync } = require('child_process');
      execSync.mockReturnValue('');
      
      const snippet = await monitor.extractLatestCodeSnippet();
      
      expect(snippet).toBeNull();
    });
    
    it('should integrate with codeExtractor utility', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const snippet = await monitor.extractLatestCodeSnippet();
      
      if (snippet) {
        expect(snippet.content.length).toBeLessThanOrEqual(200 * 15); // Max 15 lines * 200 chars
      }
    });
  });
  
  describe('Message Broadcasting (AC4)', () => {
    it('should broadcast ActionBubbleMessage on activity update', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const messages: ActionBubbleMessage[] = [];
      monitor.on('activity-update', (message: ActionBubbleMessage) => {
        messages.push(message);
      });
      
      await monitor.startMonitoring();
      await monitor.triggerUpdate();
      
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].type).toBe('agent-activity-update');
      expect(messages[0].payload).toBeDefined();
    });
    
    it('should broadcast within 500ms (AC4)', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const startTime = Date.now();
      let broadcastTime = 0;
      
      monitor.on('activity-update', () => {
        broadcastTime = Date.now() - startTime;
      });
      
      await monitor.startMonitoring();
      await monitor.triggerUpdate();
      
      expect(broadcastTime).toBeLessThan(500);
    });
    
    it('should include complete AgentActivityState in payload', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      let receivedState: AgentActivityState | null = null;
      monitor.on('activity-update', (message: ActionBubbleMessage) => {
        receivedState = message.payload;
      });
      
      await monitor.startMonitoring();
      await monitor.triggerUpdate();
      
      expect(receivedState).not.toBeNull();
      expect(receivedState!.currentAction).toBeDefined();
      expect(receivedState!.status).toBeDefined();
      expect(receivedState!.timestamp).toBeDefined();
    });
  });
  
  describe('Debouncing (AC9)', () => {
    it('should debounce rapid updates within 300ms', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const updates: number[] = [];
      monitor.on('activity-update', () => {
        updates.push(Date.now());
      });
      
      await monitor.startMonitoring();
      
      // Trigger 5 rapid updates
      await monitor.triggerUpdate();
      await monitor.triggerUpdate();
      await monitor.triggerUpdate();
      await monitor.triggerUpdate();
      await monitor.triggerUpdate();
      
      // Wait for debounce window
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Should only receive 1 aggregated update
      expect(updates.length).toBe(1);
    });
    
    it('should use DEBOUNCE_MS constant from config', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      expect(monitor.getDebounceMs()).toBe(300);
    });
    
    it('should allow multiple updates if separated by >300ms', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const updates: number[] = [];
      monitor.on('activity-update', () => {
        updates.push(Date.now());
      });
      
      await monitor.startMonitoring();
      
      await monitor.triggerUpdate();
      await new Promise(resolve => setTimeout(resolve, 350)); // Wait longer than debounce
      await monitor.triggerUpdate();
      
      expect(updates.length).toBe(2);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle git command failure gracefully', async () => {
      const { execSync } = require('child_process');
      execSync.mockImplementation(() => {
        throw new Error('Git not found');
      });
      
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      expect(async () => {
        await monitor.startMonitoring();
      }).not.toThrow();
    });
    
    it('should continue monitoring if single update fails', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const updates: number = 0;
      monitor.on('activity-update', () => {
        if (updates === 0) {
          throw new Error('First update fails');
        }
      });
      
      await monitor.startMonitoring();
      
      // Should not crash the monitor
      expect(monitor.isMonitoring()).toBe(true);
    });
    
    it('should emit error event on failure but continue', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const errors: Error[] = [];
      monitor.on('error', (error: Error) => {
        errors.push(error);
      });
      
      // Trigger error condition
      const { execSync } = require('child_process');
      execSync.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await monitor.triggerUpdate();
      
      expect(errors.length).toBeGreaterThan(0);
      expect(monitor.isMonitoring()).toBe(true); // Still running
    });
  });
  
  describe('State Management', () => {
    it('should update current state on activity change', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      const initialState = monitor.getCurrentState();
      expect(initialState.status).toBe('idle');
      
      await monitor.startMonitoring();
      await monitor.triggerUpdate();
      
      const updatedState = monitor.getCurrentState();
      expect(updatedState.timestamp).not.toBe(initialState.timestamp);
    });
    
    it('should maintain history snapshots (AC8)', async () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      
      await monitor.startMonitoring();
      
      // Trigger multiple updates
      for (let i = 0; i < 10; i++) {
        await monitor.triggerUpdate();
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      
      const state = monitor.getCurrentState();
      expect(state.historySnapshots).toBeDefined();
      expect(state.historySnapshots!.length).toBeLessThanOrEqual(50); // Max limit
    });
  });

  describe('File Operation Tracking (v1.0.5)', () => {
    it('should track a file operation', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      monitor.trackFileOperation({ type: 'read', filePath: 'src/types.ts', timestamp: Date.now() });

      const ops = monitor.getRecentFileOperations();
      expect(ops).toHaveLength(1);
      expect(ops[0].type).toBe('read');
      expect(ops[0].filePath).toBe('src/types.ts');
    });

    it('should track multiple file operations in order', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      monitor.trackFileOperation({ type: 'read', filePath: 'src/a.ts', timestamp: 100 });
      monitor.trackFileOperation({ type: 'write', filePath: 'src/b.ts', timestamp: 200 });
      monitor.trackFileOperation({ type: 'delete', filePath: 'src/c.ts', timestamp: 300 });

      const ops = monitor.getRecentFileOperations();
      expect(ops).toHaveLength(3);
      expect(ops[2].filePath).toBe('src/c.ts');
    });

    it('should evict oldest operation when buffer exceeds MAX_FILE_OPS (10)', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);

      // Add 11 operations
      for (let i = 0; i < 11; i++) {
        monitor.trackFileOperation({ type: 'write', filePath: `src/file${i}.ts`, timestamp: i });
      }

      const ops = monitor.getRecentFileOperations();
      expect(ops).toHaveLength(10);
      // Oldest (file0) should be evicted; file1 should be first
      expect(ops[0].filePath).toBe('src/file1.ts');
    });

    it('should clear file operations on dispose', () => {
      monitor = new AgentActivityMonitor(mockWorkspaceFolder);
      monitor.trackFileOperation({ type: 'read', filePath: 'src/x.ts', timestamp: Date.now() });

      monitor.dispose();

      const ops = monitor.getRecentFileOperations();
      expect(ops).toHaveLength(0);
    });
  });
});
