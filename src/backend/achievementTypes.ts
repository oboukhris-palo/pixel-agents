/**
 * Achievement Types and Logic
 * Layer 1: Domain Model - Achievement system types, streak calculation, and PRU scoring
 */

/**
 * Constants for achievement thresholds
 */
export const MILESTONE_THRESHOLDS = {
  QUARTER: 25,
  HALF: 50,
  THREE_QUARTER: 75,
  COMPLETE: 100,
} as const;

export const STREAK_THRESHOLDS = {
  THREE_DAY: 3,
  WEEK: 7,
} as const;

export const PRU_THRESHOLDS = {
  MASTER: 1000,
  EXPERT: 2000,
  INTERMEDIATE: 3000,
} as const;

/**
 * Badge visual representation
 */
export interface BadgeDefinition {
  icon: string;
  color: 'bronze' | 'silver' | 'gold' | 'platinum';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge: BadgeDefinition;
  category: 'milestone' | 'streak' | 'efficiency' | 'quality';
  unlockedAt?: Date;
}

/**
 * Streak tracking data
 */
export interface StreakData {
  current: number;
  longest: number;
  lastCompletionDate: Date | null;
}

/**
 * PRU efficiency score
 */
export interface PRUScore {
  totalPRUUsed: number;
  storyPoints: number;
  efficiency: number;
  rank: 'novice' | 'intermediate' | 'expert' | 'master';
}

/**
 * Calculate whether a streak is still active based on last completion date
 * @param lastDate Last completion date
 * @param currentDate Current date
 * @returns 'active' if completed yesterday or today, 'broken' otherwise
 */
