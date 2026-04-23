/**
 * Completeness Meter Component
 * Layer 4: UI Component
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 * 
 * Visual progress meter showing project completion with milestone markers.
 */

import React from 'react';
import { useCompleteness } from '../hooks/useCompleteness';
import { getMilestoneColor } from '../../../src/completenessTypes';

/**
 * Completeness Meter Component
 * 
 * Displays real-time project completion metrics with:
 * - Progress bar (0-100%)
 * - Milestone markers (25%, 50%, 75%, 100%)
 * - Story/test/coverage breakdown
 * - Color-coded progress stages
 * 
 * @example
 * ```typescript
 * <CompletenessMeter />
 * ```
 */
export function CompletenessMeter() {
	const metrics = useCompleteness();

	const getProgressColorClass = (percentage: number): string => {
		if (percentage === 100) return 'complete';
		if (percentage >= 75) return 'high';
		if (percentage >= 50) return 'medium';
		if (percentage >= 25) return 'low';
		return 'very-low';
	};

	const colorClass = getProgressColorClass(metrics.completionPercentage);

	return (
		<div className="completeness-meter" data-testid="completeness-meter">
			{/* Progress Bar */}
			<div className="progress-container">
				<div 
					className={`progress-bar ${colorClass}`}
					role="progressbar"
					aria-valuenow={metrics.completionPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Project completion progress"
					style={{ width: `${metrics.completionPercentage}%` }}
				/>
				
				{/* Milestone Markers */}
				<div className="milestone-markers" data-testid="milestone-markers">
					{[25, 50, 75, 100].map((threshold) => {
						const milestone = metrics.milestones.find(m => m.threshold === threshold);
						const reached = milestone?.reached || metrics.completionPercentage >= threshold;
						
						return (
							<div
								key={threshold}
								className={`milestone-marker ${reached ? 'reached' : ''}`}
								data-testid={`milestone-${threshold}`}
								style={{
									left: `${threshold}%`,
									backgroundColor: reached ? getMilestoneColor(threshold) : '#6b7280'
								}}
								title={`${threshold}% milestone ${reached ? '✓' : ''}`}
							>
								<span className="milestone-label">{threshold}%</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Percentage Display */}
			<div className="percentage-display">
				<span className="percentage-value">{metrics.completionPercentage}%</span>
				<span className="percentage-label">Complete</span>
			</div>

			{/* Metrics Breakdown */}
			<div className="metrics-breakdown">
				<div className="metric-item">
					<span className="metric-label">Stories</span>
					<span className="metric-value">
						{metrics.storiesCompleted} / {metrics.storiesTotal} stories
					</span>
					<span className="sr-only">
						{metrics.storiesCompleted} of {metrics.storiesTotal} stories completed
					</span>
				</div>

				<div className="metric-item">
					<span className="metric-label">Tests</span>
					<span className="metric-value">
						{metrics.testsPassing} / {metrics.testsTotal} tests
					</span>
				</div>

				<div className="metric-item">
					<span className="metric-label">Coverage</span>
					<span className="metric-value">{metrics.codeCoverage}%</span>
				</div>
			</div>
		</div>
	);
}
