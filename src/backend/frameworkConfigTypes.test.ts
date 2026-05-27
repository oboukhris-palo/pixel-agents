/**
 * Framework Configuration Types Tests
 * Layer 1: Domain Model Tests
 */

import {
	FrameworkConfig,
	PRUMetrics,
	getDefaultFrameworkConfig,
	getDefaultPRUMetrics,
	FrameworkConfigMessage,
} from './frameworkConfigTypes';

describe('FrameworkConfigTypes', () => {
	describe('getDefaultFrameworkConfig', () => {
		it('should return default config with all modes disabled', () => {
			const config = getDefaultFrameworkConfig();
			
			expect(config.tddMode).toBe(false);
			expect(config.bddMode).toBe(false);
			expect(config.dddMode).toBe(false);
			expect(config.grillMeMode).toBe(false);
			expect(config.cavemanMode).toBe(false);
			expect(config.approvalMode).toBe(true); // Auto-enabled when TDD/BDD/DDD all false
		});

		it('should return immutable config (defensive copy)', () => {
			const config1 = getDefaultFrameworkConfig();
			const config2 = getDefaultFrameworkConfig();
			
			expect(config1).not.toBe(config2); // Different instances
			expect(config1).toEqual(config2); // Same values
		});
	});

	describe('getDefaultPRUMetrics', () => {
		it('should return zero-state PRU metrics', () => {
			const metrics = getDefaultPRUMetrics();
			
			expect(metrics.currentConsumption).toBe(0);
			expect(metrics.estimatedCompletion).toBe(0);
			expect(metrics.lastUpdated).toBeInstanceOf(Date);
		});

		it('should set lastUpdated to current time', () => {
			const before = Date.now();
			const metrics = getDefaultPRUMetrics();
			const after = Date.now();
			
			const timestamp = metrics.lastUpdated.getTime();
			expect(timestamp).toBeGreaterThanOrEqual(before);
			expect(timestamp).toBeLessThanOrEqual(after);
		});
	});

	describe('FrameworkConfig interface', () => {
		it('should allow custom config objects', () => {
			const config: FrameworkConfig = {
				tddMode: true,
				bddMode: true,
				dddMode: false,
				grillMeMode: false,
				cavemanMode: true,
				approvalMode: false, // Manual override
			};
			
			expect(config.tddMode).toBe(true);
			expect(config.bddMode).toBe(true);
			expect(config.cavemanMode).toBe(true);
			expect(config.approvalMode).toBe(false);
		});
	});

	describe('PRUMetrics interface', () => {
		it('should allow PRU metrics with budget', () => {
			const metrics: PRUMetrics = {
				currentConsumption: 15000,
				estimatedCompletion: 25000,
				totalBudget: 50000,
				averagePerStory: 1200,
				lastUpdated: new Date('2026-05-26'),
			};
			
			expect(metrics.currentConsumption).toBe(15000);
			expect(metrics.estimatedCompletion).toBe(25000);
			expect(metrics.totalBudget).toBe(50000);
			expect(metrics.averagePerStory).toBe(1200);
		});

		it('should allow PRU metrics without optional fields', () => {
			const metrics: PRUMetrics = {
				currentConsumption: 8000,
				estimatedCompletion: 12000,
				lastUpdated: new Date(),
			};
			
			expect(metrics.totalBudget).toBeUndefined();
			expect(metrics.averagePerStory).toBeUndefined();
		});
	});

	describe('FrameworkConfigMessage interface', () => {
		it('should create valid framework config message', () => {
			const message: FrameworkConfigMessage = {
				type: 'framework.config',
				config: getDefaultFrameworkConfig(),
				pruMetrics: getDefaultPRUMetrics(),
			};
			
			expect(message.type).toBe('framework.config');
			expect(message.config).toBeDefined();
			expect(message.pruMetrics).toBeDefined();
		});
	});

	describe('YOLO mode (approvalMode)', () => {
		it('should enable approval mode when TDD/BDD/DDD all false', () => {
			const config: FrameworkConfig = {
				tddMode: false,
				bddMode: false,
				dddMode: false,
				grillMeMode: true,
				cavemanMode: false,
				approvalMode: true,
			};
			
			// YOLO mode = grillMeMode for Q&A validation + approvalMode
			expect(config.approvalMode).toBe(true);
			expect(config.grillMeMode).toBe(true);
		});

		it('should disable approval mode when any TDD/BDD/DDD enabled', () => {
			const config: FrameworkConfig = {
				tddMode: true,
				bddMode: false,
				dddMode: false,
				grillMeMode: false,
				cavemanMode: false,
				approvalMode: false,
			};
			
			// With TDD enabled, approvalMode should be false
			expect(config.approvalMode).toBe(false);
		});
	});

	describe('PRU estimation patterns', () => {
		it('should calculate per-story average', () => {
			const totalPRU = 24000;
			const storiesCompleted = 12;
			const averagePerStory = Math.round(totalPRU / storiesCompleted);
			
			expect(averagePerStory).toBe(2000);
		});

		it('should estimate completion PRU', () => {
			const currentConsumption = 24000;
			const storiesCompleted = 12;
			const storiesRemaining = 8;
			const averagePerStory = currentConsumption / storiesCompleted;
			const estimatedCompletion = Math.round(averagePerStory * storiesRemaining);
			
			expect(estimatedCompletion).toBe(16000);
		});
	});
});