export function calculateStreakStatus(
  lastDate: Date,
  currentDate: Date
): 'active' | 'broken' {
  const daysDiff = Math.floor(
    (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysDiff <= 1 ? 'active' : 'broken';
}

/**
 * Calculate PRU efficiency (PRU per story point)
 * @param pruUsed Total PRU used
 * @param storyPoints Total story points completed
 * @returns PRU efficiency score
 * @throws Error if pruUsed or storyPoints are negative
 */
export function calculatePRUEfficiency(
  pruUsed: number,
  storyPoints: number
): number {
  if (pruUsed < 0 || storyPoints < 0) {
    throw new Error('PRU and story points must be non-negative');
  }
  
  if (storyPoints === 0) {return Infinity;}
  return pruUsed / storyPoints;
}

/**
 * Calculate PRU rank based on efficiency score
 * @param efficiency PRU efficiency (PRU per story point)
 * @returns Rank: master (<1000), expert (1000-2000), intermediate (2000-3000), novice (>3000)
 */
export function calculatePRURank(efficiency: number): PRUScore['rank'] {
  if (efficiency < PRU_THRESHOLDS.MASTER) {return 'master';}
  if (efficiency < PRU_THRESHOLDS.EXPERT) {return 'expert';}
  if (efficiency < PRU_THRESHOLDS.INTERMEDIATE) {return 'intermediate';}
  return 'novice';
}

/**
 * Achievement registry with all predefined achievements
 */
export const ACHIEVEMENT_REGISTRY: Achievement[] = [
  // Milestone achievements (25%, 50%, 75%, 100%)
  {
    id: `milestone-${MILESTONE_THRESHOLDS.QUARTER}`,
    name: 'Quarter Mark',
    description: `Completed ${MILESTONE_THRESHOLDS.QUARTER}% of the project`,
    badge: {
      icon: '🎯',
      color: 'bronze',
      rarity: 'common',
    },
    category: 'milestone',
  },
  {
    id: `milestone-${MILESTONE_THRESHOLDS.HALF}`,
    name: 'Half Way There',
    description: `Completed ${MILESTONE_THRESHOLDS.HALF}% of the project`,
    badge: {
      icon: '🎯',
      color: 'silver',
      rarity: 'rare',
    },
    category: 'milestone',
  },
  {
    id: `milestone-${MILESTONE_THRESHOLDS.THREE_QUARTER}`,
    name: 'Three Quarter Mark',
    description: `Completed ${MILESTONE_THRESHOLDS.THREE_QUARTER}% of the project`,
    badge: {
      icon: '🎯',
      color: 'gold',
      rarity: 'epic',
    },
    category: 'milestone',
  },
  {
    id: `milestone-${MILESTONE_THRESHOLDS.COMPLETE}`,
    name: 'Project Victory',
    description: `Completed ${MILESTONE_THRESHOLDS.COMPLETE}% of the project`,
    badge: {
      icon: '🏆',
      color: 'platinum',
      rarity: 'legendary',
    },
    category: 'milestone',
  },
  // Streak achievements
  {
    id: `streak-${STREAK_THRESHOLDS.THREE_DAY}`,
    name: 'Three Day Streak',
    description: `Completed tasks for ${STREAK_THRESHOLDS.THREE_DAY} consecutive days`,
    badge: {
      icon: '🔥',
      color: 'bronze',
      rarity: 'common',
    },
    category: 'streak',
  },
  {
    id: `streak-${STREAK_THRESHOLDS.WEEK}`,
    name: 'Week Warrior',
    description: `Completed tasks for ${STREAK_THRESHOLDS.WEEK} consecutive days`,
    badge: {
      icon: '🔥',
      color: 'gold',
      rarity: 'epic',
    },
    category: 'streak',
  },
  // Efficiency achievements
  {
    id: 'pru-optimizer',
    name: 'PRU Optimizer',
    description: `Achieved PRU efficiency below ${PRU_THRESHOLDS.EXPERT}`,
    badge: {
      icon: '⚡',
      color: 'silver',
      rarity: 'rare',
    },
    category: 'efficiency',
  },
  {
    id: 'pru-master',
    name: 'PRU Master',
    description: `Achieved PRU efficiency below ${PRU_THRESHOLDS.MASTER}`,
    badge: {
      icon: '⚡',
      color: 'platinum',
      rarity: 'legendary',
    },
    category: 'efficiency',
  },
  // Quality achievements
  {
    id: 'tdd-champion',
    name: 'TDD Champion',
    description: 'Completed 10 stories with 100% test coverage',
    badge: {
      icon: '✅',
      color: 'gold',
      rarity: 'epic',
    },
    category: 'quality',
  },
];

/**
 * Check if any achievement should be unlocked based on project metrics
 * @param metrics Project completion metrics
 * @param achievements List of available achievements
 * @returns Highest unlocked achievement or null
 */
export function checkAchievementUnlocked(
  metrics: { completionPercentage: number; storiesCompleted: number },
  achievements: Achievement[]
): Achievement | null {
  const milestoneAchievements = achievements.filter(a => a.category === 'milestone');
  
  // Find highest milestone achieved
  const unlockedMilestones = milestoneAchievements.filter(achievement => {
    // Extract threshold from id (e.g., 'milestone-25' -> 25)
    const threshold = parseInt(achievement.id.split('-')[1], 10);
    return metrics.completionPercentage >= threshold;
  });
  
  if (unlockedMilestones.length === 0) {return null;}
  
  // Return highest milestone (sort by threshold descending)
  return unlockedMilestones.sort((a, b) => {
    const thresholdA = parseInt(a.id.split('-')[1], 10);
    const thresholdB = parseInt(b.id.split('-')[1], 10);
    return thresholdB - thresholdA;
  })[0];
}

/**
 * Type guard to validate achievement object
 * @param obj Object to validate
 * @returns true if obj is a valid Achievement
 */
export function isValidAchievement(obj: unknown): obj is Achievement {
  const a = obj as Achievement;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.description === 'string' &&
    isValidBadge(a.badge) &&
    ['milestone', 'streak', 'efficiency', 'quality'].includes(a.category)
  );
}

/**
 * Type guard to validate badge object
 * @param obj Object to validate
 * @returns true if obj is a valid BadgeDefinition
 */
export function isValidBadge(obj: unknown): obj is BadgeDefinition {
  const b = obj as BadgeDefinition;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof b.icon === 'string' &&
    ['bronze', 'silver', 'gold', 'platinum'].includes(b.color) &&
    ['common', 'rare', 'epic', 'legendary'].includes(b.rarity)
  );
}

/**
 * Achievement lookup map for O(1) access
 */
const ACHIEVEMENT_MAP = new Map(
  ACHIEVEMENT_REGISTRY.map(a => [a.id, a])
);

/**
 * Get achievement by ID
 * @param id Achievement ID
 * @returns Achievement or undefined if not found
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_MAP.get(id);
}
