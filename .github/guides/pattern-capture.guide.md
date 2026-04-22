# Pattern Capture Workflow Guide

**Purpose**: Guide for documenting new patterns discovered during project execution  
**Audience**: Framework maintainers, team leads, agents  
**Version**: 1.0  
**Last Updated**: 2026-04-20

---

## Overview

The Pattern Library grows through **systematic capture** of proven solutions from real projects. This guide defines:
- **When to capture** a pattern (trigger criteria)
- **How to document** a pattern (template usage)
- **Quality standards** for pattern acceptance
- **Workflow** from identification → documentation → integration

---

## When to Capture a Pattern

### Trigger Criteria

Capture a pattern when **ANY** of these conditions met:

✅ **High PRU Waste Identified**:
- Solution reduces PRU consumption by ≥500 PRU per instance
- Solution prevents repeated context regeneration
- Solution eliminates redundant agent work

✅ **Reusability Validated**:
- Solution used successfully 3+ times across different projects
- Solution applies to ≥80% of projects in a category
- Solution generalizes beyond original context

✅ **Quality Improvement Proven**:
- Solution reduces defects by ≥30%
- Solution eliminates common rework cycles
- Solution prevents specific failure patterns

✅ **Time Savings Demonstrated**:
- Solution reduces phase completion time by ≥20%
- Solution eliminates bottlenecks or waiting time
- Solution accelerates agent workflows

### Examples of Pattern-Worthy Solutions

**DO CAPTURE**:
- ✅ BDD scenario templates (reused across 95% of projects, saves 40% PRU)
- ✅ Layer-by-layer TDD (eliminates 77% of integration bugs, saves 58% time)
- ✅ Epic decomposition templates (used in every requirements phase, saves 25% PRU)
- ✅ API-first design workflow (prevents 50% of rework cycles)

**DO NOT CAPTURE**:
- ❌ One-time solutions specific to single project
- ❌ Workarounds for transient bugs or issues
- ❌ Experimental approaches without validated outcomes
- ❌ Solutions with <10% improvement metrics

---

## Pattern Capture Workflow

### Step 1: Identify Pattern Opportunity

**During project execution**, monitor for:
- Agents repeatedly solving same problem independently
- Manual rework cycles due to missing guidance
- PRU spikes on tasks that should be standardized
- Quality issues that standard templates could prevent

**Capture trigger**: Recognize pattern when criteria met (see above)

### Step 2: Document Solution Context

**Before creating pattern file**, gather:

```markdown
## Pattern Context Documentation

**Problem Statement**:
- What challenge does this solve?
- What pain point does it address?
- What symptoms indicate this problem?

**Solution Overview**:
- What is the high-level approach?
- What are the key steps?
- What artifacts/templates are involved?

**Evidence**:
- Which project(s) used this solution?
- What metrics improved? (PRU, time, quality)
- How many times has it been reused?
- What was the before/after comparison?

**Applicability**:
- Which PDLC phases apply?
- Which project types benefit?
- Are there exceptions or anti-patterns?
```

### Step 3: Create Pattern File from Template

**Use pattern template**: `.github/templates/pattern-tmpl.md`

```bash
# Create pattern directory structure
mkdir -p .github/patterns/{phase}/{category}

# Copy template
cp .github/templates/pattern-tmpl.md \
   .github/patterns/{phase}/{category}/{pattern-name}.md

# Edit pattern file with solution details
```

**Fill in all sections** (see template for structure):
- Metadata (ID, phase, category, tags, savings)
- Context (when to use, when NOT to use)
- Problem (statement, impact, root cause)
- Solution (implementation steps, examples, config)
- Expected Outcomes (success criteria, metrics, evidence)
- Related Patterns (complementary, alternative, sequential)
- Validation Checklist
- Troubleshooting

### Step 4: Seed with Working Examples

**Include real code/template examples**:
- ✅ Code snippets that demonstrate pattern
- ✅ Configuration files (YAML, JSON, Markdown)
- ✅ Before/after comparisons
- ✅ Project-specific adaptations

**Examples should be**:
- **Working**: Copy-paste-ready, no placeholders
- **Commented**: Explain non-obvious logic
- **Realistic**: Real-world scenarios, not toy examples
- **Adapted**: Show domain-specific customizations

### Step 5: Validate Pattern Quality

**Use validation checklist** (see Pattern Quality Standards below)

Before submitting pattern, ensure:
- [ ] Problem clearly stated with impact metrics
- [ ] Solution has step-by-step implementation guide
- [ ] At least 1 real-world project example documented
- [ ] Metrics validated (PRU savings, time reduction, quality improvement)
- [ ] Edge cases and troubleshooting documented
- [ ] Related patterns cross-referenced
- [ ] Template format followed consistently

### Step 6: Integrate into Pattern Library

**Add to Pattern Library Index** (`.github/patterns/index.md`):

1. **Add to Pattern Catalog table**:
   ```markdown
   | **{Pattern Name}** | {Phase} | {Problem} | {Savings %} | [Link]({path}) |
   ```

2. **Update Statistics table**:
   ```markdown
   | **{Phase}** | {N patterns} | {Avg PRU savings} | {Avg time reduction} | {Quality boost} |
   ```

3. **Add to Search Index**:
   - By Phase section: Link to pattern
   - By Problem Type section: Link to pattern
   - By Tag section: Add pattern tags

### Step 7: Commit and Announce

**Git commit with pattern message**:
```bash
git add .github/patterns/{phase}/{category}/{pattern-name}.md
git add .github/patterns/index.md
git commit -m "PATTERN: Add {pattern-name} pattern

- Phase: {phase}
- Savings: {PRU/Time/Quality improvements}
- Validated on: {Project name(s)}
"
```

