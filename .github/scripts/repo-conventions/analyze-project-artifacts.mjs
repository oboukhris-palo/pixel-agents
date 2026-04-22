#!/usr/bin/env node

/**
 * analyze-project-artifacts.mjs
 * 
 * Advanced artifact analysis and reporting script.
 * - Generates detailed reports on existing /docs and /logs
 * - Creates markdown summaries of artifacts
 * - Identifies documentation gaps and incomplete logs
 * - Generates interactive artifact index
 * 
 * Usage:
 *   node analyze-project-artifacts.mjs --client <path> [--output <path>] [--format json|markdown|html]
 *   
 * Examples:
 *   node analyze-project-artifacts.mjs --client . --output artifact-report.json
 *   node analyze-project-artifacts.mjs --client . --format markdown
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const utilsPath = path.join(__dirname, '..', 'utils.mjs');
const { logger, parseArgs, getCurrentDate } = await import(utilsPath);

class ArtifactAnalyzer {
  constructor(clientPath, options = {}) {
    this.clientPath = path.resolve(clientPath);
    this.outputPath = options.output || path.join(this.clientPath, 'artifact-analysis.json');
    this.format = options.format || 'json';
    this.verbose = options.verbose || false;

    this.analysis = {
      timestamp: new Date().toISOString(),
      clientPath: this.clientPath,
      docs: {
        exists: false,
        phases: {},
        totalSize: 0,
        fileCount: 0,
        summary: '',
      },
      logs: {
        exists: false,
        phases: {},
        totalSize: 0,
        fileCount: 0,
        summary: '',
      },
      recommendations: [],
      gaps: [],
      completeness: {
        docs: 0,
        logs: 0,
        overall: 0,
      },
    };
  }

  /**
   * Main execution method
   */
  async execute() {
    try {
      logger.info(`📊 Artifact Analysis`, { workspace: this.clientPath });

      logger.header('Analyzing /docs');
      await this.analyzeDocs();

      logger.header('Analyzing /logs');
      await this.analyzeLogs();

      logger.header('Generating Recommendations');
      this.generateRecommendations();

      logger.header('Generating Report');
      this.generateReport();

      return this.analysis;
    } catch (error) {
      logger.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Analyze /docs directory
   */
  async analyzeDocs() {
    const docsPath = path.join(this.clientPath, 'docs');

    if (!fs.existsSync(docsPath)) {
      logger.info('  ℹ /docs directory does not exist');
      return;
    }

    this.analysis.docs.exists = true;
    const phases = ['00-assessment', '01-requirements', '02-architecture', '03-testing', '04-planning', '05-implementation'];

    for (const phase of phases) {
      const phasePath = path.join(docsPath, phase);
      if (fs.existsSync(phasePath)) {
        const analysis = this.analyzeDirectory(phasePath);
        this.analysis.docs.phases[phase] = {
          exists: true,
          ...analysis,
        };
        this.analysis.docs.totalSize += analysis.size;
        this.analysis.docs.fileCount += analysis.fileCount;
        logger.info(`  ✓ ${phase}: ${analysis.fileCount} items (${this.formatBytes(analysis.size)})`);
      } else {
        this.analysis.docs.phases[phase] = { exists: false };
        this.analysis.gaps.push(`Missing phase documentation: ${phase}`);
      }
    }

    // Calculate completeness
    const existingPhases = Object.values(this.analysis.docs.phases).filter(p => p.exists).length;
    this.analysis.completeness.docs = Math.round((existingPhases / phases.length) * 100);
  }

  /**
   * Analyze /logs directory
   */
  async analyzeLogs() {
    const logsPath = path.join(this.clientPath, 'logs');

    if (!fs.existsSync(logsPath)) {
      logger.info('  ℹ /logs directory does not exist');
      return;
    }

    this.analysis.logs.exists = true;
    const phases = ['00-assessment', '01-requirements', '02-architecture', '03-testing', '04-planning', '05-implementation'];

    for (const phase of phases) {
      const phasePath = path.join(logsPath, phase);
      if (fs.existsSync(phasePath)) {
        const analysis = this.analyzeDirectory(phasePath);
        this.analysis.logs.phases[phase] = {
          exists: true,
          ...analysis,
        };
        this.analysis.logs.totalSize += analysis.size;
        this.analysis.logs.fileCount += analysis.fileCount;
        logger.info(`  ✓ ${phase}: ${analysis.fileCount} items (${this.formatBytes(analysis.size)})`);
      } else {
        this.analysis.logs.phases[phase] = { exists: false };
      }
    }

    // Calculate completeness
    const existingPhases = Object.values(this.analysis.logs.phases).filter(p => p.exists).length;
    this.analysis.completeness.logs = Math.round((existingPhases / phases.length) * 100);
  }

  /**
   * Analyze a directory recursively
   */
  analyzeDirectory(dirPath) {
    let size = 0;
    let fileCount = 0;
    const fileTypes = {};
    const files = [];

    const walk = (currentPath, depth = 0) => {
      if (depth > 5) return; // Prevent deep recursion
      try {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue; // Skip hidden files

          const fullPath = path.join(currentPath, entry.name);
          const relPath = path.relative(dirPath, fullPath);

          if (entry.isDirectory()) {
            walk(fullPath, depth + 1);
          } else {
            const stats = fs.statSync(fullPath);
            const ext = path.extname(entry.name) || 'no-extension';

            size += stats.size;
            fileCount++;

            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
            files.push({
              name: entry.name,
              path: relPath,
              size: stats.size,
              modified: new Date(stats.mtime).toISOString(),
            });
          }
        }
      } catch (error) {
        logger.warn(`Could not analyze ${currentPath}: ${error.message}`);
      }
    };

    walk(dirPath);

    return {
      size,
      fileCount,
      fileTypes,
      files: files.slice(0, 10), // Top 10 files
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations() {
    // Check for missing phases
    const allPhases = ['00-assessment', '01-requirements', '02-architecture', '03-testing', '04-planning', '05-implementation'];
    
    const missingDocPhases = allPhases.filter(
      phase => this.analysis.docs.phases[phase] && !this.analysis.docs.phases[phase].exists
    );

    if (missingDocPhases.length > 0) {
      this.analysis.recommendations.push({
        severity: 'high',
        title: 'Missing Documentation Phases',
        description: `${missingDocPhases.length} documentation phases are missing`,
        phases: missingDocPhases,
        action: 'Create missing phase directories in /docs',
      });
    }

    // Check documentation completeness
    if (this.analysis.completeness.docs < 50) {
      this.analysis.recommendations.push({
        severity: 'high',
        title: 'Low Documentation Completeness',
        description: `Only ${this.analysis.completeness.docs}% of documentation phases exist`,
        action: 'Prioritize creating missing documentation phases',
      });
    }

    // Check log structure
    if (!this.analysis.logs.exists) {
      this.analysis.recommendations.push({
        severity: 'medium',
        title: 'No Logs Directory',
        description: '/logs directory does not exist (required for agent logging)',
        action: 'Create /logs directory structure with phase subdirectories',
      });
    }

    // Check for large artifacts that should be archived
    if (this.analysis.docs.totalSize > 10 * 1024 * 1024) {
      this.analysis.recommendations.push({
        severity: 'medium',
        title: 'Large Artifact Size',
        description: `/docs is ${this.formatBytes(this.analysis.docs.totalSize)} - consider archiving`,
        action: 'Run init-project-structure.mjs with --archive-dir to archive large docs',
      });
    }

    // Calculate overall completeness
    this.analysis.completeness.overall = Math.round(
      (this.analysis.completeness.docs + this.analysis.completeness.logs) / 2
    );
  }

  /**
   * Generate report in specified format
   */
  generateReport() {
    let output = '';

    switch (this.format) {
      case 'markdown':
        output = this.generateMarkdownReport();
        break;
      case 'html':
        output = this.generateHtmlReport();
        break;
      case 'json':
      default:
        output = JSON.stringify(this.analysis, null, 2);
        break;
    }

    // Write to file
    fs.writeFileSync(this.outputPath, output);
    logger.success(`📄 Report generated: ${this.outputPath}`);

    // Also display summary
    this.displaySummary();
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const date = new Date().toISOString();
    let md = `# Artifact Analysis Report\n\n`;
    md += `**Generated**: ${date}\n`;
    md += `**Project Path**: ${this.clientPath}\n\n`;

    // Documentation Summary
    md += `## 📚 Documentation Analysis\n\n`;
    md += `- **Status**: ${this.analysis.docs.exists ? '✅ Exists' : '❌ Missing'}\n`;
    md += `- **Total Size**: ${this.formatBytes(this.analysis.docs.totalSize)}\n`;
    md += `- **File Count**: ${this.analysis.docs.fileCount}\n`;
    md += `- **Completeness**: ${this.analysis.completeness.docs}%\n\n`;

    if (Object.keys(this.analysis.docs.phases).length > 0) {
      md += `### Documentation Phases\n\n`;
      md += `| Phase | Status | Files | Size |\n`;
      md += `|-------|--------|-------|------|\n`;

      for (const [phase, data] of Object.entries(this.analysis.docs.phases)) {
        const status = data.exists ? '✅' : '❌';
        const files = data.fileCount || 0;
        const size = this.formatBytes(data.size || 0);
        md += `| ${phase} | ${status} | ${files} | ${size} |\n`;
      }
      md += '\n';
    }

    // Logs Summary
    md += `## 📋 Logs Analysis\n\n`;
    md += `- **Status**: ${this.analysis.logs.exists ? '✅ Exists' : '❌ Missing'}\n`;
    md += `- **Total Size**: ${this.formatBytes(this.analysis.logs.totalSize)}\n`;
    md += `- **File Count**: ${this.analysis.logs.fileCount}\n`;
    md += `- **Completeness**: ${this.analysis.completeness.logs}%\n\n`;

    if (Object.keys(this.analysis.logs.phases).length > 0) {
      md += `### Log Phases\n\n`;
      md += `| Phase | Status | Files | Size |\n`;
      md += `|-------|--------|-------|------|\n`;

      for (const [phase, data] of Object.entries(this.analysis.logs.phases)) {
        const status = data.exists ? '✅' : '❌';
        const files = data.fileCount || 0;
        const size = this.formatBytes(data.size || 0);
        md += `| ${phase} | ${status} | ${files} | ${size} |\n`;
      }
      md += '\n';
    }

    // Recommendations
    if (this.analysis.recommendations.length > 0) {
      md += `## 🎯 Recommendations\n\n`;
      for (const rec of this.analysis.recommendations) {
        const icon = rec.severity === 'high' ? '🔴' : '🟡';
        md += `### ${icon} ${rec.title}\n\n`;
        md += `- **Severity**: ${rec.severity.toUpperCase()}\n`;
        md += `- **Description**: ${rec.description}\n`;
        md += `- **Action**: ${rec.action}\n\n`;
      }
    }

    // Gaps
    if (this.analysis.gaps.length > 0) {
      md += `## ⚠️ Identified Gaps\n\n`;
      for (const gap of this.analysis.gaps) {
        md += `- ${gap}\n`;
      }
      md += '\n';
    }

    // Overall Stats
    md += `## 📊 Overall Statistics\n\n`;
    md += `- **Overall Completeness**: ${this.analysis.completeness.overall}%\n`;
    md += `- **Total Artifacts**: ${this.analysis.docs.fileCount + this.analysis.logs.fileCount} files\n`;
    md += `- **Total Size**: ${this.formatBytes(this.analysis.docs.totalSize + this.analysis.logs.totalSize)}\n`;

    return md;
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport() {
    const json = JSON.stringify(this.analysis, null, 2);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Artifact Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; }
    tr:hover { background: #f9f9f9; }
    .stat { display: inline-block; margin: 10px 20px 10px 0; }
    .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
    .stat-label { color: #666; font-size: 14px; }
    .recommendation { padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800; background: #fff8e1; }
    .recommendation.high { border-left-color: #f44336; background: #ffebee; }
    .recommendation.medium { border-left-color: #ff9800; background: #fff8e1; }
    .code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Artifact Analysis Report</h1>
    <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
    <p><strong>Project:</strong> ${this.clientPath}</p>

    <h2>📈 Overall Statistics</h2>
    <div>
      <div class="stat">
        <div class="stat-value">${this.analysis.completeness.overall}%</div>
        <div class="stat-label">Overall Completeness</div>
      </div>
      <div class="stat">
        <div class="stat-value">${this.analysis.docs.fileCount}</div>
        <div class="stat-label">Doc Files</div>
      </div>
      <div class="stat">
        <div class="stat-value">${this.analysis.logs.fileCount}</div>
        <div class="stat-label">Log Files</div>
      </div>
      <div class="stat">
        <div class="stat-value">${this.formatBytes(this.analysis.docs.totalSize + this.analysis.logs.totalSize)}</div>
        <div class="stat-label">Total Size</div>
      </div>
    </div>

    <h2>📚 Documentation</h2>
    <p><strong>Status:</strong> ${this.analysis.docs.exists ? '✅ Exists' : '❌ Missing'} | 
       <strong>Completeness:</strong> ${this.analysis.completeness.docs}%</p>
    <p><strong>Size:</strong> ${this.formatBytes(this.analysis.docs.totalSize)} | 
       <strong>Files:</strong> ${this.analysis.docs.fileCount}</p>

    <h2>📋 Logs</h2>
    <p><strong>Status:</strong> ${this.analysis.logs.exists ? '✅ Exists' : '❌ Missing'} | 
       <strong>Completeness:</strong> ${this.analysis.completeness.logs}%</p>
    <p><strong>Size:</strong> ${this.formatBytes(this.analysis.logs.totalSize)} | 
       <strong>Files:</strong> ${this.analysis.logs.fileCount}</p>

    ${this.analysis.recommendations.length > 0 ? `
      <h2>🎯 Recommendations</h2>
      ${this.analysis.recommendations.map(rec => `
        <div class="recommendation ${rec.severity}">
          <h3>${rec.title}</h3>
          <p><strong>Severity:</strong> ${rec.severity.toUpperCase()}</p>
          <p><strong>Description:</strong> ${rec.description}</p>
          <p><strong>Action:</strong> ${rec.action}</p>
        </div>
      `).join('')}
    ` : ''}

    <hr style="margin: 40px 0;">
    <h2>Raw JSON Data</h2>
    <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto;">${json}</pre>
  </div>
</body>
</html>`;
  }

  /**
   * Display summary in console
   */
  displaySummary() {
    logger.info(`\n📊 ANALYSIS SUMMARY`);
    logger.info(`===================`);
    logger.info(`\nDocumentation:`);
    logger.info(`  Status: ${this.analysis.docs.exists ? '✅ Exists' : '❌ Missing'}`);
    logger.info(`  Files: ${this.analysis.docs.fileCount}`);
    logger.info(`  Size: ${this.formatBytes(this.analysis.docs.totalSize)}`);
    logger.info(`  Completeness: ${this.analysis.completeness.docs}%`);

    logger.info(`\nLogs:`);
    logger.info(`  Status: ${this.analysis.logs.exists ? '✅ Exists' : '❌ Missing'}`);
    logger.info(`  Files: ${this.analysis.logs.fileCount}`);
    logger.info(`  Size: ${this.formatBytes(this.analysis.logs.totalSize)}`);
    logger.info(`  Completeness: ${this.analysis.completeness.logs}%`);

    if (this.analysis.recommendations.length > 0) {
      logger.info(`\n🎯 Recommendations: ${this.analysis.recommendations.length}`);
      this.analysis.recommendations.forEach(rec => {
        logger.info(`   • ${rec.title} [${rec.severity.toUpperCase()}]`);
      });
    }

    logger.info(`\n✨ Report saved to: ${this.outputPath}`);
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

  if (!args.client) {
    logger.error('❌ Missing required argument: --client <path>');
    logger.info('\nUsage: node analyze-project-artifacts.mjs --client <path> [--output <path>] [--format json|markdown|html]');
    process.exit(1);
  }

  const options = {
    output: args.output,
    format: args.format || 'json',
    verbose: args.verbose || false,
  };

  const analyzer = new ArtifactAnalyzer(args.client, options);
  await analyzer.execute();
}

main().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
