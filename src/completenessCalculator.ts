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
	 * Calculate project metrics by parsing user-stories.md
	 * 
	 * @returns ProjectMetrics with calculated completion percentage
	 */
	async calculateMetrics(): Promise<ProjectMetrics> {
		try {
			const stories = await this.parseUserStoriesFile();
			const metrics = this.calculateStoriesMetrics(stories);
			
			this.currentMetrics = metrics;
			return metrics;
		} catch (error) {
			this.log(`Error calculating metrics: ${error}`);
			return getDefaultProjectMetrics();
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

		// Pattern: **Status**: Not Started | In Progress | Implemented | Delivered
		const statusPattern = /\*\*Status\*\*:\s*(Not Started|In Progress|Implemented|Delivered)/;

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
