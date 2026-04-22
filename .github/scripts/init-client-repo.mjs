#!/usr/bin/env node
/**
 * init-client-repo.mjs
 *
 * ONE-COMMAND setup for initializing a client repository with the gene2 framework.
 *
 * Usage (minimal):
 *   node init-client-repo.mjs --client /path/to/client-repo --name "my-project"
 *
 * Usage (with explicit gene2 path):
 *   node init-client-repo.mjs \
 *     --client /path/to/client-repo \
 *     --gene2-path /path/to/gene2-core \
 *     --name "my-project"
 *
 * Usage (via environment variables):
 *   GENE2_LOCALPATH=/path/to/gene2-core \
 *   PROJECT_PATH=/path/to/client-repo \
 *   node init-client-repo.mjs --name "my-project"
 *
 * Global variables (resolved in priority order: CLI arg > env var > auto-detect):
 *
 *   GENE2_LOCALPATH  (--gene2-path)  Path to the local gene2-core clone.
 *                                    Auto-detected from script location when omitted.
 *   PROJECT_PATH     (--client)      Path to the client repository to initialise.
 *                                    Defaults to current working directory.
 *   GENE2_REPO_URL   (--gene2-url)   Git URL used to auto-clone gene2-core when it
 *                                    cannot be found at GENE2_LOCALPATH.
 */

import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';
import {
  colors,
  logger,
  resolvePath,
  removeFiles,
  backupDir,
  getTimestamp,
  exec,
  parseArgs,
} from './utils.mjs';

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureFileSync(filePath) {
  ensureDirSync(path.dirname(filePath));
  fs.closeSync(fs.openSync(filePath, 'a'));
}

function removeSync(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function moveSync(srcPath, destPath) {
  try {
    fs.renameSync(srcPath, destPath);
  } catch {
    fs.cpSync(srcPath, destPath, { recursive: true });
    removeSync(srcPath);
  }
}

const GENERIC_INSTRUCTIONS = [
  'agent-logging\\.instructions\\.md',
  'ai\\.analysis\\.guardrails\\.instructions\\.md',
  'api-design\\.instructions\\.md',
  'code-comments\\.instructions\\.md',
  'code-review\\.instructions\\.md',
  'coding\\.instructions\\.md',
  'documentation-index\\.instructions\\.md',
  'documentation\\.instructions\\.md',
  'epic-user-story-organization\\.instructions\\.md',
  'glossary-maintenance\\.instructions\\.md',
  'meeting-reports\\.instructions\\.md',
  'naming-conventions\\.instructions\\.md',
  'project-structure\\.instructions\\.md',
  'pru-optimization\\.instructions\\.md',
  'terminology\\.instructions\\.md',
  'test-strategy\\.instructions\\.md',
];

const GENERIC_AGENTS = [
  'orchestrator\\.agent\\.md',
  'ba\\.agent\\.md',
  'dev-lead\\.agent\\.md',
  'dev-tdd\\.agent\\.md',
  'dev-tdd-red\\.agent\\.md',
  'dev-tdd-green\\.agent\\.md',
  'dev-tdd-refactor\\.agent\\.md',
  'qa\\.agent\\.md',
  'po\\.agent\\.md',
  'ux\\.agent\\.md',
  'architect\\.agent\\.md',
  'pm\\.agent\\.md',
  'ai-engineering\\.agent\\.md',
  'meeting\\.assistant\\.agent\\.md',
  'business-analyst\\.agent\\.md',
  'technical-leader\\.agent\\.md',
  'product-owner\\.agent\\.md',
  'project-manager\\.agent\\.md',
  'ux-designer\\.agent\\.md',
  'ai-engineer\\.agent\\.md',
];

/**
 * Check if a directory has meaningful content (files other than .keep)
 */
function hasNonKeepFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return false;
  const contents = fs.readdirSync(dirPath);
  const meaningful = contents.filter(f => f !== '.keep' && f !== '.gitkeep');
  return meaningful.length > 0;
}

async function promptUser(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer === '');
    });
  });
}

/**
 * Interactive text prompt with optional default value
 */
