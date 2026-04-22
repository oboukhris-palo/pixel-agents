#!/usr/bin/env node

/**
 * validate-metadata-frontmatter.mjs - Validates document metadata frontmatter compliance
 *
 * - Checks docs use template: .github/templates/metadata-frontmatter-standard.md
 * - Verifies minimal required fields (templateId, author, date_created, version)
 * - Warns on overly verbose metadata (>30 lines)
 *
 * Part of Gen-e2 Toolbox v2.0 Compliance Framework
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
  console.error(`\n❌ Metadata validation failed (${violations} issue(s))`);
  process.exit(1);
}

console.log('✅ Document metadata compliant');
process.exit(0);
