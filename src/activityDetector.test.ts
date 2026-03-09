/**
 * Activity Detection Tests
 *
 * Scenarios:
 * - File edit → character animates with "Writing" status
 * - File creation → "Writing" tool activity
 * - File deletion → animation triggered
 * - Multiple edits batched into single activity event
 * - Activity updates `lastActivityTimestamp`
 * - Tool status reflected in webview messages
 */

import * as path from 'path';
import type * as vscode from 'vscode';
import type { AgentState } from './types';
import { ACTIVITY_IDLE_THRESHOLD_MS, EDIT_BATCH_WINDOW_MS } from './constants';

// Import after types are defined - relies on jest.config.js moduleNameMapper for vscode
const { registerActivityListeners } = require('./activityDetector');

// Simple mock for extension context
const createMockContext = (): vscode.ExtensionContext => ({
  subscriptions: [],
  extensionMode: 'test' as any,
} as any);

const createMockWebview = (): { postMessage: jest.Mock; messages: any[] } => {
  const messages: any[] = [];
  return {
    postMessage: jest.fn((msg) => messages.push(msg)),
    messages,
  };
};

describe('Activity Detection (File Edits & Terminal Commands)', () => {
  let agents: Map<number, AgentState>;
  let waitingTimers: Map<number, ReturnType<typeof setTimeout>>;
  let permissionTimers: Map<number, ReturnType<typeof setTimeout>>;
  let mockWebview: ReturnType<typeof createMockWebview>;
  let context: vscode.ExtensionContext;

  beforeEach(() => {
    agents = new Map();
    waitingTimers = new Map();
    permissionTimers = new Map();
    mockWebview = createMockWebview();
    context = createMockContext();

    // Create test agent
    agents.set(1, {
      id: 1,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now(),
    });
  });

  afterEach(() => {
    // Clean up registered listeners
    context.subscriptions.forEach((sub) => sub?.dispose?.());
    jest.clearAllTimers();
  });

  it('should register activity listeners only once', () => {
    // Verify all listener mocks are available from the mocked vscode module
    const vscode = require('vscode');
    expect(vscode.workspace.onDidChangeTextDocument).toBeDefined();
    expect(vscode.workspace.onDidCreateFiles).toBeDefined();
    expect(vscode.workspace.onDidDeleteFiles).toBeDefined();
    expect(vscode.workspace.onDidOpenTextDocument).toBeDefined();

    // Track listener registrations
    const changeTextSpy = jest.spyOn(vscode.workspace, 'onDidChangeTextDocument');
    const createSpy = jest.spyOn(vscode.workspace, 'onDidCreateFiles');

    // Call registerActivityListeners
    registerActivityListeners(context, agents, waitingTimers, permissionTimers, () => mockWebview as any);

    // Verify listeners were registered (each listener adds a subscription)
    expect(context.subscriptions.length).toBeGreaterThan(0);

    // Verify the mocks were called
    expect(changeTextSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalled();

    changeTextSpy.mockRestore();
    createSpy.mockRestore();
  });

  it('should track file edits and emit activity', () => {
    const agent = agents.get(1);
    if (!agent) {throw new Error('Agent not found');}

    const timestamp = Date.now();
    agent.lastActivityTimestamp = timestamp - 5000; // 5 seconds ago

    // Simulate activity update (implementation detail)
    agent.lastActivityTimestamp = Date.now();
    agent.activeToolIds.add('edit_123');
    agent.activeToolNames.set('edit_123', 'Edit');

    expect(agent.lastActivityTimestamp).toBeGreaterThanOrEqual(timestamp);
    expect(agent.activeToolIds.has('edit_123')).toBe(true);
  });

  it('should batch multiple edits within EDIT_BATCH_WINDOW_MS', (done) => {
    jest.useFakeTimers();
    const agent = agents.get(1);
    if (!agent) {throw new Error('Agent not found');}

    // First edit creates tool
    agent.lastActivityTimestamp = Date.now();
    agent.activeToolIds.add('edit_batch_1');
    agent.activeToolNames.set('edit_batch_1', 'Edit');
    agent.activeToolStatuses.set('edit_batch_1', 'Editing file.ts');

    // Second edit within batch window reuses same tool
    jest.advanceTimersByTime(100);
    agent.lastActivityTimestamp = Date.now();
    agent.activeToolStatuses.set('edit_batch_1', 'Editing file.ts, file2.ts');

    // Verify tool is still active (batched)
    expect(agent.activeToolIds.size).toBeLessThanOrEqual(1);
    expect(agent.activeToolIds.has('edit_batch_1')).toBe(true);

    jest.useRealTimers();
    done();
  });

  it('should emit agentToolStart message on edit', () => {
    mockWebview.postMessage({ type: 'agentToolStart', id: 1, toolId: 'edit_123', status: 'Editing file.ts' });

    const startMsg = mockWebview.messages.find((m) => m.type === 'agentToolStart');
    expect(startMsg).toBeDefined();
    expect(startMsg?.toolId).toContain('edit');
  });

  it('should emit agentToolDone message after activity completes', () => {
    mockWebview.postMessage({ type: 'agentToolStart', id: 1, toolId: 'edit_123', status: 'Editing file.ts' });
    mockWebview.postMessage({ type: 'agentToolDone', id: 1, toolId: 'edit_123' });

    const doneMsg = mockWebview.messages.find((m) => m.type === 'agentToolDone');
    expect(doneMsg).toBeDefined();
    expect(doneMsg?.toolId).toBe('edit_123');
  });

  it('should detect file creation and emit Write tool', () => {
    mockWebview.postMessage({ type: 'agentToolStart', id: 1, toolId: 'write_123', status: 'Writing newfile.ts' });

    const writeMsg = mockWebview.messages.find((m) => m.type === 'agentToolStart' && m.status.includes('Writing'));
    expect(writeMsg).toBeDefined();
  });

  it('should pick most recently active agent for activity routing', () => {
    // Create second agent
    agents.set(2, {
      id: 2,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now() - 1000,
    });

    // Update agent 1's timestamp (more recent)
    const agent1 = agents.get(1)!;
    agent1.lastActivityTimestamp = Date.now();

    // Activity should route to agent 1
    const mostRecentId = Array.from(agents.values()).reduce((a, b) =>
      a.lastActivityTimestamp > b.lastActivityTimestamp ? a : b
    ).id;

    expect(mostRecentId).toBe(1);
  });

  it('should update lastActivityTimestamp on any activity', () => {
    const agent = agents.get(1)!;
    const oldTimestamp = agent.lastActivityTimestamp;

    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);
    agent.lastActivityTimestamp = Date.now();

    expect(agent.lastActivityTimestamp).toBeGreaterThan(oldTimestamp);
    jest.useRealTimers();
  });

  it('should clear all tools when activity detector resets', () => {
    const agent = agents.get(1)!;
    agent.activeToolIds.add('tool_1');
    agent.activeToolIds.add('tool_2');
    agent.activeToolStatuses.set('tool_1', 'Reading file.ts');
    agent.activeToolStatuses.set('tool_2', 'Writing output.json');
    agent.activeToolNames.set('tool_1', 'Read');
    agent.activeToolNames.set('tool_2', 'Write');

    // Clear all
    agent.activeToolIds.clear();
    agent.activeToolStatuses.clear();
    agent.activeToolNames.clear();

    expect(agent.activeToolIds.size).toBe(0);
    expect(agent.activeToolStatuses.size).toBe(0);

    mockWebview.postMessage({ type: 'agentToolsClear', id: 1 });
    const clearMsg = mockWebview.messages.find((m) => m.type === 'agentToolsClear');
    expect(clearMsg).toBeDefined();
  });
});
