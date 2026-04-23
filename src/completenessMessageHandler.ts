/**
 * Completeness Message Handler
 * Layer 3: Message Protocol Integration
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 * 
 * This handler manages the backend-to-frontend messaging for completeness metrics.
 */

import * as vscode from 'vscode';
import { CompletenessCalculator } from './completenessCalculator';
import { ProjectMetrics } from './completenessTypes';

/**
 * Message sent from backend to frontend with completeness metrics
 */
export interface CompletenessMetricsMessage {
	type: 'CompletenessMetricsMessage';
	metrics: ProjectMetrics;
	timestamp: string;
}

/**
 * Completeness Message Handler
 * 
 * Coordinates between CompletenessCalculator (backend service) and webview (frontend).
 * Broadcasts metrics updates via postMessage protocol.
 * 
 * @example
 * ```typescript
 * const handler = new CompletenessMessageHandler(
 *   workspaceRoot,
 *   webview.postMessage.bind(webview)
 * );
 * handler.startMonitoring();
 * ```
 */
export class CompletenessMessageHandler {
	private calculator: CompletenessCalculator;
	private isMonitoring: boolean = false;
	private outputChannel?: vscode.OutputChannel;

	constructor(
		private workspaceRoot: vscode.Uri,
		private postMessage: (message: CompletenessMetricsMessage) => void,
		outputChannel?: vscode.OutputChannel
	) {
		this.outputChannel = outputChannel;
		this.calculator = new CompletenessCalculator(workspaceRoot, outputChannel);
	}

	/**
	 * Start monitoring user-stories.md and broadcasting metrics
	 */
	startMonitoring(): void {
		if (this.isMonitoring) {
			this.log('Already monitoring');
			return;
		}

		this.log('Starting completeness monitoring');
		this.isMonitoring = true;

		// Start calculator monitoring with callback
		this.calculator.startMonitoring((metrics: ProjectMetrics) => {
			this.broadcastMetrics(metrics);
		});
	}

	/**
	 * Stop monitoring file changes
	 */
	stopMonitoring(): void {
		if (!this.isMonitoring) {
			return;
		}

		this.log('Stopping completeness monitoring');
		this.isMonitoring = false;
		this.calculator.stopMonitoring();
	}

	/**
	 * Broadcast metrics to webview
	 * 
	 * @param metrics - Project metrics to send
	 * @private
	 */
	private broadcastMetrics(metrics: ProjectMetrics): void {
		const message: CompletenessMetricsMessage = {
			type: 'CompletenessMetricsMessage',
			metrics,
			timestamp: new Date().toISOString()
		};

		this.log(`Broadcasting metrics: ${metrics.completionPercentage}% (${metrics.storiesCompleted}/${metrics.storiesTotal})`);
		this.postMessage(message);
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this.stopMonitoring();
		this.calculator.dispose();
	}

	/**
	 * Log message to output channel
	 * 
	 * @param message - Message to log
	 * @private
	 */
	private log(message: string): void {
		if (this.outputChannel) {
			this.outputChannel.appendLine(`[CompletenessMessageHandler] ${message}`);
		}
	}
}
