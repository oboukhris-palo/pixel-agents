/**
 * useCompleteness Hook
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 * 
 * React hook for consuming completeness metrics from backend.
 */

import { useState, useEffect } from 'react';
import { ProjectMetrics, getDefaultProjectMetrics } from '../../../src/completenessTypes';
import { useExtensionMessages } from './useExtensionMessages';

interface CompletenessMetricsMessage {
	type: 'CompletenessMetricsMessage';
	metrics: ProjectMetrics;
	timestamp: string;
}

/**
 * Custom hook for completeness metrics
 * 
 * @returns Current project metrics state
 * 
 * @example
 * ```typescript
 * function CompletenessMeter() {
 *   const metrics = useCompleteness();
 *   
 *   return (
 *     <div>
 *       <progress value={metrics.completionPercentage} max={100} />
 *       <span>{metrics.completionPercentage}%</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCompleteness(): ProjectMetrics {
	const [metrics, setMetrics] = useState<ProjectMetrics>(getDefaultProjectMetrics());

	// Subscribe to backend messages
	useExtensionMessages<CompletenessMetricsMessage>((message) => {
		if (message.type === 'CompletenessMetricsMessage') {
			setMetrics(message.metrics);
		}
	});

	return metrics;
}
