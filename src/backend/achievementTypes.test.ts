/**
 * Tests for Achievement Types, Streak Logic, and PRU Calculations
 * Layer 1: Domain Model - Achievement system types and utilities
 */

import {
  Achievement,
  BadgeDefinition,
  StreakData,
  PRUScore,
  calculateStreakStatus,
  calculatePRUEfficiency,
  calculatePRURank,
  checkAchievementUnlocked,
  ACHIEVEMENT_REGISTRY,
  isValidAchievement,
  isValidBadge,
  getAchievementById,
} from './achievementTypes';

describe('Achievement Types', () => {
  describe('Type Definitions & Validation', () => {
    test('Achievement has all required fields', () => {
      const achievement: Achievement = {
        id: 'test-achievement',
        name: 'Test Achievement',
        description: 'A test achievement',
        badge: {
          icon: '🏆',
          color: 'bronze',
          rarity: 'common',
        },
        category: 'milestone',
        unlockedAt: new Date(),
      };
      
      expect(achievement.id).toBe('test-achievement');
      expect(achievement.name).toBe('Test Achievement');
      expect(achievement.badge.color).toBe('bronze');
    });

    test('BadgeDefinition validates color values (bronze, silver, gold, platinum)', () => {
      const validColors: Array<BadgeDefinition['color']> = ['bronze', 'silver', 'gold', 'platinum'];
      
      validColors.forEach(color => {
        const badge: BadgeDefinition = {
          icon: '🏆',
          color: color,
          rarity: 'common',
        };
        expect(badge.color).toBe(color);
      });
    });

    test('Achievement category validates allowed values (milestone, streak, efficiency, quality)', () => {
      const validCategories: Array<Achievement['category']> = ['milestone', 'streak', 'efficiency', 'quality'];
      
      validCategories.forEach(category => {
        const achievement: Achievement = {
          id: 'test',
          name: 'Test',
          description: 'Test',
          badge: { icon: '🏆', color: 'bronze', rarity: 'common' },
          category: category,
        };
        expect(achievement.category).toBe(category);
      });
    });

    test('unlockedAt is optional Date field', () => {
      const withDate: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        badge: { icon: '🏆', color: 'bronze', rarity: 'common' },
        category: 'milestone',
        unlockedAt: new Date(),
      };
      
      const withoutDate: Achievement = {
        id: 'test2',
        name: 'Test 2',
        description: 'Test 2',
        badge: { icon: '🏆', color: 'bronze', rarity: 'common' },
        category: 'milestone',
      };
      
      expect(withDate.unlockedAt).toBeInstanceOf(Date);
      expect(withoutDate.unlockedAt).toBeUndefined();
    });
  });

  describe('Streak Calculation Logic', () => {
    test('streak is active when completed yesterday', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const status = calculateStreakStatus(yesterday, today);
      expect(status).toBe('active');
    });

    test('streak is active when completed today (same day)', () => {
      const today = new Date();
      
      const status = calculateStreakStatus(today, today);
      expect(status).toBe('active');
    });

    test('streak is broken when lastDate is 2+ days ago', () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      
      const status = calculateStreakStatus(twoDaysAgo, today);
      expect(status).toBe('broken');
    });

    test('streak is broken when lastDate is 3+ days ago', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);
      
      const status = calculateStreakStatus(threeDaysAgo, today);
      expect(status).toBe('broken');
    });

    test('streak calculation handles midnight boundary correctly', () => {
      // Yesterday at 11:59 PM
      const yesterday = new Date('2026-04-22T23:59:00');
      // Today at 12:01 AM
      const today = new Date('2026-04-23T00:01:00');
      
      const status = calculateStreakStatus(yesterday, today);
      expect(status).toBe('active');
    });
  });

  describe('PRU Efficiency Calculation', () => {
    test('calculates PRU efficiency correctly', () => {
      const efficiency = calculatePRUEfficiency(18000, 10);
      expect(efficiency).toBe(1800); // 18000 / 10 = 1800
    });

    test('handles zero story points (returns Infinity)', () => {
      const efficiency = calculatePRUEfficiency(1000, 0);
      expect(efficiency).toBe(Infinity);
    });

    test('handles negative PRU values gracefully (throws error)', () => {
      expect(() => calculatePRUEfficiency(-100, 5)).toThrow();
    });

    test('handles negative story points gracefully (throws error)', () => {
      expect(() => calculatePRUEfficiency(1000, -5)).toThrow();
    });

    test('PRU rank calculation: <1000 = master', () => {
      const rank = calculatePRURank(900);
      expect(rank).toBe('master');
    });

    test('PRU rank calculation: 1000-2000 = expert', () => {
      const rank = calculatePRURank(1500);
      expect(rank).toBe('expert');
    });

    test('PRU rank calculation: 2000-3000 = intermediate', () => {
      const rank = calculatePRURank(2500);
      expect(rank).toBe('intermediate');
    });

    test('PRU rank calculation: >3000 = novice', () => {
      const rank = calculatePRURank(3500);
      expect(rank).toBe('novice');
    });

    test('PRU rank handles boundary values correctly', () => {
      expect(calculatePRURank(1000)).toBe('expert'); // Exactly 1000
      expect(calculatePRURank(2000)).toBe('intermediate'); // Exactly 2000
      expect(calculatePRURank(3000)).toBe('novice'); // Exactly 3000
    });
  });

  describe('Achievement Registry', () => {
    test('ACHIEVEMENT_REGISTRY contains all 9 predefined achievements', () => {
      expect(ACHIEVEMENT_REGISTRY).toHaveLength(9);
    });

    test('Each achievement has unique id', () => {
      const ids = ACHIEVEMENT_REGISTRY.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('Milestone achievements (25%, 50%, 75%, 100%) have correct metadata', () => {
      const milestones = ACHIEVEMENT_REGISTRY.filter(a => a.category === 'milestone');
      expect(milestones).toHaveLength(4);
      
      const milestone25 = milestones.find(a => a.id === 'milestone-25');
      expect(milestone25).toBeDefined();
      expect(milestone25?.name).toContain('Quarter');
      
      const milestone50 = milestones.find(a => a.id === 'milestone-50');
      expect(milestone50).toBeDefined();
      expect(milestone50?.name).toContain('Half');
      
      const milestone75 = milestones.find(a => a.id === 'milestone-75');
      expect(milestone75).toBeDefined();
      expect(milestone75?.name).toContain('Three Quarter');
      
      const milestone100 = milestones.find(a => a.id === 'milestone-100');
      expect(milestone100).toBeDefined();
      expect(milestone100?.name).toContain('Victory');
    });

    test('Streak achievements (3-day, 7-day) have correct metadata', () => {
      const streaks = ACHIEVEMENT_REGISTRY.filter(a => a.category === 'streak');
      expect(streaks.length).toBeGreaterThanOrEqual(2);
      
      const streak3 = streaks.find(a => a.id === 'streak-3');
      expect(streak3).toBeDefined();
      
      const streak7 = streaks.find(a => a.id === 'streak-7');
      expect(streak7).toBeDefined();
    });

    test('Badge colors progress correctly (bronze → silver → gold → platinum)', () => {
      const milestone25 = ACHIEVEMENT_REGISTRY.find(a => a.id === 'milestone-25');
      const milestone50 = ACHIEVEMENT_REGISTRY.find(a => a.id === 'milestone-50');
      const milestone75 = ACHIEVEMENT_REGISTRY.find(a => a.id === 'milestone-75');
      const milestone100 = ACHIEVEMENT_REGISTRY.find(a => a.id === 'milestone-100');
      
      expect(milestone25?.badge.color).toBe('bronze');
      expect(milestone50?.badge.color).toBe('silver');
      expect(milestone75?.badge.color).toBe('gold');
      expect(milestone100?.badge.color).toBe('platinum');
    });
  });

  describe('Achievement Unlock Logic', () => {
    test('unlocks milestone achievement when threshold reached (25%)', () => {
      const metrics = { completionPercentage: 25, storiesCompleted: 5 };
      const achievement = checkAchievementUnlocked(metrics, ACHIEVEMENT_REGISTRY);
      
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('milestone-25');
    });

    test('unlocks milestone achievement when threshold reached (50%)', () => {
      const metrics = { completionPercentage: 50, storiesCompleted: 10 };
      const achievement = checkAchievementUnlocked(metrics, ACHIEVEMENT_REGISTRY);
      
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('milestone-50');
    });

    test('returns null when no threshold reached', () => {
      const metrics = { completionPercentage: 15, storiesCompleted: 3 };
      const achievement = checkAchievementUnlocked(metrics, ACHIEVEMENT_REGISTRY);
      
      expect(achievement).toBeNull();
    });

    test('prioritizes highest unlocked achievement', () => {
      // If somehow 75% is reached, should return milestone-75, not 25 or 50
      const metrics = { completionPercentage: 75, storiesCompleted: 15 };
      const achievement = checkAchievementUnlocked(metrics, ACHIEVEMENT_REGISTRY);
      
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('milestone-75');
    });

    test('handles multiple simultaneous unlocks (returns highest)', () => {
      const metrics = { completionPercentage: 100, storiesCompleted: 20 };
      const achievement = checkAchievementUnlocked(metrics, ACHIEVEMENT_REGISTRY);
      
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('milestone-100');
    });
  });

  describe('Type Guards', () => {
    test('isValidAchievement validates correct achievement object', () => {
      const validAchievement = {
        id: 'test',
        name: 'Test',
        description: 'Test achievement',
        badge: { icon: '🏆', color: 'bronze', rarity: 'common' },
        category: 'milestone',
      };
      
      expect(isValidAchievement(validAchievement)).toBe(true);
    });

    test('isValidAchievement rejects invalid objects', () => {
      expect(isValidAchievement(null)).toBe(false);
      expect(isValidAchievement(undefined)).toBe(false);
      expect(isValidAchievement({})).toBe(false);
      expect(isValidAchievement({ id: 'test' })).toBe(false);
    });

    test('isValidBadge validates correct badge object', () => {
      const validBadge = {
        icon: '🏆',
        color: 'gold',
        rarity: 'rare',
      };
      
      expect(isValidBadge(validBadge)).toBe(true);
    });

    test('isValidBadge rejects invalid objects', () => {
      expect(isValidBadge(null)).toBe(false);
      expect(isValidBadge(undefined)).toBe(false);
      expect(isValidBadge({})).toBe(false);
      expect(isValidBadge({ icon: '🏆' })).toBe(false);
    });
  });

  describe('Achievement Lookup', () => {
    test('getAchievementById returns achievement when found', () => {
      const achievement = getAchievementById('milestone-25');
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('milestone-25');
    });

    test('getAchievementById returns undefined when not found', () => {
      const achievement = getAchievementById('non-existent');
      expect(achievement).toBeUndefined();
    });
  });
});
