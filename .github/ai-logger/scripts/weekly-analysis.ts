/**
 * Weekly Analysis Orchestrator
 * 
 * Coordinates the full analysis pipeline:
 * 1. Load activity logs from past week
 * 2. Run pattern detection
 * 3. Run prompt optimization on detected patterns
 * 4. Generate automation opportunities
 * 5. Compile comprehensive markdown report
 * 6. Save analyzed data for future reference
 */

import { PatternAnalyzer } from '../pattern-analyzer';
import { PromptOptimizer } from '../prompt-optimizer';
import { ActivityInterceptor } from '../activity-interceptor';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface WeeklyReport {
  metadata: {
    report_date: string;
    week_number: number;
    year: number;
    lookback_days: number;
  };
  
  usage_summary: {
    total_interactions: number;
    total_tokens: number;
    total_cost_usd: number;
    avg_response_time_ms: number;
    error_rate: number;
    top_agents: Array<{ agent: string; count: number; tokens: number }>;
  };
  
  detected_patterns: any[];
  prompt_optimizations: any[];
  inefficiencies: any[];
  automation_opportunities: any[];
  
  cost_analysis: {
    breakdown_by_agent: Record<string, { tokens: number; cost_usd: number }>;
    high_cost_operations: Array<{ description: string; cost_usd: number }>;
    optimization_potential_usd: number;
  };
}

// =============================================================================
// WEEKLY ANALYSIS ORCHESTRATOR
// =============================================================================

export class WeeklyAnalysisOrchestrator {
  private patternAnalyzer: PatternAnalyzer;
  private promptOptimizer: PromptOptimizer;
  
  constructor() {
    this.patternAnalyzer = new PatternAnalyzer({
      lookbackDays: 7,
      minOccurrences: 3,
      similarityThreshold: 0.75,
    });
    
    this.promptOptimizer = new PromptOptimizer({
      provider: 'anthropic',
      model: 'claude-sonnet-4.5',
    });
  }
  
  // ---------------------------------------------------------------------------
  // MAIN ORCHESTRATION
  // ---------------------------------------------------------------------------
  
  public async run(): Promise<void> {
    console.log('\n=== AI Activity Weekly Analysis ===\n');
    console.log('Starting weekly analysis pipeline...\n');
    
    try {
      // Step 1: Run pattern analysis
      console.log('[1/5] Running pattern detection...');
      const analysisResult = await this.patternAnalyzer.analyze();
      
      // Step 2: Optimize top patterns
      console.log('[2/5] Optimizing detected prompt patterns...');
      const optimizations = await this.optimizePatterns(analysisResult.patterns);
      
      // Step 3: Compile report data
      console.log('[3/5] Compiling weekly report...');
      const report = this.compileReport(analysisResult, optimizations);
      
      // Step 4: Save analyzed data
      console.log('[4/5] Saving analysis results...');
      await this.saveAnalysisResults(report, analysisResult);
      
      // Step 5: Generate and save markdown report
      console.log('[5/5] Generating markdown report...');
      const markdownReport = this.generateMarkdownReport(report);
      await this.saveMarkdownReport(markdownReport);
      
      console.log('\n✅ Weekly analysis complete!');
      console.log(`📊 Report saved to: ${this.getReportPath()}`);
      console.log(`📈 Found ${analysisResult.patterns.length} patterns`);
      console.log(`💰 Potential savings: $${report.cost_analysis.optimization_potential_usd.toFixed(2)}/week\n`);
      
    } catch (error) {
      console.error('❌ Error during weekly analysis:', error);
      throw error;
    }
  }
  
  // ---------------------------------------------------------------------------
  // PROMPT OPTIMIZATION
  // ---------------------------------------------------------------------------
  
  private async optimizePatterns(patterns: any[]): Promise<any[]> {
    const optimizations = [];
    
    // Optimize top 5 most frequent patterns
    const topPatterns = patterns
      .filter(p => p.type === 'prompt-sequence' && p.prompt_template)
      .slice(0, 5);
    
    for (const pattern of topPatterns) {
      try {
        const optimization = await this.promptOptimizer.optimize({
          original_prompt: pattern.prompt_template,
          focus_areas: ['clarity', 'token_efficiency', 'specificity'],
        });
        
        optimizations.push({
          pattern_id: pattern.id,
          pattern_description: pattern.description,
          occurrences: pattern.occurrences,
          optimization,
        });
      } catch (error) {
        console.warn(`Failed to optimize pattern ${pattern.id}:`, error);
      }
    }
    
    return optimizations;
  }
  
