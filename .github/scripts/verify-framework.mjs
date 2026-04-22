#!/usr/bin/env node
/**
 * verify-framework.mjs
 * Validates framework setup in client repository
 */

import path from 'path';
import fs from 'node:fs';
import {
  logger,
  resolvePath,
  isSymlink,
  getSymlinkTarget,
  writeJSON,
} from './utils.mjs';

const GENERIC_INSTRUCTIONS = [
  'api-design.instructions.md',
  'coding.instructions.md',
  'test-strategy.instructions.md',
  'agent-logging.instructions.md',
];

const GENERIC_AGENTS = [
  'orchestrator.agent.md',
  'ba.agent.md',
  'dev-lead.agent.md',
  'dev-tdd.agent.md',
];

export async function verifyFramework(args) {
  const frameworkPath = args.framework ? resolvePath(args.framework) : null;
  const clientRepoPath = resolvePath(args.client || '.');
  const fullCheck = args['full-check'] !== undefined;
  const generateReport = args['generate-report'];

  // If the user passed --framework without --client, run a framework self-check.
  // This matches the CLI help examples and is useful to validate extraction.
  if (frameworkPath && !args.client) {
    logger.section('Verify Framework (Self-Check)');
    console.log(`Framework: ${frameworkPath}\n`);

    const results = {
      timestamp: new Date().toISOString(),
      framework: frameworkPath,
      checks: [],
      errors: 0,
      warnings: 0,
      status: 'checking',
    };

    const githubDir = path.join(frameworkPath, '.github');
    const requiredDirs = ['agents', 'instructions', 'templates', 'workflows', 'scripts'];

    logger.status('Check 1: .github exists');
    if (fs.existsSync(githubDir)) {
      logger.success('.github directory found');
      results.checks.push({ check: 'github_dir', status: 'pass' });
    } else {
      results.errors++;
      logger.error('Missing .github directory');
      results.checks.push({ check: 'github_dir', status: 'fail' });
    }
    logger.newline();

    logger.status('Check 2: Required framework directories');
    for (const dir of requiredDirs) {
      const p = path.join(githubDir, dir);
      if (fs.existsSync(p)) {
        results.checks.push({ check: `dir_${dir}`, status: 'pass' });
      } else {
        results.errors++;
        results.checks.push({ check: `dir_${dir}`, status: 'fail' });
        logger.error(`Missing .github/${dir}/`);
      }
    }
    if (results.errors === 0) {
      logger.success('All required directories present');
    }
    logger.newline();

    logger.status('Check 3: Framework metadata');
    const metadataPath = path.join(frameworkPath, '.framework-metadata.json');
    if (fs.existsSync(metadataPath)) {
      logger.success('Framework metadata found');
      results.checks.push({ check: 'framework_metadata', status: 'pass' });
    } else {
      results.warnings++;
      logger.warn('Framework metadata missing (.framework-metadata.json)');
      results.checks.push({ check: 'framework_metadata', status: 'warning' });
    }
    logger.newline();

    if (fullCheck) {
      logger.status('Full Check: Basic counts');
      const agentsPath = path.join(githubDir, 'agents');
      const instructionsPath = path.join(githubDir, 'instructions');
      const agentsCount = fs.existsSync(agentsPath)
        ? fs.readdirSync(agentsPath).filter(f => f.endsWith('.agent.md')).length
        : 0;
      const instructionsCount = fs.existsSync(instructionsPath)
        ? fs.readdirSync(instructionsPath).filter(f => f.endsWith('.instructions.md')).length
        : 0;

      logger.success(`Agents: ${agentsCount}`);
      logger.success(`Instructions: ${instructionsCount}`);
      results.checks.push({ check: 'counts', status: 'pass', agents: agentsCount, instructions: instructionsCount });
      logger.newline();
    }

    logger.section('Verification Results');
    results.status = results.errors === 0 ? (results.warnings === 0 ? 'passed' : 'passed_with_warnings') : 'failed';

    const checksCount = results.checks.length;
    const passedCount = results.checks.filter(c => c.status === 'pass').length;
    const warningCount = results.checks.filter(c => c.status === 'warning').length;
    const failedCount = results.checks.filter(c => c.status === 'fail').length;

    console.log(`Checks: ${passedCount}/${checksCount} passed`);
    if (warningCount > 0) console.log(`Warnings: ${warningCount}`);
    if (failedCount > 0) console.log(`Failures: ${failedCount}`);

    if (results.errors === 0 && results.warnings === 0) {
      logger.success('Framework self-check PASSED');
    } else if (results.errors === 0) {
      logger.warn(`Framework self-check OK (with ${results.warnings} warnings)`);
    } else {
      logger.error('Framework self-check FAILED');
    }

    if (generateReport) {
      writeJSON(generateReport, results);
    }

    logger.newline();
    process.exit(results.errors > 0 ? 1 : 0);
  }

  logger.section('Verify Framework Setup');

  console.log(`Client Repo: ${clientRepoPath}\n`);

  const results = {
    timestamp: new Date().toISOString(),
    client_repo: clientRepoPath,
    checks: [],
    errors: 0,
    warnings: 0,
    status: 'checking',
  };

  // Check 1: .gene2-core symlink exists
  logger.status('Check 1: Framework symlink');
  const gene2CorePath = path.join(clientRepoPath, '.gene2-core');

  if (isSymlink(gene2CorePath)) {
    const target = getSymlinkTarget(gene2CorePath);
    logger.success(`Symlink exists: .gene2-core → ${target}`);
    results.checks.push({ check: 'symlink_exists', status: 'pass', target });

    if (!fs.existsSync(gene2CorePath)) {
      results.errors++;
      results.checks[results.checks.length - 1].status = 'fail';
      logger.error(`Symlink target does not exist: ${target}`);
    } else if (!fs.existsSync(path.join(gene2CorePath, '.github'))) {
      results.errors++;
      results.checks[results.checks.length - 1].status = 'fail';
      logger.error(`Target doesn't contain .github directory`);
    }
  } else if (fs.existsSync(gene2CorePath)) {
    results.warnings++;
    logger.warn(`.gene2-core is a DIRECTORY, not a symlink`);
    results.checks.push({ check: 'symlink_exists', status: 'warning' });
  } else {
    results.errors++;
    logger.error(`.gene2-core not found`);
    results.checks.push({ check: 'symlink_exists', status: 'fail' });
  }
  logger.newline();

  // Check 2: Framework agents accessible
  logger.status('Check 2: Framework agents accessibility');
  const agentsPath = path.join(gene2CorePath, '.github', 'agents');

  if (fs.existsSync(agentsPath)) {
    const agents = fs
      .readdirSync(agentsPath)
      .filter(f => f.endsWith('.agent.md')).length;
    logger.success(`Framework agents accessible: ${agents} agents found`);
    results.checks.push({ check: 'framework_agents', status: 'pass', count: agents });
  } else {
    results.errors++;
    logger.error(`Framework agents not accessible`);
    results.checks.push({ check: 'framework_agents', status: 'fail' });
  }
  logger.newline();

  // Check 3: Framework instructions accessible
  logger.status('Check 3: Framework instructions accessibility');
  const instructionsPath = path.join(gene2CorePath, '.github', 'instructions');

  if (fs.existsSync(instructionsPath)) {
    const instructions = fs
      .readdirSync(instructionsPath)
      .filter(f => f.endsWith('.instructions.md')).length;
    logger.success(`Framework instructions accessible: ${instructions} instructions found`);
    results.checks.push({ check: 'framework_instructions', status: 'pass', count: instructions });
  } else {
    results.errors++;
    logger.error(`Framework instructions not accessible`);
    results.checks.push({ check: 'framework_instructions', status: 'fail' });
  }
  logger.newline();

  // Check 4: No duplicate generic instructions in client .github
  logger.status('Check 4: No duplicate generic instructions');
  const clientInstructionsPath = path.join(clientRepoPath, '.github', 'instructions');
  const duplicates = [];

  if (fs.existsSync(clientInstructionsPath)) {
    const files = fs.readdirSync(clientInstructionsPath);
    GENERIC_INSTRUCTIONS.forEach(file => {
      if (files.includes(file)) {
        duplicates.push(file);
      }
    });
  }

  if (duplicates.length === 0) {
    logger.success(`No duplicate generic files found in .github`);
    results.checks.push({ check: 'no_duplicates', status: 'pass' });
  } else {
    results.errors++;
    logger.error(`Found duplicate generic files in .github:`);
    duplicates.forEach(f => logger.error(`  → ${f}`));
    results.checks.push({ check: 'no_duplicates', status: 'fail', files: duplicates });
  }
  logger.newline();

  // Check 5: .gitignore excludes .gene2-core
  logger.status('Check 5: .gitignore configuration');
  const gitignorePath = path.join(clientRepoPath, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes('.gene2-core/')) {
      logger.success(`.gene2-core/ properly excluded in .gitignore`);
      results.checks.push({ check: 'gitignore_configured', status: 'pass' });
    } else {
      results.warnings++;
      logger.warn(`.gene2-core/ not in .gitignore (or incorrect format)`);
      logger.info('Add: .gene2-core/');
      results.checks.push({ check: 'gitignore_configured', status: 'warning' });
    }
  } else {
    results.errors++;
    logger.error(`.gitignore not found`);
    results.checks.push({ check: 'gitignore_configured', status: 'fail' });
  }
  logger.newline();

  // Check 6: copilot-instructions.md exists
  logger.status('Check 6: Smart copilot-instructions.md loader');
  const copilotPath = path.join(clientRepoPath, '.github', 'copilot-instructions.md');

  if (fs.existsSync(copilotPath)) {
    const content = fs.readFileSync(copilotPath, 'utf-8');
    if (content.includes('.gene2-core')) {
      logger.success(`Smart loader found with framework references`);
      results.checks.push({ check: 'copilot_loader', status: 'pass' });
    } else {
      results.warnings++;
      logger.warn(`copilot-instructions.md doesn't reference framework`);
      results.checks.push({ check: 'copilot_loader', status: 'warning' });
    }
  } else {
    results.errors++;
    logger.error(`copilot-instructions.md not found`);
    results.checks.push({ check: 'copilot_loader', status: 'fail' });
  }
  logger.newline();

  // Additional checks if --full-check
  if (fullCheck) {
    logger.status('Full Check: Framework completeness');

    // Check framework metadata
    const metadataPath = path.join(gene2CorePath, '.framework-metadata.json');
    if (fs.existsSync(metadataPath)) {
      logger.success(`Framework metadata found`);
      results.checks.push({ check: 'framework_metadata', status: 'pass' });
    } else {
      results.warnings++;
      logger.warn(`Framework metadata not found (.framework-metadata.json)`);
      results.checks.push({ check: 'framework_metadata', status: 'warning' });
    }

    // Check framework config
    const configPath = path.join(clientRepoPath, '.github', 'framework-config.mjs');
    if (fs.existsSync(configPath)) {
      logger.success(`Client framework config found`);
      results.checks.push({ check: 'client_config', status: 'pass' });
    } else {
      results.warnings++;
      logger.warn(`Client framework config not found`);
      results.checks.push({ check: 'client_config', status: 'warning' });
    }

    logger.newline();
  }

  // Final Summary
  logger.section('Verification Results');

  results.status =
    results.errors === 0 && results.warnings === 0
      ? 'passed'
      : results.errors === 0
        ? 'passed_with_warnings'
        : 'failed';

  const checksCount = results.checks.length;
  const passedCount = results.checks.filter(c => c.status === 'pass').length;
  const warningCount = results.checks.filter(c => c.status === 'warning').length;
  const failedCount = results.checks.filter(c => c.status === 'fail').length;

  console.log(`Checks: ${passedCount}/${checksCount} passed`);
  if (warningCount > 0) console.log(`Warnings: ${warningCount}`);
  if (failedCount > 0) console.log(`Failures: ${failedCount}`);

  if (results.errors === 0 && results.warnings === 0) {
    logger.success(`Framework verification PASSED`);
  } else if (results.errors === 0) {
    logger.warn(`Framework verification OK (with ${results.warnings} warnings)`);
  } else {
    logger.error(`Framework verification FAILED`);
  }

  // Generate report if requested
  if (generateReport) {
    writeJSON(generateReport, results);
  }

  logger.newline();

  // Return exit code
  process.exit(results.errors > 0 ? 1 : 0);
}

// Make function available as default export for CLI
export default verifyFramework;

// Direct execution support
if (import.meta.url === `file://${process.argv[1]}`) {
  const { parseArgs } = await import('./utils.mjs');
  const args = parseArgs();
  verifyFramework(args);
}
