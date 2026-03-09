#!/usr/bin/env ts-node

/**
 * Test Tracer Script
 * Tests the handoff tracer with sample data
 */

import { HandoffTracer } from '../handoff-tracer';

async function testTracer() {
  console.log('🧪 Testing Handoff Tracer\n');

  const tracer = new HandoffTracer();

  // Simulate a complete handoff chain
  console.log('📋 Simulating handoff chain: dev-lead → dev-tdd → dev-tdd-red → dev-tdd-green\n');

  // 1. Dev-Lead → Dev-TDD
  const trace1 = await tracer.startTrace('dev-lead', 'dev-tdd', {
    story_ref: 'US-001',
    handoff_type: 'initial',
    context_summary: 'Implementation plan created, BDD tests failing'
  });
  console.log(`✅ Trace 1 started: ${trace1}`);

  await new Promise(resolve => setTimeout(resolve, 100));
  await tracer.endTrace(trace1, 0.95);
  console.log(`✅ Trace 1 completed with quality score: 0.95\n`);

  // 2. Dev-TDD → Dev-TDD-RED
  const trace2 = await tracer.startTrace('dev-tdd', 'dev-tdd-red', {
    story_ref: 'US-001',
    handoff_type: 'layer-start',
    context_summary: 'Starting Layer 1 (Database)',
    parent_trace_id: trace1
  });
  console.log(`✅ Trace 2 started (child of ${trace1}): ${trace2}`);

  await new Promise(resolve => setTimeout(resolve, 150));
  await tracer.endTrace(trace2, 0.88);
  console.log(`✅ Trace 2 completed with quality score: 0.88\n`);

  // 3. Dev-TDD-RED → Dev-TDD-GREEN
  const trace3 = await tracer.startTrace('dev-tdd-red', 'dev-tdd-green', {
    story_ref: 'US-001',
    handoff_type: 'phase-transition',
    context_summary: 'RED phase complete, failing tests written',
    parent_trace_id: trace2
  });
  console.log(`✅ Trace 3 started (child of ${trace2}): ${trace3}`);

  await new Promise(resolve => setTimeout(resolve, 200));
  await tracer.endTrace(trace3, 0.92);
  console.log(`✅ Trace 3 completed with quality score: 0.92\n`);

  // 4. Dev-TDD-GREEN → Dev-TDD-REFACTOR
  const trace4 = await tracer.startTrace('dev-tdd-green', 'dev-tdd-refactor', {
    story_ref: 'US-001',
    handoff_type: 'phase-transition',
    context_summary: 'GREEN phase complete, tests passing',
    parent_trace_id: trace3
  });
  console.log(`✅ Trace 4 started (child of ${trace3}): ${trace4}`);

  await new Promise(resolve => setTimeout(resolve, 120));
  await tracer.endTrace(trace4, 0.90);
  console.log(`✅ Trace 4 completed with quality score: 0.90\n`);

  // Verify traces were saved
  const report = await tracer.generateReport();
  console.log('📊 Trace Report:');
  console.log(`   Total Traces: ${report.total_traces}`);
  console.log(`   Average Quality Score: ${report.avg_quality_score.toFixed(2)}`);
  console.log(`   Average Duration: ${report.avg_duration_ms.toFixed(0)}ms`);
  console.log('\n✅ Tracer test completed successfully!');
}

testTracer().catch(err => {
  console.error('❌ Tracer test failed:', err);
  process.exit(1);
});
