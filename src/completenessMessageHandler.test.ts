/**
 * Tests for Completeness Message Handler
 * Layer 3: Message Protocol Integration
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 */

import { CompletenessMessageHandler } from './completenessMessageHandler';
import { ProjectMetrics } from './completenessTypes';
import * as vscode from 'vscode';

// Mock vscode
jest.mock('vscode', () => ({
	Uri: {
		file: jest.fn((path: string) => ({ fsPath: path, path }))
	},
	window: {
		createOutputChannel: jest.fn(() => ({
			appendLine: jest.fn(),
			dispose: jest.fn()
		}))
	}
}));

// Mock CompletenessCalculator
jest.mock('./completenessCalculator', () => {
	return {
		CompletenessCalculator: jest.fn().mockImplementation(() => ({
			calculateMetrics: jest.fn(),
			startMonitoring: jest.fn(),
			stopMonitoring: jest.fn(),
			dispose: jest.fn()
		}))
	};
});

describe('CompletenessMessageHandler', () => {
	let handler: CompletenessMessageHandler;
	let mockPostMessage: jest.Mock;
	const mockWorkspaceRoot = vscode.Uri.file('/test/workspace');

	beforeEach(() => {
		jest.clearAllMocks();
		mockPostMessage = jest.fn();
		handler = new CompletenessMessageHandler(
			mockWorkspaceRoot,
			mockPostMessage
		);
	});

	afterEach(() => {
		handler.dispose();
	});

	describe('startMonitoring', () => {
		it('should send initial metrics to webview', async () => {
			const mockMetrics: ProjectMetrics = {
				completionPercentage: 50,
				storiesTotal: 10,
				storiesCompleted: 5,
				testsTotal: 100,
				testsPassing: 85,
				codeCoverage: 82,
			bddCoverage: 0,
				linesOfCode: 5000,
				milestones: []
			};

			const { CompletenessCalculator } = require('./completenessCalculator');
			const mockCalculator = CompletenessCalculator.mock.results[0].value;
			mockCalculator.calculateMetrics.mockResolvedValue(mockMetrics);

			handler.startMonitoring();

			// Wait for async operation
			await new Promise(resolve => setTimeout(resolve, 50));

			expect(mockCalculator.startMonitoring).toHaveBeenCalled();
		});
	});

	describe('stopMonitoring', () => {
		it('should stop calculator monitoring', () => {
			handler.startMonitoring();
			handler.stopMonitoring();

			const { CompletenessCalculator } = require('./completenessCalculator');
			const mockCalculator = CompletenessCalculator.mock.results[0].value;
			expect(mockCalculator.stopMonitoring).toHaveBeenCalled();
		});
	});

	describe('dispose', () => {
		it('should dispose calculator and stop monitoring', () => {
			handler.startMonitoring();
			handler.dispose();

			const { CompletenessCalculator } = require('./completenessCalculator');
			const mockCalculator = CompletenessCalculator.mock.results[0].value;
			expect(mockCalculator.dispose).toHaveBeenCalled();
		});
	});

	describe('message broadcasting', () => {
		it('should send CompletenessMetricsMessage to webview', async () => {
			const mockMetrics: ProjectMetrics = {
				completionPercentage: 75,
				storiesTotal: 20,
				storiesCompleted: 15,
				testsTotal: 200,
				testsPassing: 180,
				codeCoverage: 90,
			bddCoverage: 0,
				linesOfCode: 10000,
				milestones: [
					{ threshold: 25, reached: true, celebrated: true, reachedAt: new Date() },
					{ threshold: 50, reached: true, celebrated: true, reachedAt: new Date() }
				]
			};

			const { CompletenessCalculator } = require('./completenessCalculator');
			const mockCalculator = CompletenessCalculator.mock.results[0].value;
			mockCalculator.calculateMetrics.mockResolvedValue(mockMetrics);

			handler.startMonitoring();

			// Wait for async operation and callback
			await new Promise(resolve => setTimeout(resolve, 50));

			// Trigger the monitoring callback manually
			const monitoringCallback = mockCalculator.startMonitoring.mock.calls[0][0];
			monitoringCallback(mockMetrics);

			expect(mockPostMessage).toHaveBeenCalledWith({
				type: 'CompletenessMetricsMessage',
				metrics: mockMetrics,
				timestamp: expect.any(String)
			});
		});
	});
});
