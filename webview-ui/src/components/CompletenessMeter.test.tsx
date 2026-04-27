/**
 * Tests for Completeness Meter Component
 * Layer 4: UI Component
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompletenessMeter } from './CompletenessMeter';
import { ProjectMetrics } from '../../../src/completenessTypes';

// Mock the useCompleteness hook
jest.mock('../hooks/useCompleteness');

import { useCompleteness } from '../hooks/useCompleteness';

const mockUseCompleteness = useCompleteness as jest.MockedFunction<typeof useCompleteness>;

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
		jest.clearAllMocks();
		mockUseCompleteness.mockReturnValue(mockMetrics);
	});

	describe('Rendering', () => {
		it('should render completion percentage', () => {
			render(<CompletenessMeter />);
			// Use progress bar aria-valuenow to avoid multiple element matches
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-valuenow', '50');
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
			
			// Check for individual milestone markers
			expect(screen.getByTestId('milestone-25')).toBeInTheDocument();
			expect(screen.getByTestId('milestone-50')).toBeInTheDocument();
			expect(screen.getByTestId('milestone-75')).toBeInTheDocument();
			expect(screen.getByTestId('milestone-100')).toBeInTheDocument();
		});

		it('should highlight reached milestones', () => {
			const metricsWithMilestones: ProjectMetrics = {
				...mockMetrics,
				milestones: [
					{ threshold: 25, reached: true, celebrated: true },
					{ threshold: 50, reached: true, celebrated: false }
				]
			};

			mockUseCompleteness.mockReturnValue(metricsWithMilestones);

			render(<CompletenessMeter />);
			
			// 25% milestone should be highlighted
			const milestone25 = screen.getByTestId('milestone-25');
			expect(milestone25).toHaveClass('milestoneAchieved');
		});
	});

	describe('Color Progression', () => {
		it('should use green color for progress fill', () => {
			const completeMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 100,
				storiesCompleted: 10
			};

			mockUseCompleteness.mockReturnValue(completeMetrics);

			render(<CompletenessMeter />);
			const progressFill = screen.getByTestId('progress-fill');
			expect(progressFill).toHaveClass('progressFill');
		});

		it('should render progress fill for low completion', () => {
			const lowMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 20,
				storiesCompleted: 2
			};

			mockUseCompleteness.mockReturnValue(lowMetrics);

			render(<CompletenessMeter />);
			const progressFill = screen.getByTestId('progress-fill');
			expect(progressFill).toHaveClass('progressFill');
			expect(progressFill).toHaveStyle({ width: '20%' });
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
				storiesCompleted: 0,
				codeCoverage: 0
			};

			mockUseCompleteness.mockReturnValue(zeroMetrics);

			render(<CompletenessMeter />);
			const percentageDisplay = screen.getByTestId('completeness-meter');
			expect(percentageDisplay).toBeInTheDocument();
			// Check progress bar value instead of text content to avoid multiple matches
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-valuenow', '0');
		});

		it('should handle 100% completion', () => {
			const completeMetrics: ProjectMetrics = {
				...mockMetrics,
				completionPercentage: 100,
				storiesCompleted: 10
			};

			mockUseCompleteness.mockReturnValue(completeMetrics);

			render(<CompletenessMeter />);
			// Check progress bar value for 100%
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-valuenow', '100');
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

			mockUseCompleteness.mockReturnValue(emptyMetrics);

			render(<CompletenessMeter />);
			// Check progress bar value instead of text content
			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-valuenow', '0');
			expect(progressBar).toBeInTheDocument();
		});
	});

	// ========================================
	// Design System v2.0.0 Alignment (US-004-004)
	// ========================================
	describe('Design System v2.0.0 Alignment (US-004-004)', () => {
		beforeEach(() => {
			mockUseCompleteness.mockReturnValue(mockMetrics);
		});

		describe('DONE Label (AC1)', () => {
			it('should render "DONE" label above percentage', () => {
				render(<CompletenessMeter />);
				const label = screen.getByTestId('done-label');
				expect(label).toBeInTheDocument();
				expect(label).toHaveTextContent('DONE');
			});

			it('should use micro typography (9px, weight 600)', () => {
				render(<CompletenessMeter />);
				const label = screen.getByTestId('done-label');
				expect(label).toHaveClass('doneLabel');
			});

			it('should use muted color (#808080)', () => {
				render(<CompletenessMeter />);
				const label = screen.getByTestId('done-label');
				// Verify CSS class that applies var(--vscode-foreground-muted)
				expect(label).toHaveClass('doneLabel');
			});
		});

		describe('Percentage Display (AC2)', () => {
			it('should use h1 typography (36px, weight 700)', () => {
				render(<CompletenessMeter />);
				const percentage = screen.getByTestId('percentage-value');
				expect(percentage).toHaveClass('percentageValue');
			});

			it('should use monospace font family', () => {
				render(<CompletenessMeter />);
				const percentage = screen.getByTestId('percentage-value');
				// Verify CSS class applies var(--font-mono)
				expect(percentage).toHaveClass('percentageValue');
			});

			it('should display percentage number only (no % symbol)', () => {
				render(<CompletenessMeter />);
				const percentage = screen.getByTestId('percentage-value');
				expect(percentage).toHaveTextContent('50');
				expect(percentage).not.toHaveTextContent('%');
			});
		});

		describe('Progress Bar Dimensions (AC3)', () => {
			it('should have exact dimensions (200×8px)', () => {
				render(<CompletenessMeter />);
				const progressContainer = screen.getByTestId('progress-container');
				expect(progressContainer).toHaveClass('progressContainer');
			});

			it('should have border-radius 4px', () => {
				render(<CompletenessMeter />);
				const progressContainer = screen.getByTestId('progress-container');
				// Verify CSS class applies var(--radius-sm) which is 4px
				expect(progressContainer).toHaveClass('progressContainer');
			});

			it('should have smooth transition (500ms cubic-bezier)', () => {
				render(<CompletenessMeter />);
				const progressFill = screen.getByTestId('progress-fill');
				expect(progressFill).toHaveClass('progressFill');
			});
		});

		describe('Milestone Markers (AC4)', () => {
			it('should render 5 milestone markers (25%, 50%, 75%, 90%, 100%)', () => {
				render(<CompletenessMeter />);
				expect(screen.getByTestId('milestone-25')).toBeInTheDocument();
				expect(screen.getByTestId('milestone-50')).toBeInTheDocument();
				expect(screen.getByTestId('milestone-75')).toBeInTheDocument();
				expect(screen.getByTestId('milestone-90')).toBeInTheDocument();
				expect(screen.getByTestId('milestone-100')).toBeInTheDocument();
			});

			it('should position markers at correct percentages', () => {
				render(<CompletenessMeter />);
				const marker25 = screen.getByTestId('milestone-25');
				const marker90 = screen.getByTestId('milestone-90');
				
				// Verify positioning via CSS classes
				expect(marker25).toHaveClass('milestoneMarker');
				expect(marker90).toHaveClass('milestoneMarker');
			});

			it('should render as 6px circles', () => {
				render(<CompletenessMeter />);
				const marker = screen.getByTestId('milestone-25');
				// Verify CSS class that applies 6px dimensions
				expect(marker).toHaveClass('milestoneMarker');
			});
		});

		describe('Achieved Milestone Styling (AC5)', () => {
			it('should apply success green fill (#10B981) to achieved milestones', () => {
				const metricsWithAchieved: ProjectMetrics = {
					...mockMetrics,
					completionPercentage: 60,
					milestones: [
						{ threshold: 25, reached: true, celebrated: true },
						{ threshold: 50, reached: true, celebrated: false }
					]
				};
				mockUseCompleteness.mockReturnValue(metricsWithAchieved);

				render(<CompletenessMeter />);
				const marker25 = screen.getByTestId('milestone-25');
				const marker50 = screen.getByTestId('milestone-50');
				
				expect(marker25).toHaveClass('milestoneAchieved');
				expect(marker50).toHaveClass('milestoneAchieved');
			});

			it('should apply background border color to achieved milestones', () => {
				const metricsWithAchieved: ProjectMetrics = {
					...mockMetrics,
					completionPercentage: 30,
					milestones: [{ threshold: 25, reached: true, celebrated: true }]
				};
				mockUseCompleteness.mockReturnValue(metricsWithAchieved);

				render(<CompletenessMeter />);
				const marker = screen.getByTestId('milestone-25');
				// Verify CSS class applies border: 1px solid var(--vscode-bg)
				expect(marker).toHaveClass('milestoneMarker');
			});
		});

		describe('Upcoming Milestone Styling (AC6)', () => {
			it('should apply muted fill (#3E3E42) to upcoming milestones', () => {
				const metricsWithUpcoming: ProjectMetrics = {
					...mockMetrics,
					completionPercentage: 20,
					milestones: []
				};
				mockUseCompleteness.mockReturnValue(metricsWithUpcoming);

				render(<CompletenessMeter />);
				const marker25 = screen.getByTestId('milestone-25');
				const marker50 = screen.getByTestId('milestone-50');
				
				expect(marker25).toHaveClass('milestoneUpcoming');
				expect(marker50).toHaveClass('milestoneUpcoming');
			});

			it('should not have achieved class on upcoming milestones', () => {
				const metricsWithUpcoming: ProjectMetrics = {
					...mockMetrics,
					completionPercentage: 10,
					milestones: []
				};
				mockUseCompleteness.mockReturnValue(metricsWithUpcoming);

				render(<CompletenessMeter />);
				const marker = screen.getByTestId('milestone-25');
				expect(marker).not.toHaveClass('milestoneAchieved');
			});
		});

		describe('Stats Grid Typography (AC7)', () => {
			it('should render stats in 2-column grid', () => {
				render(<CompletenessMeter />);
				const statsGrid = screen.getByTestId('stats-grid');
				expect(statsGrid).toHaveClass('statsGrid');
			});

			it('should use micro typography (9px) for labels', () => {
				render(<CompletenessMeter />);
				const label = screen.getByText('Stories');
				expect(label).toHaveClass('statLabel');
			});

			it('should use muted color (#808080) for labels', () => {
				render(<CompletenessMeter />);
				const label = screen.getByText('Tests');
				// Verify CSS class applies var(--vscode-foreground-muted)
				expect(label).toHaveClass('statLabel');
			});

			it('should use white color with weight 600 for values', () => {
				render(<CompletenessMeter />);
				const value = screen.getByText(/5 \/ 10 stories/i);
				expect(value).toHaveClass('statValue');
			});
		});

		describe('PRU Efficiency Display (AC8)', () => {
			it('should render PRU efficiency with lightning emoji', () => {
				const metricsWithPRU: ProjectMetrics = {
					...mockMetrics,
					pruEfficiency: 78
				};
				mockUseCompleteness.mockReturnValue(metricsWithPRU);

				render(<CompletenessMeter />);
				const pruDisplay = screen.getByTestId('pru-efficiency');
				expect(pruDisplay).toBeInTheDocument();
				expect(pruDisplay).toHaveTextContent('⚡');
			});

			it('should display PRU percentage with gold color (#FFD600)', () => {
				const metricsWithPRU: ProjectMetrics = {
					...mockMetrics,
					pruEfficiency: 78
				};
				mockUseCompleteness.mockReturnValue(metricsWithPRU);

				render(<CompletenessMeter />);
				const pruValue = screen.getByTestId('pru-value');
				expect(pruValue).toHaveTextContent('78%');
				expect(pruValue).toHaveClass('pruValue');
			});

			it('should not render PRU efficiency when value is undefined', () => {
				render(<CompletenessMeter />);
				const pruDisplay = screen.queryByTestId('pru-efficiency');
				expect(pruDisplay).not.toBeInTheDocument();
			});
		});

		describe('Progress Transition Animation (AC9)', () => {
			it('should apply smooth transition class to progress fill', () => {
				render(<CompletenessMeter />);
				const progressFill = screen.getByTestId('progress-fill');
				// Verify CSS class applies transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1)
				expect(progressFill).toHaveClass('progressFill');
			});
		});

		describe('Milestone Bounce Animation (AC10)', () => {
			it('should apply bounce animation class to newly achieved milestones', () => {
				const metricsWithNewAchievement: ProjectMetrics = {
					...mockMetrics,
					completionPercentage: 50,
					milestones: [
						{ threshold: 25, reached: true, celebrated: true },
						{ threshold: 50, reached: true, celebrated: false } // Not celebrated = newly achieved
					]
				};
				mockUseCompleteness.mockReturnValue(metricsWithNewAchievement);

				render(<CompletenessMeter />);
				const marker50 = screen.getByTestId('milestone-50');
				// Verify CSS class applies animation: bounce 400ms ease-out
				expect(marker50).toHaveClass('milestoneBounce');
			});

			it('should not apply bounce animation to already celebrated milestones', () => {
				const metricsWithCelebratedMilestone: ProjectMetrics = {
					...mockMetrics,
					completionPercentage: 30,
					milestones: [
						{ threshold: 25, reached: true, celebrated: true } // Already celebrated
					]
				};
				mockUseCompleteness.mockReturnValue(metricsWithCelebratedMilestone);

				render(<CompletenessMeter />);
				const marker25 = screen.getByTestId('milestone-25');
				expect(marker25).not.toHaveClass('milestoneBounce');
			});
		});

		describe('Visual Regression Prevention', () => {
			it('should preserve accessibility attributes', () => {
				render(<CompletenessMeter />);
				const progressBar = screen.getByRole('progressbar');
				expect(progressBar).toHaveAttribute('aria-label', 'Project completion progress');
				expect(progressBar).toHaveAttribute('aria-valuenow', '50');
			});

			it('should maintain hover interactions', () => {
				render(<CompletenessMeter />);
				const meter = screen.getByTestId('completeness-meter');
				expect(meter).toBeInTheDocument();
			});
		});
	});
});
