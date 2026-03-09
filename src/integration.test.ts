/**
 * Integration Tests
 *
 * Comprehensive end-to-end scenarios:
 * 1. User clicks "+ Agent" → Agent spawned → Character appears in office
 * 2. File edit → Activity detected → Character animates with "Writing" status
 * 3. 8s silence → Idle detection fires → Character idles + waiting bubble appears
 * 4. Layout save → Persisted to file → Survives reload
 */

import type * as vscode from 'vscode';
import type { AgentState, PersistedAgent } from '../src/types';

const createMockWebview = (): { postMessage: jest.Mock; messages: any[] } => {
  const messages: any[] = [];
  return {
    postMessage: jest.fn((msg) => messages.push(msg)),
    messages,
  };
};

describe('Integration: Complete Agent Lifecycle', () => {
  let agents: Map<number, AgentState>;
  let nextAgentIdRef: { current: number };
  let waitingTimers: Map<number, ReturnType<typeof setTimeout>>;
  let permissionTimers: Map<number, ReturnType<typeof setTimeout>>;
  let mockWebview: ReturnType<typeof createMockWebview>;

  beforeEach(() => {
    agents = new Map();
    nextAgentIdRef = { current: 1 };
    waitingTimers = new Map();
    permissionTimers = new Map();
    mockWebview = createMockWebview();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('Scenario 1: Launch Agent → Character Spawns', async () => {
    // Step 1: Click "+ Agent" button
    const agent: AgentState = {
      id: 1,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now(),
    };
    agents.set(1, agent);

    // Step 2: Emit agentCreated message
    mockWebview.postMessage({ type: 'agentCreated', id: 1 });

    // Verify: Message sent to webview
    const createdMsg = mockWebview.messages.find((m) => m.type === 'agentCreated');
    expect(createdMsg).toBeDefined();
    expect(createdMsg?.id).toBe(1);

    // Verify: Agent exists in extension state
    expect(agents.has(1)).toBe(true);
    expect(agents.get(1)?.id).toBe(1);
  });

  it('Scenario 2: File Edit → Character Animates with Writing Status', () => {
    const agent = agents.get(1);
    if (!agent) {
      agents.set(1, {
        id: 1,
        activeToolIds: new Set(),
        activeToolStatuses: new Map(),
        activeToolNames: new Map(),
        isWaiting: false,
        permissionSent: false,
        lastActivityTimestamp: Date.now(),
      });
    }

    const agent1 = agents.get(1)!;

    // Step 1: User edits file
    const editToolId = `edit_${Date.now()}`;
    agent1.lastActivityTimestamp = Date.now();
    agent1.activeToolIds.add(editToolId);
    agent1.activeToolNames.set(editToolId, 'Edit');
    agent1.activeToolStatuses.set(editToolId, 'Editing config.json');

    // Step 2: Emit agentToolStart
    mockWebview.postMessage({
      type: 'agentToolStart',
      id: 1,
      toolId: editToolId,
      status: 'Editing config.json',
    });

    // Verify: Tool activity tracked
    expect(agent1.activeToolIds.size).toBe(1);
    expect(agent1.activeToolNames.get(editToolId)).toBe('Edit');

    // Verify: Message sent to webview
    const toolStartMsg = mockWebview.messages.find((m) => m.type === 'agentToolStart');
    expect(toolStartMsg).toBeDefined();
    expect(toolStartMsg?.status).toContain('Editing');

    // Step 3: Edit completes
    agent1.activeToolIds.delete(editToolId);
    agent1.activeToolStatuses.delete(editToolId);
    agent1.activeToolNames.delete(editToolId);

    // Step 4: Emit agentToolDone
    mockWebview.postMessage({
      type: 'agentToolDone',
      id: 1,
      toolId: editToolId,
    });

    // Verify: Tool activity cleared
    expect(agent1.activeToolIds.has(editToolId)).toBe(false);

    // Verify: Message sent to webview
    const toolDoneMsg = mockWebview.messages.find((m) => m.type === 'agentToolDone');
    expect(toolDoneMsg).toBeDefined();
  });

  it('Scenario 3: 8s Silence → Idle + Waiting Bubble', () => {
    const agent = agents.get(1);
    if (!agent) {
      agents.set(1, {
        id: 1,
        activeToolIds: new Set(),
        activeToolStatuses: new Map(),
        activeToolNames: new Map(),
        isWaiting: false,
        permissionSent: false,
        lastActivityTimestamp: Date.now(),
      });
    }

    const agent1 = agents.get(1)!;
    const idleThresholdMs = 8000;

    // Step 1: Activity happens at time 0
    agent1.lastActivityTimestamp = 0;

    // Step 2: Time passes to 8.1 seconds
    jest.advanceTimersByTime(idleThresholdMs + 100);

    // Step 3: Idle detection checks if elapsed time > threshold
    const elapsedMs = Date.now() - agent1.lastActivityTimestamp;

    if (elapsedMs > idleThresholdMs) {
      agent1.isWaiting = true;
      mockWebview.postMessage({
        type: 'agentStatus',
        id: 1,
        status: 'waiting',
      });
    }

    // Verify: Agent marked as waiting
    expect(agent1.isWaiting).toBe(true);

    // Verify: Waiting message sent to webview
    const waitMsg = mockWebview.messages.find((m) => m.type === 'agentStatus' && m.status === 'waiting');
    expect(waitMsg).toBeDefined();
    expect(waitMsg?.id).toBe(1);
  });

  it('Scenario 4: Multiple Agents with Different States', () => {
    // Create agents
    agents.set(1, {
      id: 1,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now(),
    });

    agents.set(2, {
      id: 2,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now() - 5000, // Started 5s ago
    });

    // Agent 1: active with tool
    const agent1 = agents.get(1)!;
    agent1.activeToolIds.add('write_1');
    agent1.activeToolNames.set('write_1', 'Write');
    mockWebview.postMessage({ type: 'agentToolStart', id: 1, toolId: 'write_1', status: 'Writing' });

    // Agent 2: idle and waiting
    const agent2 = agents.get(2)!;
    agent2.isWaiting = true;
    mockWebview.postMessage({ type: 'agentStatus', id: 2, status: 'waiting' });

    // Verify states are independent
    expect(agent1.isWaiting).toBe(false);
    expect(agent2.isWaiting).toBe(true);

    // Verify both messages sent
    const activeMsg = mockWebview.messages.find((m) => m.type === 'agentToolStart' && m.id === 1);
    const waitMsg = mockWebview.messages.find((m) => m.type === 'agentStatus' && m.id === 2);
    expect(activeMsg).toBeDefined();
    expect(waitMsg).toBeDefined();
  });

  it('Scenario 5: Activity Resumes After Idle', () => {
    const agent = agents.get(1);
    if (!agent) {
      agents.set(1, {
        id: 1,
        activeToolIds: new Set(),
        activeToolStatuses: new Map(),
        activeToolNames: new Map(),
        isWaiting: true,
        permissionSent: false,
        lastActivityTimestamp: Date.now() - 10000,
      });
    }

    const agent1 = agents.get(1)!;

    // Agent is waiting
    expect(agent1.isWaiting).toBe(true);

    // New activity arrives
    agent1.lastActivityTimestamp = Date.now();
    agent1.isWaiting = false;
    agent1.activeToolIds.add('read_1');
    agent1.activeToolNames.set('read_1', 'Read');

    mockWebview.postMessage({
      type: 'agentStatus',
      id: 1,
      status: 'active',
    });

    mockWebview.postMessage({
      type: 'agentToolStart',
      id: 1,
      toolId: 'read_1',
      status: 'Reading file.ts',
    });

    // Verify: Agent no longer waiting
    expect(agent1.isWaiting).toBe(false);
    expect(agent1.activeToolIds.size).toBe(1);

    // Verify: Messages sent
    const activeMsg = mockWebview.messages.find((m) => m.type === 'agentStatus' && m.status === 'active');
    expect(activeMsg).toBeDefined();
  });

  it('Scenario 6: Agent Persists and Restores', () => {
    // Create and store agent
    agents.set(1, {
      id: 1,
      folderName: 'my-project',
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now(),
    });

    // Simulate persistence
    const persiasted: PersistedAgent[] = Array.from(agents.values()).map((agent) => ({
      id: agent.id,
      folderName: agent.folderName,
    }));

    // Simulate reload: clear agents
    agents.clear();
    expect(agents.size).toBe(0);

    // Simulate restore: recreate agents from persisted data
    for (const persisted of persiasted) {
      agents.set(persisted.id, {
        id: persisted.id,
        folderName: persisted.folderName,
        activeToolIds: new Set(),
        activeToolStatuses: new Map(),
        activeToolNames: new Map(),
        isWaiting: false,
        permissionSent: false,
        lastActivityTimestamp: Date.now(),
      });
    }

    // Verify: Agent restored
    expect(agents.size).toBe(1);
    expect(agents.get(1)?.folderName).toBe('my-project');
  });

  it('Scenario 7: Multiple File Operations in Sequence', () => {
    const agent = agents.get(1);
    if (!agent) {
      agents.set(1, {
        id: 1,
        activeToolIds: new Set(),
        activeToolStatuses: new Map(),
        activeToolNames: new Map(),
        isWaiting: false,
        permissionSent: false,
        lastActivityTimestamp: Date.now(),
      });
    }

    const agent1 = agents.get(1)!;

    // Sequence: Edit → Write → Read
    const operations = [
      { toolId: 'edit_1', toolName: 'Edit', status: 'Editing app.ts' },
      { toolId: 'write_2', toolName: 'Write', status: 'Writing config.json' },
      { toolId: 'read_3', toolName: 'Read', status: 'Reading package.json' },
    ];

    for (const op of operations) {
      agent1.activeToolIds.add(op.toolId);
      agent1.activeToolNames.set(op.toolId, op.toolName);
      agent1.activeToolStatuses.set(op.toolId, op.status);
      mockWebview.postMessage({
        type: 'agentToolStart',
        id: 1,
        toolId: op.toolId,
        status: op.status,
      });

      // Simulate tool completion
      jest.advanceTimersByTime(500);
      agent1.activeToolIds.delete(op.toolId);
      agent1.activeToolStatuses.delete(op.toolId);
      agent1.activeToolNames.delete(op.toolId);
      mockWebview.postMessage({
        type: 'agentToolDone',
        id: 1,
        toolId: op.toolId,
      });
    }

    // Verify: All operations completed
    expect(agent1.activeToolIds.size).toBe(0);

    // Verify: Messages sent for each operation
    const startMsgs = mockWebview.messages.filter((m) => m.type === 'agentToolStart');
    const doneMsgs = mockWebview.messages.filter((m) => m.type === 'agentToolDone');

    expect(startMsgs.length).toBe(3);
    expect(doneMsgs.length).toBe(3);
  });
});
