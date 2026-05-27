#!/usr/bin/env node

/**
 * validate-metadata-frontmatter.mjs - Validates document metadata frontmatter compliance
 *
 * Validates:
 * 1. docs/ files — require templateId, author, date_created, version frontmatter
 * 2. .github/instructions/ files — require applyTo, description frontmatter (E3)
 * 3. checkpoint.yaml — require framework_version, current_phase, last_updated fields (E2)
 * 4. framework-config.mjs — validate all boolean mode flags present with correct types (E5)
 *
 * Part of gene2 Framework v2.0 Compliance Framework
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const MINIMAL_REQUIRED_FIELDS = {
  templateId: 'Template identifier',
  author: 'Agent that created document',
  date_created: 'Creation date',
  version: 'Semantic version',
};

// Get staged generated docs (only those in recognized doc paths)
const stagedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(Boolean);
const generatedDocs = stagedFiles.filter(f =>
  f.endsWith('.md') &&
  !f.includes('node_modules') &&
  !f.includes('.git') &&
  !f.includes('logs/') &&
  (
    f.startsWith('docs/01-') ||
    f.startsWith('docs/02-') ||
    f.startsWith('docs/03-') ||
    f.startsWith('docs/04-') ||
    f.startsWith('docs/05-')
  )
);

if (generatedDocs.length === 0) {
  console.log('  ✓ No generated docs to validate');
  process.exit(0);
}

let violations = 0;

for (const docFile of generatedDocs) {
  if (!existsSync(docFile)) continue;

  const content = readFileSync(docFile, 'utf-8');
  const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);

  // Skip docs without frontmatter — not all docs are required to have it
  if (!metadataMatch) continue;

  const metadata = metadataMatch[1];
  const missingFields = Object.keys(MINIMAL_REQUIRED_FIELDS).filter(
    field => !metadata.includes(field)
  );

  if (missingFields.length > 0) {
    console.error(
      `  ❌ ${docFile}: Missing metadata: ${missingFields.join(', ')}`
    );
    violations++;
  }

  // Warn on overly verbose metadata
  const frontmatterLines = metadata.split('\n').length;
  if (frontmatterLines > 30) {
    console.warn(
      `  ⚠️  ${docFile}: Metadata is verbose (${frontmatterLines} lines). Aim for 10-15 lines.`
    );
  } else {
    console.log(`  ✓ ${docFile}: Metadata valid (${frontmatterLines} lines)`);
  }
}

if (violations > 0) {
  console.error(`\n❌ Generated docs metadata validation failed (${violations} issue(s))`);
  process.exit(1);
}

if (generatedDocs.length > 0) console.log('✅ Generated docs metadata compliant');

// ─────────────────────────────────────────────
// E3: Validate .github/instructions/ frontmatter
// ─────────────────────────────────────────────
const INSTRUCTION_REQUIRED_FIELDS = ['applyTo', 'description'];
const instructionFiles = stagedFiles.filter(f =>
  f.startsWith('.github/instructions/') && f.endsWith('.md')
);

let instructionViolations = 0;
for (const instrFile of instructionFiles) {
  if (!existsSync(instrFile)) continue;

  const content = readFileSync(instrFile, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    console.error(
      `  ❌ ${instrFile}: Missing frontmatter. Instructions files require applyTo + description.`
    );
    instructionViolations++;
    continue;
  }

  const frontmatter = frontmatterMatch[1];
  const missingFields = INSTRUCTION_REQUIRED_FIELDS.filter(field => !frontmatter.includes(field));
  if (missingFields.length > 0) {
    console.error(
      `  ❌ ${instrFile}: Missing required frontmatter fields: ${missingFields.join(', ')}`
    );
    instructionViolations++;
  } else {
    console.log(`  ✓ ${instrFile}: Instruction frontmatter valid`);
  }
}

if (instructionViolations > 0) {
  console.error(`\n❌ Instruction frontmatter validation failed (${instructionViolations} issue(s))`);
  process.exit(1);
}
if (instructionFiles.length > 0) console.log('✅ Instruction file frontmatter compliant');

// ─────────────────────────────────────────────
// E2: Validate checkpoint.yaml required fields
// ─────────────────────────────────────────────
const CHECKPOINT_REQUIRED_FIELDS = [
  'framework_version',
  'project_name',
  'current_phase',
  'last_updated',
  'current_epic',
  'current_user_story',
];

const checkpointFiles = stagedFiles.filter(f => f.endsWith('checkpoint.yaml'));
let checkpointViolations = 0;

for (const checkpointFile of checkpointFiles) {
  if (!existsSync(checkpointFile)) continue;

  const content = readFileSync(checkpointFile, 'utf-8');
  const missingFields = CHECKPOINT_REQUIRED_FIELDS.filter(field => !content.includes(field + ':'));
  if (missingFields.length > 0) {
    console.error(
      `  ❌ ${checkpointFile}: Missing required fields: ${missingFields.join(', ')}`
    );
    checkpointViolations++;
  } else {
    console.log(`  ✓ ${checkpointFile}: checkpoint.yaml valid`);
  }
}

if (checkpointViolations > 0) {
  console.error(`\n❌ checkpoint.yaml validation failed (${checkpointViolations} issue(s))`);
  process.exit(1);
}
if (checkpointFiles.length > 0) console.log('✅ checkpoint.yaml compliant');

// ─────────────────────────────────────────────
// E5: Validate framework-config.mjs mode flags
// ─────────────────────────────────────────────
const FRAMEWORK_CONFIG_REQUIRED_FLAGS = [
  'tddMode',
  'bddMode',
  'dddMode',
  'grillMeMode',
  'cavemanMode',
  'approvalMode',
];

const configFiles = stagedFiles.filter(f => f.endsWith('framework-config.mjs'));
let configViolations = 0;

for (const configFile of configFiles) {
  if (!existsSync(configFile)) continue;

  const content = readFileSync(configFile, 'utf-8');
  const missingFlags = FRAMEWORK_CONFIG_REQUIRED_FLAGS.filter(flag => !content.includes(flag));
  if (missingFlags.length > 0) {
    console.error(
      `  ❌ ${configFile}: Missing required mode flags: ${missingFlags.join(', ')}`
    );
    configViolations++;
  }

  // Validate boolean values only (warn on non-boolean)
  const boolFlags = ['tddMode', 'bddMode', 'dddMode', 'grillMeMode', 'cavemanMode'];
  for (const flag of boolFlags) {
    const regex = new RegExp(`${flag}:\\s*([^,}\\n]+)`);
    const match = content.match(regex);
    if (match) {
      const value = match[1].trim();
      if (value !== 'true' && value !== 'false') {
        console.warn(
          `  ⚠️  ${configFile}: ${flag} should be a boolean (true/false), got: ${value}`
        );
      }
    }
  }

  if (missingFlags.length === 0) {
    console.log(`  ✓ ${configFile}: framework-config.mjs flags valid`);
  }
}

if (configViolations > 0) {
  console.error(`\n❌ framework-config.mjs validation failed (${configViolations} issue(s))`);
  process.exit(1);
}
if (configFiles.length > 0) console.log('✅ framework-config.mjs compliant');

process.exit(0);