  // ---------------------------------------------------------------------------
  // REPORT COMPILATION
  // ---------------------------------------------------------------------------
  
  private compileReport(analysisResult: any, optimizations: any[]): WeeklyReport {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    
    // Calculate cost breakdown by agent
    const logs = ActivityInterceptor.readLogs(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      now
    );
    
    const costByAgent: Record<string, { tokens: number; cost_usd: number }> = {};
    
    for (const log of logs) {
      const agent = log.agent?.name || 'unknown';
      if (!costByAgent[agent]) {
        costByAgent[agent] = { tokens: 0, cost_usd: 0 };
      }
      costByAgent[agent].tokens += log.tokens.total;
      costByAgent[agent].cost_usd += log.tokens.cost_usd;
    }
    
    // Identify high-cost operations
    const highCostOps = logs
      .filter(l => l.tokens.cost_usd > 0.05)
      .sort((a, b) => b.tokens.cost_usd - a.tokens.cost_usd)
      .slice(0, 10)
      .map(l => ({
        description: `${l.agent?.name}: ${l.user_prompt?.text.substring(0, 60)}...`,
        cost_usd: l.tokens.cost_usd,
      }));
    
    // Calculate optimization potential
    const currentCost = analysisResult.summary.total_cost_usd;
    const potentialSavings = analysisResult.inefficiencies.reduce(
      (sum: number, ineff: any) => sum + ineff.estimated_savings.cost_usd,
      0
    );
    
    return {
      metadata: {
        report_date: now.toISOString(),
        week_number: weekNumber,
        year: now.getFullYear(),
        lookback_days: 7,
      },
      
      usage_summary: {
        total_interactions: analysisResult.total_interactions,
        total_tokens: analysisResult.summary.top_agents_used.reduce(
          (sum: number, a: any) => sum + a.total_tokens,
          0
        ),
        total_cost_usd: analysisResult.summary.total_cost_usd,
        avg_response_time_ms: analysisResult.summary.avg_response_time_ms,
        error_rate: analysisResult.summary.error_rate,
        top_agents: analysisResult.summary.top_agents_used,
      },
      
      detected_patterns: analysisResult.patterns,
      prompt_optimizations: optimizations,
      inefficiencies: analysisResult.inefficiencies,
      automation_opportunities: analysisResult.automation_opportunities,
      
      cost_analysis: {
        breakdown_by_agent: costByAgent,
        high_cost_operations: highCostOps,
        optimization_potential_usd: potentialSavings,
      },
    };
  }
  
  // ---------------------------------------------------------------------------
  // MARKDOWN REPORT GENERATION
  // ---------------------------------------------------------------------------
  
