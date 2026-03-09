/**
 * Agent Integration Layer - Manual Integration (Option A)
 * 
 * This module provides easy-to-use functions for agents to integrate
 * with the AI Activity Logger without complex setup.
 * 
 * Usage in any agent:
 * 1. Import AgentLogger at the start of work
 * 2. Call startWork() when beginning
 * 3. Call logDecision() for decision gates
 * 4. Call endWork() when finishing
 */

import { ActivityInterceptor } from './activity-interceptor';
import { ImplementationWorkflowInterceptor } from './implementation-interceptor';

// =============================================================================
// AGENT LOGGER - SIMPLIFIED INTERFACE
// =============================================================================

export class AgentLogger {
  private interceptor: ActivityInterceptor;
  private workflowInterceptor: ImplementationWorkflowInterceptor;
  private startTime: number = 0;
  private agentName: string;
  private currentFiles: string[] = [];

  constructor(agentName: string) {
    this.agentName = agentName;
    this.interceptor = new ActivityInterceptor();
    this.workflowInterceptor = new ImplementationWorkflowInterceptor();
  }

  // ---------------------------------------------------------------------------
  // BASIC AGENT LOGGING
  // ---------------------------------------------------------------------------

  /**
   * Call this when agent starts work
   */
  startWork(userPrompt: string, options?: {
    mode?: string;
    handoffFrom?: string;
    referencedFiles?: string[];
    userStoryRef?: string;
    phase?: string;
  }) {
    this.startTime = Date.now();
    this.currentFiles = options?.referencedFiles || [];

    console.log(`🤖 [${this.agentName}] Starting work: ${userPrompt.substring(0, 100)}...`);

    this.interceptor.startInteraction({
      agentName: this.agentName,
      agentMode: options?.mode || 'default',
      userPrompt,
      handoffFrom: options?.handoffFrom,
      referencedFiles: this.currentFiles,
    });

    // If this is part of implementation workflow, track it
    if (options?.userStoryRef && options?.phase) {
      this.workflowInterceptor.startImplementationPhase({
        phase: options.phase as any,
        userStoryRef: options.userStoryRef,
      }, {
        agentName: this.agentName,
        userPrompt,
        referencedFiles: this.currentFiles,
      });
    }
  }

  /**
   * Call this for decision points (3-option gates)
   */
  logDecision(type: 'gate' | 'option-selection' | 'handoff' | 'approval', options: {
    optionsPresented?: string[];
    selectedOption?: string;
    rationale?: string;
  }) {
    console.log(`🎯 [${this.agentName}] Decision: ${type} → ${options.selectedOption}`);

    this.interceptor.logDecision({
      type,
      optionsPresented: options.optionsPresented,
      selectedOption: options.selectedOption,
      rationale: options.rationale,
    });
  }

  /**
   * Call this when using tools
   */
  logTool(toolName: string, parameters: any, result?: 'success' | 'error') {
    const duration = Date.now() - this.startTime;
    
    this.interceptor.logToolInvocation(toolName, parameters, result, duration);
  }

  /**
   * Call this when handing off to another agent
   */
  logHandoff(toAgent: string, options: {
    documentsUpdated?: string[];
    githubIssueUpdated?: boolean;
    nextActions?: string[];
    userStoryRef?: string;
  }) {
    console.log(`🔄 [${this.agentName}] Handing off to: ${toAgent}`);

    this.logDecision('handoff', {
      selectedOption: toAgent,
      rationale: `Completing ${this.agentName} work, passing to ${toAgent}`,
    });

    // Track implementation workflow handoff if applicable
    if (options.userStoryRef) {
      this.workflowInterceptor.logAgentHandoff({
        fromAgent: this.agentName,
        toAgent: toAgent,
        handoffType: 'phase_complete',
        documentsUpdated: options.documentsUpdated || [],
        githubIssueUpdated: options.githubIssueUpdated || false,
        nextActions: options.nextActions || [],
      });
    }
  }

