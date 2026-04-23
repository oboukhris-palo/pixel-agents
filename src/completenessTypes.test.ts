/**
 * Tests for completeness metrics types and calculation utilities
 * Layer 1: Domain Model
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 */

import {
	ProjectMetrics,
	MilestoneStatus,
	calculateCompletionPercentage,
	checkMilestoneReached,
	getMilestoneColor,
	getDefaultProjectMetrics
} from './completenessTypes';

describe('completenessTypes - Domain Model', () => {
	describe('ProjectMetrics Type', () => {
		it('should create valid ProjectMetrics object', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 50,
				storiesTotal: 14,
				storiesCompleted: 7,
				testsTotal: 500,
				testsPassing: 485,
				codeCoverage: 92,
				linesOfCode: 8500,
				milestones: []
			};

			expect(metrics.completionPercentage).toBe(50);
			expect(metrics.storiesTotal).toBe(14);
			expect(metrics.storiesCompleted).toBe(7);
		});
	});

	describe('calculateCompletionPercentage', () => {
		it('should calculate 0% when no stories completed', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 14,
				storiesCompleted: 0,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(0);
		});

		it('should calculate 25% when 1/4 of stories completed', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 8,
				storiesCompleted: 2,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(25);
		});

		it('should calculate 50% when half of stories completed', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 14,
				storiesCompleted: 7,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(50);
		});

		it('should calculate 75% when 3/4 of stories completed', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 8,
				storiesCompleted: 6,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(75);
		});

		it('should calculate 100% when all stories completed', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 14,
				storiesCompleted: 14,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(100);
		});

		it('should handle division by zero (no stories)', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 0,
				storiesCompleted: 0,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(0);
		});

		it('should round to nearest integer percentage', () => {
			const metrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 3,
				storiesCompleted: 1,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			const percentage = calculateCompletionPercentage(metrics);
			expect(percentage).toBe(33); // 33.33... rounds to 33
		});
	});

	describe('checkMilestoneReached', () => {
		it('should detect crossing 25% threshold', () => {
			const milestone = checkMilestoneReached(24, 26);
			expect(milestone).toBe(25);
		});

		it('should detect crossing 50% threshold', () => {
			const milestone = checkMilestoneReached(48, 51);
			expect(milestone).toBe(50);
		});

		it('should detect crossing 75% threshold', () => {
			const milestone = checkMilestoneReached(74, 76);
			expect(milestone).toBe(75);
		});

		it('should detect crossing 100% threshold', () => {
			const milestone = checkMilestoneReached(99, 100);
			expect(milestone).toBe(100);
		});

		it('should return null when no milestone crossed', () => {
			const milestone = checkMilestoneReached(30, 35);
			expect(milestone).toBeNull();
		});

		it('should return null when going backwards', () => {
			const milestone = checkMilestoneReached(60, 55);
			expect(milestone).toBeNull();
		});

		it('should detect exact threshold crossing', () => {
			const milestone = checkMilestoneReached(24, 25);
			expect(milestone).toBe(25);
		});

		it('should only return first milestone when multiple crossed', () => {
			// Jump from 20% to 80% (crosses 25%, 50%, 75%)
			const milestone = checkMilestoneReached(20, 80);
			expect(milestone).toBe(25); // Should return first milestone
		});
	});

	describe('getMilestoneColor', () => {
		it('should return blue for 25% milestone', () => {
			const color = getMilestoneColor(25);
			expect(color).toBe('#3b82f6'); // Tailwind blue-500
		});

		it('should return silver for 50% milestone', () => {
			const color = getMilestoneColor(50);
			expect(color).toBe('#94a3b8'); // Tailwind slate-400
		});

		it('should return gold for 75% milestone', () => {
			const color = getMilestoneColor(75);
			expect(color).toBe('#eab308'); // Tailwind yellow-500
		});

		it('should return green for 100% milestone', () => {
			const color = getMilestoneColor(100);
			expect(color).toBe('#22c55e'); // Tailwind green-500
		});

		it('should return default color for invalid milestone', () => {
			const color = getMilestoneColor(60);
			expect(color).toBe('#6b7280'); // Tailwind gray-500
		});
	});

	describe('getDefaultProjectMetrics', () => {
		it('should return zero-initialized metrics', () => {
			const metrics = getDefaultProjectMetrics();

			expect(metrics.completionPercentage).toBe(0);
			expect(metrics.storiesTotal).toBe(0);
			expect(metrics.storiesCompleted).toBe(0);
			expect(metrics.testsTotal).toBe(0);
			expect(metrics.testsPassing).toBe(0);
			expect(metrics.codeCoverage).toBe(0);
			expect(metrics.linesOfCode).toBe(0);
			expect(metrics.milestones).toEqual([]);
		});
	});

	describe('MilestoneStatus', () => {
		it('should create milestone status object', () => {
			const milestone: MilestoneStatus = {
				threshold: 25,
				reached: true,
				reachedAt: new Date('2026-04-23T10:00:00Z'),
				celebrated: false
			};

			expect(milestone.threshold).toBe(25);
			expect(milestone.reached).toBe(true);
			expect(milestone.celebrated).toBe(false);
		});

		it('should prevent duplicate celebrations', () => {
			const milestone: MilestoneStatus = {
				threshold: 50,
				reached: true,
				reachedAt: new Date('2026-04-23T10:00:00Z'),
				celebrated: true // Already celebrated
			};

			// Simulate celebration check
			const shouldCelebrate = milestone.reached && !milestone.celebrated;
			expect(shouldCelebrate).toBe(false);
		});
	});
});