  private generateMarkdownReport(report: WeeklyReport): string {
    const { metadata, usage_summary, detected_patterns, prompt_optimizations, inefficiencies, automation_opportunities, cost_analysis } = report;
    
    let markdown = '';
    
    // Header
    markdown += `# 📊 AI Activity Weekly Report\n\n`;
    markdown += `**Week ${metadata.week_number}, ${metadata.year}** | Generated: ${new Date(metadata.report_date).toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;
    
    // Executive Summary
    markdown += `## 🎯 Executive Summary\n\n`;
    markdown += `- **Total Interactions**: ${usage_summary.total_interactions}\n`;
    markdown += `- **Total Tokens**: ${usage_summary.total_tokens.toLocaleString()}\n`;
    markdown += `- **Total Cost**: $${usage_summary.total_cost_usd.toFixed(2)}\n`;
    markdown += `- **Avg Response Time**: ${usage_summary.avg_response_time_ms}ms\n`;
    markdown += `- **Error Rate**: ${(usage_summary.error_rate * 100).toFixed(1)}%\n`;
    markdown += `- **💰 Optimization Potential**: $${cost_analysis.optimization_potential_usd.toFixed(2)}/week\n\n`;
    
    // Usage Summary
    markdown += `## 📈 Usage Summary\n\n`;
    markdown += `### Top Agents Used\n\n`;
    markdown += `| Agent | Invocations | Tokens Used | Est. Cost |\n`;
    markdown += `|-------|------------|-------------|----------|\n`;
    
    for (const agent of usage_summary.top_agents) {
      const cost = (cost_analysis.breakdown_by_agent[agent.agent]?.cost_usd || 0).toFixed(2);
      markdown += `| ${agent.agent} | ${agent.count} | ${agent.total_tokens.toLocaleString()} | $${cost} |\n`;
    }
    markdown += `\n`;
    
    // Detected Patterns
    markdown += `## 🔁 Detected Patterns (${detected_patterns.length} total)\n\n`;
    
    if (detected_patterns.length > 0) {
      const top5 = detected_patterns.slice(0, 5);
      
      for (let i = 0; i < top5.length; i++) {
        const pattern = top5[i];
        markdown += `### Pattern #${i + 1}: ${pattern.description}\n\n`;
        markdown += `- **Type**: ${pattern.type}\n`;
        markdown += `- **Occurrences**: ${pattern.occurrences}\n`;
        markdown += `- **Confidence**: ${(pattern.confidence * 100).toFixed(0)}%\n`;
        markdown += `- **Total Tokens**: ${pattern.total_tokens_used.toLocaleString()}\n`;
        markdown += `- **Total Cost**: $${pattern.total_cost_usd.toFixed(2)}\n`;
        
        if (pattern.prompt_template) {
          markdown += `- **Example Prompt**: "${pattern.prompt_template}"\n`;
        }
        
        markdown += `\n`;
      }
    } else {
      markdown += `No significant patterns detected this week.\n\n`;
    }
    
    // Prompt Optimizations
    markdown += `## ✨ Prompt Optimization Suggestions\n\n`;
    
    if (prompt_optimizations.length > 0) {
      for (let i = 0; i < prompt_optimizations.length; i++) {
        const opt = prompt_optimizations[i];
        const balanced = opt.optimization.optimized_variants.find((v: any) => v.id === 'balanced');
        
        markdown += `### Optimization #${i + 1}: ${opt.pattern_description}\n\n`;
        markdown += `**Frequency**: ${opt.occurrences} occurrences\n\n`;
        
        markdown += `#### Before (Original)\n\`\`\`\n${opt.optimization.original.prompt}\n\`\`\`\n\n`;
        markdown += `**Issues**: ${opt.optimization.original.issues.length}\n`;
        for (const issue of opt.optimization.original.issues) {
          markdown += `- [${issue.severity}] ${issue.description}\n`;
        }
        markdown += `\n`;
        
        if (balanced) {
          markdown += `#### After (Balanced Optimization) ⭐\n\`\`\`\n${balanced.prompt}\n\`\`\`\n\n`;
          markdown += `**Improvements**:\n`;
          markdown += `- Token Reduction: ${balanced.token_reduction_percent.toFixed(1)}%\n`;
          markdown += `- Clarity Score: ${balanced.improvements.clarity_score}/10\n`;
          markdown += `- Specificity Score: ${balanced.improvements.specificity_score}/10\n`;
          markdown += `- Structure Score: ${balanced.improvements.structure_score}/10\n\n`;
          markdown += `**Changes Made**:\n`;
          for (const change of balanced.changes_made) {
            markdown += `- ${change}\n`;
          }
          markdown += `\n`;
        }
      }
    } else {
      markdown += `No optimization suggestions this week.\n\n`;
    }
    
    // Inefficiencies
    markdown += `## ⚠️ Identified Inefficiencies (${inefficiencies.length} total)\n\n`;
    
    if (inefficiencies.length > 0) {
      const top3 = inefficiencies.slice(0, 3);
      
      for (let i = 0; i < top3.length; i++) {
        const ineff = top3[i];
        markdown += `### ${i + 1}. ${ineff.description}\n\n`;
        markdown += `- **Type**: ${ineff.type}\n`;
        markdown += `- **Severity**: ${ineff.severity}\n`;
        markdown += `- **Wasted Tokens**: ${ineff.wasted_tokens.toLocaleString()}\n`;
        markdown += `- **Wasted Cost**: $${ineff.wasted_cost_usd.toFixed(2)}\n`;
        markdown += `- **Affected Interactions**: ${ineff.affected_interactions}\n\n`;
        markdown += `**Recommendation**: ${ineff.recommendation}\n\n`;
        markdown += `**Estimated Savings**:\n`;
        markdown += `- Tokens: ${ineff.estimated_savings.tokens.toLocaleString()}\n`;
        markdown += `- Cost: $${ineff.estimated_savings.cost_usd.toFixed(2)}/week\n`;
        markdown += `- Time: ${(ineff.estimated_savings.time_ms / 1000).toFixed(1)}s\n\n`;
      }
    } else {
      markdown += `No significant inefficiencies detected. Great work! 🎉\n\n`;
    }
    
    // Automation Opportunities
    markdown += `## 🤖 Automation Opportunities (${automation_opportunities.length} total)\n\n`;
    
    if (automation_opportunities.length > 0) {
      const top5 = automation_opportunities.slice(0, 5);
      
      for (let i = 0; i < top5.length; i++) {
        const auto = top5[i];
        markdown += `### ${i + 1}. ${auto.title} [${auto.priority.toUpperCase()}]\n\n`;
        markdown += `${auto.description}\n\n`;
        markdown += `- **Occurrences**: ${auto.occurrences}\n`;
        markdown += `- **Est. Monthly Savings**: $${auto.estimated_monthly_savings_usd.toFixed(2)}\n`;
        markdown += `- **Time Saved per Execution**: ${(auto.time_saved_per_execution_ms / 1000).toFixed(1)}s\n\n`;
        
        markdown += `**Suggested Workflow**:\n`;
        markdown += `- **Name**: \`${auto.suggested_workflow.name}\`\n`;
        markdown += `- **Trigger**: ${auto.suggested_workflow.trigger}\n`;
        markdown += `- **Steps**:\n`;
        for (const step of auto.suggested_workflow.steps) {
          markdown += `  1. ${step}\n`;
        }
        markdown += `\n`;
      }
    } else {
      markdown += `No automation opportunities identified this week.\n\n`;
    }
    
    // Cost Analysis
    markdown += `## 💰 Cost Analysis\n\n`;
    markdown += `### Breakdown by Agent\n\n`;
    markdown += `| Agent | Tokens | Cost | % of Total |\n`;
    markdown += `|-------|--------|------|------------|\n`;
    
    const sortedAgents = Object.entries(cost_analysis.breakdown_by_agent)
      .sort(([, a], [, b]) => b.cost_usd - a.cost_usd);
    
    for (const [agent, stats] of sortedAgents) {
      const percentage = (stats.cost_usd / usage_summary.total_cost_usd * 100).toFixed(1);
      markdown += `| ${agent} | ${stats.tokens.toLocaleString()} | $${stats.cost_usd.toFixed(2)} | ${percentage}% |\n`;
    }
    markdown += `\n`;
    
    markdown += `### High-Cost Operations (Top 10)\n\n`;
    markdown += `| Description | Cost |\n`;
    markdown += `|-------------|------|\n`;
    
    for (const op of cost_analysis.high_cost_operations) {
      markdown += `| ${op.description} | $${op.cost_usd.toFixed(2)} |\n`;
    }
    markdown += `\n`;
    
    // Action Items
    markdown += `## ✅ Recommended Actions\n\n`;
    markdown += `1. **Review Top 3 Inefficiencies**: Address the highest-impact inefficiencies listed above\n`;
    markdown += `2. **Apply Prompt Optimizations**: Use the optimized prompts for frequent patterns\n`;
    markdown += `3. **Implement Automation**: Start with the highest-priority automation opportunity\n`;
    markdown += `4. **Monitor High-Cost Operations**: Review the top 10 high-cost operations for optimization potential\n`;
    markdown += `5. **Create Templates**: Extract reusable templates from repeated patterns\n\n`;
    
    // Footer
    markdown += `---\n\n`;
    markdown += `*Report generated by AI Activity Logger | Next report: ${this.getNextReportDate()}*\n`;
    
    return markdown;
  }
  
