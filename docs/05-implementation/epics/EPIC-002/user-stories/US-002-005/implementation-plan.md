# US-002-005 Implementation Plan: Sound Integration for Notifications

**User Story**: As a developer, I want audio cues for important events so that I'm notified even when not looking at the screen.

**Epic**: EPIC-002 (Context & Task Management)  
**Priority**: P3  
**Story Points**: 2  
**Estimated Effort**: 8 hours (1 day)  
**Dependencies**: None (independent feature)

---

## Overview

Integrate sound notifications for milestone achievements, test failures, and story completions using VS Code's native notification API. This ensures sounds respect user's VS Code audio settings and system accessibility preferences.

## Acceptance Criteria

✅ **AC1**: Sound cues use VS Code notification API (not direct audio playback)  
✅ **AC2**: Milestone sound on 25%, 50%, 75%, 100% (different notification types)  
✅ **AC3**: Error sound on test failure (VS Code showErrorMessage)  
✅ **AC4**: Success sound on story completion (VS Code showInformationMessage)  
✅ **AC5**: Sounds respect VS Code audio settings (can be muted)  
✅ **AC6**: No custom audio files (use system sounds only)  
✅ **AC7**: Accessibility: sounds paired with visual notifications  
✅ **AC8**: Sounds trigger after visual animation completes (coordinated timing)

---

## Technical Architecture

### Layer 1: Type Definitions — Not applicable

**Dependencies**: Use existing VS Code ExtensionContext and notification APIs

---

### Layer 2: Sound Service (Backend) — 4 hours

**Purpose**: Manage sound notifications via VS Code API

**Files to Create**:
- `src/soundService.ts` (150+ lines)

**Sound Service Class**:
```typescript
/**
 * Sound Service (US-002-005 Layer 2)
 * 
 * Manages audio notifications via VS Code notification API.
 * Respects user's VS Code audio settings and accessibility preferences.
 * 
 * Design pattern: Facade over VS Code notification API
 */

import * as vscode from 'vscode';

export type SoundEventType = 'milestone' | 'error' | 'success' | 'warning';

export interface SoundOptions {
  modal?: boolean;  // Show as modal dialog (false by default)
  detail?: string;  // Additional message detail
}

export class SoundService {
  private context: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
    this.context = context;
    this.outputChannel = outputChannel;
  }

  // ── Milestone sounds ───────────────────────────────────────────────────────

  /**
   * Play milestone sound via VS Code notification API (AC2)
   * Different message severity for different milestones
   */
  playMilestoneSound(milestone: number, options?: SoundOptions): void {
    const message = this.getMilestoneMessage(milestone);
    
    // Use different notification types for variety
    switch (milestone) {
      case 25:
        vscode.window.showInformationMessage(message, options);
        break;
      case 50:
        vscode.window.showInformationMessage(message + ' 🚀', options);
        break;
      case 75:
        vscode.window.showWarningMessage(message + ' 🔥', options); // Warning sound (positive context)
        break;
      case 100:
        vscode.window.showInformationMessage(message + ' 🏆', { modal: false, ...options });
        break;
      default:
        this.outputChannel.appendLine(`Unknown milestone: ${milestone}`);
    }

    this.log(`Milestone sound played: ${milestone}%`);
  }

  /**
   * Get milestone message text (AC7: paired with visual)
   */
  private getMilestoneMessage(milestone: number): string {
    const messages: Record<number, string> = {
      25: '🎉 First Quarter Done!',
      50: '🚀 Halfway There!',
      75: '🔥 On Fire!',
      100: '🏆 Project Victory!'
    };
    return messages[milestone] || `Milestone ${milestone}% reached`;
  }

  // ── Error sound ────────────────────────────────────────────────────────────

  /**
   * Play error sound on test failure (AC3)
   */
  playErrorSound(message: string = 'Test failed', detail?: string): void {
    vscode.window.showErrorMessage(message, { modal: false, detail });
    this.log(`Error sound played: ${message}`);
  }

  // ── Success sound ──────────────────────────────────────────────────────────

  /**
   * Play success sound on story completion (AC4)
   */
  playSuccessSound(message: string = '✅ Story complete!', detail?: string): void {
    vscode.window.showInformationMessage(message, { modal: false, detail });
    this.log(`Success sound played: ${message}`);
  }

  // ── Warning sound ──────────────────────────────────────────────────────────

  /**
   * Play warning sound for non-critical issues
   */
  playWarningSound(message: string, detail?: string): void {
    vscode.window.showWarningMessage(message, { modal: false, detail });
    this.log(`Warning sound played: ${message}`);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /**
   * Check if sounds are enabled (AC5: respects VS Code settings)
   * Note: VS Code doesn't expose audio settings directly,
   * so we log and rely on VS Code's own mute handling
   */
  isSoundEnabled(): boolean {
    // VS Code handles muting internally via system settings
    // We always call the notification API; VS Code decides whether to play sound
    return true;
  }

  /**
   * Log sound events for debugging
   */
  private log(message: string): void {
    this.outputChannel.appendLine(`[SoundService] ${new Date().toISOString()}: ${message}`);
  }

  /**
   * Dispose sound service
   */
  dispose(): void {
    // No cleanup needed (VS Code manages notification lifecycle)
    this.log('SoundService disposed');
  }
}
```

