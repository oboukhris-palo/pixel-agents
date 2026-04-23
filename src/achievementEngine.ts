/**
 * Achievement Engine Service
 * Layer 2: Backend - Event-driven achievement management with persistence
 */

import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import {
  Achievement,
  ACHIEVEMENT_REGISTRY,
  StreakData,
  PRUScore,
  checkAchievementUnlocked,
  calculateStreakStatus,
  calculatePRUEfficiency,
  calculatePRURank,
  MILESTONE_THRESHOLDS,
  STREAK_THRESHOLDS,
  PRU_THRESHOLDS,
} from './achievementTypes';

/**
 * Project metrics for achievement checking
 */
export interface ProjectMetrics {
  completionPercentage: number;
  storiesCompleted: number;
}

/**
 * Saved achievement state
 */
interface AchievementState {
  achievements: Achievement[];
  streak: StreakData;
  pruScore: PRUScore;
}

/**
 * Achievement Engine Service
 * Manages achievement unlocking, persistence, and event notifications
 */
export class AchievementEngine extends EventEmitter {
  private unlockedAchievements: Achievement[] = [];
  private streakData: StreakData = {
    current: 0,
    longest: 0,
    lastCompletionDate: null,
  };
  private pruScore: PRUScore = {
    totalPRUUsed: 0,
    storyPoints: 0,
    efficiency: Infinity,
    rank: 'novice',
  };
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 500;
  private readonly STATE_KEY = 'pixelAgents.achievements';

  constructor(private context: vscode.ExtensionContext) {
    super();
    this.loadState();
  }

  /**
   * Check for new achievements based on project metrics
   * @param metrics Current project metrics
   * @returns Array of newly unlocked achievements
   */
  checkForNewAchievements(metrics: ProjectMetrics): Achievement[] {
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
   * Check for streak achievements based on current streak
   * @returns Array of newly unlocked streak achievements
   */
  checkForStreakAchievements(): Achievement[] {
    const newAchievements: Achievement[] = [];

    if (
      this.streakData.current === STREAK_THRESHOLDS.THREE_DAY &&
      !this.isAchievementUnlocked('streak-3')
    ) {
      const achievement = ACHIEVEMENT_REGISTRY.find(a => a.id === 'streak-3');
      if (achievement) {
        achievement.unlockedAt = new Date();
        this.unlockedAchievements.push(achievement);
        newAchievements.push(achievement);
        this.emit('achievement.unlocked', achievement);
        this.saveState();
      }
    }

    if (
      this.streakData.current === STREAK_THRESHOLDS.WEEK &&
      !this.isAchievementUnlocked('streak-7')
    ) {
      const achievement = ACHIEVEMENT_REGISTRY.find(a => a.id === 'streak-7');
      if (achievement) {
        achievement.unlockedAt = new Date();
        this.unlockedAchievements.push(achievement);
        newAchievements.push(achievement);
        this.emit('achievement.unlocked', achievement);
        this.saveState();
      }
    }

    return newAchievements;
  }

  /**
   * Check for PRU efficiency achievements
   * @returns Array of newly unlocked PRU achievements
   */
  checkForPRUAchievements(): Achievement[] {
    const newAchievements: Achievement[] = [];

    if (
      this.pruScore.efficiency < PRU_THRESHOLDS.EXPERT &&
      !this.isAchievementUnlocked('pru-optimizer')
    ) {
      const achievement = ACHIEVEMENT_REGISTRY.find(a => a.id === 'pru-optimizer');
      if (achievement) {
        achievement.unlockedAt = new Date();
        this.unlockedAchievements.push(achievement);
        newAchievements.push(achievement);
        this.emit('achievement.unlocked', achievement);
        this.saveState();
      }
    }

    if (
      this.pruScore.efficiency < PRU_THRESHOLDS.MASTER &&
      !this.isAchievementUnlocked('pru-master')
    ) {
      const achievement = ACHIEVEMENT_REGISTRY.find(a => a.id === 'pru-master');
      if (achievement) {
        achievement.unlockedAt = new Date();
        this.unlockedAchievements.push(achievement);
        newAchievements.push(achievement);
        this.emit('achievement.unlocked', achievement);
        this.saveState();
      }
    }

    return newAchievements;
  }

  /**
   * Update streak based on task completion
   * @param completed Whether task was completed today
   * @returns Updated streak data
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

      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already completed today
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

    if (this.streakData.current > this.streakData.longest) {
      this.streakData.longest = this.streakData.current;
    }

    this.saveState();
    return this.streakData;
  }

  /**
   * Update PRU score based on story completion
   * @param pruUsed PRU used for this story
   * @param storyPoints Story points for this story
   * @returns Updated PRU score
   */
  updatePRUScore(pruUsed: number, storyPoints: number): PRUScore {
    if (pruUsed < 0 || storyPoints < 0) {
      throw new Error('PRU and story points must be non-negative');
    }

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
   * @returns Array of unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return [...this.unlockedAchievements];
  }

  /**
   * Get current streak data
   * @returns Streak data
   */
  getStreakData(): StreakData {
    return { ...this.streakData };
  }

  /**
   * Get current PRU score
   * @returns PRU score
   */
  getPRUScore(): PRUScore {
    return { ...this.pruScore };
  }

  /**
   * Emit current achievement state
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
   * @param id Achievement ID
   * @returns True if already unlocked
   */
  private isAchievementUnlocked(id: string): boolean {
    return this.unlockedAchievements.some(a => a.id === id);
  }

  /**
   * Save state to extension context (debounced)
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
      // Graceful degradation - reset to defaults
      this.unlockedAchievements = [];
      this.streakData = { current: 0, longest: 0, lastCompletionDate: null };
      this.pruScore = { totalPRUUsed: 0, storyPoints: 0, efficiency: Infinity, rank: 'novice' };
    }
  }

  /**
   * Validate achievement state object
   * @param state Object to validate
   * @returns True if valid state
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
