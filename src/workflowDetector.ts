import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { WorkflowState } from './types.js';

/**
 * Detects workflow state by parsing documentation files in /docs/
 * 
 * Workflow detection strategy:
 * 1. Check /docs/01-requirements/, /docs/02-architecture/, /docs/03-testing/, /docs/04-planning/ for PDLC completion
 * 2. Check /docs/05-implementation/user-stories.md for implementation status
 * 3. Check /docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/ for story progress
 * 4. Check /docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md for TDD phase
 * 5. Check /docs/05-implementation/current-sprint.md for active sprint
 */
export class WorkflowDetector {
	private workspaceRoot: string;
	private lastState: WorkflowState | null = null;
	private fileWatcher: vscode.FileSystemWatcher | null = null;

	constructor(workspaceRoot: string) {
		this.workspaceRoot = workspaceRoot;
	}

	/**
	 * Start watching docs folder for changes
	 */
	public startWatching(callback: (state: WorkflowState) => void): vscode.Disposable {
		// Initial detection
		const initialState = this.detectWorkflowState();
		if (initialState) {
			callback(initialState);
		}

		// Watch docs folder for changes
		this.fileWatcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(this.workspaceRoot, 'docs/**/*.{md,yml,yaml}')
		);

		this.fileWatcher.onDidCreate(() => {
			const state = this.detectWorkflowState();
			if (state && JSON.stringify(state) !== JSON.stringify(this.lastState)) {
				callback(state);
			}
		});

		this.fileWatcher.onDidChange(() => {
			const state = this.detectWorkflowState();
			if (state && JSON.stringify(state) !== JSON.stringify(this.lastState)) {
				callback(state);
			}
		});

		this.fileWatcher.onDidDelete(() => {
			const state = this.detectWorkflowState();
			if (state && JSON.stringify(state) !== JSON.stringify(this.lastState)) {
				callback(state);
			}
		});

