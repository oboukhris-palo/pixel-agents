/**
 * Completeness Metrics Types and Calculation Utilities
 * Layer 1: Domain Model
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 * 
 * This module defines the core types and calculation logic for project completion metrics.
 * It provides immutable functions for calculating completion percentages, detecting milestone
 * crossings, and managing celebration state.
 */

/**
 * Project-wide metrics for tracking implementation progress
 */
export interface ProjectMetrics {
	/** Overall completion percentage (0-100) */
	completionPercentage: number;
	
	/** Total number of user stories in the project */
	storiesTotal: number;
	
	/** Number of user stories marked as Delivered or Implemented */
	storiesCompleted: number;
	
	/** Total number of tests in the test suite */
	testsTotal: number;
	
	/** Number of tests currently passing */
	testsPassing: number;
	
	/** Code coverage percentage (0-100) */
	codeCoverage: number;
	
	/** Total lines of code in the project */
	linesOfCode: number;
	
	/** Milestone tracking for celebration triggers */
	milestones: MilestoneStatus[];
	
	/** PRU (Prompt Resource Units) efficiency score (0-100) - optional */
	pruEfficiency?: number;
}

/**
 * Milestone status for celebration tracking
 */
export interface MilestoneStatus {
	/** Milestone threshold percentage (25, 50, 75, or 100) */
	threshold: 25 | 50 | 75 | 100;
	
	/** Whether this milestone has been reached */
	reached: boolean;
	
	/** Timestamp when milestone was reached (if applicable) */
	reachedAt?: Date;
	
	/** Whether celebration has been shown for this milestone (prevents duplicates) */
	celebrated: boolean;
}

/**
 * Calculate completion percentage based on completed stories vs total stories
 * 
 * @param metrics - Project metrics object
 * @returns Completion percentage (0-100), rounded to nearest integer
 * 
 * @example
 * ```typescript
 * const metrics = { storiesTotal: 14, storiesCompleted: 7, ... };
 * const percentage = calculateCompletionPercentage(metrics);
 * // Returns: 50
 * ```
 */
export function calculateCompletionPercentage(metrics: ProjectMetrics): number {
	if (metrics.storiesTotal === 0) {
		return 0;
	}
	
	const percentage = (metrics.storiesCompleted / metrics.storiesTotal) * 100;
	return Math.round(percentage);
}

/**
 * Check if a milestone threshold was crossed between two percentage values
 * 
 * @param previousPercentage - Previous completion percentage
 * @param currentPercentage - Current completion percentage
 * @returns Milestone number (25, 50, 75, 100) if crossed, null otherwise
 * 
 * @remarks
 * - Only returns the first milestone crossed (if multiple crossed in one jump)
 * - Returns null if percentage went backwards
 * - Returns null if no milestone threshold was crossed
 * 
 * @example
 * ```typescript
 * const milestone = checkMilestoneReached(24, 26);
 * // Returns: 25 (crossed 25% threshold)
 * 
 * const none = checkMilestoneReached(30, 35);
 * // Returns: null (no milestone crossed)
 * ```
 */
export function checkMilestoneReached(
	previousPercentage: number,
	currentPercentage: number
): 25 | 50 | 75 | 100 | null {
	// No milestone if going backwards
	if (currentPercentage <= previousPercentage) {
		return null;
	}
	
	const milestones: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
	
	// Find first milestone that was crossed
	for (const milestone of milestones) {
		if (previousPercentage < milestone && currentPercentage >= milestone) {
			return milestone;
		}
	}
	
	return null;
}

/**
 * Get color for milestone visualization
 * 
 * @param milestone - Milestone threshold (25, 50, 75, 100)
 * @returns Hex color code for the milestone
 * 
 * @remarks
 * Color progression:
 * - 25%: Blue (#3b82f6) - Quarter mark
 * - 50%: Silver (#94a3b8) - Halfway
 * - 75%: Gold (#eab308) - Three quarters
 * - 100%: Green (#22c55e) - Complete
 * - Default: Gray (#6b7280) - Invalid milestone
 * 
 * @example
 * ```typescript
 * const color = getMilestoneColor(50);
 * // Returns: '#94a3b8' (silver)
 * ```
 */
export function getMilestoneColor(milestone: number): string {
	switch (milestone) {
		case 25:
			return '#3b82f6'; // Tailwind blue-500
		case 50:
			return '#94a3b8'; // Tailwind slate-400 (silver)
		case 75:
			return '#eab308'; // Tailwind yellow-500 (gold)
		case 100:
			return '#22c55e'; // Tailwind green-500
		default:
			return '#6b7280'; // Tailwind gray-500 (default)
	}
}

/**
 * Create default (zero-initialized) project metrics
 * 
 * @returns ProjectMetrics object with all values set to zero
 * 
 * @example
 * ```typescript
 * const metrics = getDefaultProjectMetrics();
 * // Returns: { completionPercentage: 0, storiesTotal: 0, ... }
 * ```
 */
export function getDefaultProjectMetrics(): ProjectMetrics {
	return {
		completionPercentage: 0,
		storiesTotal: 0,
		storiesCompleted: 0,
		testsTotal: 0,
		testsPassing: 0,
		codeCoverage: 0,
		linesOfCode: 0,
		milestones: []
	};
}
