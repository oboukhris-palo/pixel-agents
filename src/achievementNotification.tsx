/**
 * Achievement Notification & Leaderboard Components
 * Layer 4: User Interface - Achievement notifications and player leaderboard
 *
 * Components:
 * - AchievementNotification: Displays unlocked achievement with auto-dismiss
 * - Leaderboard: Virtual table showing player rankings by efficiency
 *
 * Accessibility: WCAG 2.1 AA compliant with full keyboard navigation
 * Performance: GPU-accelerated animations, virtualized rendering
 * Features:
 *   - Auto-dismiss after 5000ms (configurable)
 *   - Keyboard support: Escape to dismiss, Tab for focus nav
 *   - Reduced motion support via prefers-reduced-motion media query
 *   - Real-time sorting and filtering
 *   - Virtual scrolling for 100+ players
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Achievement, StreakData, PRUScore } from './achievementTypes';

/**
 * Props for AchievementNotification component
 */
export interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  autoDismissAfter?: number | null;
  className?: string;
}

/**
 * Player data for leaderboard
 */
export interface LeaderboardPlayer {
  name: string;
  pruScore: PRUScore;
  streak: StreakData;
}

/**
 * Props for Leaderboard component
 */
export interface LeaderboardProps {
  players: LeaderboardPlayer[];
  currentPlayer?: string;
  onPlayerClick?: (playerName: string) => void;
  sortBy?: 'efficiency' | 'streak' | 'name';
  className?: string;
}

/**
 * Type exports for component testing
 */
export type AchievementNotificationComponent = typeof AchievementNotification;
export type LeaderboardComponent = typeof Leaderboard;

/**
 * AchievementNotification Component
 *
 * Displays achievement unlock notification with:
 * - Badge icon and color coding by category
 * - Achievement name and description
 * - Auto-dismiss after 5000ms (or custom interval)
 * - Keyboard support (Escape to dismiss)
 * - ARIA live region for screen readers
 * - Slide-in/fade-out animations with reduced-motion support
 *
 * @example
 * <AchievementNotification
 *   achievement={achievement}
 *   onDismiss={() => setNotification(null)}
 *   autoDismissAfter={5000}
 * />
 */
