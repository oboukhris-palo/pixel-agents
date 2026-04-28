/**
 * Completeness Calculator Service
 * Layer 2: Backend Service
 * Story: US-002-002 - Completeness Meter with Project Progress Tracking
 * 
 * This service parses /docs/05-implementation/user-stories.md and calculates real-time project metrics.
 */

import * as vscode from 'vscode';
import { ProjectMetrics, getDefaultProjectMetrics, calculateCompletionPercentage } from './completenessTypes';

/**
 * Story status extracted from user-stories.md
 */
interface StoryStatus {
	storyRef: string;
	status: 'Not Started' | 'In Progress' | 'Implemented' | 'Delivered';
}

/**
 * Completeness Calculator Service
 * 
 * Parses user-stories.md and calculates project completion metrics.
 * Supports file watching for real-time updates.
 * 
 * @example
 * ```typescript
 * const calculator = new CompletenessCalculator(workspaceRoot);
 * const metrics = await calculator.calculateMetrics();
 * console.log(`Project completion: ${metrics.completionPercentage}%`);
 * ```
 */
export class CompletenessCalculator {
	private currentMetrics: ProjectMetrics | null = null;
	private fileWatcher: vscode.FileSystemWatcher | null = null;
	private outputChannel?: vscode.OutputChannel;
	private debounceTimer: NodeJS.Timeout | null = null;
	private readonly DEBOUNCE_MS = 500;

	constructor(
		private workspaceRoot: vscode.Uri,
		outputChannel?: vscode.OutputChannel
	) {
		this.outputChannel = outputChannel;
	}

	/**
	 * Calculate project metrics by parsing user-stories.md, counting test files,
	 * and reading coverage from lcov.info.
	 * 
	 * @returns ProjectMetrics with calculated completion percentage
	 */
	async calculateMetrics(): Promise<ProjectMetrics> {
		try {
			const [stories, testsTotal, coverageInfo, bddCoverage] = await Promise.all([
				this.parseUserStoriesFile(),
				this.countTestFiles(),
				this.readCoverageFromLcov(),
				this.calculateBddCoverage(),
			]);
			const metrics = this.calculateStoriesMetrics(stories);
			metrics.testsTotal = testsTotal;
			metrics.testsPassing = testsTotal;
			metrics.codeCoverage = coverageInfo.coverage;
			metrics.linesOfCode = coverageInfo.totalLines;
			metrics.bddCoverage = bddCoverage;
			this.currentMetrics = metrics;
			return metrics;
		} catch (error) {
			this.log(`Error calculating metrics: ${error}`);
			return getDefaultProjectMetrics();
		}
	}

	/**
	 * Count test files in the workspace
	 * 
	 * @returns number of test files found
	 * @private
	 */
	private async countTestFiles(): Promise<number> {
		try {
			const testPattern = new vscode.RelativePattern(this.workspaceRoot, '**/*.test.{ts,tsx}');
			const testFiles = await vscode.workspace.findFiles(testPattern, '**/node_modules/**');
			return testFiles.length;
		} catch (error) {
			this.log(`Error counting test files: ${error}`);
			return 0;
		}
	}

	/**
	 * Read coverage percentage and line count from coverage/lcov.info
	 * 
	 * @returns coverage % and total instrumented lines
	 * @private
	 */
	private async readCoverageFromLcov(): Promise<{ coverage: number; totalLines: number }> {
		try {
			const lcovPath = vscode.Uri.joinPath(this.workspaceRoot, 'coverage', 'lcov.info');
			const content = await vscode.workspace.fs.readFile(lcovPath);
			const text = Buffer.from(content).toString('utf-8');
			let linesFound = 0;
			let linesHit = 0;
			for (const line of text.split('\n')) {
				if (line.startsWith('LF:')) {
					linesFound += parseInt(line.substring(3), 10) || 0;
				} else if (line.startsWith('LH:')) {
					linesHit += parseInt(line.substring(3), 10) || 0;
				}
			}
			const coverage = linesFound > 0 ? Math.round((linesHit / linesFound) * 100) : 0;
			return { coverage, totalLines: linesFound };
		} catch (error) {
			this.log(`Coverage file not available: ${error}`);
			return { coverage: 0, totalLines: 0 };
		}
	}

	/**
	 * Parse user-stories.md file and extract story statuses
	 * 
	 * @returns Array of story status objects
	 * @private
	 */
	private async parseUserStoriesFile(): Promise<StoryStatus[]> {
		try {
			const userStoriesPath = vscode.Uri.joinPath(
				this.workspaceRoot,
				'docs',
				'05-implementation',
				'user-stories.md'
			);

			const content = await vscode.workspace.fs.readFile(userStoriesPath);
			const text = Buffer.from(content).toString('utf-8');

			return this.extractStoryStatuses(text);
		} catch (error) {
			this.log(`Error reading user-stories.md: ${error}`);
			return [];
		}
	}

