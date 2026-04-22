#!/usr/bin/env node

/**
 * generate-dashboard.mjs
 *
 * Generates a weekly Decision Trails Dashboard report from checkpoint.yaml.
 * Reads the orchestrator_decisions array and produces a markdown summary.
 *
 * Usage:
 *   node .github/scripts/generate-dashboard.mjs
 *   node .github/scripts/generate-dashboard.mjs --days 14    # Custom period
 *   node .github/scripts/generate-dashboard.mjs --output docs/dashboards/custom-report.md
 *
 * Output:
 *   docs/dashboards/decision-trails-weekly-YYYYMMDD.md
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const CHECKPOINT_PATH = resolve(process.cwd(), '.github/checkpoint.yaml');
const TEMPLATE_PATH = resolve(process.cwd(), '.github/templates/decision-dashboard-tmpl.md');
const DEFAULT_OUTPUT_DIR = resolve(process.cwd(), 'docs/dashboards');

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

/**
 * Simple YAML parser for checkpoint.yaml decision entries.
 * Extracts orchestrator_decisions entries from the YAML content.
 * Note: This is a simplified parser for the specific checkpoint.yaml structure.
 */
function extractDecisions(content) {
  const decisions = [];
  const lines = content.split('\n');
  let inDecisions = false;
  let currentEntry = null;
  let currentObj = null;
  let objStack = [];

  for (const line of lines) {
    // Detect start of orchestrator_decisions section
    if (line.match(/^orchestrator_decisions:/)) {
      inDecisions = true;
      continue;
    }

    // Detect end of section (next top-level comment block)
    if (inDecisions && line.match(/^# =+/)) {
      if (currentEntry) decisions.push(currentEntry);
      break;
    }

    if (!inDecisions) continue;

    // Skip empty lines and comments in the example block
    if (line.trim() === '' || line.trim() === '[]') continue;
    if (line.trim().startsWith('#')) continue;

    // New entry starts with "  - "
    if (line.match(/^\s{2}-\s/)) {
      if (currentEntry) decisions.push(currentEntry);
      currentEntry = {};
      const kv = line.replace(/^\s{2}-\s/, '').trim();
      if (kv.includes(':')) {
        const [key, ...rest] = kv.split(':');
        const val = rest.join(':').trim().replace(/^"|"$/g, '');
        currentEntry[key.trim()] = val === 'null' ? null : val;
      }
      continue;
    }

    // Nested properties
    if (currentEntry && line.match(/^\s{4,}/)) {
      const trimmed = line.trim();
      if (trimmed.includes(':')) {
        const [key, ...rest] = trimmed.split(':');
        const val = rest.join(':').trim().replace(/^"|"$/g, '');
        if (val === '' || val === undefined) {
          // Sub-object start (ignore for simple parsing)
          continue;
        }
        currentEntry[key.trim()] = val === 'null' ? null : val;
      }
    }
  }

  if (currentEntry && Object.keys(currentEntry).length > 0) {
    decisions.push(currentEntry);
  }

  return decisions;
}

function extractProjectState(content) {
  const state = {};
  const patterns = {
    current_phase: /current_phase:\s*"([^"]*)"/,
    phase_status: /phase_status:\s*"([^"]*)"/,
    last_gate_passed: /last_gate_passed:\s*(?:"([^"]*)"|(null))/,
    last_gate_score: /last_gate_score:\s*(?:(\d+\.?\d*)|(null))/,
    last_gate_date: /last_gate_date:\s*(?:"([^"]*)"|(null))/,
    next_expected_gate: /next_expected_gate:\s*"([^"]*)"/,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = content.match(pattern);
    if (match) {
      state[key] = match[1] || match[2] || null;
      if (state[key] === 'null') state[key] = null;
    }
  }

  return state;
}

