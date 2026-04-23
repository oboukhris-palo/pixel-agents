/**
 * Tests for Completeness Meter Component
 * Layer 4: UI Component
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompletenessMeter } from './CompletenessMeter';
import { ProjectMetrics } from '../../../src/completenessTypes';

// Mock the useCompleteness hook
vi.mock('../hooks/useCompleteness', () => ({
	useCompleteness: vi.fn()
}));

import { useCompleteness } from '../hooks/useCompleteness';

describe('CompletenessMeter Component', () => {
	const mockMetrics: ProjectMetrics = {
		completionPercentage: 50,
		storiesTotal: 10,
		storiesCompleted: 5,
		testsTotal: 100,
		testsPassing: 85,
		codeCoverage: 82,
		linesOfCode: 5000,
		milestones: []
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(mockMetrics);
	});

	describe('Rendering', () => {
		it('should render completion percentage', () => {
			render(<CompletenessMeter />);
			expect(screen.getByText('50%')).toBeInTheDocument();
		});

		it('should render progress bar with correct value', () => {
			render(<CompletenessMeter />);
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-valuenow', '50');
			expect(progressBar).toHaveAttribute('aria-valuemin', '0');
			expect(progressBar).toHaveAttribute('aria-valuemax', '100');
		});

		it('should render stories metrics', () => {
			render(<CompletenessMeter />);
			expect(screen.getByText(/5 \/ 10 stories/i)).toBeInTheDocument();
		});

		it('should render test metrics', () => {
			render(<CompletenessMeter />);
			expect(screen.getByText(/85 \/ 100 tests/i)).toBeInTheDocument();
		});

		it('should render code coverage', () => {
			render(<CompletenessMeter />);
			expect(screen.getByText(/82%/i)).toBeInTheDocument();
		});
	});

	describe('Milestone Visualization', () => {
		it('should show milestone markers at 25%, 50%, 75%, 100%', () => {
			render(<CompletenessMeter />);
			
			// Check for milestone markers (visual indicators)
			const milestoneContainer = screen.getByTestId('milestone-markers');
			expect(milestoneContainer).toBeInTheDocument();
		});

		it('should highlight reached milestones', () => {
			const metricsWithMilestones: ProjectMetrics = {
				...mockMetrics,
				milestones: [
					{ threshold: 25, reached: true, celebrated: true },
					{ threshold: 50, reached: true, celebrated: false }
				]
			};

			(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(metricsWithMilestones);

			render(<CompletenessMeter />);
			
			// 25% milestone should be highlighted
			const milestone25 = screen.getByTestId('milestone-25');
			expect(milestone25).toHaveClass('reached');
		});
	});

	describe('Color Progression', () => {
		it('should use green color for 100% completion', () => {
			const completeMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 100,
				storiesCompleted: 10
			};

			(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(completeMetrics);

			render(<CompletenessMeter />);
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveClass('complete');
		});

		it('should use blue color for 0-25%', () => {
			const lowMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 20,
				storiesCompleted: 2
			};

			(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(lowMetrics);

			render(<CompletenessMeter />);
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveClass('low');
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA labels', () => {
			render(<CompletenessMeter />);
			
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-label', 'Project completion progress');
		});

		it('should have descriptive text for screen readers', () => {
			render(<CompletenessMeter />);
			
			const description = screen.getByText(/5 of 10 stories completed/i);
			expect(description).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle 0% completion', () => {
			const zeroMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 0,
				storiesCompleted: 0
			};

			(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(zeroMetrics);

			render(<CompletenessMeter />);
			expect(screen.getByText('0%')).toBeInTheDocument();
		});

		it('should handle 100% completion', () => {
			const completeMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 100,
				storiesCompleted: 10
			};

			(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(completeMetrics);

			render(<CompletenessMeter />);
			expect(screen.getByText('100%')).toBeInTheDocument();
		});

		it('should handle empty metrics gracefully', () => {
			const emptyMetrics: ProjectMetrics = {
				completionPercentage: 0,
				storiesTotal: 0,
				storiesCompleted: 0,
				testsTotal: 0,
				testsPassing: 0,
				codeCoverage: 0,
				linesOfCode: 0,
				milestones: []
			};

			(useCompleteness as ReturnType<typeof vi.fn>).mockReturnValue(emptyMetrics);

			render(<CompletenessMeter />);
			expect(screen.getByText('0%')).toBeInTheDocument();
		});
	});
});