	/**
	 * Extract story statuses from markdown text
	 * 
	 * @param text - Markdown content
	 * @returns Array of story statuses
	 * @private
	 */
	private extractStoryStatuses(text: string): StoryStatus[] {
		const stories: StoryStatus[] = [];
		const lines = text.split('\n');

		// Pattern: **Status**: [optional emoji] Not Started | In Progress | Implemented | Delivered
		// Handles emoji prefixes like: ✅ Delivered, 🔵 Not Started, 🟡 In Progress, 🟢 Implemented
		const statusPattern = /\*\*Status\*\*:\s*[^a-zA-Z]*(Not Started|In Progress|Implemented|Delivered)/;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			const match = line.match(statusPattern);

			if (match) {
				const status = match[1] as StoryStatus['status'];
				
				// Look backwards for story reference (### US-XXX-XXX: Title)
				let storyRef = `US-${stories.length + 1}`;
				for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
					const prevLine = lines[j].trim();
					const storyMatch = prevLine.match(/###\s+(US-\d+-\d+):/);
					if (storyMatch) {
						storyRef = storyMatch[1];
						break;
					}
				}

				stories.push({ storyRef, status });
			}
		}

		return stories;
	}

	/**
	 * Count BDD feature files in docs/05-implementation/
	 * 
	 * @returns number of BDD feature files
	 * @private
	 */
	private async countBddFeatures(): Promise<number> {
		try {
			const pattern = new vscode.RelativePattern(
				vscode.Uri.joinPath(this.workspaceRoot, 'docs', '05-implementation'),
				'**/*.feature'
			);
			const featureFiles = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
			return featureFiles.length;
		} catch (error) {
			this.log(`Error counting BDD features: ${error}`);
			return 0;
		}
	}

	/**
	 * Calculate BDD coverage: percentage of user stories that have at least one .feature file.
	 * Only counts feature files under docs/05-implementation/epics/{EPIC}/user-stories/{US-REF}/features/
	 * to avoid counting shared test scenarios in docs/03-testing/.
	 * 
	 * @returns BDD coverage percentage (0-100)
	 * @private
	 */
	private async calculateBddCoverage(): Promise<number> {
		try {
			// Only count feature files that belong to specific user story folders
			const featurePattern = new vscode.RelativePattern(
				this.workspaceRoot,
				'docs/05-implementation/epics/*/user-stories/*/features/*.feature'
			);
			const featureFiles = await vscode.workspace.findFiles(featurePattern, '**/node_modules/**');

			if (featureFiles.length === 0) {
				this.log('BDD Coverage: No feature files found in user story folders, returning 0%');
				return 0;
			}

			// Count unique user story folders (each folder = 1 story with BDD coverage)
			const storyFolders = new Set<string>();
			for (const file of featureFiles) {
				// Path: .../user-stories/{US-REF}/features/{file}.feature
				// Extract the story folder (parent of 'features/')
				const parts = file.fsPath.split(/[\\/]/);
				const featuresIdx = parts.lastIndexOf('features');
				if (featuresIdx > 0) {
					const storyPath = parts.slice(0, featuresIdx).join('/');
					storyFolders.add(storyPath);
				}
			}

			const storiesWithFeatures = storyFolders.size;
			const allStories = await this.parseUserStoriesFile();
			const totalStories = allStories.length;

			if (totalStories === 0) { return 0; }

			const coverage = Math.round((storiesWithFeatures / totalStories) * 100);
			this.log(`BDD Coverage: ${storiesWithFeatures} stories with features / ${totalStories} total = ${coverage}%`);
			return Math.min(coverage, 100);
		} catch (error) {
			this.log(`Error calculating BDD coverage: ${error}`);
			return 0;
		}
	}

	/**
	 * Calculate metrics from story statuses
	 * 
	 * @param stories - Array of story statuses
	 * @returns Partial ProjectMetrics
	 * @private
	 */
	private calculateStoriesMetrics(stories: StoryStatus[]): ProjectMetrics {
		const storiesTotal = stories.length;
		const storiesCompleted = stories.filter(
			s => s.status === 'Delivered' || s.status === 'Implemented'
		).length;

		const metrics: ProjectMetrics = {
			...getDefaultProjectMetrics(),
			storiesTotal,
			storiesCompleted,
			completionPercentage: 0
		};

		// Calculate completion percentage
		metrics.completionPercentage = calculateCompletionPercentage(metrics);

		return metrics;
	}

	/**
	 * Start monitoring user-stories.md for changes
	 * 
	 * @param callback - Function to call when metrics update
	 */
	startMonitoring(callback: (metrics: ProjectMetrics) => void): void {
		// Initial calculation
		this.calculateMetrics().then(callback).catch(error => {
			this.log(`Error in initial calculation: ${error}`);
		});

		// Watch for file changes
		const pattern = new vscode.RelativePattern(
			this.workspaceRoot,
			'docs/05-implementation/user-stories.md'
		);

		this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

		const debouncedCalculate = () => {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}

			this.debounceTimer = setTimeout(() => {
				this.calculateMetrics()
					.then(callback)
					.catch(error => {
						this.log(`Error in debounced calculation: ${error}`);
					});
			}, this.DEBOUNCE_MS);
		};

		this.fileWatcher.onDidChange(debouncedCalculate);
		this.fileWatcher.onDidCreate(debouncedCalculate);
	}

	/**
	 * Stop monitoring file changes
	 */
	stopMonitoring(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		if (this.fileWatcher) {
			this.fileWatcher.dispose();
			this.fileWatcher = null;
		}
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this.stopMonitoring();
	}

	/**
	 * Log message to output channel
	 * 
	 * @param message - Message to log
	 * @private
	 */
	private log(message: string): void {
		if (this.outputChannel) {
			this.outputChannel.appendLine(`[CompletenessCalculator] ${message}`);
		}
	}
}