**Announce to team** (Slack, email, meeting):
- New pattern available: {pattern-name}
- Use case: {problem it solves}
- Estimated savings: {metrics}
- Link: `.github/patterns/{path}`

---

## Pattern Quality Standards

### Mandatory Requirements

All patterns MUST include:

✅ **Metadata Section**:
- Pattern ID (unique, kebab-case)
- Phase applicability (00-05, cross-phase)
- Problem category (PRU waste, time reduction, quality improvement)
- Tags (searchable keywords)
- Estimated savings (PRU %, time %, quality %)

✅ **Context Section**:
- When to use (trigger scenarios)
- When NOT to use (anti-patterns, exceptions)
- Preconditions (requirements before applying)

✅ **Problem Section**:
- Problem statement (clear, concise)
- Impact metrics (PRU cost, time waste, quality issues)
- Root cause analysis (why problem occurs)

✅ **Solution Section**:
- Implementation steps (numbered, actionable)
- Code/template examples (working, realistic)
- Configuration (if applicable)

✅ **Expected Outcomes Section**:
- Success criteria (measurable)
- Metrics table (before/after comparison)
- Real-world evidence (at least 1 project example)

✅ **Related Patterns Section**:
- Complementary patterns (use together)
- Alternative patterns (choose one)
- Sequential patterns (workflow sequence)

✅ **Validation Checklist**:
- Implementation verification checklist

✅ **Troubleshooting Section**:
- Common issues with solutions

### Quality Indicators

**High-quality patterns**:
- ✅ Documented from real project experience (not theoretical)
- ✅ Metrics validated across 2+ projects
- ✅ Clear before/after examples
- ✅ Troubleshooting section addresses real issues encountered
- ✅ Cross-referenced with related patterns
- ✅ Updated within last 12 months

**Low-quality patterns** (needs improvement):
- ⚠️ No real-world evidence (only theoretical)
- ⚠️ Metrics estimates (not validated)
- ⚠️ Generic examples (placeholders, toy scenarios)
- ⚠️ No troubleshooting section
- ⚠️ Isolated (no related patterns)
- ⚠️ Outdated (>12 months without review)

---

## Pattern Lifecycle Management

### Pattern States

| State | Description | Actions |
|-------|-------------|---------|
| **Draft** | Pattern identified, documentation in progress | Document problem, solution, examples |
| **Active** | Pattern validated, ready for use | Use in projects, gather feedback |
| **Deprecated** | Pattern replaced by better solution | Document replacement, redirect to new pattern |
| **Archived** | Pattern no longer applicable | Move to archive/, document reasons |

### Maintenance Schedule

**Monthly Review** (Framework Lead):
- Review pattern usage metrics (how many times referenced)
- Identify gaps (problems without patterns)
- Prioritize new pattern capture

**Quarterly Update** (Team):
- Add patterns from recent projects (2-3 patterns per quarter)
- Update existing patterns with new learnings
- Deprecate obsolete patterns

**Annual Audit** (Framework Team):
- Comprehensive pattern library review
- Archive unused patterns (0 usage in 12 months)
- Update metrics and evidence
- Reorganize taxonomy if needed

---

## Pattern Discovery Methods

### 1. Retrospective Mining

**After project completion**:
- Review decision trails and rework cycles
- Identify repeated challenges
- Extract solutions that worked
- Document patterns from lessons learned

### 2. Agent Action Analysis

**Monitor agent logs**:
- Identify PRU spikes on similar tasks
- Detect repeated problem-solving patterns
- Extract agent approaches that worked well
- Formalize successful agent workflows

### 3. Code Review Insights

**During code review**:
- Identify reusable design patterns
- Extract best practices from high-quality code
- Document anti-patterns to avoid
- Capture refactoring techniques

### 4. Stakeholder Feedback

**From stakeholder reviews**:
- Identify quality issues that repeat
- Extract validation techniques that prevent defects
- Document communication patterns that work
- Capture requirement clarification approaches

---

## Examples of Pattern Capture

### Example 1: BDD Scenario Template Library

**Pattern Discovery Path**:
1. **Observation**: BA agent spent 500-800 PRU writing BDD scenarios from scratch
2. **Analysis**: 70% of scenarios followed common patterns (CRUD, validation, authentication)
3. **Solution**: Created template library with edge case checklist
4. **Validation**: Applied to 5 projects → 40-50% PRU reduction validated
5. **Documentation**: Created pattern file with templates and examples
6. **Integration**: Added to pattern library, referenced in BA workflow

**Outcome**: Now standard practice; BA agents reference templates first

### Example 2: Layer-by-Layer TDD

**Pattern Discovery Path**:
1. **Observation**: Random layer implementation caused 35% integration bugs
2. **Analysis**: Bottom-up sequencing (Layer 1 → 2 → 3 → 4) prevented cascade failures
3. **Solution**: Documented strict layer sequencing with checkpoint enforcement
4. **Validation**: Applied to 3 projects → 77% integration bug reduction validated
5. **Documentation**: Created pattern with implementation plan examples
6. **Integration**: Updated dev-tdd orchestrator to enforce sequencing

**Outcome**: Now enforced by framework; dev agents follow layer-by-layer automatically

---

## Related Documentation

- **Pattern Library Index**: `.github/patterns/index.md` — Complete pattern catalog
- **Pattern Template**: `.github/templates/pattern-tmpl.md` — Standard format
- **Pattern Quality Standards**: This document (Pattern Quality Standards section)
- **PRU Optimization Guide**: `.github/instructions/pru-optimization.instructions.md` — Cost reduction strategies

---

**Status**: ACTIVE | **Maintainer**: Framework Lead | **Last Updated**: 2026-04-20
