/**
 * Activity Interceptor - Captures all agent interactions for analysis
 * 
 * This module hooks into agent invocations and logs:
 * - User prompts to agents
 * - Agent responses
 * - Decision points and outcomes
 * - Token usage and costs
 * - Tool invocations
 * - Context and file operations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface LogEntry {
  timestamp: string;
  session_id: string;
  
  // Agent context
  agent: {
    name: string;
    mode: string;
    handoff_from?: string;
  };
  
  // User interaction
  user_prompt: {
    text: string;
    intent?: string;
    referenced_files?: string[];
  };
  
  // Agent response
  agent_response?: {
    summary: string;
    actions: string[];
    files_modified?: string[];
    tool_invocations?: ToolInvocation[];
  };
  
  // Decision tracking
  decision?: {
    type: 'gate' | 'option-selection' | 'handoff' | 'approval';
    options_presented?: string[];
    selected_option?: string;
    rationale?: string;
  };
  
  // Token & cost tracking
  tokens: {
    input: number;
    output: number;
    total: number;
    cost_usd: number;
    model: string;
  };
  
  // Performance
  duration_ms: number;
  
  // Outcome
  outcome: 'success' | 'error' | 'partial' | 'pending';
  error_message?: string;
  
  // Context metadata
  metadata: {
    project_name?: string;
    workflow_stage?: string;
    current_files?: string[];
    git_branch?: string;
  };
}

interface ToolInvocation {
  tool: string;
  parameters: Record<string, any>;
  result?: 'success' | 'error';
  duration_ms?: number;
}

interface Config {
  logging: {
    enabled: boolean;
    log_directory: string;
    log_format: string;
    capture: Record<string, boolean>;
    privacy: {
      sanitize_sensitive_data: boolean;
      exclude_patterns: string[];
      project_specific_only: boolean;
    };
  };
}

// =============================================================================
// ACTIVITY INTERCEPTOR CLASS
// =============================================================================

export class ActivityInterceptor {
  private config: Config;
  private sessionId: string;
  private logFilePath: string;
  private currentEntry: Partial<LogEntry> | null = null;
  
  constructor(configPath: string = '../ai-logger/config.yaml') {
    this.config = this.loadConfig(configPath);
    this.sessionId = this.generateSessionId();
    this.logFilePath = this.getLogFilePath();
    
    // Ensure log directory exists
    this.ensureLogDirectory();
  }
  
  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  
  private loadConfig(configPath: string): Config {
    try {
      const fullPath = path.resolve(__dirname, configPath);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      return yaml.load(fileContents) as Config;
    } catch (error) {
      console.warn('[ActivityInterceptor] Failed to load config, using defaults:', error);
      return this.getDefaultConfig();
    }
  }
  
  private getDefaultConfig(): Config {
    return {
      logging: {
        enabled: true,
        log_directory: '../logs/raw',
        log_format: 'jsonl',
        capture: {
          user_prompts: true,
          agent_responses: true,
          tool_invocations: true,
          decision_points: true,
          token_usage: true,
          errors: true,
          duration: true,
          context_files: true,
        },
        privacy: {
          sanitize_sensitive_data: true,
          exclude_patterns: ['API_KEY', 'PASSWORD', 'SECRET', 'TOKEN'],
          project_specific_only: true,
        },
      },
    };
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logDir = path.resolve(__dirname, this.config.logging.log_directory);
    return path.join(logDir, `activity-${date}.jsonl`);
  }
  
  private ensureLogDirectory(): void {
    const logDir = path.resolve(__dirname, this.config.logging.log_directory);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
  
  // ---------------------------------------------------------------------------
  // MAIN LOGGING API
  // ---------------------------------------------------------------------------
  
  /**
   * Start tracking a new agent interaction
   */
  public startInteraction(params: {
    agentName: string;
    agentMode: string;
    userPrompt: string;
    handoffFrom?: string;
    referencedFiles?: string[];
  }): void {
    if (!this.config.logging.enabled) return;
    
    this.currentEntry = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      agent: {
        name: params.agentName,
        mode: params.agentMode,
        handoff_from: params.handoffFrom,
      },
      user_prompt: {
        text: this.sanitize(params.userPrompt),
        referenced_files: params.referencedFiles || [],
      },
      metadata: {
        current_files: params.referencedFiles || [],
      },
    };
  }
  
  /**
   * Log a decision point (options presented, user selection)
   */
  public logDecision(params: {
    type: 'gate' | 'option-selection' | 'handoff' | 'approval';
    optionsPresented?: string[];
    selectedOption?: string;
    rationale?: string;
  }): void {
    if (!this.config.logging.enabled || !this.currentEntry) return;
    
    if (this.config.logging.capture.decision_points) {
      this.currentEntry.decision = params;
    }
  }
  
  /**
   * Log tool invocation
   */
  public logToolInvocation(tool: string, parameters: Record<string, any>, result?: 'success' | 'error', durationMs?: number): void {
    if (!this.config.logging.enabled || !this.currentEntry) return;
    
    if (this.config.logging.capture.tool_invocations) {
      if (!this.currentEntry.agent_response) {
        this.currentEntry.agent_response = {
          summary: '',
          actions: [],
          tool_invocations: [],
        };
      }
      
      this.currentEntry.agent_response.tool_invocations = this.currentEntry.agent_response.tool_invocations || [];
      this.currentEntry.agent_response.tool_invocations.push({
        tool,
        parameters: this.sanitize(parameters),
        result,
        duration_ms: durationMs,
      });
    }
  }
  
  /**
   * Complete the interaction and write to log
   */
  public endInteraction(params: {
    responseSummary: string;
    actions: string[];
    filesModified?: string[];
    tokens: { input: number; output: number; model: string };
    durationMs: number;
    outcome: 'success' | 'error' | 'partial' | 'pending';
    errorMessage?: string;
  }): void {
    if (!this.config.logging.enabled || !this.currentEntry) return;
    
    // Complete the log entry
    const entry: LogEntry = {
      ...(this.currentEntry as any),
      agent_response: {
        summary: params.responseSummary,
        actions: params.actions,
        files_modified: params.filesModified || [],
        tool_invocations: this.currentEntry.agent_response?.tool_invocations || [],
      },
      tokens: {
        input: params.tokens.input,
        output: params.tokens.output,
        total: params.tokens.input + params.tokens.output,
        cost_usd: this.calculateCost(params.tokens.input, params.tokens.output, params.tokens.model),
        model: params.tokens.model,
      },
      duration_ms: params.durationMs,
      outcome: params.outcome,
      error_message: params.errorMessage,
    };
    
    // Write to log file
    this.writeLog(entry);
    
    // Clear current entry
    this.currentEntry = null;
  }
  
  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  
  private sanitize(data: any): any {
    if (!this.config.logging.privacy.sanitize_sensitive_data) {
      return data;
    }
    
    const patterns = this.config.logging.privacy.exclude_patterns;
    const dataStr = JSON.stringify(data);
    
    let sanitized = dataStr;
    patterns.forEach(pattern => {
      const regex = new RegExp(`(${pattern}[\\s]*[:=][\\s]*)[^\\s,}]+`, 'gi');
      sanitized = sanitized.replace(regex, '$1[REDACTED]');
    });
    
    try {
      return JSON.parse(sanitized);
    } catch {
      return sanitized;
    }
  }
  
  private calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    // Pricing per 1M tokens (as of Jan 2026)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-sonnet-4.5': { input: 3.00, output: 15.00 },
      'claude-opus-4': { input: 15.00, output: 75.00 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-5-mini': { input: 1.00, output: 3.00 },
    };
    
    const modelKey = model.toLowerCase().replace(/\s+/g, '-');
    const prices = pricing[modelKey] || pricing['claude-sonnet-4.5']; // Default fallback
    
    const inputCost = (inputTokens / 1_000_000) * prices.input;
    const outputCost = (outputTokens / 1_000_000) * prices.output;
    
    return parseFloat((inputCost + outputCost).toFixed(6));
  }
  
  private writeLog(entry: LogEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logFilePath, logLine, 'utf8');
    } catch (error) {
      console.error('[ActivityInterceptor] Failed to write log:', error);
    }
  }
  
  // ---------------------------------------------------------------------------
  // QUERY API (for reading logs)
  // ---------------------------------------------------------------------------
  
  /**
   * Read all logs for a specific date range
   */
  public static readLogs(startDate?: Date, endDate?: Date): LogEntry[] {
    const logDir = path.resolve(__dirname, '../logs/raw');
    const entries: LogEntry[] = [];
    
    if (!fs.existsSync(logDir)) {
      return entries;
    }
    
    const files = fs.readdirSync(logDir)
      .filter(f => f.startsWith('activity-') && f.endsWith('.jsonl'))
      .sort();
    
    for (const file of files) {
      const filePath = path.join(logDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as LogEntry;
          
          // Filter by date if specified
          if (startDate || endDate) {
            const entryDate = new Date(entry.timestamp);
            if (startDate && entryDate < startDate) continue;
            if (endDate && entryDate > endDate) continue;
          }
          
          entries.push(entry);
        } catch (error) {
          console.warn('[ActivityInterceptor] Failed to parse log line:', error);
        }
      }
    }
    
    return entries;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ActivityInterceptor;

// Example usage:
// const interceptor = new ActivityInterceptor();
// interceptor.startInteraction({
//   agentName: 'ai-engineering',
//   agentMode: 'prompt-optimization',
//   userPrompt: 'Optimize this prompt for clarity',
//   referencedFiles: ['/docs/prd/requirements.md'],
// });
// interceptor.logDecision({
//   type: 'option-selection',
//   optionsPresented: ['Option A', 'Option B', 'Option C'],
//   selectedOption: 'Option B',
// });
// interceptor.endInteraction({
//   responseSummary: 'Provided 3 optimized prompt variants',
//   actions: ['analyzed_prompt', 'generated_variants', 'recommended_option_b'],
//   tokens: { input: 500, output: 1200, model: 'claude-sonnet-4.5' },
//   durationMs: 3500,
//   outcome: 'success',
// });
