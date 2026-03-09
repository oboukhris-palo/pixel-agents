/**
 * Pattern Analyzer - Detects repetitive workflows and inefficiencies
 * 
 * Uses LLM-powered analysis to:
 * - Group similar prompts using semantic similarity
 * - Identify repetitive task sequences
 * - Detect token inefficiencies
 * - Find common error patterns
 * - Suggest automation opportunities
 */

import { ActivityInterceptor } from './activity-interceptor';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface PatternAnalysisResult {
  analysis_date: string;
  lookback_days: number;
  total_interactions: number;
  
  patterns: DetectedPattern[];
  inefficiencies: Inefficiency[];
  automation_opportunities: AutomationOpportunity[];
  
  summary: {
    top_agents_used: Array<{ agent: string; count: number; total_tokens: number }>;
    total_cost_usd: number;
    avg_response_time_ms: number;
    error_rate: number;
  };
}

interface DetectedPattern {
  id: string;
  type: 'prompt-sequence' | 'agent-handoff' | 'file-operation' | 'decision-gate';
  description: string;
  occurrences: number;
  confidence: number; // 0-1
  
  // Pattern details
  prompt_template?: string;
  agent_sequence?: string[];
  common_files?: string[];
  
  // Examples from logs
  example_timestamps: string[];
  
  // Impact
  total_tokens_used: number;
  total_cost_usd: number;
  avg_duration_ms: number;
}

interface Inefficiency {
  id: string;
  type: 'token-waste' | 'redundant-context' | 'repeated-work' | 'suboptimal-handoff';
  description: string;
  severity: 'low' | 'medium' | 'high';
  
  // Impact metrics
  wasted_tokens: number;
  wasted_cost_usd: number;
  affected_interactions: number;
  
  // Recommendation
  recommendation: string;
  estimated_savings: {
    tokens: number;
    cost_usd: number;
    time_ms: number;
  };
}

interface AutomationOpportunity {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  
  // Pattern that triggered this opportunity
  related_pattern_id: string;
  occurrences: number;
  
  // Automation details
  suggested_workflow: {
    name: string;
    trigger: string;
    steps: string[];
  };
  
  // ROI
  time_saved_per_execution_ms: number;
  estimated_monthly_savings_usd: number;
}

// =============================================================================
// PATTERN ANALYZER CLASS
// =============================================================================

export class PatternAnalyzer {
  private lookbackDays: number;
  private minOccurrences: number;
  private similarityThreshold: number;
  
  constructor(options: {
    lookbackDays?: number;
    minOccurrences?: number;
    similarityThreshold?: number;
  } = {}) {
    this.lookbackDays = options.lookbackDays || 7;
    this.minOccurrences = options.minOccurrences || 3;
    this.similarityThreshold = options.similarityThreshold || 0.75;
  }
  
  // ---------------------------------------------------------------------------
  // MAIN ANALYSIS METHOD
  // ---------------------------------------------------------------------------
  
  public async analyze(): Promise<PatternAnalysisResult> {
    console.log('[PatternAnalyzer] Starting analysis...');
    
    // Step 1: Load logs from the lookback period
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - this.lookbackDays);
    
    const logs = ActivityInterceptor.readLogs(startDate, endDate);
    console.log(`[PatternAnalyzer] Loaded ${logs.length} log entries`);
    
    if (logs.length === 0) {
      return this.getEmptyResult();
    }
    
    // Step 2: Detect patterns
    const patterns = await this.detectPatterns(logs);
    console.log(`[PatternAnalyzer] Detected ${patterns.length} patterns`);
    
    // Step 3: Identify inefficiencies
    const inefficiencies = this.identifyInefficiencies(logs, patterns);
    console.log(`[PatternAnalyzer] Found ${inefficiencies.length} inefficiencies`);
    
    // Step 4: Generate automation opportunities
    const automations = this.generateAutomationOpportunities(patterns);
    console.log(`[PatternAnalyzer] Generated ${automations.length} automation opportunities`);
    
    // Step 5: Generate summary statistics
    const summary = this.generateSummary(logs);
    