async function prompt(question, defaultValue = null) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const displayQuestion = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(displayQuestion, answer => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Resolve the gene2-core framework path from (priority order):
 *  1. --gene2-path CLI argument
 *  2. GENE2_LOCALPATH environment variable
 *  3. Auto-detection: 2 levels up from this script's directory.
 *     - Standalone gene2-core:  gene2-core/.github/scripts  →  gene2-core  ✅
 *     - Submodule scenario:     <client>/.gene2-core/.github/scripts  →  <client>/.gene2-core  ✅
 *  4. Interactive prompt if none of the above yield a valid path
 */
async function resolveGene2Path(args) {
  if (args['gene2-path']) return resolvePath(args['gene2-path']);
  if (process.env.GENE2_LOCALPATH) return resolvePath(process.env.GENE2_LOCALPATH);
  
  const scriptPath = dirname(fileURLToPath(import.meta.url));
  const autoDetected = path.resolve(scriptPath, '..', '..');
  
  // Try auto-detected path first
  if (fs.existsSync(path.join(autoDetected, '.github'))) {
    return autoDetected;
  }
  
  // No valid path found — prompt user
  const defaultPath = `${process.env.HOME}/gene2-core`;
  const userPath = await prompt(
    `❓ gene2-core path not found. Where is gene2-core cloned?`,
    defaultPath
  );
  return resolvePath(userPath);
}

/**
 * Resolve the client project path from (priority order):
 *  1. --client CLI argument
 *  2. PROJECT_PATH environment variable
 *  3. Current working directory (if it looks like a git repo)
 *  4. Interactive prompt if none of the above are valid
 */
async function resolveProjectPath(args) {
  if (args.client) return resolvePath(args.client);
  if (process.env.PROJECT_PATH) return resolvePath(process.env.PROJECT_PATH);
  
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, '.git'))) {
    return cwd;
  }
  
  // Not in a git repo — prompt user
  const userPath = await prompt(
    `❓ Client repo path not found. Where is your client repository?`,
    cwd
  );
  return resolvePath(userPath);
}

/**
 * Auto-clone gene2-core if it is not found at the resolved path.
 * Prompts user for repo URL if not provided via CLI arg or env var.
 */
async function ensureGene2Cloned(gene2Path, args) {
  if (fs.existsSync(path.join(gene2Path, '.github'))) return; // already present

  let repoUrl = args['gene2-url'] || process.env.GENE2_REPO_URL;
  
  if (!repoUrl) {
    logger.warn(`gene2-core not found at: ${gene2Path}`);
    repoUrl = await prompt(
      `❓ Provide the git URL to clone gene2-core from`,
      'https://github.com/your-org/gene2-core.git'
    );
  }

  logger.status(`Cloning gene2-core from ${repoUrl}`);
  logger.info(`Target: ${gene2Path}`);
  fs.mkdirSync(path.dirname(gene2Path), { recursive: true });
  execSync(`git clone "${repoUrl}" "${gene2Path}"`, { stdio: 'inherit' });
  logger.success('gene2-core cloned successfully');
}

