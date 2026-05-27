/**
 * Framework Configuration Service Tests
 * Layer 2: Service Tests
 */

import * as fs from 'fs';
import * as path from 'path';
import { FrameworkConfigService } from './frameworkConfigService';
import {
	getDefaultFrameworkConfig,
	getDefaultPRUMetrics,
} from './frameworkConfigTypes';

// Mock fs module at the top level
jest.mock('fs');

// Mock VS Code APIs
jest.mock('vscode', () => ({
	OutputChannel: jest.fn().mockImplementation(() => ({
		appendLine: jest.fn(),
		dispose: jest.fn(),
	})),
	RelativePattern: jest.fn().mockImplementation((base, pattern) => ({
		base,
		pattern,
	})),
	workspace: {
		createFileSystemWatcher: jest.fn().mockReturnValue({
			onDidChange: jest.fn(),
			onDidCreate: jest.fn(),
			dispose: jest.fn(),
		}),
	},
}), { virtual: true });

describe('FrameworkConfigService', () => {
	let service: FrameworkConfigService;
	let mockWorkspaceRoot: string;
	let mockOutputChannel: any;

	beforeEach(() => {
		mockWorkspaceRoot = '/mock/workspace';
		mockOutputChannel = {
			appendLine: jest.fn(),
			dispose: jest.fn(),
		};
		
		// Setup default fs mocks
		(fs.existsSync as jest.Mock).mockReturnValue(false);
		(fs.readFileSync as jest.Mock).mockReturnValue('');
		(fs.readdirSync as jest.Mock).mockReturnValue([]);
		
		service = new FrameworkConfigService(mockWorkspaceRoot, mockOutputChannel);
	});

	afterEach(() => {
		service.dispose();
		jest.restoreAllMocks(); // Restore all spies instead of just clearing
	});

	describe('initialization', () => {
		it('should initialize with default config when framework-config.mjs missing', async () => {
			(fs.existsSync as jest.Mock).mockReturnValue(false);
			
			await service.initialize();
			
			const message = service.getMessage();
			expect(message.config).toEqual(getDefaultFrameworkConfig());
			expect(message.pruMetrics.currentConsumption).toBe(0);
		});

		it('should parse framework-config.mjs when present', async () => {
			const mockConfig = `
				export default {
					tddMode: true,
					bddMode: true,
					dddMode: false,
					grillMeMode: false,
					cavemanMode: true,
				};
			`;
			
			(fs.existsSync as jest.Mock).mockReturnValue(true);
			(fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);
			
			await service.initialize();
			
			const message = service.getMessage();
			expect(message.config.tddMode).toBe(true);
			expect(message.config.bddMode).toBe(true);
			expect(message.config.dddMode).toBe(false);
			expect(message.config.cavemanMode).toBe(true);
			expect(message.config.approvalMode).toBe(false); // Auto-calculated (TDD/BDD enabled)
		});

		it.skip('should calculate PRU metrics from logs/', async () => {
			const mockLogs = `
## 2026-05-26T10:00:00Z | Action: Create implementation plan | Status: success

- **PRU**: ~500

## 2026-05-26T10:15:00Z | Action: Write failing test | Status: success

- **PRU**: ~300
			`;
			
			(fs.existsSync as jest.Mock).mockReturnValue(true); // Simplified - just return true for all paths
			
			(fs.readdirSync as jest.Mock).mockReturnValue([
				{ name: 'agent-dev-lead-20260526.md', isDirectory: () => false } as any
			]);
			
			(fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
				if (filePath.includes('logs') && filePath.includes('.md')) {
					return mockLogs;
				}
				// Return valid (empty) JS config for framework-config.mjs
				return 'export default {}';
			});
			
			await service.initialize();
			
			const message = service.getMessage();
			expect(message.pruMetrics.currentConsumption).toBe(800); // 500 + 300
			expect(message.pruMetrics.estimatedCompletion).toBeGreaterThan(0);
		});
	});

	describe('getMessage', () => {
		it('should return framework config message', () => {
			const message = service.getMessage();
			
			expect(message.type).toBe('framework.config');
			expect(message.config).toBeDefined();
			expect(message.pruMetrics).toBeDefined();
		});
	});

	describe('startMonitoring', () => {
		it('should send initial message to callback', async () => {
			const callback = jest.fn();
			
			(fs.existsSync as jest.Mock).mockReturnValue(false);
			await service.initialize();
			
			service.startMonitoring(callback);
			
			expect(callback).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'framework.config',
					config: expect.any(Object),
					pruMetrics: expect.any(Object),
				})
			);
		});
	});

	describe('dispose', () => {
		it('should clean up resources', () => {
			service.dispose();
			
			expect(mockOutputChannel.dispose).not.toHaveBeenCalled(); // Service doesn't own the channel
		});
	});

	describe('YOLO mode detection', () => {
		it('should enable approvalMode when TDD/BDD/DDD all false', async () => {
			const mockConfig = `
				export default {
					tddMode: false,
					bddMode: false,
					dddMode: false,
					grillMeMode: true,
				};
			`;
			
			(fs.existsSync as jest.Mock).mockReturnValue(true);
			(fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);
			
			await service.initialize();
			
			const message = service.getMessage();
			expect(message.config.approvalMode).toBe(true); // YOLO mode
			expect(message.config.grillMeMode).toBe(true);
		});
	});

	describe('PRU calculation patterns', () => {
		it.skip('should sum PRU from multiple log entries', async () => {
			const mockLogs = `
## Entry 1
- **PRU**: ~1500

## Entry 2
- **PRU**: ~2300

## Entry 3
- **PRU**: ~800
			`;
			
			(fs.existsSync as jest.Mock).mockReturnValue(true); // Simplified - just return true for all paths
			
			(fs.readdirSync as jest.Mock).mockReturnValue([
				{ name: 'agent-log.md', isDirectory: () => false } as any
			]);
			
			(fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
				if (filePath.includes('logs') && filePath.includes('.md')) {
					return mockLogs;
				}
				// Return valid (empty) JS config for framework-config.mjs
				return 'export default {}';
			});
			
			await service.initialize();
			
			const message = service.getMessage();
			expect(message.pruMetrics.currentConsumption).toBe(4600); // 1500 + 2300 + 800
		});

		it('should handle logs with no PRU entries', async () => {
			const mockLogs = `
## Entry 1
- **Status**: success
- **Files**: [test.ts]
			`;
			
			(fs.existsSync as jest.Mock).mockReturnValue(true); // Simplified - just return true for all paths
			
			(fs.readdirSync as jest.Mock).mockReturnValue([
				{ name: 'agent-log.md', isDirectory: () => false } as any
			]);
			
			(fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
				if (filePath.includes('logs') && filePath.includes('.md')) {
					return mockLogs;
				}
				// Return valid (empty) JS config for framework-config.mjs
				return 'export default {}';
			});
			
			await service.initialize();
			
			const message = service.getMessage();
			expect(message.pruMetrics.currentConsumption).toBe(0);
		});
	});
});