  // ---------------------------------------------------------------------------
  // FILE I/O
  // ---------------------------------------------------------------------------
  
  private async saveAnalysisResults(report: WeeklyReport, analysisResult: any): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const analysisDir = path.resolve(__dirname, '../logs/analyzed');
    const filename = `patterns-${report.metadata.year}-W${String(report.metadata.week_number).padStart(2, '0')}.json`;
    const filepath = path.join(analysisDir, filename);
    
    const data = {
      report,
      raw_analysis: analysisResult,
    };
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   Saved analysis data: ${filename}`);
  }
  
  private async saveMarkdownReport(markdown: string): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const reportDir = path.resolve(__dirname, '../logs/reports');
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const filename = `weekly-report-${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}.md`;
    const filepath = path.join(reportDir, filename);
    
    fs.writeFileSync(filepath, markdown, 'utf8');
    console.log(`   Saved markdown report: ${filename}`);
  }
  
  private getReportPath(): string {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    return `.github/logs/reports/weekly-report-${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}.md`;
  }
  
  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
  
  private getNextReportDate(): string {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    return nextSunday.toLocaleDateString();
  }
}

// =============================================================================
// EXPORTS & CLI
// =============================================================================

export default WeeklyAnalysisOrchestrator;

// CLI execution
if (require.main === module) {
  const orchestrator = new WeeklyAnalysisOrchestrator();
  orchestrator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
