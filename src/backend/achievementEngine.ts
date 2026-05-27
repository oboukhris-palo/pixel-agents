/**
 * Achievement Engine Service
 * Layer 2: Backend - Event-driven achievement management with persistence
 *
 * The Achievement Engine is responsible for:
 * - Detecting and unlocking achievements based on project metrics
 * - Managing user streaks (consecutive day task completions)
 * - Calculating and tracking PRU (Prompt Resource Unit) efficiency scores
 * - Persisting achievement state to VS Code's extension storage
 * - Emitting events for UI updates when achievements unlock
 *
 * @example
 * const engine = new AchievementEngine(context);
 * const achievements = engine.checkForNewAchievements({ completionPercentage: 50, storiesCompleted: 10 });
 * engine.on('achievement.unlocked', (achievement) => console.log(`Unlocked: ${achievement.name}`));
 */

import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import {
  Achievement,
  ACHIEVEMENT_REGISTRY,
  StreakData,
  PRUScore,
  checkAchievementUnlocked,
  calculatePRUEfficiency,
  calculatePRURank,
  MILESTONE_THRESHOLDS,
  STREAK_THRESHOLDS,
  PRU_THRESHOLDS,
} from './achievementTypes';

/**
 * Project metrics for achievement checking
 * Used to determine which achievements should be unlocked
 *
 * @interface ProjectMetrics
 * @property completionPercentage - Project completion percentage (0-100)
 * @property storiesCompleted - Total number of user stories completed
 */
export interface ProjectMetrics {
  completionPercentage: number;
  storiesCompleted: number;
}

/**
 * Saved achievement state
 * Serializable state object persisted to extension storage
 *
 * @interface AchievementState
 * @property achievements - Array of unlocked achievement objects
 * @property streak - Current and longest streak data
 * @property pruScore - PRU efficiency score and rank
 */
interface AchievementState {
  achievements: Achievement[];
  streak: StreakData;
  pruScore: PRUScore;
}

/**
 * Achievement Engine Service
 * Manages achievement unlocking, persistence, and event notifications
 *
 * Features:
 * - Milestone achievements (25%, 50%, 75%, 100% completion)
 * - Streak achievements (3 and 7-day consecutive completions)
 * - PRU efficiency achievements (cost optimization scoring)
 * - Automatic state persistence with debouncing
 * - Event-driven notifications for UI updates
 *
 * @class AchievementEngine
 * @extends EventEmitter
 */
export class AchievementEngine extends EventEmitter {
  /** Tracked unlocked achievements */
  private unlockedAchievements: Achievement[] = [];

  /** Streak tracking (current/longest/lastDate) */
  private streakData: StreakData = {
    current: 0,
    longest: 0,
    lastCompletionDate: null,
  };

  /** PRU efficiency score tracking */
  private pruScore: PRUScore = {
    totalPRUUsed: 0,
    storyPoints: 0,
    efficiency: Infinity,
    rank: 'novice',
  };

  /** Debounce timer for state saves */
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  /** Debounce delay in milliseconds */
  private readonly SAVE_DEBOUNCE_MS = 500;

  /** Storage key for persisting state */
  private readonly STATE_KEY = 'pixelAgents.achievements';

  /**
   * Create a new Achievement Engine
   * @param context - VS Code extension context for state persistence
   */
  constructor(private context: vscode.ExtensionContext) {
    super();
    this.loadState();
  }

  /**
   * Check for new achievements based on project metrics
   * Detects milestone achievements (25%, 50%, 75%, 100% completion)
   *
   * @param metrics - Current project metrics
   * @returns Array of newly unlocked achievements (empty if none unlocked)
   *
   * @example
   * const newAchievements = engine.checkForNewAchievements({
   *   completionPercentage: 50,
   *   storiesCompleted: 10
   * });
   */
  checkForNewAchievements(metrics: ProjectMetrics): Achievement[] {
    this.validateMetrics(metrics);
    const newAchievements: Achievement[] = [];
    const achievement = checkAchievementUnlocked(metrics, ACHIEVEMENT_REGISTRY);

    if (achievement && !this.isAchievementUnlocked(achievement.id)) {
      achievement.unlockedAt = new Date();
      this.unlockedAchievements.push(achievement);
      newAchievements.push(achievement);
      this.emit('achievement.unlocked', achievement);
      this.saveState();
    }

    return newAchievements;
  }

