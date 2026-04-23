/**
 * Layer 2: Agent Activity Monitor - Service Tests (RED phase)
 * 
 * Purpose: Validate AgentActivityMonitor service behaviors
 * BDD Mapping:
 *   - AC2: Extract code snippet from git diff (last 5-15 lines)
 *   - AC3: Parse commit message for action type + cycle (RED-01, GREEN-02, REFACTOR-03)
 *   - AC4: Broadcast ActionBubbleMessage via EventEmitter (async, <500ms)
 *   - AC6: Include status field from agent metadata
 */

import { EventEmitter } from 'events';
import { AgentActivityMonitor } from '../agentActivityMonitor';
import { ActionBubbleMessage, AgentActivityState } from '../agentActivityTypes';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeMonitor(overrides: {
  gitDiffOutput?: string;
  commitMessageOutput?: string;
  workspaceFolder?: string;
} = {}): AgentActivityMonitor {
  return new AgentActivityMonitor(
    overrides.workspaceFolder ?? '/fake/workspace',
    undefined,
    {
      getGitDiff: jest.fn().mockResolvedValue(overrides.gitDiffOutput ?? ''),
      getLatestCommitMessage: jest.fn().mockResolvedValue(overrides.commitMessageOutput ?? ''),
    },
  );
}

// ── parseCommitMessage ────────────────────────────────────────────────────────

describe('AgentActivityMonitor.parseCommitMessage', () => {
  it('parses RED-01 pattern', () => {
    const monitor = makeMonitor();
    const action = monitor.parseCommitMessage('TDD-EPIC-001-US-001-002-RED-01: Write failing test');
    expect(action.type).toBe('RED');
    expect(action.cycle).toBe(1);
    expect(action.description).toBe('Write failing test');
  });

  it('parses GREEN-02 pattern', () => {
    const monitor = makeMonitor();
    const action = monitor.parseCommitMessage('TDD-EPIC-001-US-001-002-GREEN-02: Implement logic');
    expect(action.type).toBe('GREEN');
    expect(action.cycle).toBe(2);
  });

  it('parses REFACTOR-03 pattern', () => {
    const monitor = makeMonitor();
    const action = monitor.parseCommitMessage('TDD-EPIC-001-US-001-002-REFACTOR-03: Cleanup');
    expect(action.type).toBe('REFACTOR');
    expect(action.cycle).toBe(3);
  });

  it('returns DOCUMENTATION type for non-TDD commits', () => {
    const monitor = makeMonitor();
    const action = monitor.parseCommitMessage('fix: some bugfix');
    expect(action.type).toBe('DOCUMENTATION');
    expect(action.cycle).toBe(1);
  });

  it('handles empty commit message gracefully', () => {
    const monitor = makeMonitor();
    const action = monitor.parseCommitMessage('');
    expect(action.type).toBe('DOCUMENTATION');
  });
});

// ── extractCodeSnippet ────────────────────────────────────────────────────────

