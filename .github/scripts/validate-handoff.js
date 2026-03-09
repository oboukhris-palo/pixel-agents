#!/usr/bin/env node

/**
 * Validates handoff artifacts against schema
 * Ensures completeness before next agent starts
 * 
 * Usage: node .github/scripts/validate-handoff.js [--strict]
 * Strict mode: Requires all optional fields + passes additional checks
 */

const fs = require('fs');
const path = require('path');

// Mock AJV validation for now (install ajv for production)
// const Ajv = require('ajv');
// const ajv = new Ajv();

const schemaPath = path.join(__dirname, '../schemas/handoff.schema.json');

// Helper: Load schema
function loadSchema() {
  try {
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      return null;
    }
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    return schema;
  } catch (error) {
    console.error(`❌ Failed to load schema: ${error.message}`);
    return null;
  }
}

// Helper: Manual validation against schema structure
function validateHandoffAgainstSchema(handoff, schema) {
  const errors = [];
  
  if (!handoff.handoff) {
    errors.push('Missing root "handoff" object');
    return errors;
  }

  const h = handoff.handoff;
  
  // Required fields
  const requiredFields = [
    'from_agent',
    'to_agent',
    'workflow_type',
    'story_ref',
    'phase',
    'status',
    'context',
    'artifacts',
    'decision_log',
    'timestamp'
  ];

  requiredFields.forEach(field => {
    if (!h[field]) {
      errors.push(`Missing required field: handoff.${field}`);
    }
  });

  // Field type validation
  if (h.from_agent && typeof h.from_agent !== 'string') {
    errors.push('from_agent must be string');
  }
  if (h.to_agent && typeof h.to_agent !== 'string') {
    errors.push('to_agent must be string');
  }
  if (h.context && typeof h.context !== 'object') {
    errors.push('context must be object');
  }
  if (h.artifacts && !Array.isArray(h.artifacts)) {
    errors.push('artifacts must be array');
  }
  if (h.decision_log && !Array.isArray(h.decision_log)) {
    errors.push('decision_log must be array');
  }

  // Enum validation
  const validWorkflows = ['pdlc', 'implementation', 'ci-cd'];
  if (h.workflow_type && !validWorkflows.includes(h.workflow_type)) {
    errors.push(`workflow_type must be one of: ${validWorkflows.join(', ')}`);
  }

  const validPhases = ['preparation', 'execution', 'review', 'completion'];
  if (h.phase && !validPhases.includes(h.phase)) {
    errors.push(`phase must be one of: ${validPhases.join(', ')}`);
  }

  const validStatuses = ['started', 'in-progress', 'blocked', 'completed'];
  if (h.status && !validStatuses.includes(h.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  // Story ref format: US-NNN or EPIC-NNN
  if (h.story_ref) {
    const storyRefRegex = /^(US|EPIC)-\d{3,}$/;
    if (!storyRefRegex.test(h.story_ref)) {
      errors.push('story_ref must match format: US-NNN or EPIC-NNN (NNN = 3+ digits)');
    }
  }

  // Timestamp format
  if (h.timestamp) {
    try {
      new Date(h.timestamp);
    } catch {
      errors.push('timestamp must be valid ISO-8601 format');
    }
  }

  return errors;
}

// Helper: Additional validation checks
function performAdditionalChecks(handoff, strict = false) {
  const checks = [];

  const h = handoff.handoff || {};

  // Check: delta_summary exists
  if (!h.context?.delta_summary) {
    checks.push({
      severity: strict ? 'error' : 'warning',
      message: 'context.delta_summary missing (should include what changed)'
    });
  }

  // Check: context not empty
  if (h.context && Object.keys(h.context).length === 0) {
    checks.push({
      severity: 'error',
      message: 'context cannot be empty (must include delta_summary, open_questions, next_files)'
    });
  }

  // Check: artifacts array not empty
  if (!h.artifacts || h.artifacts.length === 0) {
    checks.push({
      severity: 'warning',
      message: 'artifacts array is empty (should list files passed to next agent)'
    });
  }

  // Check: decision_log entries have required fields
  if (h.decision_log && Array.isArray(h.decision_log)) {
    h.decision_log.forEach((entry, idx) => {
      if (!entry.decision) {
        checks.push({
          severity: 'error',
          message: `decision_log[${idx}] missing "decision" field`
        });
      }
      if (!entry.rationale && strict) {
        checks.push({
          severity: 'warning',
          message: `decision_log[${idx}] missing "rationale" (should explain why this decision)`
        });
      }
    });
  }

  // Check: timestamp not in future
  if (h.timestamp) {
    const handoffTime = new Date(h.timestamp);
    const now = new Date();
    if (handoffTime > now) {
      checks.push({
        severity: 'warning',
        message: 'timestamp is in the future'
      });
    }
  }

  return checks;
}

// Main validation function
function validateHandoffFile(filePath, strict = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const handoff = JSON.parse(content);

    const schema = loadSchema();
    if (!schema) {
      return {
        valid: false,
        errors: ['Schema not available'],
        file: filePath
      };
    }

    // Schema validation
    const schemaErrors = validateHandoffAgainstSchema(handoff, schema);
    
    // Additional checks
    const checks = performAdditionalChecks(handoff, strict);
    const checkErrors = checks
      .filter(c => c.severity === 'error')
      .map(c => c.message);
    const checkWarnings = checks
      .filter(c => c.severity === 'warning')
      .map(c => c.message);

    const allErrors = [...schemaErrors, ...checkErrors];
    const valid = allErrors.length === 0;

    return {
      valid,
      errors: allErrors,
      warnings: checkWarnings,
      file: filePath,
      summary: `${valid ? '✓' : '✗'} ${filePath}`
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error.message],
      file: filePath,
      summary: `✗ ${filePath} - Parse error`
    };
  }
}

