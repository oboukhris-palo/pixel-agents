#!/usr/bin/env node

/**
 * init-project-structure.mjs
 * 
 * Orchestrator script for setting up complete project folder structure.
 * - Creates folder structure for new projects
 * - Preserves existing /docs and /logs
 * - Scans, summarizes, and archives existing artifacts
 * - Generates configuration files
 * 
 * Usage:
 *   node init-project-structure.mjs --client <path> [--dry-run] [--archive-dir <path>]
 *   
 * Examples:
 *   node init-project-structure.mjs --client . --dry-run
 *   node init-project-structure.mjs --client . --archive-dir ./archives
 *   node init-project-structure.mjs --client ~/my-project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get script directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsPath = path.join(__dirname, '..', 'utils.mjs');

// Import utilities
const { logger, parseArgs, ensureDir, loadJsonFile, saveJsonFile, getCurrentDate } = await import(utilsPath);

// Project structure definition
const PROJECT_STRUCTURE = {
  '.github': {
    'agents': true,
    'instructions': true,
    'workflows': true,
    'prompts': true,
    'tasks': true,
    'templates': true,
    'guides': true,
    'scripts': true,
  },
  'docs': {
    '00-assessment': true,
    '01-requirements': true,
    '02-architecture': true,
    '03-testing': true,
    '04-planning': true,
    '99-operations': true,
    '05-implementation': {
      'epics': true,
    }
  },
  'logs': {
    '00-assessment': true,
    '01-requirements': true,
    '02-architecture': true,
    '03-testing': true,
    '04-planning': true,
    '05-implementation': true,
  },
  'src': {
    'backend': { 'src': true },
    'frontend': { 'src': true },
  },
  '.gitkeep': 'file',
};

class ProjectStructureInitializer {
  constructor(clientPath, options = {}) {
    this.clientPath = path.resolve(clientPath);
    this.dryRun = options.dryRun || false;
    this.archiveDir = options.archiveDir || path.join(this.clientPath, '.archives');
    this.verbose = options.verbose || false;
    this.timestamp = getCurrentDate().replace(/\D/g, ''); // YYYYMMDD format
    
    this.summary = {
      createdDirs: [],
      preservedDirs: [],
      scannedDocs: {},
      scannedLogs: {},
      archivedItems: [],
      warnings: [],
      errors: [],
    };
  }

  /**
   * Main execution method
   */
  async execute() {
    try {
      logger.info(`🚀 Project Structure Initialization`, { workspace: this.clientPath });
      logger.info(this.dryRun ? '[DRY-RUN MODE]' : '[EXECUTION MODE]');

      // Step 1: Validate client path
      if (!fs.existsSync(this.clientPath)) {
        throw new Error(`Client path does not exist: ${this.clientPath}`);
      }

      logger.header('Step 1: Scanning Existing Artifacts');
      await this.scanExistingArtifacts();

      logger.header('Step 2: Creating Project Structure');
      await this.createDirectoryStructure();

      logger.header('Step 3: Archiving Existing Artifacts (if needed)');
      await this.archiveExistingArtifacts();

      logger.header('Step 4: Generating Configuration Files');
      await this.generateConfigFiles();

      logger.header('Step 5: Validation Summary');
      await this.generateSummary();

      logger.success('✅ Project Structure Initialization Complete!');
      return this.summary;

    } catch (error) {
      logger.error(`❌ Initialization failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Scan existing /docs and /logs directories
   */
  async scanExistingArtifacts() {
    const docsPath = path.join(this.clientPath, 'docs');
    const logsPath = path.join(this.clientPath, 'logs');

    // Scan docs
    if (fs.existsSync(docsPath)) {
      logger.info('📚 Scanning /docs directory...');
      this.summary.scannedDocs = this.scanDirectory(docsPath, 'docs');
      this.summary.preservedDirs.push('docs');
      logger.success(`  ✓ Found ${Object.keys(this.summary.scannedDocs).length} items in /docs`);
    }

    // Scan logs
    if (fs.existsSync(logsPath)) {
      logger.info('📋 Scanning /logs directory...');
      this.summary.scannedLogs = this.scanDirectory(logsPath, 'logs');
      this.summary.preservedDirs.push('logs');
      logger.success(`  ✓ Found ${Object.keys(this.summary.scannedLogs).length} items in /logs`);
    }
  }

  /**
   * Recursively scan directory structure
   */
  scanDirectory(dirPath, relativePath = '') {
    const items = {};
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          const size = this.getDirectorySize(fullPath);
          items[relPath] = {
            type: 'directory',
            size,
            files: fs.readdirSync(fullPath).length,
            subdirs: this.scanDirectory(fullPath, relPath),
          };
        } else {
          const stats = fs.statSync(fullPath);
          items[relPath] = {
            type: 'file',
            size: stats.size,
            modified: new Date(stats.mtime).toISOString(),
          };
        }
      }
    } catch (error) {
      logger.warn(`Could not scan ${dirPath}: ${error.message}`);
    }

    return items;
  }

  /**
   * Calculate directory size recursively
   */
  getDirectorySize(dirPath) {
    let size = 0;
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          size += this.getDirectorySize(fullPath);
        } else {
          size += fs.statSync(fullPath).size;
        }
      }
    } catch (error) {
      logger.warn(`Could not calculate size for ${dirPath}`);
    }
    return size;
  }

  /**
   * Create complete directory structure
   * 
   * Strategy for /docs and /logs:
   * - If these folders exist, preserve them and all their existing content
   * - Only create/update PDLC phase directories (00-assessment through 05-implementation)
   * - Never delete any existing files or folders
   */
  async createDirectoryStructure() {
    const created = [];
    const pdlcDirs = ['00-assessment', '01-requirements', '02-architecture', '03-testing', '04-planning', '99-operations', '05-implementation'];

    const createStructure = (structure, basePath = this.clientPath, parentName = '') => {
      for (const [name, value] of Object.entries(structure)) {
        // Skip special entries
        if (['_comment', '_description'].includes(name)) continue;

        const fullPath = path.join(basePath, name);
        const isDocs = parentName === 'docs';
        const isLogs = parentName === 'logs';
        const isPdlcDir = pdlcDirs.includes(name);

        if (value === 'file') {
          // Skip .gitkeep - we'll handle it separately
          if (name === '.gitkeep') continue;
        } else if (value === true || typeof value === 'object') {
          // Directory (either `true` for empty dir, or object with subdirectories)
          
          if (!fs.existsSync(fullPath)) {
            // Create the directory
            if (!this.dryRun) {
              fs.mkdirSync(fullPath, { recursive: true });
            }
            created.push(fullPath.replace(this.clientPath, ''));
            
            // Log creation with context - only label PDLC phases, not supporting docs
            if (isDocs || isLogs) {
              if (isPdlcDir) {
                logger.info(`  ✓ Created ${fullPath.replace(this.clientPath, '')} (PDLC phase)`);
              } else {
                logger.info(`  ✓ Created ${fullPath.replace(this.clientPath, '')} (supporting docs)`);
              }
            } else {
              logger.info(`  ✓ Created ${fullPath.replace(this.clientPath, '')}`);
            }

            // Create .gitkeep in new directories
            const gitkeepPath = path.join(fullPath, '.gitkeep');
            if (!fs.existsSync(gitkeepPath)) {
              if (!this.dryRun) {
                fs.writeFileSync(gitkeepPath, '');
              }
            }
          } else {
            // Directory already exists - preserve it
            if (isDocs || isLogs) {
              if (isPdlcDir) {
                logger.info(`  ℹ Preserved (existing PDLC): ${fullPath.replace(this.clientPath, '')}`);
              } else {
                logger.info(`  ℹ Preserved (non-PDLC content): ${fullPath.replace(this.clientPath, '')}`);
              }
            } else {
              logger.info(`  ℹ Exists: ${fullPath.replace(this.clientPath, '')}`);
            }
            this.summary.preservedDirs.push(fullPath.replace(this.clientPath, ''));
          }

          // Recurse into subdirectories (only if value is an object)
          if (typeof value === 'object' && !Array.isArray(value)) {
            createStructure(value, fullPath, name);
          }
        }
      }
    };

    createStructure(PROJECT_STRUCTURE);
    this.summary.createdDirs = created;
  }

  /**
   * Archive existing artifacts if larger than threshold
   */
  async archiveExistingArtifacts() {
    const docsPath = path.join(this.clientPath, 'docs');
    const logsPath = path.join(this.clientPath, 'logs');
    const ARCHIVE_THRESHOLD = 5 * 1024 * 1024; // 5MB

    logger.info('🗜️  Checking archive requirements...');

    const itemsToArchive = [];

    // Check docs
    if (fs.existsSync(docsPath)) {
      const docsSize = this.getDirectorySize(docsPath);
      if (docsSize > ARCHIVE_THRESHOLD) {
        itemsToArchive.push({ path: docsPath, name: 'docs', size: docsSize });
      }
    }

    // Check logs
    if (fs.existsSync(logsPath)) {
      const logsSize = this.getDirectorySize(logsPath);
      if (logsSize > ARCHIVE_THRESHOLD) {
        itemsToArchive.push({ path: logsPath, name: 'logs', size: logsSize });
      }
    }

    if (itemsToArchive.length === 0) {
      logger.info('  ℹ No items require archiving (below 5MB threshold)');
      return;
    }

    // Create archive directory
    if (!this.dryRun && !fs.existsSync(this.archiveDir)) {
      fs.mkdirSync(this.archiveDir, { recursive: true });
    }

    // Archive items
    for (const item of itemsToArchive) {
      const archiveName = `${item.name}-archive-${this.timestamp}.tar.gz`;
      const archivePath = path.join(this.archiveDir, archiveName);

      logger.info(`  ⚙️  Creating archive: ${archiveName}`);
      logger.info(`     Size: ${this.formatBytes(item.size)}`);

      if (!this.dryRun) {
        try {
          const cwd = this.clientPath;
          execSync(`tar -czf "${archivePath}" "${item.name}"`, { cwd });
          this.summary.archivedItems.push({
            name: archiveName,
            path: archivePath,
            source: item.name,
            size: this.formatBytes(item.size),
            timestamp: this.timestamp,
          });
          logger.success(`  ✓ Archive created: ${archiveName}`);
        } catch (error) {
          logger.warn(`  ⚠️  Could not create archive: ${error.message}`);
          this.summary.warnings.push(`Archive creation failed for ${item.name}`);
        }
      } else {
        logger.info(`  [DRY-RUN] Archive would be created: ${archiveName}`);
      }
    }
  }

  /**
   * Generate configuration files
   */
  async generateConfigFiles() {
    const configFiles = {
      'project-structure-config.json': this.generateStructureConfig(),
      'structure-summary.json': this.generateSummaryReport(),
    };

    for (const [filename, content] of Object.entries(configFiles)) {
      const filePath = path.join(this.clientPath, filename);

      if (!this.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        logger.success(`  ✓ Created ${filename}`);
      } else {
        logger.info(`  [DRY-RUN] Would create ${filename}`);
      }
    }
  }

  /**
   * Generate structure configuration
   */
  generateStructureConfig() {
    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      framework: 'ai-first-delivery',
      structure: {
        docs: 'Project documentation (phases 0-5)',
        logs: 'Agent action logs (by phase)',
        src: 'Source code (backend/frontend or modules)',
        '.github': 'GitHub configuration (agents, instructions, workflows)',
      },
      conventions: {
        epics: 'EPIC-{NNN}',
        stories: 'US-{NNN}',
        branches: 'feat/EPIC-{NNN}-US-{NNN}-description',
        commits: 'TDD-US-{NNN}-{PHASE}-{CYCLE}-YYYYMMDD: message',
      },
      phases: {
        '00': 'Assessment & Discovery',
        '01': 'Requirements & Personas',
        '02': 'Architecture & Design',
        '03': 'Testing Strategy',
        '04': 'Planning & Deployment',
        '05': 'Implementation (TDD)',
      },
    };
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    return {
      timestamp: new Date().toISOString(),
      executionDate: this.timestamp,
      clientPath: this.clientPath,
      dryRun: this.dryRun,
      summary: this.summary,
      statistics: {
        directoriesCreated: this.summary.createdDirs.length,
        directoriesPreserved: this.summary.preservedDirs.length,
        itemsArchived: this.summary.archivedItems.length,
        warnings: this.summary.warnings.length,
        docsItems: Object.keys(this.summary.scannedDocs).length,
        logsItems: Object.keys(this.summary.scannedLogs).length,
      },
    };
  }

  /**
   * Generate execution summary
   */
  async generateSummary() {
    const summary = this.summary;

    logger.info(`\n📊 SUMMARY REPORT`);
    logger.info(`==================`);
    logger.info(`\n📁 Directories Created: ${summary.createdDirs.length}`);
    if (summary.createdDirs.length > 0 && this.verbose) {
      summary.createdDirs.forEach(dir => logger.info(`   • ${dir}`));
    }

    logger.info(`\n✅ Directories Preserved: ${summary.preservedDirs.length}`);
    if (summary.preservedDirs.length > 0) {
      summary.preservedDirs.forEach(dir => logger.info(`   • ${dir}`));
    }

    if (summary.scannedDocs && Object.keys(summary.scannedDocs).length > 0) {
      logger.info(`\n📚 Docs Artifacts Scanned: ${Object.keys(summary.scannedDocs).length} items`);
    }

    if (summary.scannedLogs && Object.keys(summary.scannedLogs).length > 0) {
      logger.info(`\n📋 Logs Artifacts Scanned: ${Object.keys(summary.scannedLogs).length} items`);
    }

    if (summary.archivedItems.length > 0) {
      logger.info(`\n🗜️  Archived Items: ${summary.archivedItems.length}`);
      summary.archivedItems.forEach(item => {
        logger.info(`   • ${item.name} (${item.size})`);
      });
    }

    if (summary.warnings.length > 0) {
      logger.info(`\n⚠️  Warnings: ${summary.warnings.length}`);
      summary.warnings.forEach(warning => logger.warn(`   • ${warning}`));
    }

    logger.info(`\n✨ Configuration files generated:`);
    logger.info(`   • project-structure-config.json`);
    logger.info(`   • structure-summary.json`);

    if (this.dryRun) {
      logger.info(`\n⏸️  DRY-RUN MODE: No changes were made to the filesystem`);
      logger.info(`   Run without --dry-run to apply changes`);
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Validate required arguments
  if (!args.client) {
    logger.error('❌ Missing required argument: --client <path>');
    logger.info('\nUsage: node init-project-structure.mjs --client <path> [--dry-run] [--archive-dir <path>] [--verbose]');
    process.exit(1);
  }

  const options = {
    dryRun: args['dry-run'] || false,
    archiveDir: args['archive-dir'],
    verbose: args.verbose || false,
  };

  const initializer = new ProjectStructureInitializer(args.client, options);
  await initializer.execute();
}

// Execute
main().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