**TDD Approach**:
- **RED**: Write tests for sound service (verify VS Code API calls)
- **GREEN**: Implement sound service with notification API
- **REFACTOR**: Extract message configuration to constants

**Test Coverage**:
- Milestone sounds trigger correct notification types
- Error sound uses showErrorMessage
- Success sound uses showInformationMessage
- Messages paired with visual content (AC7)
- Logging works correctly

**Architectural Constraints**:
- Use VS Code notification API only (AC1, AC6)
- No direct audio file playback
- Respect VS Code audio settings (AC5)
- Coordinate with achievement animations (AC8)

**Estimated Effort**: 4 hours

---

### Layer 3: Sound Integration & Triggers — 2 hours

**Purpose**: Integrate sound service with existing systems

**Files to Modify**:
- `src/PixelAgentsViewProvider.ts` (instantiate sound service)
- `src/achievementMessageHandler.ts` (trigger sounds on achievements)
- `src/completenessMessageHandler.ts` (trigger sounds on milestones)

**Integration Points**:
```typescript
/**
 * Sound Integration (US-002-005 Layer 3)
 * 
 * Wire sound service to achievement and completeness events
 */

// In PixelAgentsViewProvider.ts
export class PixelAgentsViewProvider implements vscode.WebviewViewProvider {
  private soundService: SoundService;

  constructor(context: vscode.ExtensionContext, private outputChannel: vscode.OutputChannel) {
    this.soundService = new SoundService(context, outputChannel);
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    // ... existing setup

    // Subscribe to achievement events
    this.achievementEngine.on('achievement-unlocked', (achievement) => {
      if (achievement.tier === 'milestone') {
        // AC8: Coordinate with visual animation (delay 500ms)
        setTimeout(() => {
          this.soundService.playMilestoneSound(achievement.milestone);
        }, 500);
      }
    });

    // Subscribe to completeness events
    this.completenessCalculator.on('completeness-update', (metrics) => {
      const milestone = Math.floor(metrics.completeness / 25) * 25;
      if (milestone > 0 && milestone % 25 === 0) {
        // AC8: Play sound after visual celebration starts (delay 300ms)
        setTimeout(() => {
          this.soundService.playMilestoneSound(milestone);
        }, 300);
      }
    });

    // AC3: Test failure sound
    this.testRunner?.on('test-failed', (failure) => {
      this.soundService.playErrorSound('Test failed', failure.message);
    });

    // AC4: Story completion sound
    this.storyTracker?.on('story-completed', (storyId) => {
      this.soundService.playSuccessSound(`✅ Story ${storyId} complete!`);
    });
  }

  dispose() {
    this.soundService.dispose();
    // ... existing cleanup
  }
}
```

