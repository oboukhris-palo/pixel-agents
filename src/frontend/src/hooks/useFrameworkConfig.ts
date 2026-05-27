/**
 * useFrameworkConfig Hook
 * 
 * React hook for consuming framework configuration and PRU metrics from backend.
 * Integrates with gene2-core v2.0.1 framework mode flags.
 */

import { useState, useEffect, useCallback } from 'react';
import type { FrameworkConfig, PRUMetrics } from '../../../backend/frameworkConfigTypes';
import { getDefaultFrameworkConfig, getDefaultPRUMetrics } from '../../../backend/frameworkConfigTypes';

interface FrameworkConfigMessage {
	type: 'framework.config';
	config: FrameworkConfig;
	pruMetrics: PRUMetrics;
}

export interface FrameworkState {
	config: FrameworkConfig;
	pruMetrics: PRUMetrics;
}

/**
 * Custom hook for framework configuration and PRU tracking
 * 
 * @returns Current framework config and PRU metrics
 * 
 * @example
 * ```typescript
 * function ProjectParams() {
 *   const { config, pruMetrics } = useFrameworkConfig();
 *   
 *   return (
 *     <div>
 *       <div>TDD: {config.tddMode ? 'ON' : 'OFF'}</div>
 *       <div>PRU: {pruMetrics.currentConsumption}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFrameworkConfig(): FrameworkState {
	const [state, setState] = useState<FrameworkState>({
		config: getDefaultFrameworkConfig(),
		pruMetrics: getDefaultPRUMetrics(),
	});

	const handleMessage = useCallback((event: MessageEvent) => {
		const message = event.data;
		if (message.type === 'framework.config') {
			const msg = message as FrameworkConfigMessage;
			setState({
				config: msg.config,
				pruMetrics: msg.pruMetrics,
			});
		}
	}, []);

	useEffect(() => {
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [handleMessage]);

	return state;
}
