/**
 * Implementation Workflow Activity Interceptor
 * 
 * Specialized interceptor for tracking implementation workflow patterns,
 * agent handoffs, TDD cycles, and document synchronization.
 * 
 * Version: 1.0.0 (Option B - Balanced)
 */

import { ActivityInterceptor } from './activity-interceptor';

export interface ImplementationPhase {
  phase: 'sprint_planning' | 'story_enrichment' | 'implementation_planning' | 'tdd_execution' | 'validation';
  userStoryRef: string;
  githubIssue?: string;
  sprintNumber?: number;
  epic?: string;
}

export interface TDDCycle {
  layer: 'database' | 'backend' | 'config' | 'frontend';
  phase: 'red' | 'green' | 'refactor';
  testsWritten?: string[];
  testsPassingCount?: number;
  testsTotalCount?: number;
  codeComplexity?: number;
  coveragePercentage?: number;
  filesModified?: string[];
  bddAssertionsEnabled?: string[];
}

export interface AgentHandoff {
  fromAgent: string;
  toAgent: string;
  handoffType: 'phase_complete' | 'blocker_escalation' | 'validation_required' | 'status_sync';
  documentsUpdated?: string[];
  githubIssueUpdated?: boolean;
  nextActions?: string[];
  blockers?: string[];
  context?: Record<string, any>;
}

export interface StoryStatusTransition {
  userStoryRef: string;
  githubIssue?: string;
  fromStatus: 'not_started' | 'in_progress' | 'implemented' | 'delivered';
  toStatus: 'not_started' | 'in_progress' | 'implemented' | 'delivered';
  triggeredBy: string; // agent name
  validationPassed?: boolean;
  bugsFound?: number;
}

export interface DocumentCheckpoint {
  documentType: 'user_story' | 'implementation_plan' | 'handoff_doc' | 'tdd_execution' | 'project_status' | 'current_sprint';
  documentPath: string;
  userStoryRef?: string;
  updatedBy: string;
  updateType: 'create' | 'status_update' | 'enrichment' | 'handoff_note' | 'validation_result';
  synchronizedWithGithub?: boolean;
}

export class ImplementationWorkflowInterceptor extends ActivityInterceptor {
  private implementationConfig: any;
  private currentPhase?: ImplementationPhase;
  private activeTDDCycle?: TDDCycle;

  constructor(configPath?: string) {
    super(configPath);
    this.loadImplementationConfig();
  }

  private loadImplementationConfig() {
    // Use default configuration for implementation workflows
    this.implementationConfig = { 
      implementation_workflows: { 
        enabled: true,
        phases: {
          sprint_planning: { track_scope_decisions: true },
          story_enrichment: { track_acceptance_criteria: true },
          tdd_execution: { track_red_phases: true, track_green_phases: true, track_refactor_phases: true }
        },
        story_lifecycle: { track_status_transitions: true, track_epic_progression: true },
        document_tracking: { track_checkpoint_updates: true }
      },
      agents: {
        overrides: {
          pm: { track_handoffs: true, track_scope_decisions: true },
          ba: { track_validation_results: true },
          'dev-tdd': { track_tdd_cycles: true },
          'dev-lead': { track_handoffs: true }
        }
      }
    };
  }

  /**
   * Start tracking an implementation phase
   */
  startImplementationPhase(phase: ImplementationPhase, context: any = {}) {
    if (!this.implementationConfig.implementation_workflows?.enabled) return;

    this.currentPhase = phase;
    
    this.startInteraction({
      agentName: context.agentName || 'unknown',
      agentMode: `implementation_${phase.phase}`,
      userPrompt: context.userPrompt || `Starting ${phase.phase} for ${phase.userStoryRef}`,
      referencedFiles: context.referencedFiles || []
    });

    this.logImplementationEvent('implementation_phase_start', {
      phase: phase.phase,
      userStoryRef: phase.userStoryRef,
      githubIssue: phase.githubIssue,
      sprintNumber: phase.sprintNumber,
      epic: phase.epic,
      context
    });
  }

