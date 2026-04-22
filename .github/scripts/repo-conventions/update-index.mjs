#!/usr/bin/env node

/**
 * update-index.mjs - Generates/updates INDEX.md files throughout project structure
 * 
 * This script recursively scans directory structure and creates INDEX.md files
 * with titles, descriptions, and last modified dates for all files and folders.
 * 
 * Usage: node .github/scripts/update-index.mjs [target-directory]
 * Example: node .github/scripts/update-index.mjs docs/
 * 
 * Part of Gen‑e2 Compliance and Professional Documentation framework
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the project root from (in priority order):
 *  1. --root <path> CLI argument
 *  2. PROJECT_PATH environment variable
 *  3. Auto-detection: 3 levels up from repo-conventions dir
 *     (.gene2-core/.github/scripts/repo-conventions → client repo root)
 */
function resolveProjectRoot() {
  const args = process.argv.slice(2);
  const rootIdx = args.findIndex(a => a === '--root');
  if (rootIdx >= 0 && args[rootIdx + 1]) {
    return path.resolve(args[rootIdx + 1]);
  }
  if (process.env.PROJECT_PATH) {
    return path.resolve(process.env.PROJECT_PATH);
  }
  return path.resolve(__dirname, '../../..');
}

const projectRoot = resolveProjectRoot();

const CONFIG = {
  indexFileName: 'INDEX.md',
  excludePatterns: [
    /^\./, // Hidden files/directories
    /node_modules/,
    /\.git/,
    /logs/,
    /build/,
    /dist/,
    /coverage/,
    /\.vscode/,
    /\.DS_Store/,
    /INDEX\.md$/i // Don't include existing INDEX.md in listings
  ],
  descriptionHints: {
    // File patterns and their likely purposes
    'requirements.md': 'Master product requirements document (PRD)',
    'user-stories.md': 'User stories catalog and tracking',
    'personas.md': 'User personas and target audience definitions',
    'architecture-design.md': 'System architecture and design decisions',
    'tech-spec.md': 'Technical specifications and implementation details',
    'test-strategies.md': 'Testing approach and BDD strategies',
    'implementation-plan.md': 'Layer-by-layer implementation guide with checkboxes',
    'description.md': 'Story definition and acceptance criteria',
    'plan-approval.yaml': 'Human validation gate for implementation',
    'business-case.md': 'Business justification and ROI analysis',
    'design-systems.md': 'UI/UX design system and components',
    'iteration-planning.md': 'Sprint and iteration planning documents',
    'deployment-plan.md': 'Deployment strategy and rollout plan'
  },
  directoryDescriptions: {
    '00-assessment': 'Phase 0: Client assessment and prerequisites',
    '01-requirements': 'Phase 1-2: Requirements and personas (IMMUTABLE)',
    '02-architecture': 'Phase 3-4: Architecture and tech specs (IMMUTABLE)',
    '03-testing': 'Phase 5: Testing strategies (IMMUTABLE)',
    '04-planning': 'Phase 6-7: Planning and deployment (IMMUTABLE)',
    '05-implementation': 'Phase 8: Implementation status tracking (MUTABLE)',
    'epics': 'Epic organization containers',
    'user-stories': 'User story implementation folders',
    'bdd-scenarios': 'BDD feature files and scenarios'
  }
};

/**
 * Check if path should be excluded from INDEX.md generation
 */
function shouldExclude(itemPath, itemName) {
  return CONFIG.excludePatterns.some(pattern => pattern.test(itemName) || pattern.test(itemPath));
}

/**
 * Get file stats and last modified date
 */
function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtime.toISOString().split('T')[0] // YYYY-MM-DD format
    };
  } catch (error) {
    console.warn(`Warning: Could not get stats for ${filePath}:`, error.message);
    return {
      isDirectory: false,
      size: 0,
      modified: new Date().toISOString().split('T')[0]
    };
  }
}

/**
 * Extract description from file content or use hints
 */
