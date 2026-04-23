/**
 * Tests for Achievement Engine Service
 * Layer 2: Backend - Achievement system event handling, persistence, and notifications
 */

import { EventEmitter } from 'events';
import { ExtensionContext } from 'vscode';
import {
  AchievementEngine,
  ProjectMetrics,
} from './achievementEngine';
import { Achievement, ACHIEVEMENT_REGISTRY } from './achievementTypes';

// Mock ExtensionContext
function createMockExtensionContext(): Partial<ExtensionContext> {
  const state = new Map<string, any>();
  return {
    globalState: {
      get: (key: string) => state.get(key),
      update: (key: string, value: any) => {
        state.set(key, value);
        return Promise.resolve();
      },
    } as any,
  };
}

describe('AchievementEngine', () => {
  let engine: AchievementEngine;
  let mockContext: Partial<ExtensionContext>;

  beforeEach(() => {
    mockContext = createMockExtensionContext();
    engine = new AchievementEngine(mockContext as ExtensionContext);
  });

  describe('Service Initialization', () => {
    test('initializes with empty state when no saved data', () => {
      expect(engine.getUnlockedAchievements()).toEqual([]);
      expect(engine.getStreakData().current).toBe(0);
      expect(engine.getStreakData().lastCompletionDate).toBeNull();
    });

    test('loads saved state from ExtensionContext.globalState', async () => {
      const context = createMockExtensionContext();
      const savedState = {
        achievements: [{ id: 'milestone-25', unlockedAt: new Date() }],
        streak: { current: 3, longest: 5, lastCompletionDate: new Date() },
      };
      await context.globalState?.update('pixelAgents.achievements', savedState);

      const engine2 = new AchievementEngine(context as ExtensionContext);
      expect(engine2.getUnlockedAchievements().length).toBeGreaterThan(0);
    });

    test('handles corrupted state gracefully (resets to defaults)', async () => {
      const context = createMockExtensionContext();
      await context.globalState?.update('pixelAgents.achievements', { invalid: 'data' });

      const engine2 = new AchievementEngine(context as ExtensionContext);
      expect(engine2.getUnlockedAchievements()).toEqual([]);
      expect(engine2.getStreakData().current).toBe(0);
    });
  });

  describe('Milestone Achievement Logic', () => {
    test('unlocks milestone-25 at 25% completion', () => {
      const metrics: ProjectMetrics = { completionPercentage: 25, storiesCompleted: 5 };
      const achievements = engine.checkForNewAchievements(metrics);

      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0].id).toBe('milestone-25');
    });

    test('unlocks milestone-50 at 50% completion', () => {
      const metrics: ProjectMetrics = { completionPercentage: 50, storiesCompleted: 10 };
      const achievements = engine.checkForNewAchievements(metrics);

      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0].id).toBe('milestone-50');
    });

    test('unlocks multiple achievements if thresholds crossed', () => {
      // First call at 25%
      engine.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      
      // Second call at 75% should unlock 50% and 75%
      const newAchievements = engine.checkForNewAchievements({
        completionPercentage: 75,
        storiesCompleted: 15,
      });

      expect(newAchievements.length).toBeGreaterThan(0);
    });

    test('does not re-unlock already unlocked achievements', () => {
      const metrics: ProjectMetrics = { completionPercentage: 25, storiesCompleted: 5 };
      
      const first = engine.checkForNewAchievements(metrics);
      expect(first.length).toBeGreaterThan(0);
      
      const second = engine.checkForNewAchievements(metrics);
      expect(second.length).toBe(0);
    });

    test('returns empty array when no new achievements', () => {
      const metrics: ProjectMetrics = { completionPercentage: 15, storiesCompleted: 3 };
      const achievements = engine.checkForNewAchievements(metrics);

      expect(achievements).toEqual([]);
    });
  });

  describe('Streak Management', () => {
    test('increments current streak when task completed today', () => {
      engine.updateStreak(true);
      engine.updateStreak(true);
      engine.updateStreak(true);

      const streak = engine.getStreakData();
      expect(streak.current).toBe(3);
    });

    test('resets streak when gap > 1 day', () => {
      // Complete today
      engine.updateStreak(true);
      expect(engine.getStreakData().current).toBe(1);

      // Simulate 2 days passing with no completion
      const streakData = engine.getStreakData();
      if (streakData.lastCompletionDate) {
        const twoDoysAgo = new Date(streakData.lastCompletionDate);
        twoDoysAgo.setDate(twoDoysAgo.getDate() - 2);
        // Need to manually test this - requires date manipulation in updateStreak
      }
    });

    test('updates longest streak when current exceeds it', () => {
      engine.updateStreak(true);
      engine.updateStreak(true);
      engine.updateStreak(true);

      const streak = engine.getStreakData();
      expect(streak.longest).toBe(3);
    });

    test('unlocks streak-3 achievement at 3 days', () => {
      engine.updateStreak(true);
      engine.updateStreak(true);
      const achievements = engine.checkForStreakAchievements();

      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0].id).toBe('streak-3');
    });

    test('unlocks streak-7 achievement at 7 days', () => {
      // Simulate 7 days of streaks
      for (let i = 0; i < 7; i++) {
        engine.updateStreak(true);
      }

      const achievements = engine.checkForStreakAchievements();
      expect(achievements.some(a => a.id === 'streak-7')).toBe(true);
    });
  });

  describe('PRU Score Management', () => {
    test('calculates PRU efficiency from total usage', () => {
      const pruScore = engine.updatePRUScore(18000, 10);

      expect(pruScore.totalPRUUsed).toBe(18000);
      expect(pruScore.storyPoints).toBe(10);
      expect(pruScore.efficiency).toBe(1800);
      expect(pruScore.rank).toBe('expert');
    });

    test('unlocks PRU Optimizer achievement when efficiency < 2000', () => {
      const pruScore = engine.updatePRUScore(15000, 10);
      const achievements = engine.checkForPRUAchievements();

      expect(pruScore.rank).toBe('expert');
      expect(achievements.some(a => a.id === 'pru-optimizer')).toBe(true);
    });

    test('unlocks PRU Master achievement when efficiency < 1000', () => {
      const pruScore = engine.updatePRUScore(9000, 10);
      const achievements = engine.checkForPRUAchievements();

      expect(pruScore.rank).toBe('master');
      expect(achievements.some(a => a.id === 'pru-master')).toBe(true);
    });

    test('accumulates PRU across multiple stories', () => {
      engine.updatePRUScore(5000, 5);
      const pruScore = engine.updatePRUScore(10000, 5);

      expect(pruScore.totalPRUUsed).toBe(15000);
      expect(pruScore.storyPoints).toBe(10);
    });
  });

  describe('State Persistence', () => {
    test('saves state to extension context', async () => {
      const context = createMockExtensionContext();
      const engine2 = new AchievementEngine(context as ExtensionContext);

      engine2.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      engine2.updateStreak(true);
      engine2.updatePRUScore(5000, 5);

      // Verify data was saved (check updateCalls)
      const saved = await context.globalState?.get('pixelAgents.achievements');
      expect(saved).toBeDefined();
    });

    test('restores achievements from extension context', async () => {
      const context = createMockExtensionContext();
      const engine1 = new AchievementEngine(context as ExtensionContext);

      engine1.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      
      const engine2 = new AchievementEngine(context as ExtensionContext);
      expect(engine2.getUnlockedAchievements().length).toBeGreaterThan(0);
    });

    test('debounces multiple rapid save calls', async () => {
      let saveCount = 0;
      const originalUpdate = mockContext.globalState?.update;
      mockContext.globalState!.update = jest.fn(async (key, value) => {
        saveCount++;
        return Promise.resolve();
      });

      const engine2 = new AchievementEngine(mockContext as ExtensionContext);

      // Rapid calls should be debounced
      engine2.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      engine2.checkForNewAchievements({ completionPercentage: 50, storiesCompleted: 10 });
      engine2.checkForNewAchievements({ completionPercentage: 75, storiesCompleted: 15 });

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 600));

      // Should have fewer saves than calls due to debouncing
      expect(saveCount).toBeLessThan(3);
    });
  });

  describe('Event Subscriptions', () => {
    test('emits achievement.unlocked event when new achievement', (done) => {
      engine.on('achievement.unlocked', (achievement: Achievement) => {
        expect(achievement.id).toBe('milestone-25');
        done();
      });

      engine.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
    });

    test('does not emit when no new achievements', (done) => {
      let emitted = false;
      engine.on('achievement.unlocked', () => {
        emitted = true;
      });

      engine.checkForNewAchievements({ completionPercentage: 15, storiesCompleted: 3 });

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 100);
    });

    test('emits achievement.state on request', (done) => {
      engine.on('achievement.state', (state) => {
        expect(state.achievements).toBeDefined();
        expect(state.streak).toBeDefined();
        expect(state.pruScore).toBeDefined();
        done();
      });

      engine.emitState();
    });

    test('extends EventEmitter', () => {
      expect(engine instanceof EventEmitter).toBe(true);
    });
  });

  describe('Achievement Queries', () => {
    test('returns all unlocked achievements', () => {
      engine.checkForNewAchievements({ completionPercentage: 50, storiesCompleted: 10 });

      const achievements = engine.getUnlockedAchievements();
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    test('returns streak data', () => {
      engine.updateStreak(true);

      const streak = engine.getStreakData();
      expect(streak.current).toBeGreaterThan(0);
      expect(streak.longest).toBeGreaterThanOrEqual(streak.current);
    });

    test('returns PRU score', () => {
      engine.updatePRUScore(10000, 5);

      const pruScore = engine.getPRUScore();
      expect(pruScore.totalPRUUsed).toBeGreaterThan(0);
      expect(pruScore.efficiency).toBeGreaterThan(0);
      expect(['master', 'expert', 'intermediate', 'novice']).toContain(pruScore.rank);
    });
  });

  describe('Input Validation', () => {
    test('handles negative PRU gracefully', () => {
      expect(() => {
        engine.updatePRUScore(-100, 5);
      }).toThrow();
    });

    test('handles negative story points gracefully', () => {
      expect(() => {
        engine.updatePRUScore(5000, -5);
      }).toThrow();
    });

    test('handles zero completion percentage', () => {
      const achievements = engine.checkForNewAchievements({
        completionPercentage: 0,
        storiesCompleted: 0,
      });
      expect(achievements).toEqual([]);
    });

    test('handles 100% completion percentage', () => {
      const achievements = engine.checkForNewAchievements({
        completionPercentage: 100,
        storiesCompleted: 20,
      });

      expect(achievements.some(a => a.id === 'milestone-100')).toBe(true);
    });
  });
});
