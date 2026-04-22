#!/usr/bin/env node
/**
 * init-framework.mjs
 * Extracts reusable framework from project template into local gene2-core
 */

import path from 'path';
import fs from 'node:fs';
import {
  logger,
  colors,
  resolvePath,
  copyDir,
  removeFiles,
  writeMD,
  writeJSON,
  getTimestamp,
} from './utils.mjs';

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const FRAMEWORK_VERSION = '2.0.0';
const FRAMEWORK_DIRS = [
  'agents',
  'instructions',
  'templates',
  'workflows',
  'quality',
  'schemas',
  'tasks',
  'prompts',
  'guides',
];

const CLIENT_SPECIFIC_INSTRUCTIONS = [
  'angular\\.instructions\\.md',
  'dot-net\\.instructions\\.md',
  // Optional client-specific setup guides (project-dependent)
  'local-deployment\\.instructions\\.md',
  'run-merchant-locally\\.instructions\\.md',
  'run-locally\\.instructions\\.md',
];

export async function initFramework(args) {
  const sourceTemplate = resolvePath(args.source || '.');
  const targetFramework = resolvePath(args.target || '../gene2-core');
  const dryRun = args['dry-run'] || false;

  logger.section('AI-First Delivery Framework Extraction');
  
  console.log(`${dryRun ? '(DRY-RUN MODE)' : ''}`);
  logger.info(`Source: ${sourceTemplate}`);
  logger.info(`Target: ${targetFramework}`);
  logger.newline();

  try {
    // Validation
    if (!fs.existsSync(path.join(sourceTemplate, '.github'))) {
      throw new Error(`Source template not found: ${sourceTemplate}/.github`);
    }

    // Step 1: Create target directory
    logger.status('Step 1: Creating framework directory');
    if (!dryRun) {
      ensureDirSync(targetFramework);
      ensureDirSync(path.join(targetFramework, '.github'));
    } else {
      logger.info(`[DRY-RUN] Would create: ${targetFramework}/.github`);
    }
    logger.success('Framework directory ready\n');

    // Step 2: Copy framework directories
    logger.status('Step 2: Copying framework files');
    for (const dir of FRAMEWORK_DIRS) {
      const sourcePath = path.join(sourceTemplate, '.github', dir);
      const targetPath = path.join(targetFramework, '.github', dir);

      if (fs.existsSync(sourcePath)) {
        logger.info(`Copying .github/${dir}/`);
        if (!dryRun) {
          await copyDir(sourcePath, targetPath);
        }
      }
    }

    // Copy core config files
    const configFiles = [
      'copilot-instructions.md',
      'checkpoint.yaml',
      '.gitkeep',
    ];

    for (const file of configFiles) {
      const sourcePath = path.join(sourceTemplate, '.github', file);
      const targetPath = path.join(targetFramework, '.github', file);

      if (fs.existsSync(sourcePath)) {
        logger.info(`Copying ${file}`);
        if (!dryRun) {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }
    logger.newline();

    // Step 3: Remove client-specific instructions
    logger.status('Step 3: Removing client-specific instructions');
    const instructionsPath = path.join(targetFramework, '.github', 'instructions');
    
    if (fs.existsSync(instructionsPath)) {
      const removed = removeFiles(instructionsPath, CLIENT_SPECIFIC_INSTRUCTIONS, { dryRun });
      if (removed.length > 0) {
        logger.success(`Removed ${removed.length} client-specific files`);
      }
    }
    logger.newline();

    // Step 4: Create framework metadata
    logger.status('Step 4: Creating framework metadata');
    const metadata = {
      framework_name: 'AI-First Delivery Framework (gene2-core)',
      framework_version: FRAMEWORK_VERSION,
      extracted_from: sourceTemplate,
      extraction_date: getTimestamp('date'),
      extraction_timestamp: getTimestamp('iso'),
      local_only: true,
      git_ignored: true,
      framework_dirs: FRAMEWORK_DIRS,
      excluded_patterns: CLIENT_SPECIFIC_INSTRUCTIONS,
      description:
        'Reusable framework for AI-first delivery methodology. Maintained locally, symlinked to client repos, never committed to remote.',
    };

    if (!dryRun) {
      writeJSON(path.join(targetFramework, '.framework-metadata.json'), metadata);
      writeMD(path.join(targetFramework, 'README.md'), generateFrameworkREADME(metadata));
    } else {
      logger.info(`[DRY-RUN] Would create: .framework-metadata.json`);
      logger.info(`[DRY-RUN] Would create: README.md`);
    }
    logger.newline();

    // Step 5: Verify extraction
    logger.status('Step 5: Verifying extraction');
    if (!dryRun) {
      const agentCount = fs
        .readdirSync(path.join(targetFramework, '.github', 'agents'))
        .filter(f => f.endsWith('.agent.md')).length;
      
      const instrCount = fs
        .readdirSync(path.join(targetFramework, '.github', 'instructions'))
        .filter(f => f.endsWith('.instructions.md')).length;

      logger.success(`Found ${agentCount} agents`);
      logger.success(`Found ${instrCount} instructions`);
    }
    logger.newline();

    // Summary
    logger.section('Framework extraction complete!');
    console.log(`${colors.yellow}Framework Location:${colors.reset} ${targetFramework}`);
    console.log(`${colors.yellow}Framework Version:${colors.reset} ${FRAMEWORK_VERSION}`);
    console.log(`${colors.yellow}Framework Contents:${colors.reset}`);
    console.log('  → .github/agents/ (generic PDLC agents)');
    console.log('  → .github/instructions/ (generic standards)');
    console.log('  → .github/workflows/ (PDLC workflows)');
    console.log('  → .github/templates/ (document templates)');
    console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
    console.log('  1. Create remote repository for gene2-core (GitHub/GitLab)');
    console.log('  2. Push framework to remote: git push -u origin main');
    console.log('  3. Use init-client to integrate framework into client repos');
    console.log('  4. Each client will include framework via Git submodule');
    console.log('  5. Framework updates propagate via: git submodule update --remote\n');

  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

function generateFrameworkREADME(metadata) {
  return `# AI-First Delivery Framework (gene2-core)

**Version**: ${metadata.framework_version}  
**Extracted**: ${metadata.extraction_timestamp}  
**Strategy**: Git submodule integration with client repositories

## Overview

This is the **reusable framework** for the AI-first delivery methodology. It contains:

- **Agents**: PDLC orchestration agents (orchestrator, ba, dev-lead, dev-tdd-*, qa, po, ux, architect, etc.)
- **Instructions**: Generic coding standards, documentation requirements, API design patterns
- **Workflows**: Complete PDLC workflows (assessment, requirements, architecture, testing, planning, implementation)
- **Templates**: Document templates (implementation-plan, agent-log, BDD scenarios, etc.)
- **Quality Gates**: Code review checklists, testing standards, validation rules
- **Prompts**: AI-optimized prompts for agent orchestration

## Git Submodule Strategy

This framework is managed as a central repository and integrated into client projects as a Git submodule:

1. **Central Repository**: Maintained in a single remote repository (gene2-core)
2. **Submodule Integration**: Each client repository adds framework via \`git submodule add\`
3. **Path in Clients**: Available at \`.gene2-core/\` within each client repository
4. **Version Controlled**: Submodule tracked in client \`.gitmodules\` file
5. **Distributed Updates**: Framework updates pulled via \`git submodule update --remote\`

## Directory Structure

\`\`\`
gene2-core/              (central git repository)
├── .github/
│   ├── agents/          # Generic PDLC agents
│   ├── instructions/    # Generic coding standards
│   ├── workflows/       # PDLC workflows
│   ├── templates/       # Document templates
│   ├── quality/         # Quality gates
│   ├── schemas/         # Validation schemas
│   ├── scripts/         # Framework automation scripts
│   └── ...
│
├── .framework-metadata.json
├── .gitmodules          # Submodule mapping (for reference)
└── README.md

Client Repository (e.g., LBPAM):
├── .gene2-core/         # Framework submodule (points to gene2-core)
├── .github/
│   ├── client-agents/   # Client-specific agent overrides (optional)
│   ├── copilot-instructions.md  # Smart loader linking to framework
│   └── ...
└── ...
\`\`\`

## Framework Contents

**Agents** (${FRAMEWORK_DIRS.length} categories):
${metadata.framework_dirs.map(d => `- ${d}`).join('\n')}

**Excluded Client-Specific Files**:
${metadata.excluded_patterns.slice(0, 5).map(p => `- ${p}`).join('\n')}
(+ ${metadata.excluded_patterns.length - 5} more)

## Quick Start

### First-Time Setup (Extract Framework)

\`\`\`bash
node cli.mjs init-framework \\
  --source /path/to/project-template \\
  --target ~/workspace/gene2-core
\`\`\`

### Initialize New Client Repository

\`\`\`bash
node cli.mjs init-client \\
  --client /path/to/new/client-repo \\
  --framework ~/workspace/gene2-core \\
  --name "client-name"
\`\`\`

### Verify Framework Setup

\`\`\`bash
node cli.mjs verify --client /path/to/client-repo
\`\`\`

## What Goes Where

### Framework (gene2-core) - Committed to Remote
✅ Generic PDLC agents
✅ Generic coding standards (API design, code comments, test strategy)
✅ Reusable workflows
✅ Document templates
✅ Quality gates and validation rules
✅ Framework automation scripts (cli.mjs, init-*, verify-*, etc.)

### Client Repository (.github) - Committed to Remote
✅ Client-specific agents (if overriding framework)
✅ Client-specific instructions (Angular, .NET, local setup, etc.)
✅ Client-specific copilot-instructions.md with smart loader
✅ .gitmodules (tracks submodule reference)
❌ NO generic framework files (duplicate code)
❌ NO duplicate instructions or agents

## Updating Framework

To update the framework for all projects:

\`\`\`bash
# 1. Update framework in central repository
cd ~/path/to/gene2-core
vim .github/instructions/api-design.instructions.md
git add .github/instructions/api-design.instructions.md
git commit -m "docs: update API design standards"
git push origin main

# 2. Each client pulls updates
cd /path/to/client-repo
git submodule update --remote .gene2-core
git commit -m "chore: update gene2-core framework"
git push origin main
\`\`\`

## Version Management

Framework versions tracked in \`.framework-metadata.json\`:
- **Version**: ${metadata.framework_version}
- **Extraction Timestamp**: ${metadata.extraction_timestamp}
- **Source Repository**: ${metadata.extracted_from}
- **Integration Strategy**: Git submodule (clients reference via .gitmodules)
- **Update Mechanism**: \`git submodule update --remote\` pulls latest from main branch

## Maintenance & Automation

Framework setup and integration is automated. For details, see:
- \`init-framework.mjs\` - Extract framework from project-template
- \`init-client-repo.mjs\` - Initialize and integrate client with Git submodule
- \`verify-framework.mjs\` - Validate framework setup completeness
- \`cleanup-old-framework.mjs\` - Remove old duplicate directories
- \`cli.mjs\` - Unified CLI orchestration for all operations

These scripts handle:
  1. Creating .gitmodules entries
  2. Initializing submodules
  3. Creating smart loader symlinks in client repos
  4. Validating framework completeness

---

**Created**: ${metadata.extraction_timestamp}
`;
}

// Make function available as default export for CLI
export default initFramework;

// Direct execution support
if (import.meta.url === `file://${process.argv[1]}`) {
  const { parseArgs } = await import('./utils.mjs');
  const args = parseArgs();
  initFramework(args);
}