async function initClientRepo(args) {
  // ── Resolve global variables ──────────────────────────────────────────────
  const clientRepoPath = await resolveProjectPath(args);
  const frameworkPath  = await resolveGene2Path(args);
  const clientName     = args.name || path.basename(clientRepoPath);
  const dryRun         = args['dry-run'] || false;
  const doBackup       = args.backup !== 'false';

  // Track phase results
  const phaseSummary = {
    phases: [],
    warnings: [],
    hasFailures: false,
  };

  // ── Print header ──────────────────────────────────────────────────────────
  logger.section(`🚀 Client Repository Initialization: ${clientName}`);
  console.log(`${dryRun ? colors.yellow + '(DRY-RUN MODE)' + colors.reset : ''}\n`);
  logger.info(`gene2-core : ${frameworkPath}`);
  logger.info(`Client repo: ${clientRepoPath}\n`);
  logger.info(`Tip: set GENE2_LOCALPATH and PROJECT_PATH env vars to avoid passing paths every time.\n`);

  try {
    // Validation
    if (!fs.existsSync(clientRepoPath)) {
      throw new Error(`Client repo not found: ${clientRepoPath}`);
    }

    // Auto-clone gene2-core if missing
    if (!dryRun) {
      await ensureGene2Cloned(frameworkPath, args);
    }

    if (!fs.existsSync(path.join(frameworkPath, '.github'))) {
      throw new Error(`Framework not found: ${frameworkPath}/.github`);
    }

    // === PHASE 1: Core Framework Setup ===
    await phase1_frameworkSetup(clientRepoPath, frameworkPath, clientName, dryRun, doBackup);
    phaseSummary.phases.push({ name: 'Phase 1', status: 'success' });

    // === PHASE 2: Project Structure Creation ===
    try {
      await phase2_projectStructure(clientRepoPath, frameworkPath, dryRun);
      phaseSummary.phases.push({ name: 'Phase 2', status: 'success' });
    } catch (error) {
      logger.warn(`Phase 2 warning: ${error.message}`);
      phaseSummary.warnings.push(`Phase 2: ${error.message}`);
      phaseSummary.phases.push({ name: 'Phase 2', status: 'warning' });
    }

    // === PHASE 3: Documentation Indexes ===
    try {
      await phase3_documentation(clientRepoPath, frameworkPath, dryRun);
      phaseSummary.phases.push({ name: 'Phase 3', status: 'success' });
    } catch (error) {
      logger.warn(`Phase 3 warning: ${error.message}`);
      phaseSummary.warnings.push(`Phase 3: ${error.message}`);
      phaseSummary.phases.push({ name: 'Phase 3', status: 'warning' });
    }

    // === PHASE 4: Git Hooks Setup ===
    await phase4_gitHooks(clientRepoPath, frameworkPath, dryRun);
    phaseSummary.phases.push({ name: 'Phase 4', status: 'success' });

    // === PHASE 5: VS Code Settings ===
    await phase5_vscodeSettings(clientRepoPath, dryRun);
    phaseSummary.phases.push({ name: 'Phase 5', status: 'success' });

    // === PHASE 6: Naming Validation ===
    try {
      await phase6_namingValidation(clientRepoPath, frameworkPath, dryRun);
      phaseSummary.phases.push({ name: 'Phase 6', status: 'success' });
    } catch (error) {
      logger.warn(`Phase 6 warning: ${error.message}`);
      phaseSummary.warnings.push(`Phase 6: ${error.message}`);
      phaseSummary.phases.push({ name: 'Phase 6', status: 'warning' });
    }

    // === PHASE 7: Final Verification ===
    const verificationResult = await phase7_verification(clientRepoPath, frameworkPath, dryRun);
    if (verificationResult.allPassed) {
      phaseSummary.phases.push({ name: 'Phase 7', status: 'success' });
    } else {
      phaseSummary.warnings.push(`Phase 7: Some checks failed — see above for details`);
      phaseSummary.phases.push({ name: 'Phase 7', status: 'warning' });
    }

    // === Summary ===
    const hasWarnings = phaseSummary.warnings.length > 0;
    if (hasWarnings) {
      logger.section('⚠️  Client Repository Initialization Complete (with warnings)');
      console.log(`${colors.yellow}Setup completed, but some phases had issues:${colors.reset}`);
      phaseSummary.warnings.forEach(w => logger.warn(w));
      console.log(`\n${colors.yellow}Please run the following commands manually to complete setup:${colors.reset}`);
      if (phaseSummary.warnings.some(w => w.includes('Phase 2'))) {
        console.log(`  • node .gene2-core/.github/scripts/repo-conventions/init-project-structure.mjs --client .`);
      }
      if (phaseSummary.warnings.some(w => w.includes('Phase 3'))) {
        console.log(`  • node .gene2-core/.github/scripts/repo-conventions/update-index.mjs --root . docs/`);
      }
      if (phaseSummary.warnings.some(w => w.includes('Phase 6'))) {
        console.log(`  • node .gene2-core/.github/scripts/repo-conventions/enforce-naming.mjs --root .`);
      }
    } else {
      logger.section('✅ Client Repository Initialization Complete!');
      console.log(`${colors.green}All setup phases completed successfully${colors.reset}`);
    }
    


  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

async function phase1_frameworkSetup(clientPath, frameworkPath, clientName, dryRun, doBackup) {
  logger.section('📦 Phase 1: Framework Symlink & Cleanup');

  const githubPath = path.join(clientPath, '.github');
  const gene2CorePath = path.join(clientPath, '.gene2-core');
  
  // Backup existing .github only if it has meaningful content
  if (doBackup && fs.existsSync(githubPath) && hasNonKeepFiles(githubPath)) {
    logger.status('Creating backup of existing .github (non-empty)');
    if (!dryRun) backupDir(githubPath);
  }

  // Backup existing .gene2-core only if it has meaningful content
  if (doBackup && fs.existsSync(gene2CorePath) && hasNonKeepFiles(gene2CorePath)) {
    logger.status('Creating backup of existing .gene2-core (non-empty)');
    if (!dryRun) backupDir(gene2CorePath);
  }

  // Ensure .github folder exists (empty or will be overwritten)
  ensureDirSync(githubPath);

  // Remove duplicate instructions
  logger.status('Removing duplicate generic instructions');
  const instructionsPath = path.join(githubPath, 'instructions');
  if (fs.existsSync(instructionsPath)) {
    const removed = removeFiles(instructionsPath, GENERIC_INSTRUCTIONS, { dryRun });
    if (removed.length > 0) logger.success(`Removed ${removed.length} duplicates`);
  }
  if (!dryRun) ensureFileSync(path.join(instructionsPath, '.keep'));

  // Remove duplicate agents
  logger.status('Removing duplicate generic agents');
  const agentsPath = path.join(githubPath, 'agents');
  if (fs.existsSync(agentsPath)) {
    const removed = removeFiles(agentsPath, GENERIC_AGENTS, { dryRun });
    if (removed.length > 0) logger.success(`Removed ${removed.length} duplicates`);
  }
  if (!dryRun) ensureFileSync(path.join(agentsPath, '.keep'));

  // Setup symlink
  logger.status('Setting up framework symlink');
  if (fs.existsSync(gene2CorePath)) {
    if (fs.lstatSync(gene2CorePath).isSymbolicLink()) {
      if (!dryRun) removeSync(gene2CorePath);
    } else {
      if (!dryRun) moveSync(gene2CorePath, `${gene2CorePath}_old_${getTimestamp('datetime-file')}`);
    }
  }

  const relativePath = path.relative(clientPath, frameworkPath);
  if (!dryRun) {
    try {
      fs.symlinkSync(relativePath, gene2CorePath, 'dir');
      logger.success(`Symlink created: .gene2-core → ${relativePath}`);
    } catch (error) {
      if (process.platform === 'win32') {
        exec(`mklink /D ".gene2-core" "${frameworkPath}"`, { cwd: clientPath });
        logger.success(`Symlink created (Windows)`);
      } else {
        throw error;
      }
    }
  }

  // Update .gitignore
  logger.status('Updating .gitignore');
  const gitignorePath = path.join(clientPath, '.gitignore');
  if (!dryRun) {
    let gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
    if (!gitignoreContent.includes('.gene2-core/')) {
      gitignoreContent += '\n.gene2-core/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }
    logger.success('.gene2-core/ added to .gitignore');
  }

  // Create smart copilot-instructions.md
  logger.status('Creating smart copilot-instructions.md');
  const copilotPath = path.join(githubPath, 'copilot-instructions.md');
  if (!dryRun) {
    if (fs.existsSync(copilotPath)) fs.copyFileSync(copilotPath, `${copilotPath}.backup`);
    fs.writeFileSync(copilotPath, generateCopilotInstructions(clientName, frameworkPath));
    logger.success('Smart loader created');
  }

  // Create framework config
  logger.status('Creating framework configuration');
  const configPath = path.join(githubPath, 'framework-config.mjs');
  if (!dryRun) {
    fs.writeFileSync(configPath, generateFrameworkConfig(clientName, frameworkPath, relativePath));
    logger.success('Framework config created');
  }

  logger.newline();
}

async function phase2_projectStructure(clientPath, frameworkPath, dryRun) {
  logger.section('📁 Phase 2: Project Folder Structure');

  const structureScript = path.join(frameworkPath, '.github', 'scripts', 'repo-conventions', 'init-project-structure.mjs');
  
  logger.status('Creating PDLC folder structure');
  logger.info(`Script: ${structureScript}`);
  logger.info(`Client: ${clientPath}`);
  
  if (!dryRun) {
    try {
      // Verify the script exists before running
      if (!fs.existsSync(structureScript)) {
        throw new Error(`Script not found: ${structureScript}`);
      }

      const command = `node "${structureScript}" --client "${clientPath}"`;
      logger.info(`Executing: ${command}`);
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: clientPath 
      });
      logger.success('Project structure created');

      // Clean up empty non-PDLC folders
      const pdlcFolders = [
        '00-assessment', '01-requirements', '02-architecture',
        '03-testing', '04-planning', '99-operations', '05-implementation'
      ];
      
      cleanupEmptyFolders(path.join(clientPath, 'docs'), pdlcFolders);
      cleanupEmptyFolders(path.join(clientPath, 'logs'), pdlcFolders);
    } catch (error) {
      logger.warn(`Could not auto-create structure: ${error.message}`);
      logger.info('Troubleshooting: Verify init-project-structure.mjs has been updated with getCurrentDate function.');
      logger.info('Please run manually: node .gene2-core/.github/scripts/repo-conventions/init-project-structure.mjs --client .');
    }
  } else {
    logger.info('[DRY-RUN] Would create project structure');
  }

  logger.newline();
}

/**
 * Remove empty non-PDLC folders from a given directory.
 * Keep PDLC folders and any folder that contains files.
 */
function cleanupEmptyFolders(dirPath, pdlcFolders) {
  if (!fs.existsSync(dirPath)) return;

  const contents = fs.readdirSync(dirPath);
  
  for (const item of contents) {
    const itemPath = path.join(dirPath, item);
    const isDir = fs.lstatSync(itemPath).isDirectory();
    
    if (!isDir) continue; // Skip files
    
    // Keep PDLC phase folders
    if (pdlcFolders.includes(item)) continue;
    
    // Check if folder has meaningful content (files other than .keep/.gitkeep)
    const folderContents = fs.readdirSync(itemPath);
    const hasFiles = folderContents.some(f => f !== '.keep' && f !== '.gitkeep');
    
    // Remove if empty (only .keep files or completely empty)
    if (!hasFiles) {
      try {
        removeSync(itemPath);
        logger.info(`  Removed empty folder: ${dirPath.replace(process.cwd(), '')}/${item}`);
      } catch (error) {
        logger.warn(`Could not remove folder ${item}: ${error.message}`);
      }
    }
  }
}

async function phase3_documentation(clientPath, frameworkPath, dryRun) {
  logger.section('📖 Phase 3: Documentation Indexes');

  const indexScript = path.join(frameworkPath, '.github', 'scripts', 'repo-conventions', 'update-index.mjs');
  
  logger.status('Generating INDEX.md files');
  
  if (!dryRun) {
    try {
      execSync(`node "${indexScript}" --root "${clientPath}" docs/`, { 
        stdio: 'inherit',
        cwd: clientPath 
      });
      logger.success('Documentation indexes created');
    } catch (error) {
      logger.warn(`Could not auto-create indexes: ${error.message}`);
      logger.info('Please run manually: node .gene2-core/.github/scripts/repo-conventions/update-index.mjs --root . docs/');
    }
  } else {
    logger.info('[DRY-RUN] Would generate documentation indexes');
  }

  logger.newline();
}

async function phase4_gitHooks(clientPath, frameworkPath, dryRun) {
  logger.section('🔧 Phase 4: Git Hooks Installation');

  logger.status('Installing git hooks');

  if (!dryRun) {
    try {
      const hooksScript = path.join(frameworkPath, '.github', 'scripts', 'setup-git-hooks.mjs');
      const { setupGitHooks } = await import(pathToFileURL(hooksScript).href);
      await setupGitHooks({ client: clientPath });
      logger.success('Git hooks installed');
    } catch (error) {
      logger.warn(`Could not auto-install hooks: ${error.message}`);
      logger.info('Please run manually: node .gene2-core/.github/scripts/setup-git-hooks.mjs --client .');
    }
  } else {
    logger.info('[DRY-RUN] Would install git hooks');
  }

  logger.newline();
}

/**
 * Phase 5 – VS Code settings
 *
 * Creates / updates .vscode/settings.json in the client repo so that
 * GitHub Copilot automatically loads the framework instructions from
 * .gene2-core/.github/copilot-instructions.md.
 *
 * This ensures every developer that opens the project in VS Code gets
 * the full gene2 agent context without any manual configuration.
 */
async function phase5_vscodeSettings(clientPath, dryRun) {
  logger.section('⚙️  Phase 5: VS Code / Copilot Settings');

  logger.status('Configuring GitHub Copilot context paths');

  const vscodeDir = path.join(clientPath, '.vscode');
  const settingsPath = path.join(vscodeDir, 'settings.json');

  const defaultSettings = {
    '// GitHub Copilot Configuration': null,
    'github.copilot.chat.codeGeneration.useInstructionFiles': true,
    'github.copilot.chat.additionalReadAccessPaths': ['.gene2-core/.github'],
    'github.copilot.chat.organizationCustomAgents.enabled': true,
    '// Chat Tools Configuration': null,
    'chat.tools.terminal.autoApprove': {
      'mvn test': true,
      'npm test': true,
    },
    'chat.promptFilesRecommendations': {
      'tdd': true,
    },
    '// Markdown Preview Enhanced': null,
    'markdown-preview-enhanced.plantumlServer': 'https://kroki.io/plantuml/svg/',
  };

  if (!dryRun) {
    fs.mkdirSync(vscodeDir, { recursive: true });

    // Read existing settings if present
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        logger.info('Merging with existing .vscode/settings.json');
      } catch {
        logger.warn('Could not parse existing .vscode/settings.json — will overwrite with defaults');
        settings = {};
      }
    }

    // Merge default settings with existing (defaults take precedence for our keys)
    const mergedSettings = { ...settings, ...defaultSettings };

    fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2) + '\n');
    logger.success('.vscode/settings.json created with gene2 configuration');
  } else {
    logger.info('[DRY-RUN] Would create/update .vscode/settings.json');
  }

  logger.newline();
}

