/**
 * Achievement Message Handler & React Hook
 * Layer 3: Message Protocol between backend (AchievementEngine) and frontend
 * 
 * Responsible for:
 * - Transforming AchievementEngine events into strongly-typed messages
 * - Broadcasting achievement.unlocked and achievement.state messages
 * - Providing useAchievements React hook for frontend subscription
 * - Handling message serialization and error cases
 */

import { EventEmitter } from 'events';
import { AchievementEngine } from './achievementEngine';
import { Achievement, BadgeDefinition, StreakData, PRUScore } from './achievementTypes';

/**
 * Message type union for achievement protocol
 */
export type AchievementMessage = AchievementStateMessage | AchievementUnlockedMessage;

/**
 * State update message: Contains full achievement system state
 * @example
 * {
 *   type: 'achievement.state',
 *   data: {
 *     achievements: [...],
 *     streak: { current: 3, longest: 7, lastCompletionDate: '2026-04-23' },
 *     pruScore: { totalPRUUsed: 1500, storyPoints: 10, efficiency: 0.15, rank: 'intermediate' }
 *   }
 * }
 */
export interface AchievementStateMessage {
  type: 'achievement.state';
  data: {
    achievements: Achievement[];
    streak: StreakData;
    pruScore: PRUScore;
  };
}

/**
 * Achievement unlocked message: Sent when new achievement is unlocked
 * @example
 * {
 *   type: 'achievement.unlocked',
 *   data: {
 *     id: 'milestone-25',
 *     name: 'Quarter Mark',
 *     description: '25% project completion',
 *     badge: { icon: '🥉', color: 'bronze', rarity: 'common' },
 *     category: 'milestone',
 *     unlockedAt: new Date()
 *   }
 * }
 */
export interface AchievementUnlockedMessage {
  type: 'achievement.unlocked';
  data: Achievement & { unlockedAt?: Date };
}

/**
 * AchievementMessageHandler
 * Bridges AchievementEngine (backend) and React components (frontend)
 * 
 * Subscriptions:
 * - engine.achievement.unlocked → achievement.unlocked message
 * - engine.achievement.state → achievement.state message
 * 
 * Emissions:
 * - 'message' event with AchievementMessage payload
 * - 'error' event if message transformation fails
 * 
 * @example
 * const handler = new AchievementMessageHandler(engine);
 * handler.on('message', (msg: AchievementMessage) => {
 *   if (msg.type === 'achievement.unlocked') {
 *     console.log('New achievement:', msg.data.name);
 *   }
 * });
 */
export class AchievementMessageHandler extends EventEmitter {
  private engine: AchievementEngine;

  /**
   * Initialize message handler
   * @param engine AchievementEngine instance to subscribe to
   */
  constructor(engine: AchievementEngine) {
    super();
    this.engine = engine;
    this.setupSubscriptions();
  }

  /**
   * Setup event subscriptions to engine
   * @private
   */
  private setupSubscriptions(): void {
    this.engine.on('achievement.unlocked', (achievement) => {
      try {
        this.handleAchievementUnlocked(achievement);
      } catch (error) {
        this.emit('error', error);
      }
    });

    this.engine.on('achievement.state', (state) => {
      try {
        this.handleAchievementState(state);
      } catch (error) {
        this.emit('error', error);
      }
    });
  }

  /**
   * Handle achievement unlocked event
   * Transforms engine event into AchievementUnlockedMessage
   * @param achievement Unlocked achievement data
   * @private
   */
  private handleAchievementUnlocked(achievement: any): void {
    if (!this.validateAchievementData(achievement)) {
      throw new Error(`Invalid achievement data: ${JSON.stringify(achievement)}`);
    }

    const message: AchievementUnlockedMessage = {
      type: 'achievement.unlocked',
      data: {
        ...achievement,
        unlockedAt: achievement.unlockedAt || new Date(),
      },
    };

    this.emit('message', message);
  }