function getItemDescription(itemPath, itemName, isDirectory) {
  // Check for known file patterns
  if (!isDirectory && CONFIG.descriptionHints[itemName]) {
    return CONFIG.descriptionHints[itemName];
  }
  
  // Check for known directory patterns
  if (isDirectory && CONFIG.directoryDescriptions[itemName]) {
    return CONFIG.directoryDescriptions[itemName];
  }
  
  // Try to extract description from file content
  if (!isDirectory && itemPath.endsWith('.md')) {
    try {
      const content = fs.readFileSync(itemPath, 'utf-8');
      const lines = content.split('\n').slice(0, 10); // First 10 lines
      
      // Look for markdown headers
      for (const line of lines) {
        if (line.startsWith('# ') && line.length > 3) {
          return line.substring(2).trim();
        }
      }
      
      // Look for description in frontmatter
      if (content.startsWith('---')) {
        const frontmatterEnd = content.indexOf('---', 3);
        if (frontmatterEnd > 0) {
          const frontmatter = content.substring(0, frontmatterEnd);
          const descMatch = frontmatter.match(/description:\s*(.+)/);
          if (descMatch) {
            return descMatch[1].replace(/['"]/g, '').trim();
          }
        }
      }
      
      // Look for first paragraph
      const paragraphMatch = content.match(/\n\n(.{10,80})/);
      if (paragraphMatch) {
        return paragraphMatch[1].trim().replace(/\n/g, ' ');
      }
      
    } catch (error) {
      console.warn(`Could not read ${itemPath} for description:`, error.message);
    }
  }
  
  // Default descriptions based on patterns
  if (itemPath.includes('/epics/') && itemName.startsWith('EPIC-')) {
    return `Epic ${itemName}: Feature grouping and organization`;
  }
  if (itemPath.includes('/user-stories/') && itemName.startsWith('US-')) {
    return `User Story ${itemName}: Implementation details and artifacts`;
  }
  if (itemName.match(/^\d{3}$/)) { // TDD cycle folders (001, 002, etc.)
    return `TDD Cycle ${itemName}: RED-GREEN-REFACTOR handoff artifacts`;
  }
  
  return isDirectory ? 'Directory container' : 'Project file';
}

/**
 * Generate TABLE of Contents entry
 */
function generateTOCEntry(itemName, description, isDirectory, modified, relativePath) {
  const type = isDirectory ? '📁' : '📄';
  const link = isDirectory ? `${itemName}/` : itemName;
  const mdLink = `[${link}](${relativePath})`;
  
  return `| ${type} | ${mdLink} | ${description} | ${modified} |`;
}

/**
 * Generate INDEX.md content for a directory
 */
function generateIndexContent(dirPath, items) {
  const relativeDir = path.relative(projectRoot, dirPath);
  const dirName = path.basename(dirPath);
  
  // Determine directory title and description
  let title, description;
  if (relativeDir === '.' || relativeDir === '') {
    title = 'Project Root';
    description = 'AI-Driven PDLC Orchestration Framework - Professional documentation and automation';
  } else if (relativeDir === 'docs') {
    title = 'Documentation Hub';
    description = 'PDLC-organized documentation with phase-based structure and implementation tracking';
  } else {
    title = dirName.toUpperCase() === dirName ? dirName : dirName.charAt(0).toUpperCase() + dirName.slice(1);
    description = CONFIG.directoryDescriptions[dirName] || `${title} directory contents and organization`;
  }
  
  // Sort items: directories first, then files, both alphabetically
  const sortedItems = items.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
  
  let content = `# ${title}\n\n`;
  content += `${description}\n\n`;
  content += `**Location**: \`${relativeDir || '.'}\`  \n`;
  content += `**Last Updated**: ${new Date().toISOString().split('T')[0]}  \n`;
  content += `**Items**: ${items.length}\n\n`;
  
  if (items.length === 0) {
    content += '*This directory is empty.*\n\n';
  } else {
    content += '## Contents\n\n';
    content += '| Type | Name | Description | Last Modified |\n';
    content += '|------|------|-------------|---------------|\n';
    
    for (const item of sortedItems) {
      content += generateTOCEntry(item.name, item.description, item.isDirectory, item.modified, item.relativePath) + '\n';
    }
    content += '\n';
  }
  
  // Add navigation footer if not in root
  if (relativeDir !== '.' && relativeDir !== '') {
    const parentDir = path.dirname(relativeDir);
    const upPath = parentDir === '.' ? '../' : `../${CONFIG.indexFileName}`;
    content += `---\n\n`;
    content += `**Navigation**: [← Up](${ upPath}) | [🏠 Project Root](/${CONFIG.indexFileName})  \n`;
    content += `**Framework**: Gen‑e2 Compliance v2.0.0 | **Generated**: ${new Date().toISOString()}\n`;
  }
  
  return content;
}

/**
 * Recursively update INDEX.md files in directory tree
 */
function updateIndex(dirPath, recursive = true) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory ${dirPath} does not exist.`);
    return;
  }
  
  try {
    const entries = fs.readdirSync(dirPath);
    const items = [];
    
    // Process each entry
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      
      // Skip excluded items
      if (shouldExclude(entryPath, entry)) {
        continue;
      }
      
      const stats = getFileStats(entryPath);
      const description = getItemDescription(entryPath, entry, stats.isDirectory);
      const relativePath = stats.isDirectory ? `${entry}/` : entry;
      
      items.push({
        name: entry,
        path: entryPath,
        relativePath: relativePath,
        description: description,
        isDirectory: stats.isDirectory,
        modified: stats.modified
      });
      
      // Recursively process subdirectories
      if (recursive && stats.isDirectory) {
        updateIndex(entryPath, true);
      }
    }
    
    // Generate and write INDEX.md
    const indexPath = path.join(dirPath, CONFIG.indexFileName);
    const indexContent = generateIndexContent(dirPath, items);
    
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    
    const relativeDir = path.relative(projectRoot, dirPath);
    console.log(`✅ Updated INDEX.md in: ${relativeDir || 'project root'} (${items.length} items)`);
    
  } catch (error) {
    console.error(`Error updating INDEX.md in ${dirPath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  // Filter out --root <value> flag pairs so positional arg is not confused
  const positional = args.filter((a, i) => a !== '--root' && args[i - 1] !== '--root');
  const targetDir = positional[0] ? path.resolve(positional[0]) : projectRoot;
  
  console.log('🔄 Gen‑e2 Index Generator - Starting...');
  console.log(`📂 Target directory: ${targetDir}`);
  console.log(`🏠 Project root: ${projectRoot}`);
  console.log('');
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Target directory does not exist: ${targetDir}`);
    process.exit(1);
  }
  
  updateIndex(targetDir, true);
  
  console.log('');
  console.log('✅ Index generation complete!');
  console.log('📋 All INDEX.md files have been updated with current structure.');
  console.log('🔄 Run this script after adding, moving, or renaming files/directories.');
}

// Main async wrapper that can be called as default export
async function updateIndexWrapper(args = {}) {
  try {
    const projectRoot = args.client || args.root || process.cwd();
    const targetDir = args._ ? args._[0] : 'docs';
    updateIndex(targetDir || projectRoot, true);
    return { success: true };
  } catch (error) {
    logger.error(error.message);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateIndex, generateIndexContent, getItemDescription };
export default updateIndexWrapper;