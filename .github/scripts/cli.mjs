#!/usr/bin/env node
/**
 * cli.mjs
 * Unified CLI for gene2 framework initialization and management
 * 
 * Usage:
 *   node cli.mjs init-framework --source ./project-template --target ~/workspace/gene2-core
 *   node cli.mjs init-client --client ./my-project --framework ~/workspace/gene2-core --name my-client
 *   node cli.mjs verify --client ./my-project
 *   node cli.mjs cleanup --client ./my-project
 */

import { parseArgs, logger, colors } from './utils.mjs';
import { initFramework } from './init-framework.mjs';
import { initClientRepo } from './init-client-repo.mjs';
import { verifyFramework } from './verify-framework.mjs';
import { cleanupOldFramework } from './cleanup-old-framework.mjs';

const args = parseArgs();
// Command is always the first positional argument (e.g., "init-framework").
// Flags (e.g., --source, --framework) should never be treated as commands.
const command = args.help ? null : (args._?.[0] ?? null);

const commands = {
  'init-framework': initFramework,
  'init-client': initClientRepo,
  'verify': verifyFramework,
  'cleanup': cleanupOldFramework,
};

function printHelp() {
  console.log(`
${colors.bright}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}
${colors.bright}AI-First Delivery Framework (gene2-core) CLI${colors.reset}
${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}

${colors.bright}COMMANDS:${colors.reset}

  ${colors.cyan}init-framework${colors.reset}
    Extract framework from project template to local directory
    
    Options:
      --source <path>    Source project template (default: .)
      --target <path>    Target framework directory (default: ../gene2-core)
      --dry-run          Preview changes without applying
    
    Example:
      node cli.mjs init-framework \\
        --source /path/to/project-template \\
        --target ~/workspace/gene2-core

  ${colors.cyan}init-client${colors.reset}
    Initialize client repository with framework symlink
    
    Options:
      --client <path>      Client repository path (required)
      --framework <path>   Framework directory (default: ../gene2-core)
      --name <name>        Client name (required)
      --dry-run            Preview changes without applying
      --backup             Backup existing .github before migration
    
    Example:
      node cli.mjs init-client \\
        --client /path/to/my-project \\
        --framework ~/workspace/gene2-core \\
        --name my-client

  ${colors.cyan}verify${colors.reset}
    Validate framework setup in client repository
    
    Options:
      --client <path>            Client repository path (required)
      --framework <path>         Framework directory (optional)
      --full-check               Perform comprehensive validation
      --generate-report <path>   Save report to JSON file
    
    Example:
      node cli.mjs verify --client /path/to/my-project --full-check

  ${colors.cyan}cleanup${colors.reset}
    Remove old .gene2-core directories and prepare for migration
    
    Options:
      --client <path>   Client repository path (required)
      --force           Don't prompt for confirmation
      --dry-run         Preview changes without applying
    
    Example:
      node cli.mjs cleanup --client /path/to/my-project --force

${colors.bright}GLOBAL OPTIONS:${colors.reset}

  --help               Show this help message
  --verbose            Show detailed progress
  --json               Output results as JSON

${colors.bright}EXAMPLES:${colors.reset}

  ${colors.green}# 1. Extract framework (one-time setup)${colors.reset}
  node cli.mjs init-framework \\
    --source ~/workspace/training-day-3/project-template \\
    --target ~/workspace/gene2-core

  ${colors.green}# 2. Verify framework extracted correctly${colors.reset}
  node cli.mjs verify --framework ~/workspace/gene2-core --full-check

  ${colors.green}# 3. Initialize first client (dry-run)${colors.reset}
  node cli.mjs init-client \\
    --client ~/workspace/edenred-merchant \\
    --framework ~/workspace/gene2-core \\
    --name edenred-merchant \\
    --dry-run

  ${colors.green}# 4. Initialize first client (execute)${colors.reset}
  node cli.mjs init-client \\
    --client ~/workspace/edenred-merchant \\
    --framework ~/workspace/gene2-core \\
    --name edenred-merchant

  ${colors.green}# 5. Verify client setup${colors.reset}
  node cli.mjs verify \\
    --client ~/workspace/edenred-merchant \\
    --full-check

  ${colors.green}# 6. Initialize other clients${colors.reset}
  node cli.mjs init-client --client ~/workspace/edenred-assessment --framework ~/workspace/gene2-core --name edenred-assessment
  node cli.mjs init-client --client ~/workspace/elis-evaluation --framework ~/workspace/gene2-core --name elis-evaluation

${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}
For detailed information, see .github/scripts/README.md
${colors.reset}
  `);
}

async function main() {
  try {
    if (args.help || !command) {
      printHelp();
      process.exit(0);
    }

    if (!commands[command]) {
      logger.error(`Unknown command: ${command}`);
      console.log(`\nUse ${colors.cyan}--help${colors.reset} for available commands\n`);
      process.exit(1);
    }

    const handler = commands[command];
    await handler(args);

  } catch (error) {
    logger.error(error.message);
    if (args.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
