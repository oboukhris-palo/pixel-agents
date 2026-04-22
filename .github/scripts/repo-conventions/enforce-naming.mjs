#!/usr/bin/env node

/**
 * enforce-naming.mjs - Validates naming conventions for Gen‑e2 compliance
 * 
 * This script validates:
 * - Folder names match EPIC-xxx/US-xxx patterns
 * - References in files match IDs
 * - Branch names include correct IDs
 * - Commit messages follow TDD/DOC/ASSESSMENT patterns
 * 
 * Usage: node .github/scripts/enforce-naming.mjs [options]
 * Options: --fix (attempt to fix violations), --branch (check current branch)
 * 
 * Part of Gen‑e2 Compliance and Professional Documentation framework
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the project root from (in priority order):
 *  1. --root <path> CLI argument
 *  2. PROJECT_PATH environment variable
 *  3. Auto-detection: 2 levels up from the gene2-core scripts dir
 *     (.gene2-core/.github/scripts → .gene2-core → client repo)
 *     When run standalone from gene2-core: gene2-core/.github/scripts → client via --root
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
  // Auto-detect: when this script lives at <client>/.gene2-core/.github/scripts/repo-conventions/
  // going 3 levels up lands at the client repo root.
  // When run standalone from gene2-core, --root or PROJECT_PATH should be provided.
  return path.resolve(__dirname, '../../..');
}

const projectRoot = resolveProjectRoot();

let violations = [];
let config = null;

/**
 * Load naming configuration from environment or prompt
 * Since .github/naming.yml is removed, this will return default config
 * Actual prefixes will be provided by orchestrator agent during epic/story creation
 */
function loadNamingConfig() {
  // Return default naming conventions
  // The orchestrator agent will validate and set these during epic/story creation
  return {
    app_prefix: process.env.APP_PREFIX || '',
    epic_prefix: process.env.EPIC_PREFIX || 'EPIC',
    story_prefix: process.env.STORY_PREFIX || 'US',
    id_width: parseInt(process.env.ID_WIDTH || '3')
  };
}

/**
 * Generate regex patterns based on config
 */
function generatePatterns(config) {
  const { app_prefix, epic_prefix, story_prefix, id_width } = config;
  const idPattern = `\\d{${id_width}}`;
  const prefixPattern = app_prefix ? `${app_prefix}-` : '';
  
  return {
    epicId: new RegExp(`^${prefixPattern}${epic_prefix}-${idPattern}$`),
    storyId: new RegExp(`^${prefixPattern}${story_prefix}-${idPattern}$`),
    branchPattern: new RegExp(`^feat\\/${prefixPattern}${epic_prefix}-${idPattern}-${story_prefix}-${idPattern}-.+`),
    tddCommit: new RegExp(`^TDD-${prefixPattern}${story_prefix}-${idPattern}-(RED|GREEN|REFACTOR)-\\d+:.+`),
    docCommit: new RegExp(`^DOC-PHASE-[1-7]-${prefixPattern}${story_prefix}-${idPattern}:.+`),
    assessmentCommit: /^ASSESSMENT-PHASE-0:.+/,
    featCommit: new RegExp(`^feat\\(${prefixPattern}${epic_prefix}-${idPattern}\\/${story_prefix}-${idPattern}\\):.+`),
    choreCommit: /^chore\(structure\):.+/
  };
}

/**
 * Add a violation to the list
 */
function addViolation(type, description, file = null, fix = null) {
  violations.push({
    type,
    description,
    file,
    fix,
    severity: type.includes('ERROR') ? 'error' : 'warning'
  });
}

/**
 * Validate directory structure
 */
