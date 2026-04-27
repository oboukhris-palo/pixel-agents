/**
 * SoundService Tests (US-002-005 Layer 2 - RED phase)
 *
 * Tests for VS Code notification-based sound service.
 * Validates AC1–AC8 from the implementation plan.
 */

import * as vscode from 'vscode';
import { SoundService } from './soundService';

jest.mock('vscode');

const mockOutputChannel = {
  appendLine: jest.fn(),
} as unknown as vscode.OutputChannel;

const mockContext = {} as vscode.ExtensionContext;

function createService() {
  return new SoundService(mockContext, mockOutputChannel);
}

// ── Milestone sounds ───────────────────────────────────────────────────────────

describe('SoundService – Milestone sounds (AC2)', () => {
  let service: SoundService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  it('should play information sound for 25% milestone', () => {
    service.playMilestoneSound(25);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('First Quarter Done'),
      expect.anything()
    );
  });

  it('should play information sound with rocket emoji for 50% milestone', () => {
    service.playMilestoneSound(50);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('🚀'),
      expect.anything()
    );
  });

  it('should play warning sound for 75% milestone', () => {
    service.playMilestoneSound(75);
    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
      expect.stringContaining('🔥'),
      expect.anything()
    );
  });

  it('should play information sound with trophy for 100% milestone', () => {
    service.playMilestoneSound(100);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('🏆'),
      expect.anything()
    );
  });

  it('should log unknown milestone to output channel', () => {
    service.playMilestoneSound(42);
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Unknown milestone')
    );
  });
});

// ── Error sound ────────────────────────────────────────────────────────────────

describe('SoundService – Error sound (AC3)', () => {
  let service: SoundService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  it('should call showErrorMessage for test failure (AC3)', () => {
    service.playErrorSound('Test failed', 'Expected 1, got 0');
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Test failed',
      expect.objectContaining({ detail: 'Expected 1, got 0' })
    );
  });

  it('should use default message when none provided', () => {
    service.playErrorSound();
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Test failed',
      expect.anything()
    );
  });
});

// ── Success sound ──────────────────────────────────────────────────────────────

describe('SoundService – Success sound (AC4)', () => {
  let service: SoundService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  it('should call showInformationMessage on story completion (AC4)', () => {
    service.playSuccessSound('✅ Story complete!');
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      '✅ Story complete!',
      expect.anything()
    );
  });

  it('should use default message when none provided', () => {
    service.playSuccessSound();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('Story complete'),
      expect.anything()
    );
  });
});

// ── Warning sound ──────────────────────────────────────────────────────────────

describe('SoundService – Warning sound', () => {
  let service: SoundService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  it('should call showWarningMessage for warnings', () => {
    service.playWarningSound('Context window at 90%');
    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
      'Context window at 90%',
      expect.anything()
    );
  });
});

// ── Settings & lifecycle ───────────────────────────────────────────────────────

describe('SoundService – Settings & lifecycle (AC5, AC6)', () => {
  let service: SoundService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  it('should always report sound as enabled (AC5 – VS Code manages muting)', () => {
    expect(service.isSoundEnabled()).toBe(true);
  });

  it('should not throw on dispose (AC6)', () => {
    expect(() => service.dispose()).not.toThrow();
  });

  it('should log sound events (AC7 – paired with visual)', () => {
    service.playMilestoneSound(25);
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[SoundService]')
    );
  });
});
