# Implementation KPIs Scripts

Tools for measuring, tracking, and validating implementation quality metrics during AI-first delivery.

## Scripts

### `collect-metrics.mjs`
**Purpose**: Collects A/B testing metrics for prompt variants and agent performance

**Collects**:
- Prompt variant execution times and success/failure rates
- Agent performance metrics (accuracy, latency, cost)
- Comparison data between variant A/B trials
- Historical trends for optimization analysis

**Functionality**:
- Records metrics to timestamped JSON files
- Generates comparative reports between variants
- Tracks promotion history for variants
- Calculates statistical significance

**Usage**:
```bash
node implementation-kpis/collect-metrics.mjs [options]

Options:
  --agent <name>         Collect metrics for specific agent
  --variant <id>         Collect metrics for specific variant
  --generate-report      Generate comparison report
  --period <days>        Historical period to analyze (default: 7)
  --export <format>      Export format: json|csv|markdown (default: json)
```

**Example**:
```bash
# Collect metrics for all agents
node implementation-kpis/collect-metrics.mjs

# Generate report for specific agent
node implementation-kpis/collect-metrics.mjs --agent orchestrator --generate-report

# Export 30-day trend as CSV
node implementation-kpis/collect-metrics.mjs --period 30 --export csv

# Compare variants
node implementation-kpis/collect-metrics.mjs --variant variant1 --generate-report
```

**Output Locations**:
- Metrics: `.github/prompts/variants/metrics/`
- Config: `.github/prompts/variants/config.json`
- History: `.github/prompts/variants/promotion-history.jsonl`

**Metrics Tracked**:
```json
{
  "agent": "orchestrator",
  "variant_id": "variant-2026-001",
  "timestamp": "2026-04-09T14:35:22Z",
  "execution_time_ms": 4523,
  "success_rate": 0.98,
  "error_rate": 0.02,
  "pru_consumed": 1250,
  "quality_score": 0.87,
  "user_satisfaction": 4.5
}
```

### `validate-prompts.mjs`
**Purpose**: Validates all system prompts against quality standards

**Validates**:
- No placeholder text (`[TODO]`, `[PLACEHOLDER]`, `[FILL IN]`)
- Minimum quality (≥400 lines recommended)
- Required sections present (overview, capabilities, examples, etc.)
- Valid markdown formatting
- No broken links or references
- Metadata completeness (version, status, dependencies)

**Usage**:
```bash
node implementation-kpis/validate-prompts.mjs [options]

Options:
  --agent <name>         Validate specific agent prompt
  --strict               Fail on any violation (exit 1)
  --fix                  Attempt to fix common issues
  --generate-report      Create validation report
```

**Example**:
```bash
# Validate all prompts
node implementation-kpis/validate-prompts.mjs

# Validate with strict mode
node implementation-kpis/validate-prompts.mjs --strict

# Generate validation report
node implementation-kpis/validate-prompts.mjs --generate-report

# Validate specific agent
node implementation-kpis/validate-prompts.mjs --agent dev-tdd-red
```

**Quality Standards**:
- ✅ **No Placeholders**: All `[TODO]`, `[PLACEHOLDER]`, etc. must be resolved
- ✅ **Minimum Length**: 400+ lines recommended (ensures comprehensive instructions)
- ✅ **Required Sections**: 
  - Role/Persona (who is this agent?)
  - Capabilities (what can it do?)
  - Examples (how does it work?)
  - Constraints (what can't it do?)
  - Handoffs (who receives output?)
- ✅ **Metadata**: Version, creation date, dependencies
- ✅ **Formatting**: Valid markdown with proper headers and links

**Failure Examples** (will block validation):
```
❌ [TODO] Add examples for validation strategy
❌ [PLACEHOLDER] Handoff definition needed
❌ Version not specified in metadata
❌ Missing "Capabilities" section
❌ Broken link: (./non-existent-file.md)
```

**Expected Agents**:
```
orchestrator, pm, po, ba, ux, architect, dev-lead,
dev-tdd-red, dev-tdd-green, dev-tdd-refactor, ai-engineering, qa, meeting-assistant
```

**Output Format**:
```
✅ orchestrator.agent.md (4250 lines, 15 sections, all valid)
⚠️  ba.agent.md (2100 lines) - Below recommended minimum
❌ dev-tdd-red.agent.md - Contains 3 [TODO] placeholders
```

## Metrics & Reporting

### KPI Dashboards
Both scripts support automated reporting:

```bash
# Generate weekly metrics summary
node implementation-kpis/collect-metrics.mjs --period 7 --generate-report

# Generate quality validation report
node implementation-kpis/validate-prompts.mjs --generate-report

# Export for analytics
node implementation-kpis/collect-metrics.mjs --export csv > metrics-export.csv
```

### Integration with CI/CD

**Pre-publication checks** (before pushing to remote):
```yaml
- name: Validate Prompts
  run: node .github/scripts/implementation-kpis/validate-prompts.mjs --strict

- name: Collect Baseline Metrics
  run: node .github/scripts/implementation-kpis/collect-metrics.mjs --generate-report
```

**Decision gates** (quality validation):
```yaml
- name: Validate Quality Standards
  run: |
    node .github/scripts/implementation-kpis/validate-prompts.js --strict
    if [ $? -ne 0 ]; then
      echo "❌ Prompt validation failed. Fix issues before proceeding."
      exit 1
    fi
```

## Configuration

Scripts read from `.github/prompts/variants/config.json`:

```json
{
  "metrics_retention_days": 30,
  "min_prompt_lines": 400,
  "required_sections": ["overview", "capabilities", "examples", "constraints"],
  "placeholder_patterns": ["\\[TODO\\]", "\\[PLACEHOLDER\\]", "\\[FILL IN\\]"],
  "min_quality_score": 0.75
}
```

## Common Issues

**Issue**: "Directory not found: .github/prompts/variants/"
- **Solution**: Create directory structure: `mkdir -p .github/prompts/variants/{metrics,}`

**Issue**: No metrics files generated
- **Solution**: Ensure prompts are being executed; check that metric recordings are being called

**Issue**: Validation reports empty
- **Solution**: Verify agent prompts exist at `.github/prompts/agent-system-prompts/`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot read config" | Ensure `.github/prompts/variants/config.json` exists |
| No metrics collected | Verify agents are running and calling metric collection |
| Validation skipped | Check file permissions in `.github/prompts/` |
| Report generation fails | Ensure write permissions for output directory |

---

**Created**: 2026-04-09  
**Framework**: Gen-e2 v2.0.0  
**Location**: `.github/scripts/implementation-kpis/`