function validateDirectoryStructure() {
  const implementationPath = path.join(projectRoot, 'docs', '05-implementation');
  
  if (!fs.existsSync(implementationPath)) {
    addViolation('STRUCTURE_ERROR', 'docs/05-implementation directory missing');
    return;
  }
  
  const epicsPath = path.join(implementationPath, 'epics');
  if (!fs.existsSync(epicsPath)) {
    addViolation('STRUCTURE_WARNING', 'docs/05-implementation/epics directory missing');
    return;
  }
  
  try {
    const epics = fs.readdirSync(epicsPath);
    const patterns = generatePatterns(config);
    
    for (const epic of epics) {
      const epicPath = path.join(epicsPath, epic);
      
      if (!fs.statSync(epicPath).isDirectory()) continue;
      
      // Validate epic naming
      if (!patterns.epicId.test(epic)) {
        addViolation('NAMING_ERROR', `Epic folder name invalid: ${epic}`, epicPath);
      }
      
      // Check user-stories subdirectory
      const userStoriesPath = path.join(epicPath, 'user-stories');
      if (fs.existsSync(userStoriesPath)) {
        const stories = fs.readdirSync(userStoriesPath);
        
        for (const story of stories) {
          const storyPath = path.join(userStoriesPath, story);
          
          if (!fs.statSync(storyPath).isDirectory()) continue;
          
          // Validate story naming
          if (!patterns.storyId.test(story)) {
            addViolation('NAMING_ERROR', `User story folder name invalid: ${story}`, storyPath);
          }
          
          // Check required files
          const requiredFiles = ['description.md', 'implementation-plan.md'];
          for (const file of requiredFiles) {
            const filePath = path.join(storyPath, file);
            if (!fs.existsSync(filePath)) {
              addViolation('STRUCTURE_ERROR', `Required file missing: ${file}`, storyPath);
            }
          }
        }
      }
    }
  } catch (error) {
    addViolation('STRUCTURE_ERROR', `Error scanning epic directories: ${error.message}`);
  }
}

/**
 * Validate file references
 */