function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function generateReport(decisions, projectState, days) {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const recentDecisions = decisions.filter(d => isWithinDays(d.timestamp, days));

  // Calculate metrics
  const phaseTransitions = recentDecisions.filter(d => d.entry_type === 'phase_transition');
  const gateOutcomes = recentDecisions.filter(d => d.entry_type === 'gate_outcome');
  const reworkDecisions = recentDecisions.filter(d => d.entry_type === 'rework_decision');

  const totalGates = gateOutcomes.length;
  const passedGates = gateOutcomes.filter(d => d.decision === 'PASS').length;
  const passRate = totalGates > 0 ? Math.round((passedGates / totalGates) * 100) : 'N/A';

  const totalPhases = phaseTransitions.length;
  const avgRework = totalPhases > 0
    ? (reworkDecisions.length / Math.max(totalPhases, 1)).toFixed(1)
    : '0';

  // Build phase timeline
  const phases = ['00-assessment', '01-requirements', '02-architecture', '03-testing', '04-planning', '05-implementation'];
  const phaseRows = phases.map(phase => {
    const gate = gateOutcomes.find(d => d.phase === phase);
    const transition = phaseTransitions.find(d => (d.to_phase || d.phase) === phase);
    const isCurrentPhase = projectState.current_phase === phase;

    let status = '⬜ Not started';
    if (gate && gate.decision === 'PASS') status = '✅ Complete';
    else if (isCurrentPhase) status = '🔄 In progress';
    else if (gate && gate.decision === 'CONDITIONAL') status = '⚠️ Conditional';
    else if (gate && gate.decision === 'FAIL') status = '❌ Blocked';

    return `| ${phase} | ${status} | ${gate?.decision || '-'} | ${gate?.quality_score || '-'}/10 | ${gate?.timestamp?.split('T')[0] || '-'} |`;
  });

  // Build blockers
  const blockers = reworkDecisions
    .map(d => `- [ ] ${d.gate_id || 'Unknown gate'}: ${d.issue || 'Quality threshold not met'}\n  - Action: ${d.action || 'Remediation needed'}\n  - Estimated rework: ${d.estimated_rework_hours || '?'}h`)
    .join('\n');

  // Build action items
  const actionItems = reworkDecisions
    .map((d, i) => `${i + 1}. [ ] ${d.action || 'Resolve gate failure'} (Gate: ${d.gate_id || 'unknown'})`)
    .join('\n');

  const report = `# Decision Trails Dashboard — Weekly Summary

**Report Period:** ${startDate.toISOString().split('T')[0]} — ${now.toISOString().split('T')[0]}
**Generated:** ${now.toISOString()}
**Data Source:** checkpoint.yaml orchestrator_decisions array

---

## Weekly Summary: PDLC Progression

| Metric | This Week | Target | Status |
|--------|-----------|--------|--------|
| **Phase Transitions** | ${phaseTransitions.length} | On track | ${phaseTransitions.length > 0 ? '✅' : '⬜'} |
| **Gate Pass Rate** | ${passRate}% (${passedGates}/${totalGates} gates) | 85%+ | ${passRate === 'N/A' ? '⬜' : passRate >= 85 ? '✅' : '⚠️'} |
| **Rework Cycles** | ${reworkDecisions.length} total (${avgRework}/phase avg) | <1.0/phase | ${parseFloat(avgRework) <= 1.0 ? '✅' : '⚠️'} |
| **Total Decisions Logged** | ${recentDecisions.length} | — | ✅ |

---

## Phase Progression Timeline

| Phase | Status | Gate Result | Score | Date |
|-------|--------|------------|-------|------|
${phaseRows.join('\n')}

---

## Current Project State

| Field | Value |
|-------|-------|
| **Current Phase** | ${projectState.current_phase || 'Not started'} |
| **Phase Status** | ${projectState.phase_status || 'N/A'} |
| **Last Gate Passed** | ${projectState.last_gate_passed || 'None'} |
| **Last Gate Score** | ${projectState.last_gate_score || 'N/A'}/10 |
| **Next Expected Gate** | ${projectState.next_expected_gate || 'N/A'} |

---

## Risk Indicators

${blockers || '**No active blockers.** All gates passing or pending.'}

---

## Decision Log (Last ${days} Days)

| # | Timestamp | Type | Phase | Details |
|---|-----------|------|-------|---------|
${recentDecisions.map((d, i) => {
    const type = d.entry_type || 'unknown';
    const details = type === 'phase_transition'
      ? `${d.from_phase || 'start'} → ${d.to_phase || d.phase}`
      : type === 'gate_outcome'
        ? `${d.gate_id || ''}: ${d.decision || ''} (${d.quality_score || '-'}/10)`
        : `Rework: ${d.issue || d.action || ''}`;
    return `| ${i + 1} | ${(d.timestamp || '').split('T')[0]} | ${type} | ${d.phase || '-'} | ${details} |`;
  }).join('\n') || '| - | - | - | - | No decisions recorded |'}

---

## Action Items

${actionItems || 'No pending action items.'}

---

## Learnings & Patterns

${reworkDecisions.length > 0
    ? `- **Rework pattern detected**: ${reworkDecisions.length} rework cycle(s) this period. Review gate thresholds and agent quality.`
    : '- **Clean progression**: No rework cycles needed. Gate thresholds well-calibrated.'}
${gateOutcomes.filter(d => d.decision === 'CONDITIONAL').length > 0
    ? `- **Conditional approvals**: ${gateOutcomes.filter(d => d.decision === 'CONDITIONAL').length} gates passed conditionally. Monitor condition resolution.`
    : ''}

---

**Report Version:** 1.0 | **Generator:** generate-dashboard.mjs
`;

  return report;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const days = parseInt(args.days) || 7;

  console.log(`📊 Generating Decision Trails Dashboard (last ${days} days)...`);

  // Read checkpoint.yaml
  let content;
  try {
    content = readFileSync(CHECKPOINT_PATH, 'utf-8');
  } catch (err) {
    console.error(`Cannot read ${CHECKPOINT_PATH}: ${err.message}`);
    process.exit(1);
  }

  // Extract data
  const decisions = extractDecisions(content);
  const projectState = extractProjectState(content);

  console.log(`   Found ${decisions.length} total decision entries`);
  console.log(`   Current phase: ${projectState.current_phase || 'Not set'}`);

  // Generate report
  const report = generateReport(decisions, projectState, days);

  // Determine output path
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const outputPath = args.output
    ? resolve(process.cwd(), args.output)
    : resolve(DEFAULT_OUTPUT_DIR, `decision-trails-weekly-${today}.md`);

  // Ensure output directory exists
  mkdirSync(dirname(outputPath), { recursive: true });

  // Write report
  writeFileSync(outputPath, report, 'utf-8');
  console.log(`✅ Dashboard written to: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