  /**
   * Check for streak achievements based on current streak level
   * Detects 3-day and 7-day achievement unlocks
   *
   * @returns Array of newly unlocked streak achievements
   *
   * @example
   * // After updateStreak increases current to 3
   * const achievements = engine.checkForStreakAchievements();
   * // Returns array containing 'streak-3' achievement
   */
  checkForStreakAchievements(): Achievement[] {
    const newAchievements: Achievement[] = [];

    if (this.streakData.current === STREAK_THRESHOLDS.THREE_DAY) {
      const achievement = this.unlockAchievementIfNew('streak-3');
      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    if (this.streakData.current === STREAK_THRESHOLDS.WEEK) {
      const achievement = this.unlockAchievementIfNew('streak-7');
      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  /**
   * Check for PRU efficiency achievements
   * Detects PRU Optimizer (<2000 efficiency) and PRU Master (<1000 efficiency)
   *
   * @returns Array of newly unlocked PRU achievements
   *
   * @example
   * // After PRU efficiency drops below 1000
   * const achievements = engine.checkForPRUAchievements();
   * // Returns array containing 'pru-master' achievement
   */
  checkForPRUAchievements(): Achievement[] {
    const newAchievements: Achievement[] = [];

    if (this.pruScore.efficiency < PRU_THRESHOLDS.EXPERT) {
      const achievement = this.unlockAchievementIfNew('pru-optimizer');
      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    if (this.pruScore.efficiency < PRU_THRESHOLDS.MASTER) {
      const achievement = this.unlockAchievementIfNew('pru-master');
      if (achievement) {
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  /**
   * Update streak based on task completion
   * Increments streak on consecutive days, resets on gap > 1 day
   *
   * @param completed - Whether task was completed today (true = increment, false = reset)
   * @returns Updated streak data after processing
   *
   * @example
   * // Increment streak for completed task
   * const streak = engine.updateStreak(true);
   * console.log(`Current streak: ${streak.current} days`);
   *
   * @example
   * // Reset streak if no task completed
   * engine.updateStreak(false);
   */
  updateStreak(completed: boolean): StreakData {
    if (!completed) {
      this.streakData.current = 0;
      this.saveState();
      return this.streakData;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.streakData.lastCompletionDate) {
      const lastDate = new Date(this.streakData.lastCompletionDate);
      lastDate.setHours(0, 0, 0, 0);

      const daysDiff = this.calculateDaysDifference(today, lastDate);

      if (daysDiff === 0) {
        // Already completed today - no change
        return this.streakData;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        this.streakData.current++;
      } else {
        // Gap > 1 day - reset streak
        this.streakData.current = 1;
      }
    } else {
      // First completion
      this.streakData.current = 1;
    }

    this.streakData.lastCompletionDate = today;

    // Update longest streak if needed
    if (this.streakData.current > this.streakData.longest) {
      this.streakData.longest = this.streakData.current;
    }

    this.saveState();
    return this.streakData;
  }

  /**
   * Update PRU score based on story completion
   * Accumulates total PRU used and calculates efficiency rank
   *
   * @param pruUsed - PRU used for this story (must be non-negative)
   * @param storyPoints - Story points for this story (must be non-negative)
   * @returns Updated PRU score after processing
   * @throws {Error} If pruUsed or storyPoints is negative
   *
   * @example
   * // Record PRU usage for a story
   * const score = engine.updatePRUScore(5000, 5);
   * console.log(`Efficiency: ${score.efficiency} (${score.rank})`);
   */
  updatePRUScore(pruUsed: number, storyPoints: number): PRUScore {
    this.validatePRUScore(pruUsed, storyPoints);

    this.pruScore.totalPRUUsed += pruUsed;
    this.pruScore.storyPoints += storyPoints;
    this.pruScore.efficiency = calculatePRUEfficiency(
      this.pruScore.totalPRUUsed,
      this.pruScore.storyPoints
    );
    this.pruScore.rank = calculatePRURank(this.pruScore.efficiency);

    this.saveState();
    return this.pruScore;
  }

  /**
   * Get all unlocked achievements
   * @returns Array of unlocked achievement objects (copy to prevent mutation)
   */
  getUnlockedAchievements(): Achievement[] {
    return [...this.unlockedAchievements];
  }

  /**
   * Get current streak data
   * @returns Streak data object (copy to prevent mutation)
   */
  getStreakData(): StreakData {
    return { ...this.streakData };
  }

  /**
   * Get current PRU score
   * @returns PRU score object (copy to prevent mutation)
   */
  getPRUScore(): PRUScore {
    return { ...this.pruScore };
  }

  /**
   * Emit current achievement state to subscribers
   * Used by UI layer to receive state updates
   *
   * @emits achievement.state
   *
   * @example
   * engine.on('achievement.state', (state) => {
   *   console.log('Updated:', state);
   * });
   * engine.emitState();
   */
  emitState(): void {
    this.emit('achievement.state', {
      achievements: this.getUnlockedAchievements(),
      streak: this.getStreakData(),
      pruScore: this.getPRUScore(),
    });
  }

  /**
   * Check if achievement is already unlocked
   * @param id - Achievement ID to check
   * @returns True if achievement already unlocked
   */
  private isAchievementUnlocked(id: string): boolean {
    return this.unlockedAchievements.some(a => a.id === id);
  }

  /**
   * Unlock an achievement if not already unlocked
   * Reusable logic for achievement unlocking with event emission
   *
   * @param id - Achievement ID to unlock
   * @returns Unlocked achievement object, or null if already unlocked
   */
  private unlockAchievementIfNew(id: string): Achievement | null {
    if (this.isAchievementUnlocked(id)) {
      return null;
    }

    const achievement = ACHIEVEMENT_REGISTRY.find(a => a.id === id);
    if (!achievement) {
      return null;
    }

    achievement.unlockedAt = new Date();
    this.unlockedAchievements.push(achievement);
    this.emit('achievement.unlocked', achievement);
    this.saveState();
    return achievement;
  }

  /**
   * Calculate days difference between two dates (at midnight)
   * @param date1 - First date (should be at midnight)
   * @param date2 - Second date (should be at midnight)
   * @returns Days between dates (always >= 0)
   */
  private calculateDaysDifference(date1: Date, date2: Date): number {
    return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate project metrics for achievement checking
   * @param metrics - Metrics to validate
   * @throws {Error} If completion percentage out of range or stories negative
   */
  private validateMetrics(metrics: ProjectMetrics): void {
    if (metrics.completionPercentage < 0 || metrics.completionPercentage > 100) {
      throw new Error('Completion percentage must be between 0 and 100');
    }
    if (metrics.storiesCompleted < 0) {
      throw new Error('Stories completed cannot be negative');
    }
  }

  /**
   * Validate PRU score inputs
   * @param pruUsed - PRU used value
   * @param storyPoints - Story points value
   * @throws {Error} If either value is negative
   */
  private validatePRUScore(pruUsed: number, storyPoints: number): void {
    if (pruUsed < 0 || storyPoints < 0) {
      throw new Error('PRU and story points must be non-negative');
    }
  }

  /**
   * Save state to extension context (debounced)
   * Uses debouncing to prevent excessive writes during rapid updates
   * Debounce delay: 500ms
   */
  private saveState(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      const state: AchievementState = {
        achievements: this.unlockedAchievements,
        streak: this.streakData,
        pruScore: this.pruScore,
      };

      this.context.globalState.update(this.STATE_KEY, state);
    }, this.SAVE_DEBOUNCE_MS);
  }

  /**
   * Load state from extension context
   * Called on initialization to restore previous session state
   * Gracefully handles missing or corrupted data
   */
  private loadState(): void {
    try {
      const saved = this.context.globalState.get<AchievementState>(this.STATE_KEY);

      if (saved && this.isValidState(saved)) {
        this.unlockedAchievements = saved.achievements || [];
        this.streakData = saved.streak || {
          current: 0,
          longest: 0,
          lastCompletionDate: null,
        };
        this.pruScore = saved.pruScore || {
          totalPRUUsed: 0,
          storyPoints: 0,
          efficiency: Infinity,
          rank: 'novice',
        };
      }
    } catch (error) {
      // Graceful degradation - reset to defaults on error
      this.unlockedAchievements = [];
      this.streakData = { current: 0, longest: 0, lastCompletionDate: null };
      this.pruScore = { totalPRUUsed: 0, storyPoints: 0, efficiency: Infinity, rank: 'novice' };
    }
  }

  /**
   * Validate achievement state object structure
   * Checks that state contains required properties with correct types
   *
   * @param state - Object to validate as AchievementState
   * @returns True if state is valid
   */
  private isValidState(state: any): boolean {
    return (
      typeof state === 'object' &&
      state !== null &&
      Array.isArray(state.achievements) &&
      typeof state.streak === 'object' &&
      typeof state.pruScore === 'object'
    );
  }
}