function validateFileReferences() {
  const patterns = generatePatterns(config);
  
  // Scan markdown files for ID references
  function scanMarkdownFiles(dir) {
    try {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const entryPath = path.join(dir, entry);
        const stats = fs.statSync(entryPath);
        
        if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          scanMarkdownFiles(entryPath);
        } else if (entry.endsWith('.md')) {
          try {
            const content = fs.readFileSync(entryPath, 'utf-8');
            
            // Find all EPIC-xxx and US-xxx references
            const epicRefs = content.match(/EPIC-\d{3}/g) || [];
            const storyRefs = content.match(/US-\d{3}/g) || [];
            
            for (const ref of [...epicRefs, ...storyRefs]) {
              const isEpic = ref.startsWith(config.epic_prefix);
              const pattern = isEpic ? patterns.epicId : patterns.storyId;
              
              if (!pattern.test(ref)) {
                addViolation('REFERENCE_ERROR', `Invalid ID reference: ${ref}`, entryPath);
              }
            }
          } catch (error) {
            addViolation('FILE_ERROR', `Error reading file: ${error.message}`, entryPath);
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  const docsPath = path.join(projectRoot, 'docs');
  if (fs.existsSync(docsPath)) {
    scanMarkdownFiles(docsPath);
  }
}

/**
 * Validate current git branch name
 */
function validateBranchName() {
  try {
    const branchName = execSync('git rev-parse --abbrev-ref HEAD', { 
      encoding: 'utf-8', 
      cwd: projectRoot 
    }).trim();
    
    const patterns = generatePatterns(config);
    
    // Skip validation for main/master/develop branches
    if (['main', 'master', 'develop', 'HEAD'].includes(branchName)) {
      console.log(`ℹ️  Skipping branch validation for: ${branchName}`);
      return;
    }
    
    if (!patterns.branchPattern.test(branchName)) {
      addViolation(
        'BRANCH_ERROR', 
        `Branch name invalid: ${branchName}`,
        null,
        `Expected pattern: feat/${config.app_prefix ? config.app_prefix + '-' : ''}EPIC-xxx-US-xxx-description`
      );
    } else {
      console.log(`✅ Branch name valid: ${branchName}`);
    }
  } catch (error) {
    addViolation('GIT_ERROR', `Cannot get current branch: ${error.message}`);
  }
}

/**
 * Validate recent commit messages
 */
function validateCommitMessages(count = 5) {
  try {
    const commits = execSync(`git log --oneline -n ${count}`, {
      encoding: 'utf-8',
      cwd: projectRoot
    }).trim().split('\n');
    
    const patterns = generatePatterns(config);
    const validPatterns = [
      patterns.tddCommit,
      patterns.docCommit,
      patterns.assessmentCommit,
      patterns.featCommit,
      patterns.choreCommit
    ];
    
    for (const commit of commits) {
      const message = commit.substring(8); // Remove hash prefix
      
      const isValid = validPatterns.some(pattern => pattern.test(message));
      
      if (!isValid) {
        addViolation(
          'COMMIT_WARNING',
          `Commit message doesn't follow pattern: ${message}`,
          null,
          'Use: TDD-US-xxx-{PHASE}-{N}, DOC-PHASE-{N}-US-xxx, ASSESSMENT-PHASE-0, feat(EPIC-xxx/US-xxx), or chore(structure)'
        );
      }
    }
  } catch (error) {
    addViolation('GIT_WARNING', `Cannot validate commit messages: ${error.message}`);
  }
}

/**
 * Display validation results
 */
function displayResults() {
  console.log('\n📊 Naming Convention Validation Results\n');
  
  const errors = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');
  
  if (violations.length === 0) {
    console.log('✅ All naming conventions are correct!\n');
    return true;
  }
  
  // Display errors
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} ERROR(S) FOUND:\n`);
    
    for (const violation of errors) {
      console.log(`   ${violation.type}: ${violation.description}`);
      if (violation.file) {
        console.log(`   📁 File: ${path.relative(projectRoot, violation.file)}`);
      }
      if (violation.fix) {
        console.log(`   💡 Fix: ${violation.fix}`);
      }
      console.log('');
    }
  }
  
  // Display warnings
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING(S) FOUND:\n`);
    
    for (const violation of warnings) {
      console.log(`   ${violation.type}: ${violation.description}`);
      if (violation.file) {
        console.log(`   📁 File: ${path.relative(projectRoot, violation.file)}`);
      }
      if (violation.fix) {
        console.log(`   💡 Fix: ${violation.fix}`);
      }
      console.log('');
    }
  }
  
  // Summary
  console.log('📋 SUMMARY:');
  console.log(`   - Errors: ${errors.length}`);
  console.log(`   - Warnings: ${warnings.length}`);
  console.log(`   - Status: ${errors.length > 0 ? 'FAILED' : 'PASSED'}\n`);
  
  return errors.length === 0;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    branch: args.includes('--branch'),
    commits: args.includes('--commits')
  };
  
  console.log('🔍 Gen‑e2 Naming Convention Enforcer\n');
  
  // Load configuration
  console.log('📂 Loading naming configuration...');
  config = loadNamingConfig();
  
  console.log(`✅ Configuration loaded:`);
  console.log(`   - App Prefix: ${config.app_prefix || '(none)'}`);
  console.log(`   - Epic Prefix: ${config.epic_prefix}`);
  console.log(`   - Story Prefix: ${config.story_prefix}`);
  console.log(`   - ID Width: ${config.id_width} digits\n`);
  console.log('ℹ️  Note: Naming prefixes configured by orchestrator agent during epic/story creation\n');
  
  // Run validations
  console.log('🔄 Running validations...\n');
  
  console.log('1️⃣ Validating directory structure...');
  validateDirectoryStructure();
  
  console.log('2️⃣ Validating file references...');
  validateFileReferences();
  
  if (options.branch) {
    console.log('3️⃣ Validating branch name...');
    validateBranchName();
  }
  
  if (options.commits) {
    console.log('4️⃣ Validating commit messages...');
    validateCommitMessages();
  }
  
  // Display results
  const success = displayResults();
  
  if (!success) {
    console.log('❌ Naming convention validation failed. Fix errors before proceeding.');
    process.exit(1);
  }
  
  console.log('✅ All naming conventions validated successfully!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateDirectoryStructure, validateFileReferences, loadNamingConfig };