		return {
			dispose: () => {
				this.fileWatcher?.dispose();
			}
		};
	}

	/**
	 * Detect current workflow state by parsing documentation files
	 */
	public detectWorkflowState(): WorkflowState | null {
		const docsPath = path.join(this.workspaceRoot, 'docs');
		
		if (!fs.existsSync(docsPath)) {
			return null;
		}

		const state: WorkflowState = {
			workflow: 'None',
			lastUpdate: Date.now()
		};

		// Step 1: Check PDLC stage completion (PRD documents)
		const pdlcStage = this.detectPDLCStage();
		if (pdlcStage) {
			state.workflow = 'PDLC';
			state.pdlcStage = pdlcStage.stage;
			state.pdlcTotal = pdlcStage.total;
			state.pdlcProgress = pdlcStage.progress;
			state.activeDocuments = pdlcStage.activeDocuments;
			state.prdDocuments = pdlcStage.prdDocuments as any;
			state.maturityScore = pdlcStage.maturityScore;
			state.missingDocuments = pdlcStage.missingDocuments;
			state.readyForImplementation = pdlcStage.readyForImplementation;
		}

		// Step 2: Check implementation status (user stories)
		const implementationStatus = this.detectImplementationStatus();
		if (implementationStatus) {
			// If we have active implementation, override workflow type
			if (implementationStatus.activeUserStory) {
				state.workflow = 'Implementation';
			}
			state.totalStories = implementationStatus.totalStories;
			state.completedStories = implementationStatus.completedStories;
			state.projectCompletion = implementationStatus.projectCompletion;
			state.activeUserStory = implementationStatus.activeUserStory;
			state.epicProgress = implementationStatus.epicProgress;
		}

		// Step 3: Check TDD phase (handoff files)
		const tddPhase = this.detectTDDPhase();
		if (tddPhase) {
			state.implementationPhase = tddPhase.phase;
			state.activeTddLayer = tddPhase.layer;
			state.activeUserStory = state.activeUserStory || tddPhase.userStory;
			state.activeDocuments = state.activeDocuments || tddPhase.activeDocuments;
		}

		// Step 4: Check current sprint
		const sprintInfo = this.detectCurrentSprint();
		if (sprintInfo) {
			state.currentSprint = sprintInfo.sprintName;
		}

		this.lastState = state;
		return state;
	}

	/**
	 * Detect PDLC stage by checking phase documents in /docs/01-requirements/ through /docs/04-planning/
	 */
	private detectPDLCStage(): { 
		stage: number; 
		total: number; 
		progress: number; 
		activeDocuments: string[];
		prdDocuments: Record<string, boolean>;
		maturityScore: number;
		missingDocuments: string[];
		readyForImplementation: boolean;
	} | null {
		const phasePaths = [
			{ phase: 1, path: path.join(this.workspaceRoot, 'docs', '01-requirements') },
			{ phase: 2, path: path.join(this.workspaceRoot, 'docs', '02-architecture') },
			{ phase: 3, path: path.join(this.workspaceRoot, 'docs', '03-testing') },
			{ phase: 4, path: path.join(this.workspaceRoot, 'docs', '04-planning') }
		];
		
		if (!phasePaths.some(p => fs.existsSync(p.path))) {
			return null;
		}

		// Expected PRD documents (PDLC Phases 1-4)
		const expectedDocs = [
			'requirements.md',       // Phase 1-2: Requirements Definition
			'personas.md',           // Phase 1-2: User Research
			'architecture-design.md',// Phase 3-4: Architecture & Design
			'user-stories.md',       // Phase 1-2: Feature Specification
			'tech-spec.md',          // Phase 3-4: Technical Specifications
			'test-strategies.md',    // Phase 5: Testing Strategy
			'deployment-plan.md',    // Phase 6-7: Deployment Planning
			'release-notes.md'       // Phase 8: Release Documentation
		];

		const foundDocs: string[] = [];
		const activeDocuments: string[] = [];
		const prdDocuments: Record<string, boolean> = {};
		const missingDocuments: string[] = [];

		for (const doc of expectedDocs) {
			const docKey = doc.replace('.md', '');
			let found = false;

			for (const phaseInfo of phasePaths) {
				const docPath = path.join(phaseInfo.path, doc);
				if (fs.existsSync(docPath)) {
					foundDocs.push(doc);
					prdDocuments[docKey] = true;
					found = true;
					
					// Check if document is incomplete (contains TODO or TBD)
					const content = fs.readFileSync(docPath, 'utf-8');
					if (content.includes('[TODO]') || content.includes('[TBD]') || content.includes('# TODO')) {
						activeDocuments.push(docKey);
					}
					break;
				}
			}

			if (!found) {
				prdDocuments[docKey] = false;
				missingDocuments.push(docKey);
			}
		}

		const progress = Math.round((foundDocs.length / expectedDocs.length) * 100);
		const stage = Math.min(Math.ceil((foundDocs.length / expectedDocs.length) * 8), 8);
		
		// Calculate maturity score (considering document completeness)
		// Weight: Core docs (requirements, personas, architecture, user-stories) = 60%
		//         Tech docs (tech-spec, test-strategies) = 25%
		//         Release docs (deployment-plan, release-notes) = 15%
		const coreDocsWeight = 0.6;
		const techDocsWeight = 0.25;
		const releaseDocsWeight = 0.15;
		
		const coreDocs = ['requirements', 'personas', 'architecture-design', 'user-stories'];
		const techDocs = ['tech-spec', 'test-strategies'];
		const releaseDocs = ['deployment-plan', 'release-notes'];
		
		const coreComplete = coreDocs.filter(d => prdDocuments[d]).length / coreDocs.length;
		const techComplete = techDocs.filter(d => prdDocuments[d]).length / techDocs.length;
		const releaseComplete = releaseDocs.filter(d => prdDocuments[d]).length / releaseDocs.length;
		
		const maturityScore = Math.round(
			(coreComplete * coreDocsWeight + techComplete * techDocsWeight + releaseComplete * releaseDocsWeight) * 100
		);
		
		const readyForImplementation = maturityScore >= 75;

		return {
			stage,
			total: 8,
			progress,
			activeDocuments,
			prdDocuments,
			maturityScore,
			missingDocuments,
			readyForImplementation
		};
	}

	/**
	 * Detect implementation status by parsing /docs/05-implementation/user-stories.md
	 */
	private detectImplementationStatus(): {
		totalStories: number;
		completedStories: number;
		projectCompletion: number;
		activeUserStory?: string;
		epicProgress: Array<{ name: string; completion: number }>;
	} | null {
		const userStoriesPath = path.join(this.workspaceRoot, 'docs', '05-implementation', 'user-stories.md');
		
		if (!fs.existsSync(userStoriesPath)) {
			return null;
		}

		const content = fs.readFileSync(userStoriesPath, 'utf-8');
		
		// Count user stories by status
		const statusPattern = /\*\*Status\*\*:\s*(Not Started|In Progress|In Review|Implemented|Delivered)/gi;
		const statusMatches = Array.from(content.matchAll(statusPattern));
		
		const totalStories = statusMatches.length;
		const completedStories = statusMatches.filter(m => 
			m[1] === 'Implemented' || m[1] === 'Delivered'
		).length;
		const inProgressStories = statusMatches.filter(m => m[1] === 'In Progress');

		// Find active user story (first "In Progress" status)
		let activeUserStory: string | undefined;
		if (inProgressStories.length > 0) {
			// Look backwards to find the US-XXX ID
			const activeIndex = content.indexOf(inProgressStories[0][0]);
			const beforeActive = content.substring(Math.max(0, activeIndex - 200), activeIndex);
			const idMatch = beforeActive.match(/\[?(US-\d+)\]?/);
			if (idMatch) {
				activeUserStory = idMatch[1];
			}
		}

		// Parse epic progress
		const epicProgress: Array<{ name: string; completion: number }> = [];
		const epicPattern = /###\s+Epic\s+(\w+-\d+):\s+([^\n]+)/g;
		const epicMatches = Array.from(content.matchAll(epicPattern));
		
		for (const epicMatch of epicMatches) {
			const epicId = epicMatch[1];
			const epicName = epicMatch[2];
			
			// Find stories in this epic (between this epic and the next)
			const epicStart = epicMatch.index || 0;
			const nextEpicMatch = content.substring(epicStart + 1).match(/###\s+Epic\s+/);
			const epicEnd = nextEpicMatch ? epicStart + (nextEpicMatch.index || content.length) : content.length;
			const epicContent = content.substring(epicStart, epicEnd);
			
			// Count stories in this epic
			const epicStoryMatches = Array.from(epicContent.matchAll(statusPattern));
			const epicTotal = epicStoryMatches.length;
			const epicCompleted = epicStoryMatches.filter(m => 
				m[1] === 'Implemented' || m[1] === 'Delivered'
			).length;
			
			if (epicTotal > 0) {
				epicProgress.push({
					name: `${epicId}: ${epicName.substring(0, 30)}${epicName.length > 30 ? '...' : ''}`,
					completion: Math.round((epicCompleted / epicTotal) * 100)
				});
			}
		}

		const projectCompletion = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;

		return {
			totalStories,
			completedStories,
			projectCompletion,
			activeUserStory,
			epicProgress
		};
	}

	/**
	 * Detect TDD phase by parsing implementation plans in /docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/
	 */
	private detectTDDPhase(): {
		phase: 'Planning' | 'TDD-RED' | 'TDD-GREEN' | 'TDD-REFACTOR' | 'Validation';
		layer?: string;
		userStory?: string;
		activeDocuments?: string[];
	} | null {
		const implementationDir = path.join(this.workspaceRoot, 'docs', '05-implementation', 'epics');
		
		if (!fs.existsSync(implementationDir)) {
			return null;
		}

		// Find all epic folders and their user stories
		const epics = fs.readdirSync(implementationDir).filter(f => {
			const fullPath = path.join(implementationDir, f);
			return fs.statSync(fullPath).isDirectory() && /^epic-\d+/.test(f);
		});

		// Check each user story for implementation plan
		for (const epic of epics) {
			const storiesDir = path.join(implementationDir, epic, 'user-stories');
			
			if (!fs.existsSync(storiesDir)) {
				continue;
			}

			const stories = fs.readdirSync(storiesDir).filter(f => {
				const fullPath = path.join(storiesDir, f);
				return fs.statSync(fullPath).isDirectory() && /^US-\d+$/.test(f);
			});

			for (const storyFolder of stories) {
				const planPath = path.join(storiesDir, storyFolder, 'implementation-plan.md');
				
				if (fs.existsSync(planPath)) {
					const content = fs.readFileSync(planPath, 'utf-8');
					
					// Parse current phase and layer
					const phaseMatch = content.match(/\*\*Phase\*\*:\s*(RED|GREEN|REFACTOR|COMPLETE)/i);
					const layerMatch = content.match(/\*\*Layer\*\*:\s*([^\n]+)/i);
					
					if (phaseMatch) {
						let phase: 'Planning' | 'TDD-RED' | 'TDD-GREEN' | 'TDD-REFACTOR' | 'Validation';
						
						if (phaseMatch[1].toUpperCase() === 'RED') {
							phase = 'TDD-RED';
						} else if (phaseMatch[1].toUpperCase() === 'GREEN') {
							phase = 'TDD-GREEN';
						} else if (phaseMatch[1].toUpperCase() === 'REFACTOR') {
							phase = 'TDD-REFACTOR';
						} else {
							phase = 'Validation';
						}
						
						return {
						phase,
						layer: layerMatch ? layerMatch[1] : undefined,
						userStory: storyFolder,
						activeDocuments: [`${storyFolder}-PLAN`]
					};
				}
			}
		}

		return null;
	}

	/**
	 * Detect current sprint by parsing /docs/05-implementation/current-sprint.md
	 */
	private detectCurrentSprint(): { sprintName: string } | null {
		const sprintPath = path.join(this.workspaceRoot, 'docs', '05-implementation', 'current-sprint.md');
		
		if (!fs.existsSync(sprintPath)) {
			return null;
		}

		const content = fs.readFileSync(sprintPath, 'utf-8');
		
		// Parse sprint name/number
		const sprintMatch = content.match(/Sprint[:\s]+(\d+|Iteration\s+\d+)/i);
		if (sprintMatch) {
			return { sprintName: sprintMatch[0] };
		}

		return null;
	}
}
