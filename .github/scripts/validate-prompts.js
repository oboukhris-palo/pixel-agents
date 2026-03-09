#!/usr/bin/env node

/**
 * Validates all system prompts against quality standards
 * 
 * Checks:
 * - No [TODO], [PLACEHOLDER], [FILL IN] text
 * - Minimum file size (400 lines recommended)
 * - Required sections present
 * - Valid markdown formatting
 * 
 * Usage: npm run prompt:validate
 * Exit Code: 0 = all valid, 1 = failures found
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const PROMPT_DIR = '.github/prompts/agent-system-prompts';
const REQUIRED_AGENTS = [
  'orchestrator',
  'pm',
  'po',
  'ba',
  'ux',
  'architect',
  'dev-lead',
  'dev-tdd-red',
  'dev-tdd-green',
  'dev-tdd-refactor',
  'ai-engineering',
  'base.template'
];

const REQUIRED_SECTIONS = [
  '## 🎯 Agent Identity',
  '## 🔍 Mode & Scope',
  '## 💬 Communication Style',
  '## 🏗️ Critical Constraints',
  '## 📋 Step-by-Step Process',
  '## ✅ Quality Checkpoints',
  '## 🆘 Failure Recovery'
];

const FORBIDDEN_PATTERNS = [
  /\[TODO\]/gi,
  /\[PLACEHOLDER\]/gi,
  /\[FILL IN\]/gi,
  /FILL_IN/gi,
  /YOUR_NAME_HERE/gi,
  /\[your.*\]/gi
];

class PromptValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: [],
      errors: []
    };
  }

  /**
   * Main validation entry point
   */
  validate() {
    console.log(`\n${colors.blue}🔍 Validating System Prompts${colors.reset}\n`);
    
    if (!fs.existsSync(PROMPT_DIR)) {
      console.log(`${colors.red}❌ Prompt directory not found: ${PROMPT_DIR}${colors.reset}\n`);
      return false;
    }

    // Check all required agents
    for (const agent of REQUIRED_AGENTS) {
      const filePath = path.join(PROMPT_DIR, `${agent}.system.md`);
      const fileName = agent === 'base.template' ? 'base.template.md' : `${agent}.system.md`;
      const fullPath = path.join(PROMPT_DIR, fileName);

      this.results.total++;

      if (!fs.existsSync(fullPath)) {
        this.results.failed++;
        this.results.errors.push(`❌ Missing file: ${fullPath}`);
        console.log(`${colors.red}❌ ${agent}${colors.reset}`);
        console.log(`   Missing file: ${fullPath}\n`);
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const isValid = this.validatePromptFile(fullPath, content, agent);

      if (isValid) {
        this.results.passed++;
        console.log(`${colors.green}✓ ${agent}${colors.reset}`);
      } else {
        this.results.failed++;
        console.log(`${colors.red}✗ ${agent}${colors.reset}`);
      }
    }

    // Summary
    console.log(`\n${colors.blue}📊 Validation Summary${colors.reset}`);
    console.log(`Total: ${this.results.total}`);
    console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
    
    if (this.results.failed > 0) {
      console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
    }

    // Print all errors
    if (this.results.errors.length > 0) {
      console.log(`\n${colors.red}Errors:${colors.reset}`);
      this.results.errors.forEach(err => {
        console.log(`  ${err}`);
      });
    }

    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
      this.results.warnings.forEach(warn => {
        console.log(`  ${warn}`);
      });
    }

    console.log();
    return this.results.failed === 0;
  }

  /**
   * Validate individual prompt file
   */
  validatePromptFile(filePath, content, agentName) {
    let isValid = true;

    // Check for forbidden patterns
    for (const pattern of FORBIDDEN_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        isValid = false;
        this.results.errors.push(
          `  File: ${filePath}\n    Contains forbidden text: ${matches[0]}`
        );
        console.log(`   ${colors.red}❌ Contains forbidden pattern: ${matches[0]}${colors.reset}`);
      }
    }

    // Check for required sections (except base template)
    if (agentName !== 'base.template') {
      for (const section of REQUIRED_SECTIONS) {
        if (!content.includes(section)) {
          isValid = false;
          this.results.errors.push(
            `  File: ${filePath}\n    Missing section: ${section}`
          );
          console.log(`   ${colors.red}❌ Missing section: ${section}${colors.reset}`);
        }
      }
    }

    // Check line count (rough validation that content exists)
    const lines = content.split('\n').length;
    if (lines < 50) {
      this.results.warnings.push(
        `File: ${filePath} (${lines} lines) - Less than 50 lines, may be incomplete`
      );
      console.log(`   ${colors.yellow}⚠ File seems short (${lines} lines)${colors.reset}`);
    }

    // Check for markdown formatting
    const headingCount = (content.match(/^##\s+/gm) || []).length;
    if (headingCount < 3) {
      this.results.warnings.push(
        `File: ${filePath} - Only ${headingCount} markdown headings (expected 6+)`
      );
      console.log(`   ${colors.yellow}⚠ Low heading count (${headingCount})${colors.reset}`);
    }

    return isValid;
  }
}

// Run validation
const validator = new PromptValidator();
const isValid = validator.validate();

// Exit with appropriate code
process.exit(isValid ? 0 : 1);