    return {
      analysis_date: new Date().toISOString(),
      lookback_days: this.lookbackDays,
      total_interactions: logs.length,
      patterns,
      inefficiencies,
      automation_opportunities: automations,
      summary,
    };
  }
  
  // ---------------------------------------------------------------------------
  // PATTERN DETECTION
  // ---------------------------------------------------------------------------
  
  private async detectPatterns(logs: any[]): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    
    // Detect prompt sequence patterns
    const promptPatterns = this.detectPromptPatterns(logs);
    patterns.push(...promptPatterns);
    
    // Detect agent handoff patterns
    const handoffPatterns = this.detectHandoffPatterns(logs);
    patterns.push(...handoffPatterns);
    
    // Detect file operation patterns
    const filePatterns = this.detectFilePatterns(logs);
    patterns.push(...filePatterns);
    
    // Detect decision gate patterns
    const decisionPatterns = this.detectDecisionPatterns(logs);
    patterns.push(...decisionPatterns);
    
    // Sort by occurrences (most frequent first)
    return patterns.sort((a, b) => b.occurrences - a.occurrences);
  }
  
  private detectPromptPatterns(logs: any[]): DetectedPattern[] {
    // Group prompts by semantic similarity
    const promptGroups = new Map<string, any[]>();
    
    for (const log of logs) {
      const prompt = log.user_prompt?.text || '';
      if (!prompt) continue;
      
      // Simple keyword-based grouping (in production, use embeddings)
      const keywords = this.extractKeywords(prompt);
      const groupKey = keywords.slice(0, 3).join('_');
      
      if (!promptGroups.has(groupKey)) {
        promptGroups.set(groupKey, []);
      }
      promptGroups.get(groupKey)!.push(log);
    }
    
    // Convert groups to patterns
    const patterns: DetectedPattern[] = [];
    let patternId = 1;
    
    for (const [groupKey, groupLogs] of promptGroups.entries()) {
      if (groupLogs.length < this.minOccurrences) continue;
      
      const totalTokens = groupLogs.reduce((sum, l) => sum + l.tokens.total, 0);
      const totalCost = groupLogs.reduce((sum, l) => sum + l.tokens.cost_usd, 0);
      const avgDuration = groupLogs.reduce((sum, l) => sum + l.duration_ms, 0) / groupLogs.length;
      
      patterns.push({
        id: `pattern-prompt-${patternId++}`,
        type: 'prompt-sequence',
        description: `Repeated prompt pattern: "${this.generatePromptTemplate(groupLogs)}"`,
        occurrences: groupLogs.length,
        confidence: Math.min(groupLogs.length / 10, 1), // Higher confidence with more occurrences
        prompt_template: this.generatePromptTemplate(groupLogs),
        example_timestamps: groupLogs.slice(0, 3).map((l: any) => l.timestamp),
        total_tokens_used: totalTokens,
        total_cost_usd: totalCost,
        avg_duration_ms: avgDuration,
      });
    }
    
    return patterns;
  }
  
  private detectHandoffPatterns(logs: any[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const handoffSequences = new Map<string, any[]>();
    
    // Track sequences of agent handoffs
    for (let i = 0; i < logs.length - 1; i++) {
      const current = logs[i];
      const next = logs[i + 1];
      
      if (current.agent && next.agent) {
        const sequence = `${current.agent.name} → ${next.agent.name}`;
        
        if (!handoffSequences.has(sequence)) {
          handoffSequences.set(sequence, []);
        }
        handoffSequences.get(sequence)!.push({ current, next });
      }
    }
    
    // Convert to patterns
    let patternId = 1;
    for (const [sequence, occurrences] of handoffSequences.entries()) {
      if (occurrences.length < this.minOccurrences) continue;
      
      const agents = sequence.split(' → ');
      const totalTokens = occurrences.reduce((sum, o) => sum + o.current.tokens.total + o.next.tokens.total, 0);
      const totalCost = occurrences.reduce((sum, o) => sum + o.current.tokens.cost_usd + o.next.tokens.cost_usd, 0);
      
      patterns.push({
        id: `pattern-handoff-${patternId++}`,
        type: 'agent-handoff',
        description: `Common agent handoff: ${sequence}`,
        occurrences: occurrences.length,
        confidence: Math.min(occurrences.length / 8, 1),
        agent_sequence: agents,
        example_timestamps: occurrences.slice(0, 3).map((o: any) => o.current.timestamp),
        total_tokens_used: totalTokens,
        total_cost_usd: totalCost,
        avg_duration_ms: 0, // Could calculate from timestamps
      });
    }
    
    return patterns;
  }
  
  private detectFilePatterns(logs: any[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const fileGroups = new Map<string, any[]>();
    
    for (const log of logs) {
      const files = [
        ...(log.user_prompt?.referenced_files || []),
        ...(log.agent_response?.files_modified || []),
      ];
      
      if (files.length === 0) continue;
      
      const fileKey = files.sort().join('|');
      if (!fileGroups.has(fileKey)) {
        fileGroups.set(fileKey, []);
      }
      fileGroups.get(fileKey)!.push(log);
    }
    
    // Convert to patterns
    let patternId = 1;
    for (const [fileKey, groupLogs] of fileGroups.entries()) {
      if (groupLogs.length < this.minOccurrences) continue;
      
      const files = fileKey.split('|');
      const totalTokens = groupLogs.reduce((sum, l) => sum + l.tokens.total, 0);
      const totalCost = groupLogs.reduce((sum, l) => sum + l.tokens.cost_usd, 0);
      
      patterns.push({
        id: `pattern-file-${patternId++}`,
        type: 'file-operation',
        description: `Repeated file operations on: ${files.slice(0, 2).join(', ')}${files.length > 2 ? '...' : ''}`,
        occurrences: groupLogs.length,
        confidence: Math.min(groupLogs.length / 5, 1),
        common_files: files,
        example_timestamps: groupLogs.slice(0, 3).map((l: any) => l.timestamp),
        total_tokens_used: totalTokens,
        total_cost_usd: totalCost,
        avg_duration_ms: groupLogs.reduce((sum, l) => sum + l.duration_ms, 0) / groupLogs.length,
      });
    }
    
    return patterns;
  }
  
  private detectDecisionPatterns(logs: any[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const decisionGroups = new Map<string, any[]>();
    
    for (const log of logs) {
      if (!log.decision) continue;
      
      const decisionKey = `${log.decision.type}:${log.agent.name}`;
      if (!decisionGroups.has(decisionKey)) {
        decisionGroups.set(decisionKey, []);
      }
      decisionGroups.get(decisionKey)!.push(log);
    }
    
    // Convert to patterns
    let patternId = 1;
    for (const [decisionKey, groupLogs] of decisionGroups.entries()) {
      if (groupLogs.length < this.minOccurrences) continue;
      
      const [type, agent] = decisionKey.split(':');
      const totalTokens = groupLogs.reduce((sum, l) => sum + l.tokens.total, 0);
      const totalCost = groupLogs.reduce((sum, l) => sum + l.tokens.cost_usd, 0);
      
      patterns.push({
        id: `pattern-decision-${patternId++}`,
        type: 'decision-gate',
        description: `Frequent ${type} decisions in ${agent}`,
        occurrences: groupLogs.length,
        confidence: Math.min(groupLogs.length / 6, 1),
        example_timestamps: groupLogs.slice(0, 3).map((l: any) => l.timestamp),
        total_tokens_used: totalTokens,
        total_cost_usd: totalCost,
        avg_duration_ms: groupLogs.reduce((sum, l) => sum + l.duration_ms, 0) / groupLogs.length,
      });
    }
    
    return patterns;
  }
  
  // ---------------------------------------------------------------------------
  // INEFFICIENCY DETECTION
  // ---------------------------------------------------------------------------
  
  private identifyInefficiencies(logs: any[], patterns: DetectedPattern[]): Inefficiency[] {
    const inefficiencies: Inefficiency[] = [];
    
    // Detect token waste from repeated context
    inefficiencies.push(...this.detectTokenWaste(logs));
    
    // Detect redundant operations
    inefficiencies.push(...this.detectRedundantWork(logs, patterns));
    
    // Detect suboptimal handoffs
    inefficiencies.push(...this.detectSuboptimalHandoffs(logs));
    
    return inefficiencies.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
  
  private detectTokenWaste(logs: any[]): Inefficiency[] {
    const inefficiencies: Inefficiency[] = [];
    
    // Find interactions with unusually high token counts
    const avgTokens = logs.reduce((sum, l) => sum + l.tokens.total, 0) / logs.length;
    const highTokenLogs = logs.filter(l => l.tokens.total > avgTokens * 2);
    
    if (highTokenLogs.length >= 3) {
      const wastedTokens = highTokenLogs.reduce((sum, l) => sum + (l.tokens.total - avgTokens), 0);
      const wastedCost = highTokenLogs.reduce((sum, l) => sum + l.tokens.cost_usd, 0) * 0.4; // Estimate 40% waste
      
      inefficiencies.push({
        id: 'ineff-token-waste-1',
        type: 'token-waste',
        description: `${highTokenLogs.length} interactions with unusually high token usage (>2x average)`,
        severity: wastedCost > 1 ? 'high' : wastedCost > 0.5 ? 'medium' : 'low',
        wasted_tokens: Math.floor(wastedTokens),
        wasted_cost_usd: wastedCost,
        affected_interactions: highTokenLogs.length,
        recommendation: 'Review prompts for excessive context. Consider pre-processing or summarization.',
        estimated_savings: {
          tokens: Math.floor(wastedTokens * 0.6),
          cost_usd: wastedCost * 0.6,
          time_ms: 0,
        },
      });
    }
    
    return inefficiencies;
  }
  
  private detectRedundantWork(logs: any[], patterns: DetectedPattern[]): Inefficiency[] {
    const inefficiencies: Inefficiency[] = [];
    
    // Find high-frequency patterns that could be templated
    const redundantPatterns = patterns.filter(p => p.occurrences >= 5 && p.type === 'prompt-sequence');
    
    for (const pattern of redundantPatterns) {
      const potentialSavings = pattern.total_tokens_used * 0.3; // Estimate 30% savings with templates
      const costSavings = pattern.total_cost_usd * 0.3;
      
      inefficiencies.push({
        id: `ineff-redundant-${pattern.id}`,
        type: 'repeated-work',
        description: `Pattern "${pattern.description}" repeated ${pattern.occurrences} times - could be templated`,
        severity: pattern.occurrences >= 10 ? 'high' : pattern.occurrences >= 7 ? 'medium' : 'low',
        wasted_tokens: Math.floor(potentialSavings),
        wasted_cost_usd: costSavings,
        affected_interactions: pattern.occurrences,
        recommendation: `Create a reusable template or workflow for this pattern`,
        estimated_savings: {
          tokens: Math.floor(potentialSavings),
          cost_usd: costSavings,
          time_ms: pattern.avg_duration_ms * pattern.occurrences * 0.4,
        },
      });
    }
    
    return inefficiencies;
  }
  
  private detectSuboptimalHandoffs(logs: any[]): Inefficiency[] {
    const inefficiencies: Inefficiency[] = [];
    
    // Find handoffs that repeatedly go back and forth between same agents
    const handoffPairs = new Map<string, number>();
    
    for (let i = 0; i < logs.length - 2; i++) {
      const agent1 = logs[i].agent?.name;
      const agent2 = logs[i + 1].agent?.name;
      const agent3 = logs[i + 2].agent?.name;
      
      if (agent1 === agent3 && agent1 !== agent2) {
        const pairKey = [agent1, agent2].sort().join('↔');
        handoffPairs.set(pairKey, (handoffPairs.get(pairKey) || 0) + 1);
      }
    }
    
    for (const [pair, count] of handoffPairs.entries()) {
      if (count >= 3) {
        inefficiencies.push({
          id: `ineff-handoff-${pair.replace(/[^a-z0-9]/gi, '-')}`,
          type: 'suboptimal-handoff',
          description: `Agents ${pair} repeatedly hand off back and forth (${count} times)`,
          severity: count >= 5 ? 'medium' : 'low',
          wasted_tokens: count * 500, // Estimate overhead per handoff
          wasted_cost_usd: count * 0.01,
          affected_interactions: count * 2,
          recommendation: 'Consider consolidating these operations into a single agent interaction',
          estimated_savings: {
            tokens: count * 300,
            cost_usd: count * 0.008,
            time_ms: count * 2000, // Handoff overhead
          },
        });
      }
    }
    
    return inefficiencies;
  }
  
  // ---------------------------------------------------------------------------
  // AUTOMATION OPPORTUNITIES
  // ---------------------------------------------------------------------------
  
  private generateAutomationOpportunities(patterns: DetectedPattern[]): AutomationOpportunity[] {
    const opportunities: AutomationOpportunity[] = [];
    
    // High-frequency patterns are good automation candidates
    const automationCandidates = patterns.filter(p => p.occurrences >= 5);
    
    for (const pattern of automationCandidates) {
      const priority = pattern.occurrences >= 10 ? 'high' : pattern.occurrences >= 7 ? 'medium' : 'low';
      
      opportunities.push({
        id: `auto-${pattern.id}`,
        title: `Automate: ${pattern.description}`,
        description: `This pattern has been detected ${pattern.occurrences} times. Creating an automated workflow could save time and tokens.`,
        priority,
        related_pattern_id: pattern.id,
        occurrences: pattern.occurrences,
        suggested_workflow: {
          name: this.generateWorkflowName(pattern),
          trigger: this.generateTrigger(pattern),
          steps: this.generateWorkflowSteps(pattern),
        },
        time_saved_per_execution_ms: pattern.avg_duration_ms * 0.6, // Estimate 60% time savings
        estimated_monthly_savings_usd: (pattern.total_cost_usd / this.lookbackDays) * 30 * 0.5, // Extrapolate to monthly
      });
    }
    
    return opportunities.sort((a, b) => b.estimated_monthly_savings_usd - a.estimated_monthly_savings_usd);
  }
  
  // ---------------------------------------------------------------------------
  // SUMMARY STATISTICS
  // ---------------------------------------------------------------------------
  
  private generateSummary(logs: any[]): PatternAnalysisResult['summary'] {
    // Agent usage statistics
    const agentStats = new Map<string, { count: number; tokens: number }>();
    
    for (const log of logs) {
      const agent = log.agent?.name || 'unknown';
      if (!agentStats.has(agent)) {
        agentStats.set(agent, { count: 0, tokens: 0 });
      }
      const stats = agentStats.get(agent)!;
      stats.count++;
      stats.tokens += log.tokens.total;
    }
    
    const topAgents = Array.from(agentStats.entries())
      .map(([agent, stats]) => ({ agent, count: stats.count, total_tokens: stats.tokens }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Overall metrics
    const totalCost = logs.reduce((sum, l) => sum + l.tokens.cost_usd, 0);
    const avgResponseTime = logs.reduce((sum, l) => sum + l.duration_ms, 0) / logs.length;
    const errorCount = logs.filter(l => l.outcome === 'error').length;
    const errorRate = errorCount / logs.length;
    
    return {
      top_agents_used: topAgents,
      total_cost_usd: parseFloat(totalCost.toFixed(4)),
      avg_response_time_ms: Math.round(avgResponseTime),
      error_rate: parseFloat(errorRate.toFixed(3)),
    };
  }
  
  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, use NLP library)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }
  
  private generatePromptTemplate(logs: any[]): string {
    // Extract common structure from prompts
    const prompts = logs.map((l: any) => l.user_prompt?.text || '');
    
    // Find common prefix
    let commonPrefix = prompts[0] || '';
    for (const prompt of prompts.slice(1)) {
      let i = 0;
      while (i < commonPrefix.length && i < prompt.length && commonPrefix[i] === prompt[i]) {
        i++;
      }
      commonPrefix = commonPrefix.substring(0, i);
    }
    
    // Truncate and add placeholder
    const template = commonPrefix.trim().substring(0, 80);
    return template + (prompts[0].length > 80 ? ' [...]' : '');
  }
  
  private generateWorkflowName(pattern: DetectedPattern): string {
    const type = pattern.type.replace('-', '_');
    return `auto_${type}_${pattern.id.split('-').pop()}`;
  }
  
  private generateTrigger(pattern: DetectedPattern): string {
    switch (pattern.type) {
      case 'prompt-sequence':
        return `User prompt matches: "${pattern.prompt_template?.substring(0, 40)}..."`;
      case 'agent-handoff':
        return `Agent sequence: ${pattern.agent_sequence?.join(' → ')}`;
      case 'file-operation':
        return `Files referenced: ${pattern.common_files?.slice(0, 2).join(', ')}`;
      case 'decision-gate':
        return 'Decision gate reached';
      default:
        return 'Manual trigger';
    }
  }
  
  private generateWorkflowSteps(pattern: DetectedPattern): string[] {
    // Generate generic workflow steps based on pattern type
    switch (pattern.type) {
      case 'prompt-sequence':
        return [
          'Capture user input',
          'Apply prompt template',
          'Execute agent with optimized context',
          'Return result',
        ];
      case 'agent-handoff':
        return [
          `Initialize ${pattern.agent_sequence?.[0]}`,
          ...(pattern.agent_sequence?.slice(1).map(agent => `Handoff to ${agent}`) || []),
          'Consolidate results',
        ];
      case 'file-operation':
        return [
          'Load referenced files',
          'Execute operation',
          'Validate results',
          'Update files',
        ];
      default:
        return ['Step 1', 'Step 2', 'Step 3'];
    }
  }
  
  private getEmptyResult(): PatternAnalysisResult {
    return {
      analysis_date: new Date().toISOString(),
      lookback_days: this.lookbackDays,
      total_interactions: 0,
      patterns: [],
      inefficiencies: [],
      automation_opportunities: [],
      summary: {
        top_agents_used: [],
        total_cost_usd: 0,
        avg_response_time_ms: 0,
        error_rate: 0,
      },
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default PatternAnalyzer;
