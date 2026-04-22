#!/usr/bin/env node

/**
 * validate-agent-logs.mjs - Validates agent log compliance
 *
 * - Checks agent logs use template: .github/templates/agent-log-tmpl.md
 * - Verifies less-verbose format (max 200 lines/day)
 * - Ensures required metadata fields are present
 *
 * Part of Gen-e2 Toolbox v2.0 Compliance Framework
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const LOGS_PATTERN = /logs\/(.*?)\/(agent-.*?-\d{8}\.md|agent-.*?\.md)/;
const MAX_LINES_PER_DAY = 200;
const REQUIRED_FIELDS = [
  'templateId',
  'templateVersion',
  'documentType',
  'agent_name',
  'date',
  'version',
  'status',
];

// Get staged log files
const stagedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(Boolean);
const logFiles = stagedFiles.filter(f => LOGS_PATTERN.test(f));

if (logFiles.length === 0) {
  console.log('  ✓ No agent logs to validate');
  process.exit(0);
}

let violations = 0;

for (const logFile of logFiles) {
  if (!existsSync(logFile)) continue;

  const content = readFileSync(logFile, 'utf-8');
  const lines = content.split('\n').length;
  const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);

  // Check 1: Frontmatter metadata present
  if (!metadataMatch) {
    console.error(
      `  ❌ ${logFile}: Missing YAML frontmatter. Use template: .github/templates/agent-log-tmpl.md`
    );
    violations++;
    continue;
  }

  const metadata = metadataMatch[1];
  const missingFields = REQUIRED_FIELDS.filter(field => !metadata.includes(field));

  if (missingFields.length > 0) {
    console.error(
      `  ❌ ${logFile}: Missing metadata fields: ${missingFields.join(', ')}`
    );
    violations++;
  }

  // Check 2: Max 200 lines per day
  if (lines > MAX_LINES_PER_DAY) {
    console.warn(
      `  ⚠️  ${logFile}: ${lines} lines (max: ${MAX_LINES_PER_DAY}). Keep logs minimal.`
    );
  }

  // Check 3: templateId points to agent-log
  if (!metadata.includes('templateId: "agent-log"') && !metadata.includes("templateId: 'agent-log'")) {
    console.error(`  ❌ ${logFile}: Invalid templateId. Must be 'agent-log'`);
    violations++;
  }

  // Check 4: No file-based handoff references (no tdd-execution.md or handoff.json)
  if (content.includes('tdd-execution.md') || content.includes('handoff.json')) {
    console.error(
      `  ❌ ${logFile}: Contains forbidden file handoff references (tdd-execution.md / handoff.json). Use chat-based handoff.`
    );
    violations++;
  }

  // Report entry count
  const timestamps = content.match(/(?:^|\n)## \d{4}-\d{2}-\d{2}T/g) || [];
  console.log(`  ✓ ${logFile}: ${timestamps.length} log entries, ${lines} lines`);
}

if (violations > 0) {
  console.error(`\n❌ Agent log validation failed (${violations} issue(s))`);
  process.exit(1);
}

console.log('✅ Agent logs compliant');
process.exit(0);
