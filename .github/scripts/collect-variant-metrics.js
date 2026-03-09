#!/usr/bin/env node

/**
 * Collects metrics for prompt variants from handoff files
 * Usage: npm run variants:collect-metrics
 */

const fs = require('fs');
const path = require('path');

function parseHandoffFiles() {
  const handoffsDir = '.github/handoffs';
  if (!fs.existsSync(handoffsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(handoffsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(handoffsDir, f), 'utf-8'));
        return { file: f, data };
      } catch (error) {
        console.warn(`Skipping invalid handoff file: ${f}`);
        return null;
      }
    })
    .filter(Boolean);
  
  return files;
}

function calculateMetrics(handoffs) {
  const metrics = {};
  
  handoffs.forEach(({ data }) => {
    const { from_agent, status, validation_checklist, timestamp } = data.handoff;
    
    if (!metrics[from_agent]) {
      metrics[from_agent] = {
        total_handoffs: 0,
        successful_handoffs: 0,
        escalations: 0,
        avg_handoff_time: [],
        quality_scores: []
      };
    }
    
    metrics[from_agent].total_handoffs++;
    
    // Success rate
    if (status === 'ready-for-next' || status.includes('complete')) {
      metrics[from_agent].successful_handoffs++;
    }
    
    // Escalation rate
    if (status === 'escalation-required' || data.handoff.escalation?.is_escalation) {
      metrics[from_agent].escalations++;
    }
    
    // Quality score (percentage of validation checklist items true)
    if (validation_checklist) {
      const checklist = Object.values(validation_checklist);
      const trueCount = checklist.filter(Boolean).length;
      const qualityScore = (trueCount / checklist.length) * 100;
      metrics[from_agent].quality_scores.push(qualityScore);
    }
  });
  
  // Calculate averages
  Object.keys(metrics).forEach(agent => {
    const m = metrics[agent];
    m.success_rate = m.total_handoffs > 0 ? (m.successful_handoffs / m.total_handoffs) * 100 : 0;
    m.escalation_rate = m.total_handoffs > 0 ? (m.escalations / m.total_handoffs) * 100 : 0;
    m.avg_quality_score = m.quality_scores.length > 0 
      ? m.quality_scores.reduce((a, b) => a + b, 0) / m.quality_scores.length 
      : 0;
    
    // Clean up arrays
    delete m.avg_handoff_time;
    delete m.quality_scores;
  });
  
  return metrics;
}

function updateVariantConfig(metrics) {
  const configPath = '.github/variants/variant-config.json';
  if (!fs.existsSync(configPath)) {
    console.warn('Variant config not found, creating new one');
    return;
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  Object.keys(metrics).forEach(agent => {
    if (config.variants[agent]) {
      const activeVariant = config.variants[agent].active_variant;
      if (config.variants[agent].available_variants[activeVariant]) {
        config.variants[agent].available_variants[activeVariant].metrics = {
          success_rate: Math.round(metrics[agent].success_rate),
          escalation_rate: Math.round(metrics[agent].escalation_rate),
          avg_quality_score: Math.round(metrics[agent].avg_quality_score),
          total_handoffs: metrics[agent].total_handoffs
        };
      }
    }
  });
  
  config.last_updated = new Date().toISOString();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Variant metrics updated');
}

// Run metrics collection
if (require.main === module) {
  const handoffs = parseHandoffFiles();
  
  if (handoffs.length === 0) {
    console.log('No handoff data found');
    process.exit(0);
  }
  
  const metrics = calculateMetrics(handoffs);
  
  console.log('📊 Agent Performance Metrics:');
  Object.entries(metrics).forEach(([agent, m]) => {
    console.log(`\n${agent}:`);
    console.log(`  Success Rate: ${m.success_rate.toFixed(1)}%`);
    console.log(`  Escalation Rate: ${m.escalation_rate.toFixed(1)}%`);
    console.log(`  Avg Quality Score: ${m.avg_quality_score.toFixed(1)}%`);
    console.log(`  Total Handoffs: ${m.total_handoffs}`);
  });
  
  updateVariantConfig(metrics);
}

module.exports = { calculateMetrics, updateVariantConfig };