/**
 * useCompleteness Hook
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 * 
 * React hook for consuming completeness metrics from backend.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ProjectMetrics } from '../../../backend/completenessTypes';
import { getDefaultProjectMetrics } from '../../../backend/completenessTypes';

interface CompletenessUpdateMessage {
	type: 'completeness.update';
	metrics: ProjectMetrics;
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

	const handleMessage = useCallback((event: MessageEvent) => {
		const message = event.data;
		if (message.type === 'completeness.update') {
			const msg = message as CompletenessUpdateMessage;
			setMetrics(msg.metrics);
		}
	}, []);

	useEffect(() => {
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [handleMessage]);

	return metrics;
}
