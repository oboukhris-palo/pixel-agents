#!/usr/bin/env node
/**
 * cleanup-old-framework.mjs
 * Removes old .gene2-core directories and prepare for migration
 */

import path from 'path';
import fs from 'node:fs';
import readline from 'readline';
import {
  colors,
  logger,
  resolvePath,
  isSymlink,
  getTimestamp,
} from './utils.mjs';

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

async function promptUser(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

export async function cleanupOldFramework(args) {
  const clientRepoPath = resolvePath(args.client || '.');
  const force = args.force !== undefined;
  const dryRun = args['dry-run'] !== undefined;

  logger.section('Cleanup Old Framework');

  console.log(`Client Repo: ${clientRepoPath}\n`);

  try {
    const gene2CorePath = path.join(clientRepoPath, '.gene2-core');

    // Check if .gene2-core exists
    if (!fs.existsSync(gene2CorePath)) {
      logger.warn('No .gene2-core found');
      logger.newline();
      return;
    }

    // Check if it's a symlink or directory
    const isSymlinkPath = isSymlink(gene2CorePath);

    if (isSymlinkPath) {
      logger.success('.gene2-core is already a symlink (no cleanup needed)');
      logger.newline();
      return;
    }

    // It's a directory - ask for confirmation
    logger.warn('Found old .gene2-core directory (not a symlink)');
    console.log(`Size: ${getSizeReadable(gene2CorePath)}`);
    console.log(`Path: ${gene2CorePath}\n`);

    let shouldRemove = force;

    if (!force && !dryRun) {
      shouldRemove = await promptUser('Remove it? (y/N): ');
    } else if (dryRun) {
      logger.info('[DRY-RUN] Would remove: .gene2-core');
      return;
    }

    if (shouldRemove) {
      logger.status('Step 1: Creating backup');

      const backupName = `.gene2-core_backup_${getTimestamp('datetime-file')}`;
      const backupPath = path.join(clientRepoPath, backupName);

      if (!dryRun) {
        moveSync(gene2CorePath, backupPath);
        logger.success(`Moved to: ${backupName}`);
      } else {
        logger.info(`[DRY-RUN] Would move: .gene2-core → ${backupName}`);
      }

      logger.newline();

      logger.section('Cleanup Complete');
      console.log(`${colors.yellow}Summary:${colors.reset}`);
      console.log('  ✓ Old .gene2-core directory moved to backup');
      console.log(`  → Backup location: ${backupName}`);
      console.log(`  → Ready for symlink setup\n`);

      console.log(`${colors.yellow}Next Step:${colors.reset}`);
      console.log('  Run: node cli.mjs init-client --client . --framework ~/workspace/gene2-core --name <name>\n');

    } else {
      logger.warn('Cleanup cancelled');
    }

    logger.newline();

  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

function getSizeReadable(dirPath) {
  try {
    let size = 0;
    const walk = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walk(filePath);
        } else {
          size += stat.size;
        }
      });
    };
    walk(dirPath);

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } catch {
    return 'unknown';
  }
}

// Make function available as default export for CLI
export default cleanupOldFramework;

// Direct execution support
if (import.meta.url === `file://${process.argv[1]}`) {
  const { parseArgs } = await import('./utils.mjs');
  const args = parseArgs();
  cleanupOldFramework(args);
}
