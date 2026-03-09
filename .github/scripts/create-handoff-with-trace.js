#!/usr/bin/env node

/**
 * Create handoff with automatic trace logging
 * Integrates handoff schema with distributed tracing
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

/**
 * Create handoff with automatic trace logging
 */
function createHandoffWithTrace(handoffData, tracer) {
  // Validate handoff data against schema
  const schemaPath = '.github/schemas/handoff.schema.json';
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Handoff schema not found: ${schemaPath}`);
  }
  
  const ajv = new Ajv();
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const validate = ajv.compile(schema);
  
  const isValid = validate(handoffData);
  
  // Start trace
  const trace = tracer.startHandoff(
    handoffData.handoff.storyRef,
    handoffData.handoff.fromAgent,
    handoffData.handoff.toAgent,
    handoffData.handoff.layer,
    {
      contextSize: JSON.stringify(handoffData).length,
      hasDecisionLog: !!handoffData.handoff.decisionLog,
      hasNextAgentContext: !!handoffData.handoff.nextAgentContext,
      qualityScore: handoffData.handoff.qualityMetrics?.qualityScore,
      validationErrors: isValid ? [] : validate.errors?.map(err => err.message) || []
    }
  );
  
  // Add trace ID to handoff
  handoffData.handoff.traceId = trace.traceId;
  handoffData.handoff.spanId = trace.spanId;
  
  // Save handoff file
  const handoffDir = `docs/user-stories/${handoffData.handoff.storyRef}`;
  if (!fs.existsSync(handoffDir)) {
    fs.mkdirSync(handoffDir, { recursive: true });
  }
  
  const handoffFile = path.join(handoffDir, 'handoff.json');
  fs.writeFileSync(handoffFile, JSON.stringify(handoffData, null, 2));
  
  // Update trace based on validation
  if (!isValid) {
    const errors = validate.errors?.map(err => `${err.instancePath}: ${err.message}`) || ['Unknown validation error'];
    tracer.failHandoff(trace.spanId, errors, {
      handoffFile,
      validationDetails: validate.errors
    });
  } else if (handoffData.handoff.qualityMetrics?.qualityScore < 0.8) {
    tracer.escalateHandoff(trace.spanId, 'Quality score below threshold', {
      handoffFile,
      qualityScore: handoffData.handoff.qualityMetrics.qualityScore
    });
  } else {
    tracer.completeHandoff(trace.spanId, {
      handoffFile,
      actualContextSize: JSON.stringify(handoffData).length
    });
  }
  
  console.log(`Handoff created: ${handoffFile}`);
  console.log(`Trace ID: ${trace.traceId}`);
  console.log(`Status: ${isValid ? 'Valid' : 'Invalid'}`);
  
  return handoffData;
}

/**
 * Load tracer from TypeScript module
 */
function loadTracer() {
  try {
    // In a real implementation, you'd compile the TypeScript or use ts-node
    // For now, we'll create a simple JavaScript version
    return {
      startHandoff: (storyRef, fromAgent, toAgent, layer, metadata) => ({
        traceId: generateId('trace'),
        spanId: generateId('span'),
        storyRef,
        fromAgent,
        toAgent,
        layer,
        startTime: new Date(),
        metadata
      }),
      completeHandoff: (spanId, metadata) => {
        console.log(`Trace ${spanId} completed`);
      },
      failHandoff: (spanId, errors, metadata) => {
        console.log(`Trace ${spanId} failed: ${errors.join(', ')}`);
      },
      escalateHandoff: (spanId, reason, metadata) => {
        console.log(`Trace ${spanId} escalated: ${reason}`);
      }
    };
  } catch (error) {
    console.warn('Could not load handoff tracer, using mock:', error.message);
    return null;
  }
}

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node create-handoff-with-trace.js <handoff-data-file>');
    console.log('Example: node create-handoff-with-trace.js ./temp-handoff.json');
    process.exit(1);
  }
  
  const handoffDataFile = args[0];
  
  if (!fs.existsSync(handoffDataFile)) {
    console.error(`Handoff data file not found: ${handoffDataFile}`);
    process.exit(1);
  }
  
  try {
    const handoffData = JSON.parse(fs.readFileSync(handoffDataFile, 'utf-8'));
    const tracer = loadTracer();
    
    if (!tracer) {
      console.error('Could not initialize tracer');
      process.exit(1);
    }
    
    createHandoffWithTrace(handoffData, tracer);
  } catch (error) {
    console.error('Error creating handoff:', error.message);
    process.exit(1);
  }
}

module.exports = { createHandoffWithTrace, loadTracer };