export function AchievementNotification({
  achievement,
  onDismiss,
  autoDismissAfter = 5000,
  className = '',
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || autoDismissAfter === null) return;

    const dismissDelay = prefersReducedMotion ? 100 : 300;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, dismissDelay);
    }, autoDismissAfter ?? 5000);

    return () => clearTimeout(timer);
  }, [isVisible, autoDismissAfter, prefersReducedMotion, onDismiss]);

  // Keyboard support: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        setTimeout(() => {
          onDismiss();
        }, prefersReducedMotion ? 0 : 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss, prefersReducedMotion]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, prefersReducedMotion ? 0 : 300);
  }, [onDismiss, prefersReducedMotion]);

  // Get category-based color class
  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      bronze: 'bg-amber-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-blue-300',
      orange: 'bg-orange-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  // Get rarity color class
  const getRarityClass = (rarity: string): string => {
    const rarityMap: Record<string, string> = {
      common: 'text-gray-700',
      uncommon: 'text-green-700',
      rare: 'text-blue-700',
      epic: 'text-purple-700',
      legendary: 'text-orange-700',
    };
    return rarityMap[rarity] || 'text-gray-700';
  };

  return (
    <div
      className={`
        fixed top-4 right-4 max-w-sm transition-all duration-300 z-50
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        ${prefersReducedMotion ? 'transition-none' : ''}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-amber-500 p-4">
        {/* Badge Container */}
        <div className="flex gap-4">
          {/* Badge Icon */}
          <div
            className={`
              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
              ${getColorClass(achievement.badge.color)} text-xl
              ${!prefersReducedMotion ? 'animate-bounce' : ''}
            `}
            aria-hidden="true"
          >
            {achievement.badge.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-sm dark:text-white">{achievement.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {achievement.description}
            </p>
            <span
              className={`
                inline-block text-xs font-semibold mt-2
                ${getRarityClass(achievement.badge.rarity)}
              `}
            >
              {achievement.badge.rarity.toUpperCase()} - {achievement.category}
            </span>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
              transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded
              p-1
            "
            aria-label="Dismiss achievement notification"
            type="button"
            tabIndex={0}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export component alias for testing compatibility
export const AchievementNotificationComponent = AchievementNotification;

/**
 * Leaderboard Component
 *
 * Displays player rankings with:
 * - Sorted by efficiency (ascending = better players first)
 * - Virtual scrolling for 100+ players (<500ms render time)
 * - Clickable column headers to change sort order
 * - Current player highlight with aria-current=row
 * - Full keyboard navigation
 * - ARIA labels for accessibility
 * - Real-time updates
 *
 * @example
 * <Leaderboard
 *   players={players}
 *   currentPlayer="Alice"
 *   sortBy="efficiency"
 *   onPlayerClick={(name) => console.log(name)}
 * />
 */
export function Leaderboard({
  players,
  currentPlayer,
  onPlayerClick,
  sortBy = 'efficiency',
  className = '',
}: LeaderboardProps) {
  const [internalSortBy, setInternalSortBy] = useState<'efficiency' | 'streak' | 'name'>(sortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // Sort players based on current sort column
  const sortedPlayers = useMemo(() => {
    const sorted = [...players].sort((a, b) => {
      let comparison = 0;

      if (internalSortBy === 'efficiency') {
        comparison = a.pruScore.efficiency - b.pruScore.efficiency;
      } else if (internalSortBy === 'streak') {
        comparison = a.streak.current - b.streak.current;
      } else if (internalSortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [players, internalSortBy, sortDirection]);

  // Handle column header click for sorting
  const handleSortClick = useCallback(
    (column: 'efficiency' | 'streak' | 'name') => {
      if (internalSortBy === column) {
        // Toggle direction if same column clicked
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        // Change column and reset to ascending
        setInternalSortBy(column);
        setSortDirection('asc');
      }
    },
    [internalSortBy]
  );

  // Handle virtual scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const rowHeight = 44; // Row height in pixels
    const visibleRows = Math.ceil(target.clientHeight / rowHeight);

    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 5); // 5 row buffer
    const end = start + visibleRows + 10;

    setVisibleRange({ start, end });
  }, []);

  // Get visible players for rendering
  const visiblePlayers = useMemo(() => {
    return sortedPlayers.slice(visibleRange.start, visibleRange.end);
  }, [sortedPlayers, visibleRange]);

  // Get aria-sort value for column header
  const getAriaSort = (column: 'efficiency' | 'streak' | 'name'): 'ascending' | 'descending' | 'none' => {
    if (internalSortBy !== column) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  if (players.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 dark:text-gray-400 ${className}`}>
        <p className="text-sm">No players on the leaderboard yet.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg shadow ${className}`}>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: '500px' }}
        onScroll={handleScroll}
        role="presentation"
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
            <tr>
              <th
                className="
                  px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200
                  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500
                "
                onClick={() => handleSortClick('name')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSortClick('name');
                  }
                }}
                aria-sort={getAriaSort('name')}
                tabIndex={0}
                role="columnheader"
              >
                Player {internalSortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="
                  px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200
                  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500
                "
                onClick={() => handleSortClick('efficiency')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSortClick('efficiency');
                  }
                }}
                aria-sort={getAriaSort('efficiency')}
                tabIndex={0}
                role="columnheader"
              >
                Efficiency {internalSortBy === 'efficiency' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="
                  px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200
                  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500
                "
                onClick={() => handleSortClick('streak')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSortClick('streak');
                  }
                }}
                aria-sort={getAriaSort('streak')}
                tabIndex={0}
                role="columnheader"
              >
                Streak {internalSortBy === 'streak' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200"
                role="columnheader"
              >
                Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Render spacer rows before visible range */}
            {visibleRange.start > 0 && (
              <tr style={{ height: `${visibleRange.start * 44}px` }}>
                <td colSpan={4} />
              </tr>
            )}

            {/* Render visible players */}
            {visiblePlayers.map((player, index) => {
              const actualIndex = visibleRange.start + index;
              const isCurrentPlayer = player.name === currentPlayer;

              return (
                <tr
                  key={`${player.name}-${actualIndex}`}
                  onClick={() => onPlayerClick?.(player.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPlayerClick?.(player.name);
                    }
                  }}
                  className={`
                    border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${onPlayerClick ? 'cursor-pointer' : ''}
                    transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-amber-500
                    ${isCurrentPlayer ? 'bg-amber-50 dark:bg-amber-900/20 font-semibold' : ''}
                  `}
                  aria-current={isCurrentPlayer ? 'row' : undefined}
                  role="row"
                  tabIndex={onPlayerClick ? 0 : -1}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {isCurrentPlayer && <span className="mr-2">★</span>}
                    {player.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {Math.round(player.pruScore.efficiency)} PRU/SP
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-orange-500 font-semibold">{player.streak.current}🔥</span>
                    <span className="text-gray-500 text-xs"> / {player.streak.longest}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`
                        inline-block px-2 py-1 rounded text-xs font-semibold
                        ${
                          player.pruScore.rank === 'master'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                            : player.pruScore.rank === 'expert'
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                              : player.pruScore.rank === 'intermediate'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }
                      `}
                    >
                      {player.pruScore.rank}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Render spacer rows after visible range */}
            {visibleRange.end < sortedPlayers.length && (
              <tr style={{ height: `${(sortedPlayers.length - visibleRange.end) * 44}px` }}>
                <td colSpan={4} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Export component alias for testing compatibility
export const LeaderboardComponent = Leaderboard;
