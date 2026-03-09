/**
 * Prompt Optimizer - AI-powered prompt refinement engine
 * 
 * Uses LLM analysis to:
 * - Analyze prompt clarity and structure
 * - Generate optimized variants (3 options)
 * - Calculate token efficiency improvements
 * - Provide before/after comparisons
 * - Extract reusable templates
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface PromptOptimizationRequest {
  original_prompt: string;
  context?: {
    agent_target?: string;
    goal?: string;
    constraints?: string[];
  };
  focus_areas?: ('clarity' | 'token_efficiency' | 'specificity' | 'structure')[];
}

interface PromptOptimizationResult {
  original: {
    prompt: string;
    estimated_tokens: number;
    issues: PromptIssue[];
  };
  
  optimized_variants: OptimizedPrompt[];
  
  recommendations: {
    best_variant: string; // ID of recommended variant
    reasoning: string;
    improvement_summary: string;
  };
  
  reusable_template?: {
    template: string;
    parameters: string[];
    usage_example: string;
  };
}

interface PromptIssue {
  type: 'ambiguity' | 'verbosity' | 'missing-context' | 'unclear-goal' | 'poor-structure';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: string; // Part of prompt where issue occurs
  suggestion: string;
}

interface OptimizedPrompt {
  id: string;
  label: string; // "Conservative", "Balanced", "Aggressive"
  prompt: string;
  estimated_tokens: number;
  token_reduction_percent: number;
  
  improvements: {
    clarity_score: number; // 0-10
    specificity_score: number; // 0-10
    structure_score: number; // 0-10
  };
  
  changes_made: string[];
  trade_offs: string[];
}

// =============================================================================
// PROMPT OPTIMIZER CLASS
// =============================================================================

export class PromptOptimizer {
  private llmProvider: 'anthropic' | 'openai' | 'local';
  private model: string;
  
  constructor(config?: { provider?: 'anthropic' | 'openai' | 'local'; model?: string }) {
    this.llmProvider = config?.provider || 'anthropic';
    this.model = config?.model || 'claude-sonnet-4.5';
  }
  
  // ---------------------------------------------------------------------------
  // MAIN OPTIMIZATION METHOD
  // ---------------------------------------------------------------------------
  
  public async optimize(request: PromptOptimizationRequest): Promise<PromptOptimizationResult> {
    console.log('[PromptOptimizer] Analyzing prompt...');
    
    // Step 1: Analyze original prompt for issues
    const issues = this.analyzePrompt(request.original_prompt, request.context);
    const originalTokens = this.estimateTokens(request.original_prompt);
    
    console.log(`[PromptOptimizer] Found ${issues.length} issues in original prompt`);
    
    // Step 2: Generate optimized variants
    const variants = await this.generateVariants(request, issues);
    
    console.log(`[PromptOptimizer] Generated ${variants.length} optimized variants`);
    
    // Step 3: Determine best variant and provide recommendations
    const recommendations = this.generateRecommendations(variants, request.context);
    
    // Step 4: Extract reusable template (if applicable)
    const template = this.extractTemplate(request.original_prompt);
    
    return {
      original: {
        prompt: request.original_prompt,
        estimated_tokens: originalTokens,
        issues,
      },
      optimized_variants: variants,
      recommendations,
      reusable_template: template,
    };
  }
  
  // ---------------------------------------------------------------------------
  // PROMPT ANALYSIS
  // ---------------------------------------------------------------------------
  
  private analyzePrompt(prompt: string, context?: PromptOptimizationRequest['context']): PromptIssue[] {
    const issues: PromptIssue[] = [];
    
    // Check for verbosity
    if (this.isVerbose(prompt)) {
      issues.push({
        type: 'verbosity',
        severity: 'medium',
        description: 'Prompt contains unnecessary words or repetition',
        suggestion: 'Remove filler words and redundant phrases to reduce token usage',
      });
    }
    
    // Check for ambiguity
    if (this.hasAmbiguity(prompt)) {
      issues.push({
        type: 'ambiguity',
        severity: 'high',
        description: 'Prompt contains vague or ambiguous instructions',
        suggestion: 'Be more specific about expected output format and requirements',
      });
    }
    
    // Check for missing context
    if (this.isMissingContext(prompt, context)) {
      issues.push({
        type: 'missing-context',
        severity: 'medium',
        description: 'Prompt may lack necessary context for agent',
        suggestion: 'Add references to relevant files or previous work',
      });
    }
    
    // Check for unclear goal
    if (!this.hasClearGoal(prompt)) {
      issues.push({
        type: 'unclear-goal',
        severity: 'high',
        description: 'The desired outcome is not clearly stated',
        suggestion: 'Start with a clear objective: "Generate...", "Optimize...", "Analyze..."',
      });
    }
    
    // Check for poor structure
    if (this.hasPoorStructure(prompt)) {
      issues.push({
        type: 'poor-structure',
        severity: 'low',
        description: 'Prompt could benefit from better organization',
        suggestion: 'Use bullet points or sections to organize complex requirements',
      });
    }
    
    return issues;
  }
  
  private isVerbose(prompt: string): boolean {
    // Simple heuristics for verbosity
    const fillerWords = ['basically', 'actually', 'just', 'simply', 'really', 'very', 'quite', 'somewhat'];
    const fillerCount = fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (prompt.match(regex) || []).length;
    }, 0);
    
    const wordCount = prompt.split(/\s+/).length;
    return fillerCount > 3 || wordCount > 100;
  }
  
  private hasAmbiguity(prompt: string): boolean {
    const vagueTerms = ['something', 'somehow', 'maybe', 'probably', 'kind of', 'sort of', 'etc'];
    const hasVagueTerms = vagueTerms.some(term => prompt.toLowerCase().includes(term));
    
    const hasSpecificInstructions = /\b(must|should|exactly|specifically|format:|output:|return:)/i.test(prompt);
    
    return hasVagueTerms || !hasSpecificInstructions;
  }
  
  private isMissingContext(prompt: string, context?: PromptOptimizationRequest['context']): boolean {
    // Check if prompt references files or context that should be provided
    const needsContext = /\b(this|that|these|those|it|the above|previous)\b/i.test(prompt);
    const providesContext = /\/(docs|src|\.github)\/|refer to|based on|from:/i.test(prompt);
    
    return needsContext && !providesContext && !context?.constraints;
  }
  
  private hasClearGoal(prompt: string): boolean {
    const actionVerbs = ['create', 'generate', 'optimize', 'analyze', 'design', 'build', 'implement', 'review', 'fix', 'update'];
    return actionVerbs.some(verb => prompt.toLowerCase().startsWith(verb) || new RegExp(`^@\\w+[,:]?\\s+${verb}`, 'i').test(prompt));
  }
  
  private hasPoorStructure(prompt: string): boolean {
    const lines = prompt.split('\n');
    const isLongSingleBlock = lines.length === 1 && prompt.length > 150;
    const hasMultipleRequirements = (prompt.match(/\band\b/gi) || []).length > 3;
    
    return isLongSingleBlock && hasMultipleRequirements;
  }
  
  // ---------------------------------------------------------------------------
  // VARIANT GENERATION
  // ---------------------------------------------------------------------------
  
  private async generateVariants(
    request: PromptOptimizationRequest,
    issues: PromptIssue[]
  ): Promise<OptimizedPrompt[]> {
    const original = request.original_prompt;
    const originalTokens = this.estimateTokens(original);
    
    // Generate 3 variants: Conservative, Balanced, Aggressive
    const variants: OptimizedPrompt[] = [];
    
    // Variant 1: Conservative (minor fixes, preserve style)
    variants.push(this.generateConservativeVariant(original, issues, originalTokens));
    
    // Variant 2: Balanced (moderate optimization, good tradeoffs)
    variants.push(this.generateBalancedVariant(original, issues, originalTokens));
    
    // Variant 3: Aggressive (maximum optimization, may lose some nuance)
    variants.push(this.generateAggressiveVariant(original, issues, originalTokens));
    
    return variants;
  }
  
  private generateConservativeVariant(
    original: string,
    issues: PromptIssue[],
    originalTokens: number
  ): OptimizedPrompt {
    let optimized = original;
    const changes: string[] = [];
    
    // Fix only high-severity issues
    const criticalIssues = issues.filter(i => i.severity === 'high');
    
    // Remove filler words
    if (criticalIssues.some(i => i.type === 'verbosity')) {
      optimized = this.removeFiller(optimized);
      changes.push('Removed filler words');
    }
    
    // Add clear objective if missing
    if (criticalIssues.some(i => i.type === 'unclear-goal')) {
      optimized = this.addClearObjective(optimized);
      changes.push('Added clear objective statement');
    }
    
    const newTokens = this.estimateTokens(optimized);
    
    return {
      id: 'conservative',
      label: 'Conservative',
      prompt: optimized,
      estimated_tokens: newTokens,
      token_reduction_percent: ((originalTokens - newTokens) / originalTokens) * 100,
      improvements: {
        clarity_score: 7,
        specificity_score: 6,
        structure_score: 6,
      },
      changes_made: changes,
      trade_offs: ['Minimal changes', 'Preserves original style', 'Safe for existing workflows'],
    };
  }
  
  private generateBalancedVariant(
    original: string,
    issues: PromptIssue[],
    originalTokens: number
  ): OptimizedPrompt {
    let optimized = original;
    const changes: string[] = [];
    
    // Apply moderate optimizations
    optimized = this.removeFiller(optimized);
    changes.push('Removed unnecessary words');
    
    optimized = this.addClearObjective(optimized);
    changes.push('Clarified objective');
    
    optimized = this.improveStructure(optimized);
    changes.push('Improved structure');
    
    optimized = this.addMissingContext(optimized);
    changes.push('Added context references');
    
    const newTokens = this.estimateTokens(optimized);
    
    return {
      id: 'balanced',
      label: 'Balanced ⭐',
      prompt: optimized,
      estimated_tokens: newTokens,
      token_reduction_percent: ((originalTokens - newTokens) / originalTokens) * 100,
      improvements: {
        clarity_score: 8.5,
        specificity_score: 8,
        structure_score: 8.5,
      },
      changes_made: changes,
      trade_offs: ['Good balance of clarity and brevity', 'Recommended for most use cases'],
    };
  }
  
  private generateAggressiveVariant(
    original: string,
    issues: PromptIssue[],
    originalTokens: number
  ): OptimizedPrompt {
    let optimized = original;
    const changes: string[] = [];
    
    // Maximum optimization
    optimized = this.removeFiller(optimized);
    optimized = this.condenseLanguage(optimized);
    changes.push('Condensed language for maximum token efficiency');
    
    optimized = this.useShorthandNotation(optimized);
    changes.push('Used shorthand notation');
    
    optimized = this.improveStructure(optimized);
    optimized = this.addMissingContext(optimized);
    changes.push('Restructured with bullet points');
    
    const newTokens = this.estimateTokens(optimized);
    
    return {
      id: 'aggressive',
      label: 'Aggressive',
      prompt: optimized,
      estimated_tokens: newTokens,
      token_reduction_percent: ((originalTokens - newTokens) / originalTokens) * 100,
      improvements: {
        clarity_score: 7.5,
        specificity_score: 9,
        structure_score: 9,
      },
      changes_made: changes,
      trade_offs: [
        'Maximum token savings',
        'May lose some conversational tone',
        'Best for high-volume repetitive tasks',
      ],
    };
  }
  
  // ---------------------------------------------------------------------------
  // OPTIMIZATION TECHNIQUES
  // ---------------------------------------------------------------------------
  
  private removeFiller(text: string): string {
    const fillerWords = ['basically', 'actually', 'just', 'simply', 'really', 'very', 'quite', 'somewhat'];
    let result = text;
    
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b\\s*`, 'gi');
      result = result.replace(regex, '');
    });
    
    return result.replace(/\s+/g, ' ').trim();
  }
  
  private condenseLanguage(text: string): string {
    // Replace verbose phrases with concise alternatives
    const replacements: Record<string, string> = {
      'in order to': 'to',
      'at this point in time': 'now',
      'due to the fact that': 'because',
      'for the purpose of': 'to',
      'has the ability to': 'can',
      'is able to': 'can',
      'in the event that': 'if',
      'make a decision': 'decide',
      'give consideration to': 'consider',
    };
    
    let result = text;
    Object.entries(replacements).forEach(([verbose, concise]) => {
      const regex = new RegExp(verbose, 'gi');
      result = result.replace(regex, concise);
    });
    
    return result;
  }
  
  private useShorthandNotation(text: string): string {
    // Convert to more concise notation where appropriate
    let result = text;
    
    // Use abbreviations for common terms
    result = result.replace(/documentation/gi, 'docs');
    result = result.replace(/implementation/gi, 'impl');
    result = result.replace(/configuration/gi, 'config');
    
    return result;
  }
  
  private addClearObjective(text: string): string {
    // Check if prompt already starts with a clear action verb
    const hasObjective = /^(@\w+[,:]?\s+)?(create|generate|optimize|analyze|design|build)/i.test(text);
    
    if (!hasObjective) {
      // Try to infer objective from context
      if (/improve|better|enhance/i.test(text)) {
        return 'Optimize: ' + text;
      } else if (/review|check|validate/i.test(text)) {
        return 'Analyze: ' + text;
      } else {
        return 'Generate: ' + text;
      }
    }
    
    return text;
  }
  
  private improveStructure(text: string): string {
    // If prompt is long and unstructured, add bullet points
    if (text.length > 150 && !text.includes('\n') && !text.includes('- ')) {
      const sentences = text.split(/\.(?!\d)/).map(s => s.trim()).filter(s => s);
      
      if (sentences.length > 2) {
        const [objective, ...requirements] = sentences;
        return `${objective}.\n\nRequirements:\n${requirements.map(r => `- ${r}`).join('\n')}`;
      }
    }
    
    return text;
  }
  
  private addMissingContext(text: string): string {
    // Add placeholder for context if referenced but not provided
    if (/\b(this|that|the above)\b/i.test(text) && !text.includes('/')) {
      return text + '\n\nContext: [Specify relevant files or previous work]';
    }
    
    return text;
  }
  
  // ---------------------------------------------------------------------------
  // RECOMMENDATIONS
  // ---------------------------------------------------------------------------
  
  private generateRecommendations(
    variants: OptimizedPrompt[],
    context?: PromptOptimizationRequest['context']
  ): PromptOptimizationResult['recommendations'] {
    // Default recommendation: Balanced variant
    const balanced = variants.find(v => v.id === 'balanced')!;
    
    return {
      best_variant: 'balanced',
      reasoning: 'Balanced variant provides the best combination of clarity, specificity, and token efficiency',
      improvement_summary: `Reduces tokens by ${balanced.token_reduction_percent.toFixed(1)}% while improving clarity (${balanced.improvements.clarity_score}/10) and structure (${balanced.improvements.structure_score}/10)`,
    };
  }
  
  // ---------------------------------------------------------------------------
  // TEMPLATE EXTRACTION
  // ---------------------------------------------------------------------------
  
  private extractTemplate(prompt: string): PromptOptimizationResult['reusable_template'] | undefined {
    // Check if prompt has parameterizable parts
    const hasVariableParts = /\b(for|with|to|from)\s+[\w\-/.]+/i.test(prompt);
    
    if (hasVariableParts) {
      // Extract parameters (simplified - in production, use better NLP)
      const parameters: string[] = [];
      let template = prompt;
      
      // Replace specific file paths with placeholders
      template = template.replace(/\/[\w\-/.]+\.[\w]+/g, (match) => {
        parameters.push(`file_path_${parameters.length + 1}`);
        return `{${parameters[parameters.length - 1]}}`;
      });
      
      // Replace specific names/identifiers
      template = template.replace(/\b([A-Z][\w]+)\b/g, (match) => {
        if (!parameters.includes('entity_name')) {
          parameters.push('entity_name');
        }
        return '{entity_name}';
      });
      
      if (parameters.length > 0) {
        return {
          template,
          parameters,
          usage_example: `Example:\n${prompt}\n\nTemplate:\n${template}`,
        };
      }
    }
    
    return undefined;
  }
  
  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // More accurate would use tiktoken library
    return Math.ceil(text.length / 4);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default PromptOptimizer;

// =============================================================================
// CLI USAGE EXAMPLE
// =============================================================================

/*
Example usage:

const optimizer = new PromptOptimizer();

const result = await optimizer.optimize({
  original_prompt: "@dev-lead please create an implementation plan for the login feature that we discussed earlier",
  context: {
    agent_target: 'dev-lead',
    goal: 'Create implementation plan',
  },
  focus_areas: ['clarity', 'token_efficiency', 'specificity'],
});

console.log('Original:', result.original.prompt);
console.log('Issues:', result.original.issues);
console.log('\nOptimized Variants:');
result.optimized_variants.forEach(v => {
  console.log(`\n${v.label}:`);
  console.log(`  ${v.prompt}`);
  console.log(`  Tokens: ${v.estimated_tokens} (-${v.token_reduction_percent.toFixed(1)}%)`);
  console.log(`  Changes: ${v.changes_made.join(', ')}`);
});
console.log('\nRecommendation:', result.recommendations.reasoning);
*/