async function phase6_namingValidation(clientPath, frameworkPath, dryRun) {
  logger.section('✅ Phase 6: Naming Convention Validation');

  logger.status('Validating naming conventions');

  if (!dryRun) {
    try {
      const namingScript = path.join(frameworkPath, '.github', 'scripts', 'repo-conventions', 'enforce-naming.mjs');
      // Run as subprocess so projectRoot is resolved correctly via env var
      exec(`node "${namingScript}" --root "${clientPath}"`, { cwd: clientPath, silent: true });
      logger.success('Naming conventions validated');
    } catch (error) {
      logger.warn(`Could not validate naming: ${error.message}`);
      logger.info('Please run manually: node .gene2-core/.github/scripts/repo-conventions/enforce-naming.mjs --root .');
    }
  } else {
    logger.info('[DRY-RUN] Would validate naming');
  }

  logger.newline();
}

async function phase7_verification(clientPath, frameworkPath, dryRun) {
  logger.section('🔍 Phase 7: Final Verification');

  logger.status('Running final setup verification');

  let allPassed = true;
  
  if (!dryRun) {
    // Helper function to check if docs has required subdirectories
    const hasDocsStructure = () => {
      const docsPath = path.join(clientPath, 'docs');
      if (!fs.existsSync(docsPath)) return false;
      
      // Check for any of the expected phase directories
      const expectedDirs = [
        '00-assessment',
        '01-requirements',
        '02-architecture',
        '03-testing',
        '04-planning',
        '05-implementation',
      ];
      
      const contents = fs.readdirSync(docsPath);
      return expectedDirs.some(dir => contents.includes(dir));
    };

    const checks = [
      ['Framework symlink (.gene2-core)', () => fs.existsSync(path.join(clientPath, '.gene2-core'))],
      ['.github folder',                  () => fs.existsSync(path.join(clientPath, '.github'))],
      ['copilot-instructions.md',         () => fs.existsSync(path.join(clientPath, '.github', 'copilot-instructions.md'))],
      ['.vscode/settings.json',           () => fs.existsSync(path.join(clientPath, '.vscode', 'settings.json'))],
      ['docs folder',                     () => fs.existsSync(path.join(clientPath, 'docs'))],
      ['docs PDLC structure',             () => hasDocsStructure()],
      ['.gitignore',                      () => fs.existsSync(path.join(clientPath, '.gitignore'))],
    ];

    for (const [check, fn] of checks) {
      const passed = fn();
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
      if (!passed) allPassed = false;
    }

    // If docs structure failed, provide debugging info
    const docsPath = path.join(clientPath, 'docs');
    if (fs.existsSync(docsPath)) {
      const contents = fs.readdirSync(docsPath);
      if (!contents.some(dir => ['00-assessment', '01-requirements', '02-architecture', '03-testing', '04-planning', '05-implementation'].includes(dir))) {
        logger.info(`📂 /docs exists. Contents: ${contents.join(', ')}`);
      }
    }

    if (allPassed) {
      logger.success('All verifications passed');
    } else {
      logger.warn('Some checks failed - please review above');
    }
  } else {
    logger.info('[DRY-RUN] Would run verification');
  }

  logger.newline();
  
  return { allPassed };
}

