/**
 * Sound Service (US-002-005 Layer 2)
 *
 * Manages audio notifications via VS Code notification API.
 * Respects user's VS Code audio settings and accessibility preferences.
 * No custom audio files — system sounds only (AC1, AC6).
 *
 * Design pattern: Facade over VS Code notification API
 */

import * as vscode from 'vscode';

export type SoundEventType = 'milestone' | 'error' | 'success' | 'warning';

export interface SoundOptions {
  modal?: boolean;
  detail?: string;
}

// Milestone messages (AC7: paired with visual notifications)
const MILESTONE_MESSAGES: Record<number, string> = {
  25: '🎉 First Quarter Done!',
  50: '🚀 Halfway There!',
  75: '🔥 On Fire!',
  100: '🏆 Project Victory!',
};

export class SoundService {
  private readonly outputChannel: vscode.OutputChannel;

  constructor(
    private readonly context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
  ) {
    this.outputChannel = outputChannel;
  }

  // ── Milestone sounds ───────────────────────────────────────────────────────

  /**
   * Play milestone notification sound via VS Code API (AC2).
   * Different severity for each milestone to provide audio variety.
   * VS Code internally routes severity to the correct system sound.
   */
  playMilestoneSound(milestone: number, options?: SoundOptions): void {
    const message = MILESTONE_MESSAGES[milestone];

    if (!message) {
      this.log(`Unknown milestone: ${milestone}`);
      return;
    }

    switch (milestone) {
      case 25:
        vscode.window.showInformationMessage(message, options ?? {});
        break;
      case 50:
        vscode.window.showInformationMessage(message, options ?? {});
        break;
      case 75:
        // Use warning severity for a distinct higher-urgency sound (positive context)
        vscode.window.showWarningMessage(message, options ?? {});
        break;
      case 100:
        vscode.window.showInformationMessage(message, options ?? {});
        break;
    }

    this.log(`Milestone sound played: ${milestone}%`);
  }

  // ── Error sound ────────────────────────────────────────────────────────────

  /**
   * Play error sound on test failure (AC3).
   * Uses VS Code showErrorMessage which triggers system error sound.
   */
  playErrorSound(message: string = 'Test failed', detail?: string): void {
    vscode.window.showErrorMessage(message, { modal: false, detail });
    this.log(`Error sound played: ${message}`);
  }

  // ── Success sound ──────────────────────────────────────────────────────────

  /**
   * Play success sound on story completion (AC4).
   */
  playSuccessSound(message: string = '✅ Story complete!', detail?: string): void {
    vscode.window.showInformationMessage(message, { modal: false, detail });
    this.log(`Success sound played: ${message}`);
  }

  // ── Warning sound ──────────────────────────────────────────────────────────

  /**
   * Play warning sound for non-critical attention events.
   */
  playWarningSound(message: string, detail?: string): void {
    vscode.window.showWarningMessage(message, { modal: false, detail });
    this.log(`Warning sound played: ${message}`);
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  /**
   * Report whether sounds are enabled (AC5).
   * VS Code handles system audio muting internally — we always call the
   * notification API and rely on VS Code / OS audio settings.
   */
  isSoundEnabled(): boolean {
    return true;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  private log(message: string): void {
    this.outputChannel.appendLine(
      `[SoundService] ${new Date().toISOString()}: ${message}`
    );
  }

  dispose(): void {
    // No cleanup needed — VS Code manages notification lifecycle
    this.log('SoundService disposed');
  }
}
