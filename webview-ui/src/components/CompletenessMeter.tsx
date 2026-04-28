/**
 * Completeness Meter Component - Design System v2.0.0 Alignment
 * Layer 4: UI Component
 * Story: US-004-004 - CompletenessMeter Milestone Design
 * 
 * Visual progress meter showing project completion with:
 * - DONE label (micro typography)
 * - Percentage display (36px h1, monospace)
 * - Progress bar (200×8px) with milestone markers
 * - Stats grid (2-column, micro typography)
 * - PRU efficiency display (gold color with lightning emoji)
 */

import { useRef, useEffect } from 'react';
import { useCompleteness } from '../hooks/useCompleteness';
import { ParticleSystem } from '../office/engine/particleSystem';

// CSS module — mocked as identity-obj-proxy in Jest, loaded by Vite in production
import styles from './CompletenessMeter.module.css';

/**
 * Build CSS class names for milestone markers with fallbacks for identity-obj-proxy
 * 
 * @param reached - Whether milestone has been reached
 * @param newlyAchieved - Whether milestone was just achieved (not celebrated)
 * @returns Space-separated class names
 */
function getMilestoneClasses(reached: boolean, newlyAchieved: boolean): string {
	let classes = styles.milestoneMarker || 'milestoneMarker';
	
	if (reached) {
		classes += ` ${styles.milestoneAchieved || 'milestoneAchieved'}`;
	} else {
		classes += ` ${styles.milestoneUpcoming || 'milestoneUpcoming'}`;
	}
	
	if (newlyAchieved) {
		classes += ` ${styles.milestoneBounce || 'milestoneBounce'}`;
	}
	
	return classes;
}

/**
 * Completeness Meter Component
 * 
 * Displays real-time project completion metrics with:
 * - Progress bar (0-100%)
 * - Milestone markers (25%, 50%, 75%, 90%, 100%) with bounce animation
 * - Story/test/coverage breakdown in 2-column grid
 * - PRU efficiency score with gold color
 * - Color-coded progress stages
 * 
 * @example
 * ```typescript
 * <CompletenessMeter />
 * ```
 */
export function CompletenessMeter() {
	const metrics = useCompleteness();
	const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
	const prevCompletionRef = useRef(0);

	// Trigger milestone celebration particle effects (US-002-004)
	useEffect(() => {
		const prev = Math.floor(prevCompletionRef.current / 25);
		const curr = Math.floor(metrics.completionPercentage / 25);
		if (curr > prev && metrics.completionPercentage > 0) {
			const milestone = curr * 25;
			const centerX = 480;
			const centerY = 320;
			if (milestone === 25) {
				particleSystemRef.current.emitConfetti(centerX, centerY, 50);
			} else if (milestone === 50) {
				particleSystemRef.current.emitConfetti(centerX, centerY, 75);
			} else if (milestone === 75) {
				particleSystemRef.current.emitStarBurst(centerX, centerY, 100);
			} else if (milestone >= 100) {
				particleSystemRef.current.emitFireworks(centerX, centerY, 200);
			}
		}
		prevCompletionRef.current = metrics.completionPercentage;
	}, [metrics.completionPercentage]);

	return (
		<div className={styles['completeness-meter'] || 'completeness-meter'} data-testid="completeness-meter">
			{/* DONE Label (AC1) */}
			<div className={styles.doneLabel || 'doneLabel'} data-testid="done-label">
				DONE
			</div>

			{/* Percentage Display (AC2) */}
			<div className={styles.percentageValue || 'percentageValue'} data-testid="percentage-value">
				{metrics.completionPercentage}
			</div>

			{/* Progress Bar with Milestone Markers (AC3, AC4) */}
			<div 
				className={styles.progressContainer || 'progressContainer'}
				data-testid="progress-container"
			>
				<div 
					className={styles.progressFill || 'progressFill'}
					data-testid="progress-fill"
					role="progressbar"
					aria-valuenow={metrics.completionPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Project completion progress"
					style={{ width: `${metrics.completionPercentage}%` }}
				/>
				
				{/* Milestone Markers (AC4, AC5, AC6, AC10) */}
				{[25, 50, 75, 90, 100].map((threshold) => {
					const milestone = metrics.milestones.find(m => m.threshold === threshold);
					const reached = milestone?.reached || metrics.completionPercentage >= threshold;
					const newlyAchieved = !!(milestone?.reached && !milestone?.celebrated);
					
					return (
						<div
							key={threshold}
							className={getMilestoneClasses(reached, newlyAchieved)}
							data-testid={`milestone-${threshold}`}
							style={{ left: `${threshold}%` }}
							title={`${threshold}% milestone ${reached ? '✓' : ''}`}
						/>
					);
				})}
			</div>

			{/* Stats Grid (AC7) - Enhanced with all metrics from design */}
			<div className={styles.statsGrid || 'statsGrid'} data-testid="stats-grid">
				{/* Epics */}
				<div>
					<div className={styles.statLabel || 'statLabel'}>Epics</div>
					<div className={styles.statValue || 'statValue'}>
						{Math.floor(metrics.storiesCompleted / 5)}/{Math.floor(metrics.storiesTotal / 5)}
					</div>
				</div>

				{/* Stories */}
				<div>
					<div className={styles.statLabel || 'statLabel'}>Stories</div>
					<div className={styles.statValue || 'statValue'}>
						{metrics.storiesCompleted}/{metrics.storiesTotal}
					</div>
					<span className={styles['sr-only'] || 'sr-only'}>
						{metrics.storiesCompleted} of {metrics.storiesTotal} stories completed
					</span>
				</div>

				{/* Coverage */}
				<div>
					<div className={styles.statLabel || 'statLabel'}>Coverage</div>
					<div className={styles.statValue || 'statValue'}>
						{metrics.codeCoverage}%
					</div>
				</div>

				{/* BDD */}
				<div>
					<div className={styles.statLabel || 'statLabel'}>BDD</div>
					<div className={styles.statValue || 'statValue'}>
						{metrics.bddCoverage}%
					</div>
				</div>

				{/* PASS */}
				<div>
					<div className={styles.statLabel || 'statLabel'}>PASS</div>
					<div className={styles.statValue || 'statValue'}>
						{Math.round((metrics.testsPassing / Math.max(metrics.testsTotal, 1)) * 100)}%
					</div>
				</div>

				{/* Tests */}
				<div>
					<div className={styles.statLabel || 'statLabel'}>Tests</div>
					<div className={styles.statValue || 'statValue'}>
						{metrics.testsPassing}/{metrics.testsTotal}
					</div>
				</div>
			</div>

			{/* PRU Efficiency Display (AC8) */}
			{metrics.pruEfficiency !== undefined && (
				<div className={styles.pruEfficiency || 'pruEfficiency'} data-testid="pru-efficiency">
					<span role="img" aria-label="lightning">⚡</span>
					<span className={styles.pruValue || 'pruValue'} data-testid="pru-value">
						{metrics.pruEfficiency}%
					</span>
				</div>
			)}
		</div>
	);
}