/**
 * Generate the client repo's .github/copilot-instructions.md.
 *
 * Priority:
 *  1. If the gene2-core copilot-instructions.md can be read, use its content
 *     verbatim so VS Code auto-loads the complete framework context.
 *  2. Fall back to a lightweight loader comment that references the submodule.
 */
function generateCopilotInstructions(clientName, frameworkPath) {
  // Try to read the framework's own instructions file
  const frameworkInstructionsPath = path.join(frameworkPath, '.github', 'copilot-instructions.md');
  if (fs.existsSync(frameworkInstructionsPath)) {
    try {
      const content = fs.readFileSync(frameworkInstructionsPath, 'utf-8');
      return (
        `<!-- Auto-generated by gene2 init-client-repo.mjs for: ${clientName} -->\n` +
        `<!-- Source: .gene2-core/.github/copilot-instructions.md -->\n` +
        `<!-- Do NOT edit manually — re-run init-client-repo.mjs to refresh. -->\n\n` +
        content
      );
    } catch {
      // fall through to fallback
    }
  }

  // Fallback: lightweight loader pointing at the submodule
  return `# Copilot Instructions - ${clientName}

## Framework Integration

This repository uses the **gene2 AI-first delivery framework**.

- **Framework location**: \`.gene2-core/.github/\` (local symlink / submodule)
- **Full instructions**:  see \`.gene2-core/.github/copilot-instructions.md\`

### Copilot context
VS Code is configured (via \`.vscode/settings.json\`) to load the framework
instructions from \`.gene2-core/.github/copilot-instructions.md\` automatically.

### Client-specific overrides
Add client-specific instruction files to \`.github/instructions/\`.
`;
}