  /**
   * Call this when work is complete
   */
  endWork(summary: string, options?: {
    actions?: string[];
    filesModified?: string[];
    outcome?: 'success' | 'error' | 'partial' | 'pending';
    errorMessage?: string;
    tokens?: { input: number; output: number; model: string };
    userStoryRef?: string;
    phase?: string;
  }) {
    const duration = Date.now() - this.startTime;
    const defaultTokens = { input: 800, output: 1200, model: 'claude-sonnet-4.5' };

    console.log(`✅ [${this.agentName}] Work complete: ${summary}`);

    this.interceptor.endInteraction({
      responseSummary: summary,
      actions: options?.actions || ['completed_work'],
      filesModified: options?.filesModified || [],
      tokens: options?.tokens || defaultTokens,
      durationMs: duration,
      outcome: options?.outcome || 'success',
      errorMessage: options?.errorMessage,
    });

    // End implementation workflow phase if applicable
    if (options?.userStoryRef && options?.phase) {
      this.workflowInterceptor.endImplementationPhase({
        phaseCompleted: true,
        documentsUpdated: options.filesModified || [],
        githubIssuesUpdated: [],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // SPECIALIZED WORKFLOW METHODS
  // ---------------------------------------------------------------------------

  /**
   * For PM agent - Sprint planning decisions
   */
  logSprintDecision(sprintNumber: number, selectedScope: 'conservative' | 'balanced' | 'aggressive', details: {
    storyCount: number;
    totalStoryPoints: number;
    selectedStories: string[];
    rationale: string;
  }) {
    this.workflowInterceptor.logSprintScopeDecision({
      sprintNumber,
      selectedScope,
      storyCount: details.storyCount,
      totalStoryPoints: details.totalStoryPoints,
      teamCapacity: details.totalStoryPoints * 1.2, // Estimate
      utilizationPercentage: Math.round((details.totalStoryPoints / (details.totalStoryPoints * 1.2)) * 100),
      selectedStories: details.selectedStories,
      rationale: details.rationale,
    });
  }

  /**
   * For TDD agents - Test-driven development cycles
   */
  logTDDCycle(layer: 'database' | 'backend' | 'config' | 'frontend', phase: 'red' | 'green' | 'refactor', results: {
    testsWritten?: string[];
    testsPassingCount?: number;
    testsTotalCount?: number;
    filesModified?: string[];
    coveragePercentage?: number;
  }) {
    this.workflowInterceptor.startTDDCycle({ layer, phase });
    
    this.workflowInterceptor.completeTDDCycle({
      testsWritten: results.testsWritten || [],
      testsPassingCount: results.testsPassingCount || 0,
      testsTotalCount: results.testsTotalCount || 0,
      filesModified: results.filesModified || [],
      coveragePercentage: results.coveragePercentage,
    });
  }

  /**
   * For BA agent - Story status transitions
   */
  logStoryTransition(userStoryRef: string, githubIssue: string, fromStatus: string, toStatus: string, options?: {
    validationPassed?: boolean;
    bugsFound?: number;
  }) {
    this.workflowInterceptor.logStoryStatusTransition({
      userStoryRef,
      githubIssue,
      fromStatus: fromStatus as any,
      toStatus: toStatus as any,
      triggeredBy: this.agentName,
      validationPassed: options?.validationPassed,
      bugsFound: options?.bugsFound || 0,
    });
  }

  /**
   * For any agent - Document updates
   */
  logDocumentUpdate(documentType: string, documentPath: string, userStoryRef: string, updateType: 'create' | 'update' | 'enrichment') {
    this.workflowInterceptor.logDocumentCheckpoint({
      documentType: documentType as any,
      documentPath,
      userStoryRef,
      updatedBy: this.agentName,
      updateType,
      synchronizedWithGithub: true,
    });
  }
}

// =============================================================================
// QUICK START FUNCTIONS (Import these in agent templates)
// =============================================================================

/**
 * Quick start for any agent - returns initialized logger
 */
export function startAgentLogging(agentName: string): AgentLogger {
  return new AgentLogger(agentName);
}

/**
 * Simple logging for basic agent work (no implementation workflow)
 */
export async function logAgentWork<T>(
  agentName: string,
  userPrompt: string,
  workFunction: (logger: AgentLogger) => Promise<T>,
  options?: {
    mode?: string;
    handoffFrom?: string;
    referencedFiles?: string[];
  }
): Promise<T> {
  const logger = new AgentLogger(agentName);
  
  try {
    logger.startWork(userPrompt, options);
    const result = await workFunction(logger);
    logger.endWork(`Completed ${agentName} work successfully`);
    return result;
  } catch (error) {
    logger.endWork(`${agentName} work failed`, {
      outcome: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Implementation workflow logging (for user story work)
 */
export async function logImplementationWork<T>(
  agentName: string,
  userPrompt: string,
  userStoryRef: string,
  phase: string,
  workFunction: (logger: AgentLogger) => Promise<T>,
  options?: {
    handoffFrom?: string;
    referencedFiles?: string[];
  }
): Promise<T> {
  const logger = new AgentLogger(agentName);
  
  try {
    logger.startWork(userPrompt, {
      ...options,
      userStoryRef,
      phase,
    });
    const result = await workFunction(logger);
    logger.endWork(`Completed ${phase} for ${userStoryRef}`, {
      userStoryRef,
      phase,
    });
    return result;
  } catch (error) {
    logger.endWork(`${phase} failed for ${userStoryRef}`, {
      outcome: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      userStoryRef,
      phase,
    });
    throw error;
  }
}

// =============================================================================
// AGENT TEMPLATE INTEGRATION PATTERNS
// =============================================================================

export const AgentIntegrationPatterns = {
  
  /**
   * Pattern 1: Basic Agent Work
   */
  basic: `
// At start of agent work:
const logger = startAgentLogging('agent-name');
logger.startWork(userPrompt, { referencedFiles: ['file1.md', 'file2.md'] });

// During decision gates:
logger.logDecision('option-selection', {
  optionsPresented: ['Option A', 'Option B', 'Option C'],
  selectedOption: 'Option B',
  rationale: 'Best balance of factors'
});

// When using tools:
logger.logTool('create_file', { filePath: '/path/to/file.md' }, 'success');

// At end:
logger.endWork('Task completed successfully', {
  actions: ['created_files', 'analyzed_requirements'],
  filesModified: ['requirements.md', 'status.md']
});
`,

  /**
   * Pattern 2: Implementation Workflow
   */
  implementation: `
// For user story work:
await logImplementationWork(
  'dev-lead',
  'Create implementation plan for US-001',
  'US-001',
  'implementation_planning',
  async (logger) => {
    // Do the work
    logger.logDocumentUpdate('implementation_plan', '/docs/user-stories/US-001/plan.md', 'US-001', 'create');
    logger.logHandoff('tdd-orchestrator', {
      documentsUpdated: ['/docs/user-stories/US-001/plan.md'],
      userStoryRef: 'US-001'
    });
    return results;
  },
  { referencedFiles: ['/docs/user-stories/US-001/US-001.md'] }
);
`,

  /**
   * Pattern 3: Decision Gates
   */
  decisionGate: `
// Present 3 options to user
const options = ['Conservative', 'Balanced', 'Aggressive'];
// ... user selects 'Balanced' ...

logger.logDecision('gate', {
  optionsPresented: options,
  selectedOption: 'Balanced',
  rationale: 'User selected balanced approach for optimal risk/reward'
});
`
};

export default {
  AgentLogger,
  startAgentLogging,
  logAgentWork,
  logImplementationWork,
  AgentIntegrationPatterns,
};