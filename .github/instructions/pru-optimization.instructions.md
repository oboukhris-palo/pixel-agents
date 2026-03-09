---
description: PRU (Prompt Resource Units) optimization and cost management strategies
applyTo: ".github/agents/**,.github/prompts/**"
---

# PRU Optimization Standards

## Core Principle
**Optimize for efficiency without sacrificing quality**. Reduce token waste through smart context management, prompt refinement, and strategic tool usage.

---

## Token Budget by Agent Type

| Agent Type | Budget per Handoff | Rationale |
|------------|-------------------|-----------|
| **Planning** (PM, PO, BA) | 5K-10K tokens | Moderate context: user stories, requirements, personas |
| **Architecture** (Architect, Dev-Lead) | 10K-15K tokens | Heavy context: architecture diagrams, tech specs, implementation plans |
| **Implementation** (TDD agents) | 3K-5K tokens | Focused context: single layer, single file, test cases |
| **Review** (AI-Engineering, Orchestrator) | 5K-8K tokens | Analysis context: handoff history, quality metrics, PRU reports |

---

## Context Compression Strategies

### 1. Delta Summaries (NOT Full Context)
❌ **BAD**: Pass entire handoff history (40K+ tokens)
```json
{
  "handoff_1": { /* full 10K tokens */ },
  "handoff_2": { /* full 12K tokens */ },
  "handoff_3": { /* full 15K tokens */ }
}
```

✅ **GOOD**: Pass delta summary (5K tokens)
```json
{
  "summary": "Layer 2 complete. User/Subscription models created. API endpoints functional.",
  "files_changed": ["src/models/User.ts", "src/services/SubscriptionService.ts"],
  "open_questions": ["Should we add tier validation middleware?"],
  "next_agent_focus": "Layer 3 configuration - DI setup and route registration"
}
```

**Savings**: 75% token reduction (37K → 5K)

---

### 2. Canonical Source References (NOT Content Duplication)
❌ **BAD**: Repeat implementation plan in every handoff
```markdown
# Handoff to GREEN agent
## Implementation Plan (copied 15K tokens)
[Full implementation plan repeated]
## Current Context
...
```

✅ **GOOD**: Reference canonical source
```markdown
# Handoff to GREEN agent
## Context
See `/docs/user-stories/US-001/implementation-plan.md` for full layer breakdown.

## Current Focus
**Layer 2, Step 3**: Implement SubscriptionService.upgradeUser()
- File: `src/services/SubscriptionService.ts`
- Test: Already failing (RED phase complete)
- Approach: Follow plan Section 2.3 (lines 45-67)
```

**Savings**: 90% reduction (15K → 1.5K)

---

### 3. Code Snippets: 20-Line Limit
❌ **BAD**: Include entire file (200+ lines)
```markdown
## File src/services/SubscriptionService.ts
[200 lines of code]
```

✅ **GOOD**: Snippet + file reference
```markdown
## Focus: src/services/SubscriptionService.ts:45-65
```typescript
async upgradeUser(userId: string, targetTier: SubscriptionTier) {
  // [20 lines of relevant code]
}
```
Full file: `/docs/user-stories/US-001/US-001-HANDOFF-LAYER-2.json` → `files_changed`
```

**Savings**: 85% reduction (200 lines → 20 lines)

---

### 4. Semantic Chunking (Layer-by-Layer)
❌ **BAD**: Pass all 4 layers context at once
```json
{
  "layer_1_db": { /* 8K tokens */ },
  "layer_2_backend": { /* 12K tokens */ },
  "layer_3_config": { /* 6K tokens */ },
  "layer_4_frontend": { /* 10K tokens */ }
}
```

✅ **GOOD**: Pass only current layer + previous summary
```json
{
  "previous_layers_summary": "L1 complete (DB migration, models, indexes). L2 complete (services, API endpoints).",
  "current_layer": "Layer 3 - Config",
  "layer_3_context": { /* 6K tokens */ }
}
```

**Savings**: 80% reduction (36K → 7K)

---

## Prompt Refinement Strategies

### 1. Identify Token Waste Patterns
Run periodic audits to find inefficiencies:

```bash
# Analyze handoff token usage
npm run analyze-handoff-tokens -- --story=US-001

# Output
Layer 1 → Layer 2: 8,500 tokens (✅ within budget)
Layer 2 → Layer 3: 18,200 tokens (⚠️ exceeds 15K limit)
  - Culprit: Full implementation plan repeated (12K)
  - Fix: Reference canonical source instead
```

### 2. Remove Redundant Instructions
❌ **BAD**: Repeat coding standards in every prompt
```markdown
# Prompt to GREEN agent
Follow SOLID principles, DRY, YAGNI...
[500 tokens of repeated standards]
```