function generateFrameworkConfig(clientName, frameworkPath, relativePath) {
  return `/**
 * framework-config.mjs
 * Framework configuration for ${clientName}
 * 
 * This file tracks the framework setup for this client repository.
 * Do NOT edit manually unless you understand the implications.
 */

export const frameworkConfig = {
  client_name: '${clientName}',
  framework: {
    version: '2.0.0',
    source_location: '.gene2-core',
    absolute_path: '${frameworkPath}',
    relative_path: '${relativePath}',
    strategy: 'symlink-local-only',
    auto_update: true,
    git_ignored: true,
    never_commit: true,
  },
  created_at: new Date().toISOString(),
  last_verified: new Date().toISOString(),
  status: 'initialized',
};

export default frameworkConfig;
`;
}

// Make function available as default export for CLI
export default initClientRepo;

// Direct execution support
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs();
  initClientRepo(args).catch((error) => {
    logger.error(error.message);
    logger.error('\nUsage:');
    logger.error('  node init-client-repo.mjs --client <path> --name <project-name>');
    logger.error('\nOptional:');
    logger.error('  --gene2-path <path>   Path to gene2-core clone  (or set GENE2_LOCALPATH)');
    logger.error('  --gene2-url  <url>    Git URL to auto-clone gene2-core (or set GENE2_REPO_URL)');
    logger.error('  --dry-run             Preview changes without applying');
    process.exit(1);
  });
}
