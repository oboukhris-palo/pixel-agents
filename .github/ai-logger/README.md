# 🤖 AI Activity Logger & Prompt Optimizer

**Version**: 1.0.0  
**Status**: Production-Ready  
**Model**: Option B (Balanced) - Automated AI-powered analysis

---

## 📋 Overview

The AI Activity Logger & Prompt Optimizer is an intelligent system that captures, analyzes, and optimizes your interactions with AI agents. It provides:

- **📊 Automated activity logging** - Captures all agent interactions, token usage, and costs
- **🔍 Pattern detection** - Identifies repetitive workflows and inefficiencies
- **✨ Prompt optimization** - Suggests improved prompt variants with token efficiency analysis
- **🤖 Automation opportunities** - Generates workflow templates for common tasks
- **📈 Weekly reports** - Comprehensive analysis with actionable recommendations

---

## 🏗️ System Architecture

```
.github/
├── ai-logger/                        # Core logging system
│    ├── scripts/                          # Analysis & automation scripts
│    |        ├── weekly-analysis.ts            # Main orchestrator
│    |        └── generate-automation-tasks.ts  # Workflow generator
│    ├── config.yaml                   # Configuration file
│    ├── activity-interceptor.ts       # Captures agent interactions
│    ├── pattern-analyzer.ts           # Detects patterns and inefficiencies
│    └── prompt-optimizer.ts           # AI-powered prompt refinement
│
├── logs/                             # Log storage
│   ├── raw/                          # Raw activity logs (JSONL)
│   │   └── activity-YYYY-MM-DD.jsonl
│   ├── analyzed/                     # Analyzed data (JSON)
│   │   └── patterns-YYYY-WWW.json
│   └── reports/                      # Weekly markdown reports
│       └── weekly-report-YYYY-WWW.md
│
|── templates/
   └── prompts/
       ├── auto-generated/           # AI-detected templates
       └── custom/                   # User-defined templates
```

---

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to project root
cd /path/to/project

# Install dependencies
npm install js-yaml @types/node

# Or with yarn
yarn add js-yaml @types/node
```

### 2. Configuration

Edit [.github/ai-logger/config.yaml](.github/ai-logger/config.yaml) to customize:

```yaml
logging:
  enabled: true
  capture:
    user_prompts: true
    token_usage: true
    decision_points: true

analysis:
  pattern_detection:
    min_occurrences: 3
    lookback_days: 7

optimization:
  prompt_optimizer:
    generate_variants: 3

# NEW: Implementation workflow tracking
implementation_workflows:
  enabled: true
  phases:
    sprint_planning:
      track_story_selection: true
      track_scope_decisions: true
    tdd_execution:
      track_red_phases: true
      track_green_phases: true
      track_refactor_phases: true
```

### 3. Usage

#### **Implementation Workflow Integration** (NEW)

```typescript
import ImplementationWorkflowInterceptor from './.github/ai-logger/implementation-interceptor';

const interceptor = new ImplementationWorkflowInterceptor();

// PM Sprint Planning
interceptor.startImplementationPhase({
  phase: 'sprint_planning',
  userStoryRef: 'SPRINT_PLANNING',
  sprintNumber: 1
}, {
  agentName: 'pm',
  userPrompt: 'Planning Sprint 1 with 8 available stories'
});

interceptor.logSprintScopeDecision({
  sprintNumber: 1,
  selectedScope: 'balanced',
  storyCount: 5,
  totalStoryPoints: 21,
  rationale: 'Balanced approach with reasonable challenge'
});

// TDD Execution
interceptor.startTDDCycle({
  layer: 'backend',
  phase: 'red'
});

interceptor.completeTDDCycle({
  testsWritten: ['UserController.test.ts'],
  coveragePercentage: 85,
  filesModified: ['UserController.ts']
});

// Agent Handoffs
interceptor.logAgentHandoff({
  fromAgent: 'dev-lead',
  toAgent: 'tdd-orchestrator',
  handoffType: 'phase_complete',
  documentsUpdated: ['/docs/user-stories/US-001/implementation-plan.md']
});
```

#### **Manual Logging** (Integrate into your workflow)

```typescript
import ActivityInterceptor from './.github/ai-logger/activity-interceptor';

const interceptor = new ActivityInterceptor();

// Start tracking
interceptor.startInteraction({
  agentName: 'ai-engineering',
  agentMode: 'prompt-optimization',
  userPrompt: 'Optimize this prompt for clarity',
  referencedFiles: ['/docs/prd/requirements.md'],
});

// Log decisions
interceptor.logDecision({
  type: 'option-selection',
  optionsPresented: ['Option A', 'Option B', 'Option C'],
  selectedOption: 'Option B',
});

