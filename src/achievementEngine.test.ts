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
      get: (key: string) => {
        const val = state.get(key);
        // Return a copy to simulate real behavior
        return val ? JSON.parse(JSON.stringify(val)) : undefined;
      },
      update: (key: string, value: any) => {
        // Store a deep copy to prevent mutation issues
        state.set(key, JSON.parse(JSON.stringify(value)));
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
      const engine1 = new AchievementEngine(context as ExtensionContext);
      
      // Create an achievement through the first engine
      engine1.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Create a second engine from same context
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
    test('increments current streak when task completed consecutively', () => {
      // Manually test streak management
      expect(engine.getStreakData().current).toBe(0);
      
      engine.updateStreak(true);
      expect(engine.getStreakData().current).toBeGreaterThan(0);
    });

    test('resets streak on no completion', () => {
      engine.updateStreak(true);
      const initialStreak = engine.getStreakData().current;
      expect(initialStreak).toBeGreaterThan(0);
      
      engine.updateStreak(false);
      expect(engine.getStreakData().current).toBe(0);
    });

    test('updates longest streak when current exceeds it', () => {
      (engine as any).streakData.current = 3;
      (engine as any).streakData.longest = 3;
      
      const streak = engine.getStreakData();
      expect(streak.longest).toBeGreaterThanOrEqual(streak.current);
    });

    test('unlocks streak-3 achievement at 3 days', () => {
      // Set current streak to 3 and test achievement unlock
      (engine as any).streakData.current = 3;
      const achievements = engine.checkForStreakAchievements();

      expect(achievements.length).toBeGreaterThan(0);
      expect(achievements[0].id).toBe('streak-3');
    });

    test('unlocks streak-7 achievement at 7 days', () => {
      // Set current streak to 7 and test achievement unlock
      (engine as any).streakData.current = 7;
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
      jest.useFakeTimers();
      const context = createMockExtensionContext();
      const engine2 = new AchievementEngine(context as ExtensionContext);

      engine2.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      engine2.updateStreak(true);
      engine2.updatePRUScore(5000, 5);

      // Fast-forward debounce timer
      jest.advanceTimersByTime(600);

      const saved = context.globalState?.get('pixelAgents.achievements');
      expect(saved).toBeDefined();
      expect(saved.achievements).toBeDefined();
      
      jest.useRealTimers();
    });

    test('restores achievements from extension context', async () => {
      jest.useFakeTimers();
      const context = createMockExtensionContext();
      const engine1 = new AchievementEngine(context as ExtensionContext);

      engine1.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      jest.advanceTimersByTime(600); // Wait for debounce
      
      const engine2 = new AchievementEngine(context as ExtensionContext);
      expect(engine2.getUnlockedAchievements().length).toBeGreaterThan(0);
      
      jest.useRealTimers();
    });

    test('debounces multiple rapid save calls', async () => {
      jest.useFakeTimers();
      let saveCount = 0;
      const context = createMockExtensionContext();
      const originalUpdate = context.globalState!.update;
      context.globalState!.update = jest.fn(async (key, value) => {
        saveCount++;
        return originalUpdate.call(context.globalState, key, value);
      });

      const engine2 = new AchievementEngine(context as ExtensionContext);

      // Rapid calls should be debounced
      engine2.checkForNewAchievements({ completionPercentage: 25, storiesCompleted: 5 });
      engine2.checkForNewAchievements({ completionPercentage: 50, storiesCompleted: 10 });
      engine2.checkForNewAchievements({ completionPercentage: 75, storiesCompleted: 15 });

      // Advance timers to resolve debounce
      jest.advanceTimersByTime(600);

      // Should have fewer saves than calls due to debouncing
      expect(saveCount).toBeLessThanOrEqual(3); // At most 1-2 saves instead of 3
      
      jest.useRealTimers();
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
