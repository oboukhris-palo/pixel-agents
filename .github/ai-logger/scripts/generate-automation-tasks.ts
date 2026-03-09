/**
 * Automation Task Generator
 * 
 * Converts detected patterns and automation opportunities into:
 * - Executable workflow templates
 * - Prompt templates for reuse
 * - CLI scripts for common tasks
 * - VS Code tasks and shortcuts
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface AutomationTaskConfig {
  pattern_id: string;
  pattern_description: string;
  priority: 'low' | 'medium' | 'high';
  occurrences: number;
  
  automation_type: 'workflow' | 'prompt-template' | 'cli-script' | 'vscode-task';
  
  workflow?: WorkflowTemplate;
  prompt_template?: PromptTemplate;
  cli_script?: CLIScript;
  vscode_task?: VSCodeTask;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  parameters: Parameter[];
}

interface WorkflowStep {
  name: string;
  agent?: string;
  action: string;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
}

interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  parameters: Parameter[];
  example: string;
  target_agent?: string;
}

interface Parameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'file-path' | 'enum';
  required: boolean;
  default?: string;
  enum_values?: string[];
}

interface CLIScript {
  name: string;
  description: string;
  command: string;
  parameters: Parameter[];
  example: string;
}

interface VSCodeTask {
  label: string;
  type: string;
  command: string;
  args?: string[];
  problem_matcher?: string[];
}

// =============================================================================
// AUTOMATION TASK GENERATOR CLASS
// =============================================================================

export class AutomationTaskGenerator {
  // ---------------------------------------------------------------------------
  // MAIN GENERATION METHOD
  // ---------------------------------------------------------------------------
  
  public generateFromOpportunities(opportunities: any[]): AutomationTaskConfig[] {
    const tasks: AutomationTaskConfig[] = [];
    
    for (const opportunity of opportunities) {
      const task = this.createAutomationTask(opportunity);
      if (task) {
        tasks.push(task);
      }
    }
    
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  // ---------------------------------------------------------------------------
  // TASK CREATION
  // ---------------------------------------------------------------------------
  
  private createAutomationTask(opportunity: any): AutomationTaskConfig | null {
    const relatedPattern = opportunity.related_pattern_id;
    
    // Determine automation type based on pattern
    const automationType = this.determineAutomationType(opportunity);
    
    const task: AutomationTaskConfig = {
      pattern_id: opportunity.id,
      pattern_description: opportunity.description,
      priority: opportunity.priority,
      occurrences: opportunity.occurrences,
      automation_type: automationType,
    };
    
    // Generate appropriate automation artifact
    switch (automationType) {
      case 'workflow':
        task.workflow = this.generateWorkflowTemplate(opportunity);
        break;
      case 'prompt-template':
        task.prompt_template = this.generatePromptTemplate(opportunity);
        break;
      case 'cli-script':
        task.cli_script = this.generateCLIScript(opportunity);
        break;
      case 'vscode-task':
        task.vscode_task = this.generateVSCodeTask(opportunity);
        break;
      default:
        return null;
    }
    
    return task;
  }
  
  private determineAutomationType(opportunity: any): AutomationTaskConfig['automation_type'] {
    const workflow = opportunity.suggested_workflow;
    
    // Multi-step operations → workflow
    if (workflow.steps.length > 3) {
      return 'workflow';
    }
    
    // Simple repeated prompts → template
    if (workflow.steps.length <= 2 && workflow.trigger.includes('prompt matches')) {
      return 'prompt-template';
    }
    
    // File operations → CLI script
    if (workflow.trigger.includes('Files referenced') || workflow.name.includes('file')) {
      return 'cli-script';
    }
    
    // IDE integration → VS Code task
    return 'vscode-task';
  }
  
  // ---------------------------------------------------------------------------
  // WORKFLOW TEMPLATE GENERATION
  // ---------------------------------------------------------------------------
  
  private generateWorkflowTemplate(opportunity: any): WorkflowTemplate {
    const workflow = opportunity.suggested_workflow;
    
    const steps: WorkflowStep[] = workflow.steps.map((step: string, index: number) => ({
      name: `step_${index + 1}`,
      action: step,
      agent: this.extractAgent(step),
      inputs: {},
      outputs: {},
    }));
    
    const parameters = this.extractParameters(workflow.name, workflow.trigger);
    
    return {
      name: workflow.name,
      description: opportunity.description,
      trigger: workflow.trigger,
      steps,
      parameters,
    };
  }
  
  // ---------------------------------------------------------------------------
  // PROMPT TEMPLATE GENERATION
  // ---------------------------------------------------------------------------
  
  private generatePromptTemplate(opportunity: any): PromptTemplate {
    const workflow = opportunity.suggested_workflow;
    const template = this.createTemplateFromTrigger(workflow.trigger);
    const parameters = this.extractParameters(workflow.name, workflow.trigger);
    
    return {
      name: workflow.name.replace(/_/g, '-'),
      description: opportunity.description,
      template: template.template,
      parameters,
      example: template.example,
      target_agent: this.extractAgent(workflow.trigger),
    };
  }
  
  private createTemplateFromTrigger(trigger: string): { template: string; example: string } {
    // Extract pattern from trigger and create template
    
    if (trigger.includes('prompt matches')) {
      const match = trigger.match(/"([^"]+)"/);
      const basePrompt = match ? match[1] : 'Action on {TARGET}';
      
      // Parameterize the prompt
      const template = basePrompt
        .replace(/[\w-]+\.(md|ts|tsx|js|yaml|json)/g, '{FILE_PATH}')
        .replace(/\b([A-Z][\w]+)\b/g, '{ENTITY_NAME}')
        .replace(/\d+/g, '{NUMBER}');
      
      return {
        template,
        example: basePrompt,
      };
    }
    
    if (trigger.includes('Agent sequence')) {
      const agents = trigger.match(/: (.+)$/)?.[1] || '';
      return {
        template: `Execute workflow: ${agents}\nWith context: {CONTEXT}\nGoal: {GOAL}`,
        example: `Execute workflow: ${agents}\nWith context: /docs/prd/requirements.md\nGoal: Generate implementation plan`,
      };
    }
    
    if (trigger.includes('Files referenced')) {
      const files = trigger.match(/: (.+)$/)?.[1] || '';
      return {
        template: `Process files: {FILES}\nOperation: {OPERATION}\nOutput format: {FORMAT}`,
        example: `Process files: ${files}\nOperation: Generate BDD scenarios\nOutput format: Gherkin`,
      };
    }
    
    return {
      template: 'Execute: {ACTION}\nContext: {CONTEXT}',
      example: 'Execute: Analyze logs\nContext: /logs/activity-2026-01-09.jsonl',
    };
  }
  
  // ---------------------------------------------------------------------------
  // CLI SCRIPT GENERATION
  // ---------------------------------------------------------------------------
  
  private generateCLIScript(opportunity: any): CLIScript {
    const workflow = opportunity.suggested_workflow;
    const parameters = this.extractParameters(workflow.name, workflow.trigger);
    
    const command = this.generateCLICommand(workflow.name, parameters);
    
    return {
      name: workflow.name,
      description: opportunity.description,
      command,
      parameters,
      example: this.generateCLIExample(command, parameters),
    };
  }
  
  private generateCLICommand(name: string, parameters: Parameter[]): string {
    const paramFlags = parameters
      .map(p => {
        if (p.required) {
          return `--${p.name.replace(/_/g, '-')} <${p.type}>`;
        } else {
          return `[--${p.name.replace(/_/g, '-')} <${p.type}>]`;
        }
      })
      .join(' ');
    
    return `.github/scripts/${name}.sh ${paramFlags}`;
  }
  
  private generateCLIExample(command: string, parameters: Parameter[]): string {
    const paramValues = parameters.map(p => {
      let value = p.default || '';
      
      if (!value) {
        switch (p.type) {
          case 'string':
            value = 'example-value';
            break;
          case 'number':
            value = '42';
            break;
          case 'file-path':
            value = '/docs/example.md';
            break;
          case 'enum':
            value = p.enum_values?.[0] || 'option1';
            break;
        }
      }
      
      return `--${p.name.replace(/_/g, '-')} ${value}`;
    }).join(' ');
    
    return `${command.split(' ')[0]} ${paramValues}`;
  }
  
  // ---------------------------------------------------------------------------
  // VS CODE TASK GENERATION
  // ---------------------------------------------------------------------------
  
  private generateVSCodeTask(opportunity: any): VSCodeTask {
    const workflow = opportunity.suggested_workflow;
    
    return {
      label: workflow.name.replace(/_/g, ' '),
      type: 'shell',
      command: `.github/scripts/${workflow.name}.sh`,
      args: [],
      problem_matcher: [],
    };
  }
  
  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  
  private extractAgent(text: string): string | undefined {
    const agents = ['orchestrator', 'pm', 'po', 'ba', 'ux', 'architect', 'dev-lead', 'dev-tdd', 'ai-engineering'];
    
    for (const agent of agents) {
      if (text.toLowerCase().includes(agent)) {
        return agent;
      }
    }
    
    return undefined;
  }
  
  private extractParameters(name: string, trigger: string): Parameter[] {
    const params: Parameter[] = [];
    
    // Extract file paths
    if (trigger.includes('Files referenced') || name.includes('file')) {
      params.push({
        name: 'file_path',
        description: 'Path to the file to process',
        type: 'file-path',
        required: true,
      });
    }
    
    // Extract entity names
    if (trigger.includes('Entity') || name.includes('entity') || /[A-Z][\w]+/.test(trigger)) {
      params.push({
        name: 'entity_name',
        description: 'Name of the entity to process',
        type: 'string',
        required: true,
      });
    }
    
    // Extract agent references
    if (trigger.includes('Agent')) {
      params.push({
        name: 'agent',
        description: 'Target agent for the operation',
        type: 'enum',
        required: true,
        enum_values: ['orchestrator', 'dev-lead', 'architect', 'dev-tdd'],
      });
    }
    
    // Common parameters
    params.push({
      name: 'context',
      description: 'Additional context or constraints',
      type: 'string',
      required: false,
      default: '',
    });
    
    return params;
  }
  
  // ---------------------------------------------------------------------------
  // FILE GENERATION
  // ---------------------------------------------------------------------------
  
  public async saveAutomationTasks(tasks: AutomationTaskConfig[]): Promise<void> {
    for (const task of tasks) {
      if (task.prompt_template) {
        await this.savePromptTemplate(task.prompt_template);
      }
      
      if (task.workflow) {
        await this.saveWorkflowTemplate(task.workflow);
      }
      
      if (task.cli_script) {
        await this.saveCLIScript(task.cli_script);
      }
      
      if (task.vscode_task) {
        await this.saveVSCodeTask(task.vscode_task);
      }
    }
  }
  
  private async savePromptTemplate(template: PromptTemplate): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const templateDir = path.resolve(__dirname, '../templates/prompts/auto-generated');
    const filename = `${template.name}.md`;
    const filepath = path.join(templateDir, filename);
    
    let content = `# ${template.name}\n\n`;
    content += `${template.description}\n\n`;
    content += `## Template\n\n\`\`\`\n${template.template}\n\`\`\`\n\n`;
    
    content += `## Parameters\n\n`;
    for (const param of template.parameters) {
      content += `- **${param.name}** (${param.type}${param.required ? ', required' : ', optional'}): ${param.description}\n`;
    }
    content += `\n`;
    
    content += `## Example\n\n\`\`\`\n${template.example}\n\`\`\`\n\n`;
    
    if (template.target_agent) {
      content += `## Target Agent\n\n@${template.target_agent}\n`;
    }
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`   Saved prompt template: ${filename}`);
  }
  
  private async saveWorkflowTemplate(workflow: WorkflowTemplate): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const workflowDir = path.resolve(__dirname, '../workflows');
    const filename = `${workflow.name}.workflow.md`;
    const filepath = path.join(workflowDir, filename);
    
    let content = `# ${workflow.name}\n\n`;
    content += `${workflow.description}\n\n`;
    content += `## Trigger\n\n${workflow.trigger}\n\n`;
    content += `## Steps\n\n`;
    
    workflow.steps.forEach((step, index) => {
      content += `### Step ${index + 1}: ${step.name}\n\n`;
      content += `- **Action**: ${step.action}\n`;
      if (step.agent) {
        content += `- **Agent**: @${step.agent}\n`;
      }
      content += `\n`;
    });
    
    content += `## Parameters\n\n`;
    for (const param of workflow.parameters) {
      content += `- **${param.name}**: ${param.description}\n`;
    }
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`   Saved workflow template: ${filename}`);
  }
  
  private async saveCLIScript(script: CLIScript): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const scriptDir = path.resolve(__dirname, '../scripts');
    const filename = `${script.name}.sh`;
    const filepath = path.join(scriptDir, filename);
    
    let content = `#!/bin/bash\n\n`;
    content += `# ${script.description}\n\n`;
    content += `# Usage: ${script.example}\n\n`;
    
    content += `# Parse arguments\n`;
    for (const param of script.parameters) {
      const varName = param.name.toUpperCase();
      content += `${varName}=""\n`;
    }
    content += `\n`;
    
    content += `while [[ $# -gt 0 ]]; do\n`;
    content += `  case $1 in\n`;
    for (const param of script.parameters) {
      const flag = `--${param.name.replace(/_/g, '-')}`;
      const varName = param.name.toUpperCase();
      content += `    ${flag})\n`;
      content += `      ${varName}="$2"\n`;
      content += `      shift 2\n`;
      content += `      ;;\n`;
    }
    content += `    *)\n`;
    content += `      echo "Unknown option: $1"\n`;
    content += `      exit 1\n`;
    content += `      ;;\n`;
    content += `  esac\n`;
    content += `done\n\n`;
    
    content += `# Validate required parameters\n`;
    for (const param of script.parameters.filter(p => p.required)) {
      const varName = param.name.toUpperCase();
      content += `if [ -z "$${varName}" ]; then\n`;
      content += `  echo "Error: --${param.name.replace(/_/g, '-')} is required"\n`;
      content += `  exit 1\n`;
      content += `fi\n\n`;
    }
    
    content += `# TODO: Implement automation logic here\n`;
    content += `echo "Executing ${script.name}..."\n`;
    
    fs.writeFileSync(filepath, content, 'utf8');
    fs.chmodSync(filepath, '755'); // Make executable
    console.log(`   Saved CLI script: ${filename}`);
  }
  
  private async saveVSCodeTask(task: VSCodeTask): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const tasksFile = path.resolve(__dirname, '../../.vscode/tasks.json');
    
    let tasks: any = { version: '2.0.0', tasks: [] };
    
    // Read existing tasks if file exists
    if (fs.existsSync(tasksFile)) {
      const content = fs.readFileSync(tasksFile, 'utf8');
      tasks = JSON.parse(content);
    }
    
    // Add new task if it doesn't exist
    const exists = tasks.tasks.some((t: any) => t.label === task.label);
    if (!exists) {
      tasks.tasks.push(task);
      fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2), 'utf8');
      console.log(`   Added VS Code task: ${task.label}`);
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default AutomationTaskGenerator;
