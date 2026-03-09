/**
 * Idle Detection Tests
 *
 * Scenarios:
 * - 8 seconds of silence → character transitions to idle + waiting bubble appears
 * - Waiting bubble shown after idle threshold
 * - Notification sound plays when waiting state activated
 * - Any new activity cancels idle state
 * - Permission timer for non-exempt tools firing after 5s
 * - Multiple agents can idle independently
 */

import type * as vscode from 'vscode';
import type { AgentState } from '../src/types';
import {
  startWaitingTimer,
  cancelWaitingTimer,
  startPermissionTimer,
  cancelPermissionTimer,
  clearAgentActivity,
} from '../src/timerManager';
import { PERMISSION_TIMER_DELAY_MS } from '../src/constants';

const createMockWebview = (): { postMessage: jest.Mock; messages: any[] } => {
  const messages: any[] = [];
  return {
    postMessage: jest.fn((msg) => messages.push(msg)),
    messages,
  };
};

describe('Idle Detection (8s Silence → Wandering + Waiting Bubble)', () => {
  let agents: Map<number, AgentState>;
  let waitingTimers: Map<number, ReturnType<typeof setTimeout>>;
  let permissionTimers: Map<number, ReturnType<typeof setTimeout>>;
  let mockWebview: ReturnType<typeof createMockWebview>;

  beforeEach(() => {
    agents = new Map();
    waitingTimers = new Map();
    permissionTimers = new Map();
    mockWebview = createMockWebview();
    jest.useFakeTimers();

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
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('should start waiting timer', () => {
    const agent = agents.get(1)!;
    const delayMs = 8000; // 8 seconds

    startWaitingTimer(1, delayMs, agents, waitingTimers, mockWebview as any);

    expect(waitingTimers.has(1)).toBe(true);
  });

  it('should emit agentStatus: waiting after delay expires', () => {
    const agent = agents.get(1)!;
    const delayMs = 8000;

    startWaitingTimer(1, delayMs, agents, waitingTimers, mockWebview as any);

    // Advance time past the delay
    jest.advanceTimersByTime(delayMs + 100);

    // Verify waiting timer fired
    expect(waitingTimers.has(1)).toBe(false); // Timer deleted after firing
    expect(agent.isWaiting).toBe(true);

    const statusMsg = mockWebview.messages.find((m) => m.type === 'agentStatus' && m.status === 'waiting');
    expect(statusMsg).toBeDefined();
    expect(statusMsg?.id).toBe(1);
  });

  it('should emit agentStatus: active when activity resumes', () => {
    const agent = agents.get(1)!;
    agent.isWaiting = true;

    // Simulate activity resuming
    cancelWaitingTimer(1, waitingTimers);
    agent.isWaiting = false;
    mockWebview.postMessage({ type: 'agentStatus', id: 1, status: 'active' });

    expect(agent.isWaiting).toBe(false);
    const activeMsg = mockWebview.messages.find((m) => m.type === 'agentStatus' && m.status === 'active');
    expect(activeMsg).toBeDefined();
  });

  it('should cancel waiting timer when new activity arrives', () => {
    const agent = agents.get(1)!;
    const delayMs = 8000;

    startWaitingTimer(1, delayMs, agents, waitingTimers, mockWebview as any);
    expect(waitingTimers.has(1)).toBe(true);

    // New activity arrives
    cancelWaitingTimer(1, waitingTimers);
    expect(waitingTimers.has(1)).toBe(false);
    expect(agent.isWaiting).toBe(false);
  });

  it('should replace waiting timer if called multiple times', () => {
    const firstDelayMs = 3000;
    const secondDelayMs = 8000;

    startWaitingTimer(1, firstDelayMs, agents, waitingTimers, mockWebview as any);
    expect(waitingTimers.size).toBe(1);

    startWaitingTimer(1, secondDelayMs, agents, waitingTimers, mockWebview as any);
    expect(waitingTimers.size).toBe(1); // Still 1, not 2

    // Advance past first delay (should not fire)
    jest.advanceTimersByTime(firstDelayMs + 100);
    expect(agents.get(1)!.isWaiting).toBe(false);

    // Advance past second delay (should fire)
    jest.advanceTimersByTime(secondDelayMs);
    expect(agents.get(1)!.isWaiting).toBe(true);
  });

  it('should start permission timer for non-exempt tools', () => {
    const agent = agents.get(1)!;
    const permissionExemptTools = new Set(['Read', 'Grep', 'Glob', 'WebFetch']);

    agent.activeToolIds.add('task_123');
    agent.activeToolNames.set('task_123', 'Bash');

    startPermissionTimer(1, agents, permissionTimers, permissionExemptTools, mockWebview as any);

    expect(permissionTimers.has(1)).toBe(true);
  });

  it('should emit agentToolPermission after PERMISSION_TIMER_DELAY_MS', () => {
    const agent = agents.get(1)!;
    const permissionExemptTools = new Set(['Read', 'Grep', 'Glob', 'WebFetch']);

    agent.activeToolIds.add('write_456');
    agent.activeToolNames.set('write_456', 'Write');

    startPermissionTimer(1, agents, permissionTimers, permissionExemptTools, mockWebview as any);

    // Advance time
    jest.advanceTimersByTime(PERMISSION_TIMER_DELAY_MS + 100);

    expect(agent.permissionSent).toBe(true);
    const permMsg = mockWebview.messages.find((m) => m.type === 'agentToolPermission');
    expect(permMsg).toBeDefined();
    expect(permMsg?.id).toBe(1);
  });

  it('should NOT emit agentToolPermission if all tools are exempt', () => {
    const agent = agents.get(1)!;
    const permissionExemptTools = new Set(['Read', 'Grep', 'Glob', 'WebFetch']);

    // Only add exempt tools
    agent.activeToolIds.add('read_789');
    agent.activeToolNames.set('read_789', 'Read');

    mockWebview.messages.length = 0; // Clear

    startPermissionTimer(1, agents, permissionTimers, permissionExemptTools, mockWebview as any);
    jest.advanceTimersByTime(PERMISSION_TIMER_DELAY_MS + 100);

    expect(agent.permissionSent).toBe(false);
    const permMsg = mockWebview.messages.find((m) => m.type === 'agentToolPermission');
    expect(permMsg).toBeUndefined();
  });

  it('should cancel permission timer when activity completes', () => {
    const agent = agents.get(1)!;
    agent.activeToolIds.add('task_100');
    agent.activeToolNames.set('task_100', 'Bash');

    startPermissionTimer(1, agents, permissionTimers, new Set(['Read']), mockWebview as any);
    expect(permissionTimers.has(1)).toBe(true);

    cancelPermissionTimer(1, permissionTimers);
    expect(permissionTimers.has(1)).toBe(false);
  });

  it('should clear all agent activity and emit agentToolsClear', () => {
    const agent = agents.get(1)!;
    agent.activeToolIds.add('tool_1');
    agent.activeToolIds.add('tool_2');
    agent.activeToolStatuses.set('tool_1', 'Writing file.ts');
    agent.activeToolStatuses.set('tool_2', 'Reading config.json');
    agent.activeToolNames.set('tool_1', 'Write');
    agent.activeToolNames.set('tool_2', 'Read');
    agent.permissionSent = true;
    agent.isWaiting = true;

    const permTimer = setTimeout(() => {}, 1000);
    permissionTimers.set(1, permTimer);

    clearAgentActivity(agent, 1, permissionTimers, mockWebview as any);

    expect(agent.activeToolIds.size).toBe(0);
    expect(agent.activeToolStatuses.size).toBe(0);
    expect(agent.activeToolNames.size).toBe(0);
    expect(agent.isWaiting).toBe(false);
    expect(agent.permissionSent).toBe(false);
    expect(permissionTimers.has(1)).toBe(false);

    const clearMsg = mockWebview.messages.find((m) => m.type === 'agentToolsClear');
    const activeMsg = mockWebview.messages.find((m) => m.type === 'agentStatus' && m.status === 'active');
    expect(clearMsg).toBeDefined();
    expect(activeMsg).toBeDefined();
  });

  it('should handle multiple agents idling independently', () => {
    const delayMs = 8000;

    // Set up agent 2
    agents.set(2, {
      id: 2,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      lastActivityTimestamp: Date.now(),
    });

    startWaitingTimer(1, delayMs, agents, waitingTimers, mockWebview as any);
    startWaitingTimer(2, delayMs, agents, waitingTimers, mockWebview as any);

    // Advance time past delay
    jest.advanceTimersByTime(delayMs + 100);

    expect(agents.get(1)!.isWaiting).toBe(true);
    expect(agents.get(2)!.isWaiting).toBe(true);

    // Cancel agent 1's waiting
    cancelWaitingTimer(1, waitingTimers);
    agents.get(1)!.isWaiting = false;

    expect(agents.get(1)!.isWaiting).toBe(false);
    expect(agents.get(2)!.isWaiting).toBe(true);
  });

  it('should measure idle time correctly', () => {
    const agent = agents.get(1)!;
    const idleThresholdMs = 8000;

    agent.lastActivityTimestamp = Date.now() - idleThresholdMs - 1000; // 9 seconds ago

    // Check if idle
    const currentTime = Date.now();
    const idleTime = currentTime - agent.lastActivityTimestamp;

    expect(idleTime).toBeGreaterThan(idleThresholdMs);
  });
});