**TDD Approach**:
- **RED**: Write integration tests (verify sound service called on events)
- **GREEN**: Wire sound service to event emitters
- **REFACTOR**: Extract timing configuration to constants

**Test Coverage**:
- Sound service instantiated on provider creation
- Milestone sounds triggered on completeness updates
- Error sounds triggered on test failures
- Success sounds triggered on story completions
- Timing coordination correct (AC8)

**Estimated Effort**: 2 hours

---

### Layer 4: Component Testing & Validation — 2 hours

**Purpose**: Comprehensive testing of sound system

**Files to Create**:
- `src/soundService.test.ts` (20-30 tests)

**Test Suites**:

1. **Sound Service Tests** (10 tests)
   - Milestone sounds use correct notification type
   - Error sound uses showErrorMessage (AC3)
   - Success sound uses showInformationMessage (AC4)
   - Messages include emoji and detail text (AC7)
   - Logging captures all sound events

2. **Integration Tests** (10 tests)
   - Sound service instantiated correctly
   - Milestone sounds triggered on completeness events
   - Error sounds triggered on test failures
   - Success sounds triggered on story completions
   - Timing delays applied correctly (AC8: 300ms, 500ms)

3. **VS Code API Mock Tests** (10 tests)
   - showInformationMessage called with correct params
   - showErrorMessage called with correct params
   - showWarningMessage called with correct params
   - Modal option set to false (non-blocking)
   - No direct audio file playback (AC6)

**TDD Approach**:
- **RED**: Write comprehensive test suite (20-30 tests)
- **GREEN**: Verify all tests pass
- **REFACTOR**: Use shared test fixtures for VS Code API mocks

**Estimated Effort**: 2 hours

---

## Definition of Done

- ✅ All 8 acceptance criteria met
- ✅ Sound service implemented using VS Code notification API (AC1)
- ✅ Milestone sounds trigger on 25%, 50%, 75%, 100% (AC2)
- ✅ Error sound on test failure (AC3)
- ✅ Success sound on story completion (AC4)
- ✅ Sounds respect VS Code settings (AC5)
- ✅ No custom audio files used (AC6)
- ✅ Sounds paired with visual notifications (AC7)
- ✅ Timing coordinated with animations (AC8)
- ✅ 20-30 tests passing (sound service + integration)
- ✅ Code review approved (13-point checklist)

---

## Effort Summary

| Layer | Effort | Key Deliverables |
|-------|--------|------------------|
| Layer 2 | 4 hours | Sound service with VS Code API |
| Layer 3 | 2 hours | Integration with achievement/completeness systems |
| Layer 4 | 2 hours | Testing + validation |
| **Total** | **8 hours (1 day)** | **Complete sound system** |

---

## Dependencies & Blockers

**Dependencies**:
- None (independent feature)
- VS Code API available in extension context ✅

**No blockers** — Can be implemented immediately

---

## Success Metrics

- All sounds use VS Code notification API (AC1) ✅
- Sounds respect user's audio settings (AC5) ✅
- Accessibility: Visual + audio pairing (AC7) ✅
- User satisfaction: Sounds feel motivating, not annoying
- Zero custom audio files (AC6) ✅

---

## Notes

### Why VS Code Notification API?

1. **AC5: Respects Settings**: VS Code handles muting based on system/user preferences
2. **AC6: No Custom Files**: Uses system sounds (no bundling audio files)
3. **AC7: Accessibility**: Notifications always paired with visual content
4. **Simplicity**: No audio file management, playback logic, or timing issues

### Timing Coordination (AC8)

- Milestone sounds delayed 300-500ms after visual animation starts
- Ensures sound doesn't overlap with particle emission sound (if any)
- Prevents audio spam during rapid milestone crossing

### Future Enhancement

If VS Code adds native audio API in future, refactor to use dedicated sound playback while maintaining same interface.

---

**Document Version**: 1.0  
**Created**: 2026-04-27  
**Last Updated**: 2026-04-27  
**Author**: Sebastian (Dev-Lead)  
**Status**: READY FOR APPROVAL
