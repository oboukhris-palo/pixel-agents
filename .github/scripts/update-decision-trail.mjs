#!/usr/bin/env node

/**
 * update-decision-trail.mjs
 *
 * Appends a decision entry to checkpoint.yaml orchestrator_decisions array.
 * Called by phase workflows at phase exits after gate execution.
 *
 * Usage:
 *   node .github/scripts/update-decision-trail.mjs \
 *     --type phase_transition \
 *     --phase "00-assessment" \
 *     --from-phase "null" \
 *     --to-phase "01-requirements" \
 *     --trigger "gate-00-assessment PASSED" \
 *     --rationale "All prerequisites met" \
 *     --workflow "00-assessment.workflows.yml"
 *
 *   node .github/scripts/update-decision-trail.mjs \
 *     --type gate_outcome \
 *     --phase "01-requirements" \
 *     --gate-id "gate-01-requirements" \
 *     --decision "PASS" \
 *     --score 8.5 \
 *     --details "All prerequisites verified"
 *
 *   node .github/scripts/update-decision-trail.mjs \
 *     --type rework_decision \
 *     --phase "03-testing" \
 *     --gate-id "gate-03-testing" \
 *     --issue "BDD coverage 78%" \
 *     --action "Return to BA" \
 *     --rework-hours 4
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const CHECKPOINT_PATH = resolve(process.cwd(), '.github/checkpoint.yaml');

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2).replace(/-/g, '_');
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      parsed[key] = value;
      if (value !== true) i++;
    }
  }
  return parsed;
}

function getTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function getGitSha() {
  try {
    const { execSync } = await import('child_process');
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function buildEntry(args) {
  const timestamp = getTimestamp();
  const type = args.type;

  const base = {
    timestamp,
    entry_type: type,
    phase: args.phase,
    recorded_by: 'orchestrator',
    workflow_ref: args.workflow || `${args.phase}.workflows.yml`,
    git_commit: args.git_commit || null,
  };

  switch (type) {
    case 'phase_transition':
      return {
        ...base,
        transition: {
          from_phase: args.from_phase === 'null' ? null : args.from_phase,
          to_phase: args.to_phase,
          trigger: args.trigger || 'Manual transition',
          rationale: args.rationale || 'N/A',
        },
      };

    case 'gate_outcome':
      return {
        ...base,
        gate_result: {
          gate_id: args.gate_id,
          decision: args.decision || 'PASS',
          quality_score: parseFloat(args.score) || 0,
          metrics: {},
          details: args.details || '',
        },
      };

    case 'rework_decision': {
      const retryDeadline = new Date();
      retryDeadline.setHours(retryDeadline.getHours() + 24);
      return {
        ...base,
        rework: {
          gate_id: args.gate_id,
          issue: args.issue || 'Quality threshold not met',
          action: args.action || 'Return to responsible agent for remediation',
          retry_deadline: retryDeadline.toISOString().replace(/\.\d{3}Z$/, 'Z'),
          estimated_rework_hours: parseInt(args.rework_hours) || 4,
        },
      };
    }

    default:
      console.error(`Unknown entry type: ${type}`);
      process.exit(1);
  }
}

function yamlSerializeEntry(entry, indent = 2) {
  const pad = ' '.repeat(indent);

  function serialize(obj, level = 0) {
    const prefix = ' '.repeat(indent + level * 2);
    const lines = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        lines.push(`${prefix}${key}: null`);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${prefix}${key}:`);
        lines.push(...serialize(value, level + 1).split('\n').filter(Boolean));
      } else if (typeof value === 'number') {
        lines.push(`${prefix}${key}: ${value}`);
      } else {
        lines.push(`${prefix}${key}: "${value}"`);
      }
    }

    return lines.join('\n');
  }

  return `  - ${serialize(entry).trimStart().replace(/^ {2}/, '')}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.type || !args.phase) {
    console.error('Required: --type <phase_transition|gate_outcome|rework_decision> --phase <phase>');
    console.error('Run with --help for usage examples.');
    process.exit(1);
  }

  // Build the decision entry
  const entry = buildEntry(args);

  console.log(`\n📝 Decision Trail Entry:`);
  console.log(`   Type: ${entry.entry_type}`);
  console.log(`   Phase: ${entry.phase}`);
  console.log(`   Timestamp: ${entry.timestamp}`);

  // Read checkpoint.yaml
  let content;
  try {
    content = readFileSync(CHECKPOINT_PATH, 'utf-8');
  } catch (err) {
    console.error(`Cannot read ${CHECKPOINT_PATH}: ${err.message}`);
    process.exit(1);
  }

  // Find the orchestrator_decisions array and append
  // Simple approach: replace the empty array [] or append before the last section
  const emptyArrayPattern = /^(orchestrator_decisions:\s*\n)\s*\[\]/m;
  const existingArrayPattern = /^(orchestrator_decisions:\s*\n)((?:\s+-[\s\S]*?)?)(\n# =+)/m;

  const yamlEntry = yamlSerializeEntry(entry);

  if (emptyArrayPattern.test(content)) {
    // Replace empty array with first entry
    content = content.replace(emptyArrayPattern, `$1${yamlEntry}\n`);
  } else if (existingArrayPattern.test(content)) {
    // Append to existing entries
    content = content.replace(existingArrayPattern, `$1$2\n${yamlEntry}\n$3`);
  } else {
    console.error('Could not find orchestrator_decisions section in checkpoint.yaml');
    process.exit(1);
  }

  // Also update project_state fields if this is a phase transition
  if (entry.entry_type === 'phase_transition' && entry.transition) {
    const phasePattern = /current_phase:\s*"[^"]*"/;
    const statusPattern = /phase_status:\s*"[^"]*"/;
    const gatePattern = /last_gate_passed:\s*(?:null|"[^"]*")/;

    if (entry.transition.to_phase) {
      content = content.replace(phasePattern, `current_phase: "${entry.transition.to_phase}"`);
      content = content.replace(statusPattern, `phase_status: "in-progress"`);
    }
  }

  if (entry.entry_type === 'gate_outcome' && entry.gate_result) {
    const gatePassedPattern = /last_gate_passed:\s*(?:null|"[^"]*")/;
    const gateDatePattern = /last_gate_date:\s*(?:null|"[^"]*")/;
    const gateScorePattern = /last_gate_score:\s*(?:null|\d+\.?\d*)/;

    if (entry.gate_result.decision === 'PASS') {
      content = content.replace(gatePassedPattern, `last_gate_passed: "${entry.gate_result.gate_id}"`);
      content = content.replace(gateDatePattern, `last_gate_date: "${entry.timestamp}"`);
      content = content.replace(gateScorePattern, `last_gate_score: ${entry.gate_result.quality_score}`);
    }
  }

  // Update last_update timestamp
  content = content.replace(
    /last_update:\s*"[^"]*"/,
    `last_update: "${entry.timestamp}"`
  );
  content = content.replace(
    /updated_by_agent:\s*"[^"]*"/,
    `updated_by_agent: "orchestrator"`
  );

  // Write back
  writeFileSync(CHECKPOINT_PATH, content, 'utf-8');
  console.log(`✅ Decision entry appended to ${CHECKPOINT_PATH}`);

  if (entry.entry_type === 'phase_transition') {
    console.log(`   Transition: ${entry.transition.from_phase} → ${entry.transition.to_phase}`);
  } else if (entry.entry_type === 'gate_outcome') {
    console.log(`   Gate: ${entry.gate_result.gate_id} → ${entry.gate_result.decision} (${entry.gate_result.quality_score}/10)`);
  } else if (entry.entry_type === 'rework_decision') {
    console.log(`   Rework: ${entry.rework.issue} → ${entry.rework.action}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