// Complete interaction
interceptor.endInteraction({
  responseSummary: 'Provided 3 optimized prompt variants',
  actions: ['analyzed_prompt', 'generated_variants'],
  tokens: { input: 500, output: 1200, model: 'claude-sonnet-4.5' },
  durationMs: 3500,
  outcome: 'success',
});
```

#### **Run Weekly Analysis**

```bash
# Execute full analysis pipeline
npx ts-node .github/scripts/weekly-analysis.ts

# NEW: Run implementation-specific analysis
npx ts-node .github/ai-logger/scripts/implementation-analysis.ts

# Or add to cron for automated weekly runs
# Every Sunday at 11:59 PM
59 23 * * 0 cd /path/to/project && npx ts-node .github/scripts/weekly-analysis.ts
```

---

## 📊 Weekly Report Structure

Generated reports include:

### 1. **Executive Summary**
- Total interactions, tokens, cost
- Error rate and response times
- Optimization potential ($XX/week)

### 2. **Usage Summary**
- Top agents used
- Token breakdown by agent
- Cost per agent

### 3. **Detected Patterns** (Top 5)
- Pattern description and frequency
- Token usage and cost
- Example prompts

### 4. **Prompt Optimizations** (Top 5)
- Before/after comparison
- Token reduction percentage
- Clarity and specificity scores
- Changes made and improvements

### 5. **🆕 Implementation Workflow Analysis**
- **TDD Cycle Analysis**: Layer-specific efficiency, coverage trends, bottlenecks
- **Agent Handoff Analysis**: Duration, blocker rates, sync efficiency
- **Sprint Planning Analysis**: Scope selection trends, velocity, completion rates
- **Story Lifecycle Analysis**: Transition delays, validation pass rates, bug discovery
- **Epic Progression Analysis**: Completion rates, cross-dependencies

### 6. **Identified Inefficiencies** (Top 3)
- Issue description and severity
- Wasted tokens and cost
- Recommendations
- Estimated savings

### 7. **🆕 Cost Analysis & ROI**
- Implementation cost breakdown by category
- Optimization potential per workflow phase
- Monthly cost projections and savings

### 8. **Action Items**
- Prioritized recommendations
- Quick wins and long-term improvements
- Implementation-specific optimizations

---

## 🎯 Key Features

### Pattern Detection

Identifies 4 types of patterns:

1. **Prompt Sequences** - Repeated similar prompts
2. **Agent Handoffs** - Common agent-to-agent workflows
3. **File Operations** - Frequently accessed files
4. **Decision Gates** - Recurring decision points

### Prompt Optimization

Generates 3 optimized variants for each pattern:

- **Conservative**: Minor fixes, preserve style (safe)
- **Balanced** ⭐: Best tradeoffs (recommended)
- **Aggressive**: Maximum token efficiency

Each variant includes:
- Token reduction percentage
- Clarity/Specificity/Structure scores (0-10)
- Changes made and trade-offs

### Automation Task Generation

Automatically creates:

- **Workflow Templates** - Multi-step orchestrations
- **Prompt Templates** - Reusable prompt structures
- **CLI Scripts** - Shell scripts for common tasks
- **VS Code Tasks** - IDE integration

---

## 💡 Usage Examples

### Example 1: Analyze Last Week's Activity

```bash
npx ts-node .github/scripts/weekly-analysis.ts
```

**Output**:
```
=== AI Activity Weekly Analysis ===

[1/5] Running pattern detection...
   Loaded 47 log entries
   Detected 8 patterns

[2/5] Optimizing detected prompt patterns...
   Optimized 5 patterns

[3/5] Compiling weekly report...

[4/5] Saving analysis results...
   Saved analysis data: patterns-2026-W02.json

[5/5] Generating markdown report...
   Saved markdown report: weekly-report-2026-W02.md

✅ Weekly analysis complete!
📊 Report saved to: .github/logs/reports/weekly-report-2026-W02.md
📈 Found 8 patterns
💰 Potential savings: $12.50/week
```

### Example 2: View Generated Report

```bash
cat .github/logs/reports/weekly-report-2026-W02.md
```

### Example 3: Use Generated Prompt Template

```bash
# View auto-generated templates
ls .github/templates/prompts/auto-generated/

# Use template
cat .github/templates/prompts/auto-generated/bdd-scenario-generator.md
```

---

## 🔧 Configuration Options

### Logging Configuration

```yaml
logging:
  enabled: true                       # Master switch
  log_format: "jsonl"                 # jsonl, json, or markdown
  
  capture:
    user_prompts: true                # Capture user input
    agent_responses: true             # Capture agent output
    tool_invocations: true            # Capture tool usage
    decision_points: true             # Capture gates/options
    token_usage: true                 # Capture tokens/cost
    errors: true                      # Capture errors
    duration: true                    # Capture timing
    context_files: true               # Capture file references
  
  privacy:
    sanitize_sensitive_data: true    # Remove API keys, passwords
    exclude_patterns:                 # Redaction patterns
      - "API_KEY"
      - "PASSWORD"
      - "SECRET"
