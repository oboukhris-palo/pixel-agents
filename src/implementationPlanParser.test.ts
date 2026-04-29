/**
 * Layer 2 Tests: Implementation Plan Parser Service
 * Story: Pixel Agents v1.0.5 - UI/UX Enhancement
 *
 * Tests validate parsing of implementation-plan.md files, user story status detection,
 * and task progression calculation.
 */

import { ImplementationPlanParser } from './implementationPlanParser';
import type { ImplementationPlanTask, TaskProgressionEnhanced } from './implementationPlanTypes';

// Mock vscode module
jest.mock('vscode', () => ({
  Uri: {
    file: jest.fn((path: string) => ({ fsPath: path, path })),
    joinPath: jest.fn((...parts: any[]) => {
      const joined = parts.map((p: any) => (typeof p === 'string' ? p : p.path || p.fsPath)).join('/');
      return { fsPath: joined, path: joined };
    }),
  },
  workspace: {
    fs: {
      readFile: jest.fn(),
      stat: jest.fn(),
    },
    findFiles: jest.fn(),
  },
  window: {
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  RelativePattern: jest.fn((base: any, pattern: string) => ({ base, pattern })),
}));

const SAMPLE_PLAN = `# Implementation Plan: Test Story

## Layer 1: Types

### 🔴 RED Phase - Cycle 1 (Write Failing Tests)
- [x] RED Phase - Cycle 1: Create type test file
- [x] RED Phase - Cycle 1: Write interface validation tests

### 🟢 GREEN Phase - Cycle 1 (Minimal Implementation)
- [x] GREEN Phase - Cycle 1: Create types file
- [ ] GREEN Phase - Cycle 1: Implement interfaces

## Layer 2: Services

### 🔴 RED Phase - Cycle 2 (Write Failing Tests)
- [ ] RED Phase - Cycle 2: Create parser test file
- [ ] RED Phase - Cycle 2: Write parsing tests
`;

const SAMPLE_USER_STORIES = `# User Stories Implementation Status

## Epic 1: Core Features

### US-001-001: Authentication
**Status**: ✅ Delivered

### US-001-002: Activity Monitor
**Status**: 🟡 In Progress

### US-001-003: Completeness Meter
**Status**: 🔵 Not Started
`;

import * as vscode from 'vscode';

describe('ImplementationPlanParser - Layer 2', () => {
  let parser: ImplementationPlanParser;
  const mockWorkspaceRoot = { fsPath: '/workspace', path: '/workspace' } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    parser = new ImplementationPlanParser(mockWorkspaceRoot);
  });

  describe('parseImplementationPlan()', () => {
    it('should parse checkboxes from implementation-plan.md', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.parseImplementationPlan('US-001-002', 'EPIC-001');

      expect(result.storyRef).toBe('US-001-002');
      expect(result.epicRef).toBe('EPIC-001');
      expect(result.checkboxes.length).toBeGreaterThan(0);
    });

    it('should count total vs completed checkboxes correctly', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.parseImplementationPlan('US-001-002', 'EPIC-001');

      // SAMPLE_PLAN has 3 checked [x] and 3 unchecked [ ]
      expect(result.totalCheckboxes).toBe(6);
      expect(result.completedCheckboxes).toBe(3);
    });

    it('should assign correct layer numbers from surrounding ## Layer N: headers', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.parseImplementationPlan('US-001-002', 'EPIC-001');

      const layer1Checkboxes = result.checkboxes.filter(cb => cb.layerNumber === 1);
      const layer2Checkboxes = result.checkboxes.filter(cb => cb.layerNumber === 2);
      expect(layer1Checkboxes.length).toBe(4);
      expect(layer2Checkboxes.length).toBe(2);
    });

    it('should identify currentCheckbox as first unchecked item', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.parseImplementationPlan('US-001-002', 'EPIC-001');

      expect(result.currentCheckbox).not.toBeNull();
      expect(result.currentCheckbox!.completed).toBe(false);
      expect(result.currentCheckbox!.description).toBe('Implement interfaces');
    });

    it('should return currentCheckbox null when all items are complete', async () => {
      const allChecked = SAMPLE_PLAN.replace(/- \[ \]/g, '- [x]');
      const encoded = Buffer.from(allChecked);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.parseImplementationPlan('US-001-002', 'EPIC-001');

      expect(result.currentCheckbox).toBeNull();
    });

    it('should return default task when file does not exist', async () => {
      (vscode.workspace.fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await parser.parseImplementationPlan('US-001-999', 'EPIC-001');

      expect(result.storyRef).toBe('US-001-999');
      expect(result.checkboxes).toHaveLength(0);
      expect(result.totalCheckboxes).toBe(0);
      expect(result.currentCheckbox).toBeNull();
    });
  });

  describe('findCurrentUserStory()', () => {
    it('should return the In Progress story from user-stories.md', async () => {
      const encoded = Buffer.from(SAMPLE_USER_STORIES);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.findCurrentUserStory();

      expect(result).not.toBeNull();
      expect(result!.storyRef).toBe('US-001-002');
    });

    it('should return null when no story is In Progress', async () => {
      const noInProgress = SAMPLE_USER_STORIES.replace('🟡 In Progress', '🔵 Not Started');
      const encoded = Buffer.from(noInProgress);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.findCurrentUserStory();

      expect(result).toBeNull();
    });

    it('should return null when user-stories.md cannot be read', async () => {
      (vscode.workspace.fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await parser.findCurrentUserStory();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentTaskProgression()', () => {
    it('should return combined story status and plan checkboxes', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      const storiesEncoded = Buffer.from(SAMPLE_USER_STORIES);

      (vscode.workspace.fs.readFile as jest.Mock)
        .mockResolvedValueOnce(storiesEncoded) // user-stories.md
        .mockResolvedValueOnce(encoded);        // implementation-plan.md

      const result = await parser.getCurrentTaskProgression();

      expect(result).not.toBeNull();
      expect(result!.totalCheckboxes).toBe(6);
      expect(result!.completedCheckboxes).toBe(3);
      expect(result!.currentCheckbox).not.toBeNull();
    });

    it('should return null when no story is In Progress', async () => {
      const noInProgress = SAMPLE_USER_STORIES.replace('🟡 In Progress', '🔵 Not Started');
      const encoded = Buffer.from(noInProgress);
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(encoded);

      const result = await parser.getCurrentTaskProgression();

      expect(result).toBeNull();
    });

    it('should include planPath in the result', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      const storiesEncoded = Buffer.from(SAMPLE_USER_STORIES);

      (vscode.workspace.fs.readFile as jest.Mock)
        .mockResolvedValueOnce(storiesEncoded)
        .mockResolvedValueOnce(encoded);

      const result = await parser.getCurrentTaskProgression();

      expect(result!.planPath).toContain('implementation-plan.md');
    });

    it('should provide nextCheckbox after current', async () => {
      const encoded = Buffer.from(SAMPLE_PLAN);
      const storiesEncoded = Buffer.from(SAMPLE_USER_STORIES);

      (vscode.workspace.fs.readFile as jest.Mock)
        .mockResolvedValueOnce(storiesEncoded)
        .mockResolvedValueOnce(encoded);

      const result = await parser.getCurrentTaskProgression();

      // currentCheckbox is 4th item (first unchecked), next should be the 5th
      expect(result!.nextCheckbox).not.toBeNull();
      expect(result!.nextCheckbox!.description).toBe('Create parser test file');
    });
  });
});