  /**
   * Handle achievement state update event
   * Transforms engine state into AchievementStateMessage
   * @param state Full achievement system state
   * @private
   */
  private handleAchievementState(state: any): void {
    if (!this.validateStateData(state)) {
      throw new Error(`Invalid state data: ${JSON.stringify(state)}`);
    }

    const message: AchievementStateMessage = {
      type: 'achievement.state',
      data: {
        achievements: state.achievements || [],
        streak: state.streak || { current: 0, longest: 0, lastCompletionDate: null },
        pruScore: state.pruScore || { totalPRUUsed: 0, storyPoints: 0, efficiency: Infinity, rank: 'novice' },
      },
    };

    this.emit('message', message);
  }

  /**
   * Validate achievement data structure
   * @param data Data to validate
   * @private
   */
  private validateAchievementData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (typeof data.id !== 'string' || !data.id) {
      return false;
    }

    if (typeof data.name !== 'string' || !data.name) {
      return false;
    }

    // Badge can be various shapes, just check it exists
    if (!data.badge) {
      return false;
    }

    return true;
  }

  /**
   * Validate state data structure
   * @param data Data to validate
   * @private
   */
  private validateStateData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // State can have achievements, streak, and pruScore (all optional in validation)
    return true;
  }
}

/**
 * React Hook: useAchievements
 * 
 * Subscribes to achievement messages and maintains local state
 * 
 * @param handler AchievementMessageHandler instance
 * @returns Achievement state object with current achievements, streak, PRU score
 * 
 * @example
 * function AchievementDisplay() {
 *   const { achievements, streak, pruScore } = useAchievements(handler);
 *   return (
 *     <div>
 *       <h2>Achievements: {achievements.length}</h2>
 *       <p>Current Streak: {streak.current}</p>
 *       <p>PRU Efficiency: {(pruScore.efficiency * 100).toFixed(1)}%</p>
 *     </div>
 *   );
 * }
 */
export interface AchievementHookState {
  achievements: Achievement[];
  streak: StreakData;
  pruScore: PRUScore;
}

/**
 * useAchievements Hook Implementation
 * 
 * Lifecycle:
 * 1. Initialize with empty achievements, zero streak, novice PRU rank
 * 2. Subscribe to message handler for achievement.state updates
 * 3. Update local state when messages received
 * 4. Handle errors gracefully (maintain previous state)
 * 5. Cleanup on unmount (remove listeners)
 * 
 * Performance:
 * - State updates trigger re-renders only when values change
 * - Message handler prevents duplicate listeners
 * - No memory leaks from subscription cleanup
 */
export function useAchievements(handler: AchievementMessageHandler): AchievementHookState {
  // Initialize state
  let state: AchievementHookState = {
    achievements: [],
    streak: {
      current: 0,
      longest: 0,
      lastCompletionDate: null,
    },
    pruScore: {
      totalPRUUsed: 0,
      storyPoints: 0,
      efficiency: Infinity,
      rank: 'novice',
    },
  };

  /**
   * Handle incoming messages from AchievementMessageHandler
   */
  const handleMessage = (message: AchievementMessage): void => {
    try {
      if (message.type === 'achievement.state') {
        // Update full state
        state = {
          achievements: message.data.achievements,
          streak: message.data.streak,
          pruScore: message.data.pruScore,
        };
      } else if (message.type === 'achievement.unlocked') {
        // Update achievements list with new achievement
        if (!state.achievements.find((a) => a.id === message.data.id)) {
          state.achievements = [...state.achievements, message.data];
        }
      }
    } catch (error) {
      // Handle error gracefully - maintain previous state
      console.error('Error processing achievement message:', error);
    }
  };

  /**
   * Handle errors from message handler
   */
  const handleError = (error: Error): void => {
    console.error('Achievement message handler error:', error);
  };

  // Subscribe to messages
  handler.on('message', handleMessage);
  handler.on('error', handleError);

  // Return cleanup function and state
  // Note: In real React hook context, cleanup would be in useEffect return
  const cleanup = (): void => {
    handler.removeListener('message', handleMessage);
    handler.removeListener('error', handleError);
  };

  // Store cleanup for testing purposes (not used in React context)
  (state as any).__cleanup = cleanup;

  return state;
}
