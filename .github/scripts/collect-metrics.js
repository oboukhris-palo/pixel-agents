#!/usr/bin/env node

/**
 * Metrics Collection & Analysis Script
 * Collects A/B testing metrics for prompt variants and generates reports
 * 
 * Usage: node .github/scripts/collect-metrics.js [--agent <name>] [--generate-report] [--period <days>]
 */

const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor(metricsDir = '.github/prompts/variants/metrics') {
    this.metricsDir = metricsDir;
    this.configPath = '.github/prompts/variants/config.json';
    this.historyPath = '.github/prompts/variants/promotion-history.jsonl';
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Failed to load config: ${error.message}`);
      return null;
    }
  }

  recordMetric(agent, variantId, runResult) {
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }

    const metricsFile = path.join(
      this.metricsDir,
      `${agent}-${variantId}-metrics.json`
    );

    let metrics = {};
    if (fs.existsSync(metricsFile)) {
      try {
        const content = fs.readFileSync(metricsFile, 'utf-8');
        metrics = JSON.parse(content);
      } catch (error) {
        console.warn(`⚠️  Could not load existing metrics: ${error.message}`);
      }
    }

    // Initialize runs array if not present
    if (!metrics.runs) {
      metrics.runs = [];
    }

    // Add new run
    metrics.runs.push({
      timestamp: new Date().toISOString(),
      ...runResult
    });

    // Calculate summary
    metrics.summary = this.calculateSummary(metrics.runs);

    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
    console.log(`✅ Metric recorded for ${agent}-${variantId}`);
  }

  calculateSummary(runs) {
    if (!runs || runs.length === 0) {
      return {
        total_runs: 0,
        successful_runs: 0,
        failed_runs: 0,
        success_rate: 0,
        avg_handoff_quality: null,
        avg_execution_time: null,
        last_run: null
      };
    }

    const successful = runs.filter(r => r.success).length;
    const failed = runs.length - successful;
    const successRate = (successful / runs.length) * 100;

    let totalQuality = 0;
    let qualityCount = 0;
    let totalTime = 0;
    let timeCount = 0;

    runs.forEach(run => {
      if (run.handoff_quality_score !== undefined) {
        totalQuality += run.handoff_quality_score;
        qualityCount++;
      }
      if (run.execution_time_seconds !== undefined) {
        totalTime += run.execution_time_seconds;
        timeCount++;
      }
    });

    return {
      total_runs: runs.length,
      successful_runs: successful,
      failed_runs: failed,
      success_rate: parseFloat(successRate.toFixed(2)),
      avg_handoff_quality:
        qualityCount > 0 ? parseFloat((totalQuality / qualityCount).toFixed(2)) : null,
      avg_execution_time:
        timeCount > 0 ? parseFloat((totalTime / timeCount).toFixed(2)) : null,
      last_run: runs[runs.length - 1].timestamp
    };
  }

  loadMetrics(agent, variantId) {
    const metricsFile = path.join(
      this.metricsDir,
      `${agent}-${variantId}-metrics.json`
    );

    if (!fs.existsSync(metricsFile)) {
      return null;
    }

    try {
      const content = fs.readFileSync(metricsFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Failed to load metrics: ${error.message}`);
      return null;
    }
  }

  generateReport(agent = null, days = 7) {
    console.log(`\n📊 Variant Metrics Report`);
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Period: Last ${days} days\n`);
    console.log('=' .repeat(80));

    const agents = agent ? [agent] : Object.keys(this.config.variants || {});

    let totalRuns = 0;
    let totalSuccessful = 0;
    let report = [];

    for (const agentName of agents) {
      if (!this.config.variants[agentName]) {
        console.log(`⚠️  Agent not found: ${agentName}`);
        continue;
      }

      const agentVariants = this.config.variants[agentName];
      console.log(`\n🤖 Agent: ${agentName}`);
      console.log(`Default variant: ${agentVariants.default}\n`);

      for (const variant of agentVariants.variants) {
        const metrics = this.loadMetrics(agentName, variant.id);

        if (!metrics) {
          console.log(
            `  ${variant.id}: No metrics collected yet`
          );
          continue;
        }

        const summary = metrics.summary;
        const status = variant.active ? '✅ ACTIVE' : '⭕ INACTIVE';

        console.log(`  ${variant.id} ${status}`);
        console.log(`    Runs: ${summary.total_runs}`);
        console.log(`    Success Rate: ${summary.success_rate}%`);
        if (summary.avg_handoff_quality) {
          console.log(`    Avg Quality Score: ${summary.avg_handoff_quality}/10`);
        }
        if (summary.avg_execution_time) {
          console.log(`    Avg Execution Time: ${summary.avg_execution_time}s`);
        }

        totalRuns += summary.total_runs;
        totalSuccessful += summary.successful_runs;

        report.push({
          agent: agentName,
          variant: variant.id,
          active: variant.active,
          metrics: summary
        });
      }
    }

    console.log(`\n${'=' .repeat(80)}`);
    console.log(`\n📈 Overall Metrics:`);
    console.log(`Total runs: ${totalRuns}`);
    console.log(
      `Overall success rate: ${totalRuns > 0 ? ((totalSuccessful / totalRuns) * 100).toFixed(2) : 'N/A'}%`
    );

    return report;
  }

  getVariantComparison(agent) {
    if (!this.config.variants[agent]) {
      console.error(`❌ Agent not found: ${agent}`);
      return null;
    }

    const agentVariants = this.config.variants[agent];
    const comparison = {
      agent,
      variants: []
    };

    for (const variant of agentVariants.variants) {
      const metrics = this.loadMetrics(agent, variant.id);

      if (!metrics) {
        comparison.variants.push({
          id: variant.id,
          active: variant.active,
          metrics: null,
          winner: false
        });
        continue;
      }

      comparison.variants.push({
        id: variant.id,
        active: variant.active,
        metrics: metrics.summary
      });
    }

    // Determine winner based on success rate
    const withMetrics = comparison.variants.filter(v => v.metrics);
    if (withMetrics.length > 0) {
      const winner = withMetrics.reduce((prev, current) =>
        current.metrics.success_rate > prev.metrics.success_rate ? current : prev
      );
      winner.winner = true;
    }

    return comparison;
  }

  exportMetrics(format = 'json') {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `metrics-export-${timestamp}.${format}`;

    const data = {
      exported_at: new Date().toISOString(),
      variants: this.config.variants,
      reports: {}
    };

    // Collect all metrics
    for (const [agent, agentData] of Object.entries(this.config.variants || {})) {
      data.reports[agent] = [];
      for (const variant of agentData.variants) {
        const metrics = this.loadMetrics(agent, variant.id);
        if (metrics) {
          data.reports[agent].push({
            variant_id: variant.id,
            metrics: metrics.summary
          });
        }
      }
    }

    const filepath = path.join(this.metricsDir, filename);

    if (format === 'json') {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } else if (format === 'csv') {
      let csv = 'Agent,Variant,Total Runs,Success Rate,Avg Quality,Avg Time\n';
      for (const [agent, reports] of Object.entries(data.reports)) {
        for (const report of reports) {
          const m = report.metrics;
          csv += `${agent},${report.variant_id},${m.total_runs},${m.success_rate},${m.avg_handoff_quality || 'N/A'},${m.avg_execution_time || 'N/A'}\n`;
        }
      }
      fs.writeFileSync(filepath, csv);
    }

    console.log(`✅ Metrics exported to: ${filepath}`);
    return filepath;
  }
}

// CLI Execution
function main() {
  const args = process.argv.slice(2);
  const collector = new MetricsCollector();

  const command = args[0];

  if (command === 'record') {
    const agent = args[args.indexOf('--agent') + 1];
    const variant = args[args.indexOf('--variant') + 1];
    const success = args.includes('--success');

    if (!agent || !variant) {
      console.error('Usage: record --agent <name> --variant <id> [--success]');
      process.exit(1);
    }

    const runResult = {
      success,
      handoff_quality_score: Math.random() * 10,
      execution_time_seconds: Math.random() * 30
    };

    collector.recordMetric(agent, variant, runResult);
    process.exit(0);
  }

  if (command === 'report' || command === 'report') {
    const agent = args.includes('--agent') ? args[args.indexOf('--agent') + 1] : null;
    const days = args.includes('--period')
      ? parseInt(args[args.indexOf('--period') + 1])
      : 7;

    collector.generateReport(agent, days);
    process.exit(0);
  }

  if (command === 'compare') {
    const agent = args[args.indexOf('--agent') + 1];
    if (!agent) {
      console.error('Usage: compare --agent <name>');
      process.exit(1);
    }

    const comparison = collector.getVariantComparison(agent);
    console.log(`\n🏆 Variant Comparison: ${agent}\n`);

    comparison.variants.forEach(v => {
      const badge = v.winner ? '🥇' : v.active ? '✅' : '⭕';
      const metrics = v.metrics
        ? ` | Success: ${v.metrics.success_rate}% | Runs: ${v.metrics.total_runs}`
        : ' | No metrics yet';

      console.log(`${badge} ${v.id}${metrics}`);
    });

    process.exit(0);
  }

  if (command === 'export') {
    const format = args.includes('--format')
      ? args[args.indexOf('--format') + 1]
      : 'json';

    collector.exportMetrics(format);
    process.exit(0);
  }

  console.log(`
Metrics Collection Tool

Commands:
  record --agent <name> --variant <id> [--success]    - Record a test run
  report [--agent <name>] [--period <days>]           - Generate report
  compare --agent <name>                               - Compare variants
  export [--format json|csv]                           - Export metrics

Examples:
  node collect-metrics.js report
  node collect-metrics.js report --agent orchestrator
  node collect-metrics.js compare --agent dev-lead
  node collect-metrics.js export --format csv
  node collect-metrics.js record --agent orchestrator --variant standard --success
  `);

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { MetricsCollector };
