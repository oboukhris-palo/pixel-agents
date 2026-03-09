#!/usr/bin/env node

/**
 * Variant Promotion Script
 * Promotes tested variant to baseline after validation
 * Supports rollback to previous versions
 * 
 * Usage:
 *   node .github/scripts/promote-variant.js --agent=orchestrator --variant=v2-clarity-focus
 *   node .github/scripts/promote-variant.js --agent=dev-lead --variant=v1-baseline --rollback
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      parsed[key] = value || true;
    }
  });

  return parsed;
}

// Helper: Read YAML (simplified)
function readYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Simple YAML parser for our use case
  const lines = content.split('\n');
  const obj = {};
  let currentKey = null;

  lines.forEach(line => {
    line = line.trimStart();
    if (line.startsWith('#') || !line) return;

    if (!line.startsWith(' ') && line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      currentKey = key;
      if (value) {
        obj[currentKey] = value;
      } else {
        obj[currentKey] = {};
      }
    }
  });

  return obj;
}

// Helper: Write YAML
function writeYaml(filePath, obj, preserveComments = false) {
  let content = '';
  
  if (preserveComments) {
    // Preserve header comment
    const original = fs.readFileSync(filePath, 'utf-8');
    const commentMatch = original.match(/^(#.*\n)*/);
    if (commentMatch) {
      content = commentMatch[0] + '\n';
    }
  }

  content += fs.readFileSync(filePath, 'utf-8')
    .replace(
      new RegExp(`(${Object.keys(obj)[0]}:)([\\s\\S]*?)(?=\\n[a-z-]+:|$)`),
      (match) => {
        let replacement = '';
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object') {
            replacement += `${key}:\n`;
            for (const [k, v] of Object.entries(value)) {
              replacement += `  ${k}: ${v}\n`;
            }
          } else {
            replacement += `${key}: ${value}\n`;
          }
        }
        return replacement;
      }
    );

  fs.writeFileSync(filePath, content);
}