✅ **GOOD**: Reference instruction files
```markdown
# Prompt to GREEN agent
Follow [coding.instructions.md](/.github/instructions/coding.instructions.md)
Focus: Minimal implementation to pass failing test
```

**Savings**: 95% reduction (500 → 25 tokens)

### 3. Use Structured Outputs (JSON Schema)
Reduces ambiguity and token waste on formatting:

```json
{
  "type": "object",
  "properties": {
    "files_changed": { "type": "array", "items": { "type": "string" } },
    "summary": { "type": "string", "maxLength": 200 },
    "next_steps": { "type": "array", "maxItems": 3 }
  }
}
```

**Benefit**: Eliminates verbose prose, enforces conciseness

---

## Cost/Benefit Thresholds

### When to Optimize (Triggers)
- ✅ **Handoff exceeds budget** by >20% (e.g., 18K tokens when budget is 15K)
- ✅ **Quality score drops** >10% after compression attempt (e.g., from 95% to 84%)
- ✅ **Repeated context** detected (same content in 3+ consecutive handoffs)
- ✅ **Monthly PRU usage** reaches 75% threshold

### When NOT to Optimize (Exceptions)
- ❌ **Critical architecture decisions**: Need full context (tradeoff: cost vs risk)
- ❌ **Security reviews**: Cannot omit details (completeness > efficiency)
- ❌ **First-time agents**: Initial handoffs may need more context to establish patterns
- ❌ **Low-frequency workflows**: One-time operations not worth optimization effort

---

## PRU Alert System

### Alert Levels
```yaml
alerts:
  - threshold: 75%
    level: WARNING
    action: "Review current month usage. Identify optimization opportunities."
    
  - threshold: 90%
    level: CRITICAL
    action: "Prompt refinement REQUIRED. Defer non-critical work."
    
  - threshold: 100%
    level: EMERGENCY
    action: "Work halted. Implement aggressive compression strategies."
```

### Monitoring Dashboard
```markdown
## Monthly PRU Usage Report

**Current Month**: January 2026  
**PRU Used**: 67,500 / 100,000 (67.5%)  
**Status**: ✅ HEALTHY  
**Projection**: 90,000 by month end (10K buffer)

### Top Consumers
1. **dev-lead** (Phase 3 Planning): 18,200 tokens/handoff avg (⚠️ exceeds 15K budget)
2. **architect** (Stage 3 Design): 14,500 tokens/handoff avg (✅ within budget)
3. **dev-tdd-refactor** (Phase 4 Refactor): 4,800 tokens/handoff avg (✅ within budget)

### Optimization Recommendations
1. **dev-lead**: Reference implementation-plan.md instead of repeating content (-40% tokens)
2. **architect**: Use semantic chunking for large architecture diagrams (-25% tokens)
3. **ALL**: Limit code snippets to 20 lines (-15% overall)
```

---

## Measurement Framework

### Phase 1: Evaluation (Baseline Metrics)
Track early indicators to establish baseline:

```yaml
metrics:
  developer_satisfaction:
    question: "How satisfied are you with AI agent quality?"
    scale: 1-5 (5=very satisfied)
    target: ≥4.0 avg
    
  daily_active_users:
    description: "Developers using AI agents daily"
    target: ≥80% of team
    
  acceptance_rate:
    description: "% of AI-generated code accepted without changes"
    formula: (lines_accepted / lines_generated) * 100
    target: ≥70%
    
  task_completion_rate:
    description: "% of user stories completed within sprint"
    target: ≥85%
```

### Phase 2: Adoption (Productivity Tracking)
Monitor productivity as usage expands:

```yaml
metrics:
  time_to_complete_story:
    description: "Avg hours from story start to merge"
    baseline: 8 hours (manual)
    target: ≤5 hours (AI-assisted)
    improvement: 37.5%
    
  code_review_time:
    description: "Avg hours for code review cycle"
    baseline: 2 hours (manual review)
    target: ≤0.5 hours (AI pre-review + human approval)
    improvement: 75%
    
  defects_per_story:
    description: "Bugs found in production per story"
    baseline: 0.8 defects/story
    target: ≤0.3 defects/story (AI quality gates)
    improvement: 62.5%
```

### Phase 3: Optimization (ROI Analysis)
Use Copilot Metrics API to tune outcomes:

