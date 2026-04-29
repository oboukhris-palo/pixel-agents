/**
 * Tests for Completeness Calculator Service
 * Layer 2: Backend Service
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 */

import * as vscode from 'vscode';
import { CompletenessCalculator } from './completenessCalculator';
import { ProjectMetrics } from './completenessTypes';

// Mock vscode module
jest.mock('vscode', () => ({
	Uri: {
		file: jest.fn((path: string) => ({ fsPath: path, path })),
		joinPath: jest.fn((...paths: any[]) => ({
			fsPath: paths.join('/'),
			path: paths.join('/')
		}))
	},
	workspace: {
		fs: {
			readFile: jest.fn()
		},
		createFileSystemWatcher: jest.fn(() => ({
			onDidChange: jest.fn(),
			onDidCreate: jest.fn(),
			onDidDelete: jest.fn(),
			dispose: jest.fn()
		}))
	},
	RelativePattern: jest.fn((base: any, pattern: string) => ({ base, pattern })),
	FileSystemWatcher: jest.fn(),
	window: {
		createOutputChannel: jest.fn(() => ({
			appendLine: jest.fn(),
			dispose: jest.fn()
		}))
	}
}));

describe('CompletenessCalculator - Service Layer', () => {
	let calculator: CompletenessCalculator;
	const mockWorkspaceRoot = vscode.Uri.file('/test/workspace');

	beforeEach(() => {
		jest.clearAllMocks();
		calculator = new CompletenessCalculator(mockWorkspaceRoot);
	});

	afterEach(() => {
		calculator.dispose();
	});

	describe('calculateMetrics', () => {
		it('should calculate metrics from user-stories.md', async () => {
			const mockContent = `
# User Stories

## Epic Progress
| Epic | Progress |
|------|----------|
| EPIC-001 | 100% |

## EPIC-001

### US-001-001: Task Progression
**Status**: Delivered

### US-001-002: Agent Activity
**Status**: Implemented

## EPIC-002

### US-002-001: Context Window
**Status**: In Progress

### US-002-002: Completeness Meter
**Status**: Not Started
			`.trim();

			(vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(
				Buffer.from(mockContent, 'utf-8')
			);

			const metrics = await calculator.calculateMetrics();

			expect(metrics.storiesTotal).toBe(4);
			expect(metrics.storiesCompleted).toBe(2); // Delivered + Implemented
			expect(metrics.completionPercentage).toBe(50);
		});

		it('should handle empty user-stories.md', async () => {
			(vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(
				Buffer.from('', 'utf-8')
			);

			const metrics = await calculator.calculateMetrics();

			expect(metrics.storiesTotal).toBe(0);
			expect(metrics.storiesCompleted).toBe(0);
			expect(metrics.completionPercentage).toBe(0);
		});

		it('should count only Delivered and Implemented as complete', async () => {
			const mockContent = `
### US-001: Story One
**Status**: Delivered

### US-002: Story Two
**Status**: Implemented

### US-003: Story Three
**Status**: In Progress

### US-004: Story Four
**Status**: Not Started
			`.trim();

			(vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(
				Buffer.from(mockContent, 'utf-8')
			);

			const metrics = await calculator.calculateMetrics();

			expect(metrics.storiesTotal).toBe(4);
			expect(metrics.storiesCompleted).toBe(2);
		});

		it('should handle missing file gracefully', async () => {
			(vscode.workspace.fs.readFile as jest.Mock).mockRejectedValue(
				new Error('File not found')
			);

			const metrics = await calculator.calculateMetrics();

			expect(metrics.storiesTotal).toBe(0);
			expect(metrics.completionPercentage).toBe(0);
		});

		it('should parse malformed markdown gracefully', async () => {
			const mockContent = `
Random text without proper structure
**Status**: Delivered
Some story here
**Status**: Not Started
			`.trim();

			(vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(
				Buffer.from(mockContent, 'utf-8')
			);

			const metrics = await calculator.calculateMetrics();

			// Should still detect status lines
			expect(metrics.storiesTotal).toBe(2);
			expect(metrics.storiesCompleted).toBe(1);
		});
	});

	describe('startMonitoring', () => {
		it('should call callback when metrics calculated', async () => {
			const mockContent = `
### US-001: Test
**Status**: Delivered
			`.trim();

			(vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(
				Buffer.from(mockContent, 'utf-8')
			);

			const callback = jest.fn();
			calculator.startMonitoring(callback);

			// Wait for async calculation
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(callback).toHaveBeenCalled();
			const metrics = callback.mock.calls[0][0] as ProjectMetrics;
			expect(metrics.storiesTotal).toBe(1);
		});
	});

	describe('stopMonitoring', () => {
		it('should stop file watching', () => {
			const callback = jest.fn();
			calculator.startMonitoring(callback);
			calculator.stopMonitoring();

			// Should not throw error
			expect(() => calculator.stopMonitoring()).not.toThrow();
		});
	});

	describe('parseUserStoriesFile', () => {
		it('should extract story status from markdown', async () => {
			const mockContent = `
### US-001-001: Feature A
**Story Points**: 5
**Status**: Delivered
**Assignee**: Dev

### US-001-002: Feature B  
**Status**: In Progress
			`.trim();

			(vscode.workspace.fs.readFile as jest.Mock).mockResolvedValue(
				Buffer.from(mockContent, 'utf-8')
			);

			const metrics = await calculator.calculateMetrics();

			expect(metrics.storiesTotal).toBe(2);
			expect(metrics.storiesCompleted).toBe(1); // Only "Delivered"
		});
	});

        describe('verifyKpiCalculations()', () => {
                it('returns a KpiVerificationReport with allValid true when metrics are valid', async () => {
                        const report = await calculator.verifyKpiCalculations();
                        expect(report).toHaveProperty('steps');
                        expect(report).toHaveProperty('allValid');
                        expect(report).toHaveProperty('metrics');
                        expect(Array.isArray(report.steps)).toBe(true);
                        expect(report.allValid).toBe(true);
                });

                it('includes steps for all key KPIs', async () => {
                        const report = await calculator.verifyKpiCalculations();
                        const names = report.steps.map(s => s.name);
                        expect(names).toContain('storiesTotal');
                        expect(names).toContain('storiesCompleted');
                        expect(names).toContain('testsTotal');
                        expect(names).toContain('testsPassing');
                        expect(names).toContain('codeCoverage');
                        expect(names).toContain('completionPercentage');
                });

                it('logs each calculation step to the output channel', async () => {
                        const mockChannel = { appendLine: jest.fn() } as unknown as vscode.OutputChannel;
                        const calcWithChannel = new CompletenessCalculator(mockWorkspaceRoot, mockChannel);
                        await calcWithChannel.verifyKpiCalculations();
                        expect(mockChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('KPI Verification'));
                        expect(mockChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('storiesTotal'));
                });
        });
});