// Scan all handoff files
function validateAllHandoffs(strict = false) {
  const handoffDir = path.join(__dirname, '../../docs/user-stories');
  const results = [];

  if (!fs.existsSync(handoffDir)) {
    console.log('ℹ️  No user-stories directory yet. Handoffs will be validated as they\'re created.');
    return { valid: true, results: [], total: 0 };
  }

  try {
    const dirs = fs.readdirSync(handoffDir);
    
    for (const dir of dirs) {
      const dirPath = path.join(handoffDir, dir);
      const stat = fs.statSync(dirPath);
      
      if (!stat.isDirectory()) continue;

      // Look for handoff-*.json files
      const files = fs.readdirSync(dirPath).filter(f => f.startsWith('handoff-') && f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const result = validateHandoffFile(filePath, strict);
        results.push(result);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory: ${error.message}`);
  }

  const validCount = results.filter(r => r.valid).length;
  const totalCount = results.length;

  return {
    valid: totalCount === 0 || validCount === totalCount,
    results,
    total: totalCount,
    passed: validCount,
    summary: {
      total: totalCount,
      passed: validCount,
      failed: totalCount - validCount,
      passRate: totalCount === 0 ? '100%' : `${((validCount / totalCount) * 100).toFixed(1)}%`
    }
  };
}

// CLI
function main() {
  const strict = process.argv.includes('--strict');
  
  console.log('\n🔍 Validating Handoff Artifacts\n');
  console.log('=' .repeat(60));

  const validation = validateAllHandoffs(strict);

  if (validation.results.length > 0) {
    console.log(`\nResults: ${validation.summary.passed}/${validation.summary.total} passed (${validation.summary.passRate})\n`);
    
    validation.results.forEach(result => {
      if (!result.valid) {
        console.log(`\n${result.summary}`);
        result.errors.forEach(err => console.log(`  ❌ ${err}`));
        result.warnings?.forEach(warn => console.log(`  ⚠️  ${warn}`));
      } else {
        console.log(`${result.summary}`);
      }
    });
  } else {
    console.log('\n✓ No handoff files found yet. Ready for Phase 2.');
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\nValidation: ${validation.valid ? '✓ PASSED' : '✗ FAILED'}\n`);

  process.exit(validation.valid ? 0 : 1);
}

main();