// Main promotion function
function promoteVariant(agent, variant, rollback = false) {
  console.log('\n' + '='.repeat(70));
  console.log('📦 VARIANT PROMOTION UTILITY');
  console.log('='.repeat(70) + '\n');

  const variantDir = path.join(__dirname, '../prompts/variants');
  const agentDir = path.join(variantDir, agent);
  const configFile = path.join(variantDir, 'variant-config.yml');
  const metricsFile = path.join(variantDir, 'variant-metrics.yml');

  // Validation
  if (!fs.existsSync(agentDir)) {
    console.error(`❌ Agent directory not found: ${agentDir}`);
    process.exit(1);
  }

  const baselineFile = path.join(agentDir, 'v1-baseline.md');
  const variantFile = path.join(agentDir, `${variant}.md`);

  if (rollback) {
    // ROLLBACK MODE
    console.log(`🔄 ROLLBACK MODE: ${agent} → v1-baseline\n`);

    if (!fs.existsSync(baselineFile)) {
      console.error(`❌ No baseline to rollback to`);
      process.exit(1);
    }

    // Find and restore backup
    const backups = fs.readdirSync(agentDir)
      .filter(f => f.startsWith('v1-baseline.') && f.endsWith('.backup.md'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.error(`❌ No backups found for rollback`);
      process.exit(1);
    }

    const latestBackup = backups[0];
    const backupPath = path.join(agentDir, latestBackup);

    console.log(`Restoring from backup: ${latestBackup}`);
    execSync(`cp "${backupPath}" "${baselineFile}"`);

    console.log(`✓ Rollback complete`);
    console.log(`✓ Backup timestamp: ${latestBackup.match(/\d{4}-\d{2}-\d{2}T[\d:]+/)[0]}`);

    // Update config
    const config = fs.readFileSync(configFile, 'utf-8');
    const updated = config.replace(
      new RegExp(`(${agent}:[\\s\\S]*?)(active: )([^\\n]+)`),
      `$1$2v1-baseline`
    );
    fs.writeFileSync(configFile, updated);

    console.log(`✓ Config updated\n`);
    process.exit(0);
  }

  // PROMOTION MODE
  if (!fs.existsSync(variantFile)) {
    console.error(`❌ Variant file not found: ${variantFile}`);
    console.error(`   Expected: .github/prompts/variants/${agent}/${variant}.md`);
    process.exit(1);
  }

  console.log(`🚀 PROMOTING: ${agent} → ${variant}\n`);

  // Get current metrics
  const metricsContent = fs.readFileSync(metricsFile, 'utf-8');
  const currentMetricsMatch = metricsContent.match(
    new RegExp(`v1-baseline-${agent}:[\\s\\S]*?sample_size: (\\d+)`)
  );
  const newMetricsMatch = metricsContent.match(
    new RegExp(`${variant}-${agent}:[\\s\\S]*?sample_size: (\\d+)`)
  );

  const currentMetrics = {
    success_rate: parseFloat(metricsContent.match(new RegExp(`v1-baseline-${agent}:[\\s\\S]*?handoff_success_rate: ([\\d.]+)`))?.[1] || '0'),
    sample_size: parseInt(currentMetricsMatch?.[1] || '0')
  };

  const newMetrics = {
    success_rate: parseFloat(metricsContent.match(new RegExp(`${variant}-${agent}:[\\s\\S]*?handoff_success_rate: ([\\d.]+)`))?.[1] || '0'),
    sample_size: parseInt(newMetricsMatch?.[1] || '0')
  };

  if (newMetrics.sample_size < 10) {
    console.warn(`⚠️  WARNING: New variant only tested on ${newMetrics.sample_size} samples (recommend 10+)`);
  }

  const improvement = (
    (newMetrics.success_rate - currentMetrics.success_rate) * 100
  ).toFixed(1);

  console.log(`Current baseline success rate: ${(currentMetrics.success_rate * 100).toFixed(1)}% (${currentMetrics.sample_size} samples)`);
  console.log(`New variant success rate:      ${(newMetrics.success_rate * 100).toFixed(1)}% (${newMetrics.sample_size} samples)`);
  console.log(`Improvement:                    ${improvement > 0 ? '+' : ''}${improvement}%\n`);

  if (improvement < 0) {
    console.error(`❌ Variant shows REGRESSION of ${Math.abs(improvement)}%. Promotion blocked.`);
    console.error(`   Either improve the variant or use --force to override.\n`);
    process.exit(1);
  }

  if (improvement === '0.0') {
    console.warn(`⚠️  No improvement detected. Continue? (y/n) `);
  }

  // Backup current baseline
  console.log(`Creating backup of current baseline...`);
  const timestamp = new Date().toISOString();
  const backupFile = path.join(agentDir, `v1-baseline.${timestamp}.backup.md`);
  execSync(`cp "${baselineFile}" "${backupFile}"`);
  console.log(`✓ Backup: ${path.basename(backupFile)}`);

  // Copy variant to baseline
  console.log(`\nPromoting variant to baseline...`);
  execSync(`cp "${variantFile}" "${baselineFile}"`);
  console.log(`✓ ${agent} baseline updated with ${variant}`);

  // Update config
  console.log(`\nUpdating configuration...`);
  const configContent = fs.readFileSync(configFile, 'utf-8');
  const updatedConfig = configContent.replace(
    new RegExp(`(${agent}:[\\s\\S]*?)(active: )([^\\n]+)(.*?)(last_updated: )"[^"]+"`, 's'),
    (match) => {
      return match
        .replace(/active: [^\n]+/, `active: ${variant}`)
        .replace(/last_updated: "[^"]+"/, `last_updated: "${timestamp.split('T')[0]}"`);
    }
  );
  fs.writeFileSync(configFile, updatedConfig);
  console.log(`✓ Config updated`);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✓ PROMOTION COMPLETE`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`Summary:`);
  console.log(`  Agent: ${agent}`);
  console.log(`  New Baseline: ${variant}`);
  console.log(`  Improvement: ${improvement > 0 ? '+' : ''}${improvement}%`);
  console.log(`  Backup: ${path.basename(backupFile)}`);
  console.log(`\nRollback available with:`);
  console.log(`  npm run variant:promote -- --agent=${agent} --rollback\n`);

  process.exit(0);
}

// CLI Entry
function main() {
  const args = parseArgs();

  if (!args.agent) {
    console.error('❌ Missing required argument: --agent=<agent-name>');
    console.error(`\nUsage: npm run variant:promote -- --agent=orchestrator --variant=v2-clarity-focus`);
    process.exit(1);
  }

  if (args.rollback) {
    promoteVariant(args.agent, null, true);
  } else if (!args.variant) {
    console.error('❌ Missing required argument: --variant=<variant-name>');
    console.error(`\nUsage: npm run variant:promote -- --agent=${args.agent} --variant=v2-variant-name`);
    process.exit(1);
  } else {
    promoteVariant(args.agent, args.variant, false);
  }
}

main();
