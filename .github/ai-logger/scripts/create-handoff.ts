#!/usr/bin/env ts-node

/**
 * Create Handoff Helper
 * Utility to create handoff artifacts with automatic tracing
 */

import * as fs from 'fs';
import * as path from 'path';
import { HandoffTracer } from '../handoff-tracer';

interface HandoffData {
  storyRef: string;
  agentFrom: string;
  agentTo: string;
  handoffType: 'initial' | 'layer-complete' | 'blocked' | 'review-feedback';
  contextSummary: string;
  deltaSummary: {
    filesCreated: string[];
    filesModified: string[];
    bddTestsPassing: number;
    bddTestsTotal: number;
  };
  decisionLog: {
    decision: string;
    rationale: string;
    alternatives: string[];
    tradeoffs: string;
  };
  qualityMetrics: {
    completeness: number;
    testCoverage: number;
    codeQuality: number;
  };
  nextAgentContext: {
    objective: string;
    constraints: string[];
    expectedOutputs: string[];
  };
}

class HandoffCreator {
  private tracer: HandoffTracer;
  private userStoriesDir: string;

  constructor() {
    this.tracer = new HandoffTracer();
    this.userStoriesDir = path.join(__dirname, '../../../docs/user-stories');
  }

  async createHandoff(data: HandoffData): Promise<void> {
    console.log(`\n🔄 Creating handoff: ${data.agentFrom} → ${data.agentTo}`);
    console.log(`   Story: ${data.storyRef}`);
    console.log(`   Type: ${data.handoffType}`);

    // Start trace
    const trace = this.tracer.startHandoff(
      data.storyRef,
      data.agentFrom, 
      data.agentTo,
      'initial',
      {
        story_ref: data.storyRef,
        handoff_type: data.handoffType,
        context_summary: data.contextSummary
      }
    );

    console.log(`   Trace ID: ${trace.traceId}`);

    // Create handoff artifact
    const handoffDir = path.join(this.userStoriesDir, data.storyRef);
    if (!fs.existsSync(handoffDir)) {
      fs.mkdirSync(handoffDir, { recursive: true });
    }

    const handoffFile = path.join(handoffDir, `${data.storyRef}-HANDOFF.json`);
    const handoffContent = {
      metadata: {
        story_ref: data.storyRef,
        agent_from: data.agentFrom,
        agent_to: data.agentTo,
        handoff_type: data.handoffType,
        timestamp: new Date().toISOString(),
        trace_id: trace.traceId
      },
      context_summary: data.contextSummary,
      delta_summary: data.deltaSummary,
      decision_log: data.decisionLog,
      quality_metrics: data.qualityMetrics,
      next_agent_context: data.nextAgentContext
    };

    fs.writeFileSync(handoffFile, JSON.stringify(handoffContent, null, 2));
    console.log(`   ✅ Handoff artifact created: ${handoffFile}`);

    // Calculate quality score
    const qualityScore = (
      data.qualityMetrics.completeness * 0.4 +
      data.qualityMetrics.testCoverage * 0.3 +
      data.qualityMetrics.codeQuality * 0.3
    );

    // End trace
    this.tracer.completeHandoff(trace.spanId, { quality_score: qualityScore });
    console.log(`   📊 Quality Score: ${qualityScore.toFixed(2)}`);
    console.log(`   ✅ Trace completed\n`);
  }

  async createFromTemplate(storyRef: string): Promise<void> {
    console.log(`\n📝 Creating handoff template for ${storyRef}...`);

    const templateData: HandoffData = {
      storyRef,
      agentFrom: 'dev-lead',
      agentTo: 'dev-tdd',
      handoffType: 'initial',
      contextSummary: 'Initial handoff for TDD implementation',
      deltaSummary: {
        filesCreated: ['implementation-plan.md'],
        filesModified: [],
        bddTestsPassing: 0,
        bddTestsTotal: 5
      },
      decisionLog: {
        decision: 'Proceed with layer-by-layer TDD implementation',
        rationale: 'BDD tests are failing as expected, implementation plan is complete',
        alternatives: ['Implement all layers at once', 'Start with frontend first'],
        tradeoffs: 'Layer-by-layer is slower but more controlled'
      },
      qualityMetrics: {
        completeness: 0.95,
        testCoverage: 0,
        codeQuality: 0
      },
      nextAgentContext: {
        objective: 'Implement Layer 1 (Database) to make BDD assertions pass',
        constraints: [
          'Follow implementation plan',
          'Use RED-GREEN-REFACTOR cycle',
          'Maintain test coverage > 80%'
        ],
        expectedOutputs: [
          'Database migrations',
          'Model classes',
          'Passing tests for Layer 1'
        ]
      }
    };

    await this.createHandoff(templateData);
  }
}

// CLI Interface
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage:
  ts-node create-handoff.ts --template <STORY-REF>
  ts-node create-handoff.ts --from <JSON-FILE>

Examples:
  ts-node create-handoff.ts --template US-001
  ts-node create-handoff.ts --from handoff-data.json
  `);
  process.exit(0);
}

const creator = new HandoffCreator();

if (args[0] === '--template') {
  const storyRef = args[1];
  if (!storyRef) {
    console.error('❌ Please provide a story reference (e.g., US-001)');
    process.exit(1);
  }
  creator.createFromTemplate(storyRef).catch(err => {
    console.error('❌ Failed to create handoff:', err);
    process.exit(1);
  });
} else if (args[0] === '--from') {
  const jsonFile = args[1];
  if (!jsonFile || !fs.existsSync(jsonFile)) {
    console.error('❌ JSON file not found:', jsonFile);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8')) as HandoffData;
  creator.createHandoff(data).catch(err => {
    console.error('❌ Failed to create handoff:', err);
    process.exit(1);
  });
} else {
  console.error('❌ Unknown command. Use --template or --from');
  process.exit(1);
}