```yaml
metrics:
  pru_cost_per_story:
    description: "PRU consumed per user story implemented"
    baseline: 15,000 PRU/story (before optimization)
    target: ≤10,000 PRU/story (after context compression)
    improvement: 33.3%
    
  quality_score_vs_cost:
    description: "Quality score per 1K PRU spent"
    formula: (quality_score / pru_consumed) * 1000
    baseline: 6.0 (90% quality / 15K PRU)
    target: ≥9.0 (90% quality / 10K PRU)
    improvement: 50%
    
  time_to_market:
    description: "Days from requirements to production deployment"
    baseline: 12 days (manual)
    target: ≤6 days (AI-accelerated)
    improvement: 50%
```

### Phase 4: Sustained Efficiency (Long-Term Monitoring)
Continuous monitoring to maintain gains:

```yaml
metrics:
  monthly_pru_trend:
    description: "PRU usage over time (detect regressions)"
    target: Stable or decreasing month-over-month
    
  agent_efficiency_score:
    description: "Quality score / tokens consumed per agent"
    formula: (avg_quality / avg_tokens) * 10000
    target: ≥60 per agent (90% quality / 15K tokens)
    
  automation_coverage:
    description: "% of development tasks automated by agents"
    target: ≥70% (skeleton code, tests, docs, reviews)
```

---

## Usage Metrics Integration

### Copilot Metrics API Endpoints
```typescript
// Get PRU usage for organization
const usage = await copilot.metrics.getPRUUsage({
  org: 'my-org',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

// Get acceptance rates by agent
const acceptance = await copilot.metrics.getAcceptanceRates({
  breakdown: 'agent',
  timeRange: 'last_30_days'
});

// Get quality scores by workflow phase
const quality = await copilot.metrics.getQualityScores({
  breakdown: 'workflow_phase',
  thresholds: [70, 80, 90, 95]
});
```

### Custom Dashboard
```markdown
## AI Agent Performance Dashboard

### PRU Efficiency
- **Avg PRU per User Story**: 12,500 (↓ 16.7% from last month)
- **Highest Efficiency**: dev-tdd-refactor (95% quality / 4.8K tokens = 19.8 score)
- **Lowest Efficiency**: dev-lead (92% quality / 18.2K tokens = 5.1 score) ⚠️

### Quality vs Cost
| Agent | Quality Score | Avg Tokens | Efficiency Score | Status |
|-------|--------------|------------|------------------|--------|
| dev-tdd-red | 98% | 4,200 | 23.3 | ✅ Excellent |
| dev-tdd-green | 97% | 3,800 | 25.5 | ✅ Excellent |
| dev-tdd-refactor | 95% | 4,800 | 19.8 | ✅ Good |
| dev-lead | 92% | 18,200 | 5.1 | ⚠️ Needs optimization |
| architect | 94% | 14,500 | 6.5 | ✅ Acceptable |
```

---

## Optimization Workflow

### Weekly PRU Review (Every Monday)
1. **Run usage report**: `npm run pru-report -- --week=last`
2. **Identify outliers**: Agents exceeding budget by >20%
3. **Analyze handoffs**: Find token waste patterns
4. **Propose optimizations**: Delta summaries, canonical references, snippet limits
5. **Test changes**: Validate quality scores maintained
6. **Deploy refinements**: Update agent prompts

### Monthly PRU Audit (End of Month)
1. **Calculate total usage**: Actual vs budget
2. **Trend analysis**: Month-over-month changes
3. **ROI assessment**: Quality maintained while reducing cost?
4. **Adjust budgets**: Reallocate PRU based on agent performance
5. **Report to stakeholders**: PRU efficiency dashboard

---

## Optimization Techniques by Agent

### Planning Agents (PM, PO, BA)
- **Use templates**: Pre-structured outputs reduce verbosity
- **Limit examples**: 1-2 examples instead of 5+
- **Focus on deltas**: Only new requirements/changes in updates

### Architecture Agents (Architect, Dev-Lead)
- **Canonical references**: Link to architecture-design.md instead of repeating
- **Diagram compression**: Use Mermaid (text) over PlantUML (image) when possible
- **Layered handoffs**: Pass only current layer context

### Implementation Agents (TDD)
- **Tight focus**: Single file, single test at a time
- **Minimal context**: Previous step result + current test
- **No history**: Don't pass 10 previous TDD cycles

### Review Agents (AI-Engineering, Orchestrator)
- **Quality metrics only**: Don't repeat full handoff content
- **Summary reports**: 200-word summaries instead of full reviews
- **Thresholds**: Only escalate issues, don't report all checks

---

## Applied To
- **ai-engineering**: Monitors PRU usage, generates optimization reports
- **orchestrator**: Reviews PRU alerts, approves workflow adjustments
- **All agents**: Follow token budgets and compression strategies

---

**Reference**:
- [context-optimization-strategy.md](../guides/context-optimization-strategy.md) for semantic handoff architecture
- [quality-metrics.md](../quality/quality-metrics.md) for quality scoring algorithms