describe('AgentActivityMonitor.extractCodeSnippet', () => {
  it('extracts TypeScript code from git diff', async () => {
    const gitDiff = [
      'diff --git a/src/foo.ts b/src/foo.ts',
      '--- a/src/foo.ts',
      '+++ b/src/foo.ts',
      '@@ -1,3 +1,5 @@',
      '+const x = 1;',
      '+const y = 2;',
      ' unchanged line',
      '-removed line',
      '+added line',
    ].join('\n');

    const monitor = makeMonitor({ gitDiffOutput: gitDiff });
    const snippet = await monitor.extractCodeSnippet();

    expect(snippet).not.toBeNull();
    expect(snippet!.language).toBe('typescript');
    expect(snippet!.content).toContain('const x = 1;');
  });

  it('detects JavaScript language from .js file', async () => {
    const gitDiff = [
      'diff --git a/src/foo.js b/src/foo.js',
      '+console.log("hello");',
    ].join('\n');

    const monitor = makeMonitor({ gitDiffOutput: gitDiff });
    const snippet = await monitor.extractCodeSnippet();
    expect(snippet?.language).toBe('javascript');
  });

  it('detects CSS language from .css file', async () => {
    const gitDiff = [
      'diff --git a/src/styles.css b/src/styles.css',
      '+.foo { color: red; }',
    ].join('\n');

    const monitor = makeMonitor({ gitDiffOutput: gitDiff });
    const snippet = await monitor.extractCodeSnippet();
    expect(snippet?.language).toBe('css');
  });

  it('returns null when diff is empty', async () => {
    const monitor = makeMonitor({ gitDiffOutput: '' });
    const snippet = await monitor.extractCodeSnippet();
    expect(snippet).toBeNull();
  });

  it('truncates lines longer than MAX_CHARS_PER_LINE (AC7)', async () => {
    const longLine = 'x'.repeat(250);
    const gitDiff = [
      'diff --git a/src/foo.ts b/src/foo.ts',
      `+${longLine}`,
    ].join('\n');

    const monitor = makeMonitor({ gitDiffOutput: gitDiff });
    const snippet = await monitor.extractCodeSnippet();
    expect(snippet?.content.length).toBeLessThanOrEqual(204); // 200 + '...'
  });

  it('limits to MAX_LINES (15) lines from diff', async () => {
    const lines = Array.from({ length: 30 }, (_, i) => `+const line${i} = ${i};`);
    const gitDiff = ['diff --git a/src/foo.ts b/src/foo.ts', ...lines].join('\n');
    const monitor = makeMonitor({ gitDiffOutput: gitDiff });
    const snippet = await monitor.extractCodeSnippet();
    const lineCount = snippet!.content.split('\n').length;
    expect(lineCount).toBeLessThanOrEqual(15);
  });
});

// ── broadcast / EventEmitter ─────────────────────────────────────────────────

describe('AgentActivityMonitor event broadcasting (AC4)', () => {
  it('emits agent-activity-update event', async () => {
    const monitor = makeMonitor({
      commitMessageOutput: 'TDD-EPIC-001-US-001-002-RED-01: Test',
      gitDiffOutput: 'diff --git a/src/foo.ts b/src/foo.ts\n+const x = 1;',
    });

    const received: ActionBubbleMessage[] = [];
    monitor.on('agent-activity-update', (msg: ActionBubbleMessage) => received.push(msg));

    await monitor.broadcastUpdate();

    expect(received.length).toBe(1);
    expect(received[0].type).toBe('agent-activity-update');
    expect(received[0].payload.currentAction.type).toBe('RED');
  });

  it('emitted payload includes valid AgentActivityState', async () => {
    const monitor = makeMonitor({
      commitMessageOutput: 'TDD-EPIC-001-US-001-002-GREEN-01: Implement',
      gitDiffOutput: 'diff --git a/src/foo.ts b/src/foo.ts\n+export const fn = () => {};',
    });

    const received: AgentActivityState[] = [];
    monitor.on('agent-activity-update', (msg: ActionBubbleMessage) => received.push(msg.payload));
    await monitor.broadcastUpdate();

    expect(received[0].status).toBe('in-progress');
    expect(received[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it('can be instantiated with EventEmitter', () => {
    const monitor = makeMonitor();
    expect(monitor).toBeInstanceOf(EventEmitter);
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('AgentActivityMonitor error handling', () => {
  it('handles git diff failure gracefully', async () => {
    const monitor = new AgentActivityMonitor('/fake', undefined, {
      getGitDiff: jest.fn().mockRejectedValue(new Error('git not found')),
      getLatestCommitMessage: jest.fn().mockResolvedValue(''),
    });

    await expect(monitor.broadcastUpdate()).resolves.not.toThrow();
  });

  it('handles commit message parse failure gracefully', async () => {
    const monitor = new AgentActivityMonitor('/fake', undefined, {
      getGitDiff: jest.fn().mockResolvedValue(''),
      getLatestCommitMessage: jest.fn().mockRejectedValue(new Error('git log failed')),
    });

    await expect(monitor.broadcastUpdate()).resolves.not.toThrow();
  });
});