  /**
   * Track agent handoffs with document synchronization
   */
  logAgentHandoff(handoff: AgentHandoff, context: any = {}) {
    if (!this.implementationConfig.agents?.overrides?.[handoff.fromAgent]?.track_handoffs) return;

    this.logImplementationEvent('agent_handoff', {
      fromAgent: handoff.fromAgent,
      toAgent: handoff.toAgent,
      handoffType: handoff.handoffType,
      documentsUpdated: handoff.documentsUpdated,
      githubIssueUpdated: handoff.githubIssueUpdated,
      nextActions: handoff.nextActions,
      blockers: handoff.blockers,
      context: handoff.context,
      timestamp: new Date().toISOString(),
      currentPhase: this.currentPhase
    });

    // Track handoff patterns for optimization
    if (handoff.blockers && handoff.blockers.length > 0) {
      this.logImplementationEvent('handoff_blocker', {
        fromAgent: handoff.fromAgent,
        toAgent: handoff.toAgent,
        blockers: handoff.blockers,
        userStoryRef: this.currentPhase?.userStoryRef
      });
    }
  }

  /**
   * Start tracking a TDD cycle (RED/GREEN/REFACTOR)
   */
  startTDDCycle(cycle: TDDCycle, context: any = {}) {
    if (!this.implementationConfig.agents?.overrides?.['dev-tdd']?.track_tdd_cycles) return;

    this.activeTDDCycle = cycle;

    this.logImplementationEvent('tdd_cycle_start', {
      layer: cycle.layer,
      phase: cycle.phase,
      userStoryRef: this.currentPhase?.userStoryRef,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Complete a TDD cycle with results
   */
  completeTDDCycle(results: Partial<TDDCycle>, context: any = {}) {
    if (!this.activeTDDCycle || !this.implementationConfig.agents?.overrides?.['dev-tdd']?.track_tdd_cycles) return;

    const completedCycle = { ...this.activeTDDCycle, ...results };

    this.logImplementationEvent('tdd_cycle_complete', {
      layer: completedCycle.layer,
      phase: completedCycle.phase,
      testsWritten: completedCycle.testsWritten,
      testsPassingCount: completedCycle.testsPassingCount,
      testsTotalCount: completedCycle.testsTotalCount,
      codeComplexity: completedCycle.codeComplexity,
      coveragePercentage: completedCycle.coveragePercentage,
      filesModified: completedCycle.filesModified,
      bddAssertionsEnabled: completedCycle.bddAssertionsEnabled,
      userStoryRef: this.currentPhase?.userStoryRef,
      context,
      timestamp: new Date().toISOString()
    });

    // Track quality metrics
    if (completedCycle.coveragePercentage) {
      this.logImplementationEvent('test_coverage_metric', {
        userStoryRef: this.currentPhase?.userStoryRef,
        layer: completedCycle.layer,
        coverage: completedCycle.coveragePercentage,
        phase: completedCycle.phase
      });
    }

    this.activeTDDCycle = undefined;
  }

  /**
   * Track user story status transitions
   */
  logStoryStatusTransition(transition: StoryStatusTransition, context: any = {}) {
    if (!this.implementationConfig.implementation_workflows?.story_lifecycle?.track_status_transitions) return;

    this.logImplementationEvent('story_status_transition', {
      userStoryRef: transition.userStoryRef,
      githubIssue: transition.githubIssue,
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus,
      triggeredBy: transition.triggeredBy,
      validationPassed: transition.validationPassed,
      bugsFound: transition.bugsFound,
      context,
      timestamp: new Date().toISOString()
    });

    // Track velocity metrics
    if (transition.toStatus === 'delivered') {
      this.logImplementationEvent('story_completed', {
        userStoryRef: transition.userStoryRef,
        epic: this.currentPhase?.epic,
        sprintNumber: this.currentPhase?.sprintNumber,
        completionTime: new Date().toISOString()
      });
    }
  }

  /**
   * Track document checkpoint updates
   */
  logDocumentCheckpoint(checkpoint: DocumentCheckpoint, context: any = {}) {
    if (!this.implementationConfig.implementation_workflows?.document_tracking?.track_checkpoint_updates) return;

    this.logImplementationEvent('document_checkpoint', {
      documentType: checkpoint.documentType,
      documentPath: checkpoint.documentPath,
      userStoryRef: checkpoint.userStoryRef,
      updatedBy: checkpoint.updatedBy,
      updateType: checkpoint.updateType,
      synchronizedWithGithub: checkpoint.synchronizedWithGithub,
      context,
      timestamp: new Date().toISOString()
    });

    // Track synchronization issues
    if (checkpoint.synchronizedWithGithub === false) {
      this.logImplementationEvent('sync_issue', {
        documentPath: checkpoint.documentPath,
        userStoryRef: checkpoint.userStoryRef,
        updatedBy: checkpoint.updatedBy
      });
    }
  }

  /**
   * Track sprint scope decisions (Conservative/Balanced/Stretch)
   */
  logSprintScopeDecision(decision: {
    sprintNumber: number;
    selectedScope: 'conservative' | 'balanced' | 'stretch';
    storyCount: number;
    totalStoryPoints: number;
    teamCapacity: number;
    utilizationPercentage: number;
    selectedStories: string[];
    rationale: string;
  }, context: any = {}) {
    if (!this.implementationConfig.implementation_workflows?.phases?.sprint_planning?.track_scope_decisions) return;

    // Use the decision logging mechanism from parent class
    this.logDecision({
      type: 'option-selection',
      optionsPresented: ['conservative', 'balanced', 'stretch'],
      selectedOption: decision.selectedScope,
      rationale: decision.rationale
    });

    this.logImplementationEvent('sprint_scope_decision', {
      ...decision,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track validation results (BA phase)
   */
  logValidationResults(results: {
    userStoryRef: string;
    githubIssue?: string;
    bddTestsPassed: number;
    bddTestsTotal: number;
    exploratoryTestsPassed: number;
    exploratoryTestsTotal: number;
    designCompliancePassed: boolean;
    acceptanceCriteriaMet: boolean;
    bugsFound: Array<{ severity: string; description: string }>;
    validationPassed: boolean;
    screenshotsCaptured: number;
  }, context: any = {}) {
    if (!this.implementationConfig.agents?.overrides?.ba?.track_validation_results) return;

    this.logImplementationEvent('validation_results', {
      ...results,
      context,
      timestamp: new Date().toISOString()
    });

    // Track quality metrics
    const testPassRate = results.bddTestsTotal > 0 ? 
      (results.bddTestsPassed / results.bddTestsTotal) * 100 : 0;
    
    this.logImplementationEvent('quality_metric', {
      userStoryRef: results.userStoryRef,
      metricType: 'bdd_pass_rate',
      value: testPassRate,
      bugsFound: results.bugsFound.length
    });
  }

  /**
   * Track epic progression (automatic completion)
   */
  logEpicProgression(epic: {
    epicName: string;
    totalStories: number;
    deliveredStories: number;
    completionPercentage: number;
    isComplete: boolean;
    completedStoryRefs: string[];
  }, context: any = {}) {
    if (!this.implementationConfig.implementation_workflows?.story_lifecycle?.track_epic_progression) return;

    this.logImplementationEvent('epic_progression', {
      ...epic,
      context,
      timestamp: new Date().toISOString()
    });

    if (epic.isComplete) {
      this.logImplementationEvent('epic_completed', {
        epicName: epic.epicName,
        totalStories: epic.totalStories,
        completedStoryRefs: epic.completedStoryRefs,
        completionTime: new Date().toISOString()
      });
    }
  }

  /**
   * End implementation phase
   */
  endImplementationPhase(results: {
    phaseCompleted: boolean;
    nextPhase?: string;
    blockers?: string[];
    handoffTo?: string;
    documentsUpdated?: string[];
    githubIssuesUpdated?: string[];
  }, context: any = {}) {
    if (!this.currentPhase) return;

    this.logImplementationEvent('implementation_phase_end', {
      phase: this.currentPhase.phase,
      userStoryRef: this.currentPhase.userStoryRef,
      results,
      context,
      timestamp: new Date().toISOString()
    });

    this.endInteraction({
      responseSummary: `Completed ${this.currentPhase.phase} for ${this.currentPhase.userStoryRef}`,
      actions: context.actions || [`completed_${this.currentPhase.phase}`],
      tokens: context.tokens,
      durationMs: context.durationMs,
      outcome: results.phaseCompleted ? 'success' : 'error'
    });

    this.currentPhase = undefined;
  }

  /**
   * Helper to log custom implementation events
   */
  private logImplementationEvent(eventType: string, data: any) {
    // Use handoff mechanism to track implementation-specific events
    this.logDecision({
      type: 'handoff',
      optionsPresented: [eventType],
      selectedOption: eventType,
      rationale: JSON.stringify(data)
    });
  }
}

// Export for easy integration with existing workflow agents
export default ImplementationWorkflowInterceptor;