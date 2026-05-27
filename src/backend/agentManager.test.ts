/**
 * Agent Launch Tests
 *
 * Scenarios:
 * - User clicks "+ Agent" button → new agent created
 * - Agent persisted to workspace state
 * - Multiple agents can coexist
 * - Agent IDs increment sequentially
 * - Copilot Chat panel opens automatically
 */

import * as vscode from 'vscode';
import { launchNewAgent, removeAgent, persistAgents, restoreAgents } from './agentManager';
import type { AgentState, PersistedAgent } from './types';
import { WORKSPACE_KEY_AGENTS } from './constants';

// Mock VS Code API
const mockWorkspaceFolders: vscode.WorkspaceFolder[] = [
  { uri: vscode.Uri.file('/workspace/project1'), name: 'project1', index: 0 },
  { uri: vscode.Uri.file('/workspace/project2'), name: 'project2', index: 1 },
];

const createMockWebview = (): { postMessage: jest.Mock; messages: any[] } => {
  const messages: any[] = [];
  return {
    postMessage: jest.fn((msg) => messages.push(msg)),
    messages,
  };
};

const createMockContext = (): vscode.ExtensionContext => ({
  workspaceState: {
    get: jest.fn(),
    update: jest.fn(),
    keys: jest.fn(),
  } as any,
} as any);

describe('Agent Launch (+ Agent Button)', () => {
  let agents: Map<number, AgentState>;
  let nextAgentIdRef: { current: number };
  let waitingTimers: Map<number, ReturnType<typeof setTimeout>>;
  let permissionTimers: Map<number, ReturnType<typeof setTimeout>>;
  let mockWebview: ReturnType<typeof createMockWebview>;
  let persistCallback: jest.Mock;
  let vscodeMock: any;

  beforeEach(() => {
    agents = new Map();
    nextAgentIdRef = { current: 1 };
    waitingTimers = new Map();
    permissionTimers = new Map();
    mockWebview = createMockWebview();
    persistCallback = jest.fn();

    // Import vscode mock and set workspace folders
    vscodeMock = require('vscode');
    vscodeMock.workspace.workspaceFolders = mockWorkspaceFolders;
    vscodeMock.commands.executeCommand = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create new agent with incremented ID', async () => {
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);

    expect(agents.size).toBe(1);
    const agent = agents.get(1);
    expect(agent).toBeDefined();
    expect(agent?.id).toBe(1);
  });

  it('should initialize agent with empty tool state', async () => {
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);

    const agent = agents.get(1);
    expect(agent?.activeToolIds.size).toBe(0);
    expect(agent?.activeToolStatuses.size).toBe(0);
    expect(agent?.isWaiting).toBe(false);
  });

  it('should emit agentCreated message to webview', async () => {
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);

    const createdMsg = mockWebview.messages.find((m) => m.type === 'agentCreated');
    expect(createdMsg).toBeDefined();
    expect(createdMsg?.id).toBe(1);
  });

  it('should call persist callback after agent creation', async () => {
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);

    expect(persistCallback).toHaveBeenCalled();
  });

  it('should increment agent ID for multiple launches', async () => {
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);

    expect(agents.size).toBe(2);
    expect(agents.has(1)).toBe(true);
    expect(agents.has(2)).toBe(true);
    expect(nextAgentIdRef.current).toBe(3);
  });

  it('should set folderName in multi-root workspace', async () => {
    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback, mockWorkspaceFolders[0].uri.fsPath);

    const agent = agents.get(1);
    expect(agent?.folderName).toBe('project1');
  });

  it('should not set folderName in single-root workspace', async () => {
    vscodeMock.workspace.workspaceFolders = [mockWorkspaceFolders[0]];

    await launchNewAgent(nextAgentIdRef, agents, waitingTimers, permissionTimers, mockWebview as any, persistCallback);

    const agent = agents.get(1);
    expect(agent?.folderName).toBeUndefined();
  });

  it('should remove agent and clean up timers', () => {
    agents.set(1, { id: 1, activeToolIds: new Set(), activeToolStatuses: new Map(), activeToolNames: new Map(), isWaiting: false, permissionSent: false, lastActivityTimestamp: 0 });
    const waitTimer = setTimeout(() => {}, 5000);
    waitingTimers.set(1, waitTimer);

    removeAgent(1, agents, waitingTimers, permissionTimers, persistCallback);

    expect(agents.has(1)).toBe(false);
    expect(waitingTimers.has(1)).toBe(false);
    expect(persistCallback).toHaveBeenCalled();
  });

  it('should store agent to persistence', () => {
    agents.set(1, { id: 1, folderName: 'my-project', activeToolIds: new Set(), activeToolStatuses: new Map(), activeToolNames: new Map(), isWaiting: false, permissionSent: false, lastActivityTimestamp: 0 });
    agents.set(2, { id: 2, folderName: undefined, activeToolIds: new Set(), activeToolStatuses: new Map(), activeToolNames: new Map(), isWaiting: false, permissionSent: false, lastActivityTimestamp: 0 });

    const context = createMockContext();
    persistAgents(agents, context as any);

    expect(context.workspaceState.update).toHaveBeenCalledWith(WORKSPACE_KEY_AGENTS, expect.arrayContaining([
      { id: 1, folderName: 'my-project' },
      { id: 2, folderName: undefined },
    ]));
  });

  it('should restore agents from persistence', () => {
    const persisted: PersistedAgent[] = [
      { id: 5, folderName: 'project-a' },
      { id: 6, folderName: 'project-b' },
    ];

    const context = createMockContext();
    (context.workspaceState.get as jest.Mock).mockReturnValue(persisted);

    nextAgentIdRef.current = 5;
    restoreAgents(context as any, nextAgentIdRef, agents, mockWebview as any, jest.fn());

    expect(agents.size).toBe(2);
    expect(agents.has(5)).toBe(true);
    expect(agents.has(6)).toBe(true);
    expect(nextAgentIdRef.current).toBeGreaterThan(6);
  });
});
