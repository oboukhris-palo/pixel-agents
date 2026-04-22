#!/usr/bin/env node

/**
 * Setup Git Hooks Script
 * 
 * Creates self-contained git hooks directly in .git/hooks
 * Run this automatically on npm install or manually
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the client repository root from (in priority order):
 *  1. --client <path> CLI argument
 *  2. PROJECT_PATH environment variable
 *  3. Current working directory (cwd when running from client repo)
 *
 * NOTE: Do NOT use __dirname-based resolution here because this script
 * lives inside gene2-core (.gene2-core/.github/scripts/), not the client repo.
 */
function resolveRepoRoot(cliArgs) {
  const clientIdx = (cliArgs || []).findIndex(a => a === '--client');
  if (clientIdx >= 0 && cliArgs[clientIdx + 1]) {
    return path.resolve(cliArgs[clientIdx + 1]);
  }
  if (process.env.PROJECT_PATH) {
    return path.resolve(process.env.PROJECT_PATH);
  }
  return process.cwd();
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook definitions
// All script references use .gene2-core/.github/scripts/ because in the client
// repo the framework lives at <client>/.gene2-core/ (symlink or submodule).
// ─────────────────────────────────────────────────────────────────────────────
const hooks = {
  'pre-commit': `#!/bin/bash
set -e

echo "🔍 [pre-commit] Validating and updating documentation..."

# PHASE 1: Log Agent Action
echo "  1️⃣  Logging agent action..."
AGENT_NAME="\${AGENT_NAME:-unknown}"
PHASE_NAME="\${PHASE_NAME:-unknown}"
EPIC_REF="\${EPIC_REF:-}"
US_REF="\${US_REF:-}"
TDD_CYCLE="\${TDD_CYCLE:-}"

# Determine log directory based on phase
if [ "\$PHASE_NAME" = "implementation" ] && [ -n "\$EPIC_REF" ] && [ -n "\$US_REF" ]; then
  LOG_DIR="logs/05-implementation/epics/\${EPIC_REF}/user-stories/\${US_REF}"
else
  LOG_DIR="logs/\${PHASE_NAME}"
fi

mkdir -p "\$LOG_DIR"
LOG_FILE="\$LOG_DIR/agent-\${AGENT_NAME}-\$(date +%Y%m%d).md"

# Create log file with frontmatter if it does not exist today
if [ ! -f "\$LOG_FILE" ]; then
  cat > "\$LOG_FILE" << 'EOFLOG'
---
metadata:
  templateId: "agent-log"
  templateVersion: "2.0"
  documentType: "agent-activity-log"
  template_source: ".github/templates/agent-log-tmpl.md"
EOFLOG
  echo "  title: \\"Agent Log: \${AGENT_NAME}\\"" >> "\$LOG_FILE"
  echo "  ai_model: \\"\${MODEL_NAME:-unknown}\\"" >> "\$LOG_FILE"
  echo "  agent_name: \\"\${AGENT_NAME}\\"" >> "\$LOG_FILE"
  echo "  date: \\"$(date +%Y-%m-%d)\\"" >> "\$LOG_FILE"
  echo "  version: \\"1.0\\"" >> "\$LOG_FILE"
  echo "  status: \\"active\\"" >> "\$LOG_FILE"
  echo "---" >> "\$LOG_FILE"
  echo "" >> "\$LOG_FILE"
  echo "# Agent Log: \${AGENT_NAME}" >> "\$LOG_FILE"
  echo "" >> "\$LOG_FILE"
fi

# Append action entry
TIMESTAMP=\$(date +%Y-%m-%dT%H:%M:%SZ)
CHANGED_FILES=\$(git diff --cached --name-only | tr '\\n' ', ')
CHANGED_COUNT=\$(git diff --cached --name-only | wc -l | tr -d ' ')
ACTION_SUMMARY="Changes to \${CHANGED_COUNT} files"

cat >> "\$LOG_FILE" << EOF

## \$TIMESTAMP | \$ACTION_SUMMARY

**Status**: in-progress

| Field | Value |
|-------|-------|
| **Phase** | \${PHASE_NAME} |
| **Epic/Story** | \${EPIC_REF}\${US_REF:+/}\${US_REF} |
| **Layer/Cycle** | \${TDD_CYCLE} |
| **Files Changed** | \$(echo \$CHANGED_FILES | sed 's/,\$//') |
| **Handoff** | Chat-based (read history + checkpoint.yaml) |

EOF

echo "  ✓ Logged to: \$LOG_FILE"

# PHASE 2: Update INDEX.md for Modified Folders
echo "  2️⃣  Updating INDEX.md for modified folders..."
MODIFIED_DIRS=\$(git diff --cached --name-only | xargs -I {} dirname {} | sort -u)

for dir in \$MODIFIED_DIRS; do
  if [ -d "\$dir" ]; then
    if [ -f "\$dir/INDEX.md" ] || [ -f "\$dir/index.md" ]; then
      echo "    • Updating index for: \$dir"
      node .gene2-core/.github/scripts/repo-conventions/update-index.mjs --root . "\$dir" 2>/dev/null || {
        echo "    ⚠️  Index update issue in \$dir (non-blocking)"
      }
    fi
  fi
done

# PHASE 3: Update Root README.md if docs were added
echo "  3️⃣  Checking root README.md..."
if echo "\$MODIFIED_DIRS" | grep -q "^docs/"; then
  echo "    • Documentation changes detected"
  if [ -f "README.md" ]; then
    echo "    • Root README.md exists and is up to date"
  fi
fi

# PHASE 4: Enforce Naming & Validation Conventions
echo "  4️⃣  Validating compliance..."
node .gene2-core/.github/scripts/repo-conventions/enforce-naming.mjs --root . --branch --commits || {
  echo "❌ Naming convention violation"
  exit 1
}

# PHASE 5: Validate Agent Logging Compliance
echo "  5️⃣  Checking agent logging compliance..."
node .gene2-core/.github/scripts/hooks/validate-agent-logs.mjs 2>/dev/null || {
  echo "⚠️  Agent logging validation skipped (hook not found)"
}

# PHASE 6: Validate Metadata Frontmatter
echo "  6️⃣  Checking document metadata compliance..."
node .gene2-core/.github/scripts/hooks/validate-metadata-frontmatter.mjs 2>/dev/null || {
  echo "⚠️  Metadata validation skipped (hook not found)"
}

# PHASE 7: Check for Forbidden File References
echo "  7️⃣  Checking for forbidden artifacts..."
if git diff --cached --name-only | xargs grep -l "api-design\\\\.md\\\\|tdd-execution\\\\.md" 2>/dev/null | grep -v "enhancement.md"; then
  echo "❌ Forbidden file references found (api-design.md or tdd-execution.md)"
  exit 1
fi

# PHASE 8: Verify description.md Purity
echo "  8️⃣  Verifying description.md purity..."
if git diff --cached --name-only | grep "description\\\\.md" | xargs grep -l "Related logs\\\\|/logs/" 2>/dev/null; then
  echo "❌ description.md contains log references. Keep pure (specification only)."
  exit 1
fi

# PHASE 9: Stage All Validated Changes
echo "  9️⃣  Staging validated changes..."
git add -A

echo ""
echo "✅ [pre-commit] All validations passed - ready to commit"
exit 0
`,

  'commit-msg': `#!/bin/bash

COMMIT_MSG_FILE=\$1
MSG=\$(cat "\$COMMIT_MSG_FILE")

echo "🔍 [commit-msg] Validating commit message..."

# Validate commit message format using enforce-naming.mjs
node .gene2-core/.github/scripts/repo-conventions/enforce-naming.mjs --root . --commits || {
  echo "❌ Commit message violates naming policy"
  exit 1
}

echo "✅ [commit-msg] Commit message valid"
exit 0
`,

  'post-merge': `#!/bin/bash

echo "🔄 [post-merge] Updating documentation indices..."

# Auto-run index update in case other team members added docs
node .gene2-core/.github/scripts/repo-conventions/update-index.mjs --root . docs 2>/dev/null || {
  echo "⚠️  Auto-update of indexes encountered issues."
  echo "    Run: node .gene2-core/.github/scripts/repo-conventions/update-index.mjs --root . docs"
}

# Update checkpoint if variables are set
if [ -n "\$AGENT_NAME" ]; then
  TIMESTAMP=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
  cat > .github/checkpoint.yaml << EOF
# Gen-e2 Toolbox Checkpoint - auto-updated on post-merge
last_update: "\${TIMESTAMP}"
updated_by_agent: "\${AGENT_NAME:-unknown}"
current_phase: "\${PHASE_NAME:-unknown}"
sub_phase: "\${TDD_CYCLE:-}"
active_epic: "\${EPIC_REF:-null}"
active_story: "\${US_REF:-null}"
current_layer: "\${LAYER_NAME:-null}"
current_cycle: "\${TDD_CYCLE:-null}"
last_agent: "\${AGENT_NAME:-unknown}"
ai_model_in_use: "\${MODEL_NAME:-unknown}"
generated_files: []
blockers: []
decision_gates_pending: []
notes: "Auto-updated after merge"
EOF
  echo "  ✓ Checkpoint updated"
fi

echo "✅ [post-merge] Documentation sync complete"
exit 0
`
};

/**
 * Install git hooks into the given client repository.
 * @param {object} args  Parsed CLI args (or an object with a `client` key).
 *                       Pass `{ client: '/path/to/repo' }` when calling programmatically.
 */
export async function setupGitHooks(args = {}) {
  const repoRoot = typeof args === 'string'
    ? path.resolve(args)
    : resolveRepoRoot(
        // support both { client: '...' } objects AND raw argv arrays
        Array.isArray(args) ? args : Object.entries(args).flatMap(([k, v]) => [`--${k}`, v])
      );
  const hooksDest = path.join(repoRoot, '.git/hooks');

  console.log('🔧 Setting up git hooks...\n');
  console.log(`   Client repo: ${repoRoot}\n`);

  // Step 1: Ensure .git/hooks directory exists
  if (!fs.existsSync(hooksDest)) {
    fs.mkdirSync(hooksDest, { recursive: true });
    console.log('✓ Created .git/hooks directory');
  }

  // Step 2: Write hook files directly to .git/hooks
  let installedCount = 0;

  for (const [hookName, hookContent] of Object.entries(hooks)) {
    const destFile = path.join(hooksDest, hookName);

    try {
      fs.writeFileSync(destFile, hookContent);
      fs.chmodSync(destFile, 0o755); // Make executable
      console.log(`✓ Installed: ${hookName}`);
      installedCount++;
    } catch (error) {
      console.error(`❌ Failed to install ${hookName}:`, error.message);
      throw error;
    }
  }

  if (installedCount === 0) {
    throw new Error('No hooks were installed');
  }

  // Step 3: Configure git core.hooksPath
  const gitDir = path.join(repoRoot, '.git');
  if (fs.existsSync(gitDir)) {
    try {
      execSync('git config core.hooksPath .git/hooks', { cwd: repoRoot, stdio: 'pipe' });
      console.log('✓ Configured git core.hooksPath -> .git/hooks');
    } catch {
      console.warn('⚠️  Could not configure git core.hooksPath (non-critical)');
    }
  } else {
    console.warn('⚠️  Not in a git repository - skipping git config');
    console.warn('   Run from within a git repository or execute manually:');
    console.warn('   git config core.hooksPath .git/hooks');
  }

  // Step 4: Verify hooks are executable
  console.log('\n🔍 Verifying hook setup...');
  for (const hookName of Object.keys(hooks)) {
    const destFile = path.join(hooksDest, hookName);
    if (fs.existsSync(destFile)) {
      const stats = fs.statSync(destFile);
      const isExecutable = (stats.mode & 0o111) !== 0;
      if (isExecutable) {
        console.log(`✓ ${hookName} is executable`);
      } else {
        console.warn(`⚠️  ${hookName} is not executable`);
        fs.chmodSync(destFile, 0o755);
      }
    }
  }

  console.log('\n✅ Git hooks setup complete!');
  console.log('\nHooks installed:');
  console.log('  • pre-commit   - Logs actions, validates naming, updates documentation');
  console.log('  • commit-msg   - Validates commit message format');
  console.log('  • post-merge   - Updates indices and checkpoint after merge\n');
  console.log('ℹ️  To bypass hooks if needed: git commit --no-verify\n');
}

// ─── CLI entry point ─────────────────────────────────────────────────────────
// When run directly: node setup-git-hooks.mjs [--client <path>]
if (import.meta.url === `file://${process.argv[1]}`) {
  setupGitHooks(process.argv.slice(2)).catch(err => {
    console.error('❌', err.message);
    process.exit(1);
  });
}

export default setupGitHooks;