```

### Analysis Configuration

```yaml
analysis:
  enabled: true
  
  pattern_detection:
    min_occurrences: 3                # Min repetitions to detect pattern
    similarity_threshold: 0.75        # Semantic similarity (0-1)
    lookback_days: 7                  # Analysis window
  
  llm_config:
    provider: "anthropic"             # anthropic, openai, local
    model: "claude-sonnet-4.5"
    temperature: 0.2
    max_tokens: 4000
```

### Cost Tracking

```yaml
cost_tracking:
  enabled: true
  pricing:
    claude_sonnet_4_5:
      input_per_1m_tokens: 3.00
      output_per_1m_tokens: 15.00
    gpt_4_turbo:
      input_per_1m_tokens: 10.00
      output_per_1m_tokens: 30.00
```

### Reporting Configuration

```yaml
reporting:
  enabled: true
  schedule: "weekly"                  # daily, weekly, manual
  report_format: "markdown"
  
  include_sections:
    usage_summary: true
    detected_patterns: true
    prompt_optimizations: true
    cost_analysis: true
    automation_suggestions: true
```

---

## 📈 ROI Analysis

### Expected Benefits

Based on 50 weekly agent interactions:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Avg Tokens/Interaction** | 5,000 | 3,500 | -30% |
| **Weekly Cost** | $30.00 | $21.00 | -$9/week |
| **Monthly Cost** | $120.00 | $84.00 | **-$36/month** |
| **Prompt Clarity** | 6/10 | 8.5/10 | +40% |
| **Time per Task** | 5 min | 3.5 min | -30% |

### Cost Breakdown

- **Setup**: 0 (your time)
- **Weekly Analysis**: ~$0.50 (LLM API calls)
- **Net Monthly Savings**: $36 - $2 = **$34/month**
- **ROI**: **17x**

---

## 🛠️ Troubleshooting

### Issue: No logs being generated

**Solution**:
1. Check `config.yaml` → `logging.enabled: true`
2. Ensure `activity-interceptor.ts` is imported in your code
3. Verify log directory exists: `.github/logs/raw/`

### Issue: Weekly analysis fails

**Solution**:
1. Install missing dependencies: `npm install js-yaml @types/node`
2. Check Node.js version: `node --version` (requires v16+)
3. Verify log files exist in `.github/logs/raw/`

### Issue: TypeScript errors

**Solution**:
```bash
# Install type definitions
npm install --save-dev @types/node @types/js-yaml

# Or create tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 🤝 Integration with Orchestration System

This AI logger integrates seamlessly with the PDLC orchestration framework:

### Agent Integration

Each agent can log activity automatically:

```typescript
// In agent workflow
import ActivityInterceptor from './.github/ai-logger/activity-interceptor';

export async function executeAgentTask(context: AgentContext) {
  const interceptor = new ActivityInterceptor();
  
  interceptor.startInteraction({
    agentName: context.agentName,
    agentMode: context.mode,
    userPrompt: context.userPrompt,
    handoffFrom: context.handoffFrom,
  });
  
  // Execute agent logic...
  
  interceptor.endInteraction({
    responseSummary: result.summary,
    actions: result.actions,
    tokens: result.tokens,
    durationMs: result.duration,
    outcome: result.success ? 'success' : 'error',
  });
}
```

### Workflow Tracking

Track entire PDLC/Implementation workflows:

```typescript
// Track PDLC Stage completion
interceptor.logDecision({
  type: 'gate',
  optionsPresented: ['Approve', 'Revise', 'Reject'],
  selectedOption: 'Approve',
  rationale: 'All requirements met',
});
```

---

## 📚 Additional Resources

- **PDLC Workflow**: `.github/workflows/documents.workflows.md`
- **Implementation Workflow**: `.github/workflows/implementation.workflows.md`
- **Coding Standards**: `.github/instructions/coding.instructions.md`
- **Agent Registry**: `.github/agents/`

---

## 🔮 Future Enhancements

Potential upgrades (Option C features):

- Real-time monitoring dashboard
- Automatic prompt rewriting before execution
- Predictive workflow suggestions
- Cross-project learning
- A/B testing framework
- Vector embeddings for semantic similarity

---

## 📧 Support

For issues or questions:

1. Check [Troubleshooting](#🛠️-troubleshooting) section
2. Review logs in `.github/logs/raw/`
3. Consult weekly reports for insights
4. Adjust `config.yaml` settings

---

## 📄 License

Part of the AI-Driven PDLC Orchestration System.

---

**Last Updated**: January 2026  
**Status**: ✅ Production-Ready
