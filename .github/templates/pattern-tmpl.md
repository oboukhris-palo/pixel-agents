# Pattern: {Pattern Name}

> **Pattern ID**: `{phase-category-short-name}`  
> **Phase**: {PDLC Phase(s)}  
> **Category**: {PRU Waste / Time Reduction / Quality Improvement}  
> **Status**: {Draft / Active / Deprecated}  
> **Last Updated**: {YYYY-MM-DD}  
> **Author/Source**: {Project or contributor}

---

## Metadata

| Field | Value |
|-------|-------|
| **Pattern ID** | `{phase-category-short-name}` |
| **Phase(s)** | {00-assessment / 01-requirements / 02-architecture / 03-testing / 04-planning / 05-implementation / cross-phase} |
| **Problem Category** | {PRU Waste Reduction / Time-to-Value / Quality Improvement} |
| **Tags** | `#{tag1}`, `#{tag2}`, `#{tag3}` |
| **Applicable To** | {Languages / Frameworks / Domains} |
| **Estimated Savings** | {PRU: X%, Time: Y%, Quality: Z% defect reduction} |
| **Reusability** | {High / Medium / Low} |

---

## Context

### When to Use This Pattern

**Triggers** (when this pattern applies):
- {Trigger 1: Specific scenario or condition}
- {Trigger 2: Specific scenario or condition}
- {Trigger 3: Specific scenario or condition}

**Preconditions** (requirements before applying):
- {Precondition 1}
- {Precondition 2}

### When NOT to Use This Pattern

**Anti-patterns** (avoid in these scenarios):
- ❌ {Scenario where pattern doesn't apply}
- ❌ {Scenario where pattern creates more complexity}
- ❌ {Scenario where alternative is better}

**Exceptions**:
- {Specific exception case}

---

## Problem

### Problem Statement

{Clear, concise description of the problem this pattern solves. Focus on the pain point.}

### Impact Without Pattern

| Metric | Impact | Example |
|--------|--------|---------|
| **PRU Cost** | {X PRU wasted per instance} | {Example: Re-parsing interviews wastes 500 PRU each} |
| **Time** | {Y hours wasted per instance} | {Example: 2 hours rework per epic} |
| **Quality** | {Z% defect rate or rework cycles} | {Example: 40% of BDD scenarios need revision} |

### Root Cause

{Why does this problem occur? What underlying issue causes this waste/delay/defect?}

---

## Solution

### Overview

{High-level summary of the solution in 2-3 sentences.}

### Implementation Steps

**Step 1: {Step Title}**
- Action: {Detailed action description}
- Input: {What inputs are needed}
- Output: {What this step produces}
- Example:
  ```{language}
  {Code or template example}
  ```

**Step 2: {Step Title}**
- Action: {Detailed action description}
- Input: {What inputs are needed}
- Output: {What this step produces}
- Example:
  ```{language}
  {Code or template example}
  ```

**Step 3: {Step Title}**
- {Continue for all steps}

### Code/Template Example

```{language}
{Complete working example that demonstrates the pattern}
```

### Configuration (if applicable)

```yaml
{Configuration file or settings required}
```

---

## Expected Outcomes

### Success Criteria

✅ {Criteria 1: Measurable outcome}  
✅ {Criteria 2: Measurable outcome}  
✅ {Criteria 3: Measurable outcome}

### Metrics

| Metric | Before Pattern | After Pattern | Improvement |
|--------|----------------|---------------|-------------|
| **PRU Cost** | {X PRU} | {Y PRU} | {Z% reduction} |
| **Time** | {X hours} | {Y hours} | {Z% reduction} |
| **Quality** | {X defects/cycle} | {Y defects/cycle} | {Z% improvement} |

### Real-World Evidence

**Project Example 1**: {Project name}
- Context: {Brief context}
- Results: {Specific metrics achieved}
- Learnings: {Key takeaway}

**Project Example 2**: {Project name}
- Context: {Brief context}
- Results: {Specific metrics achieved}
- Learnings: {Key takeaway}

---

## Related Patterns

### Complementary Patterns (use together)

- [{Pattern Name}]({link}) — {How they work together}
- [{Pattern Name}]({link}) — {How they work together}

### Alternative Patterns (choose one)

- [{Pattern Name}]({link}) — {When to use this instead}
- [{Pattern Name}]({link}) — {When to use this instead}

### Sequential Patterns (use in sequence)

1. [{Pattern Name}]({link}) — {First step}
2. **This Pattern** — {Second step}
3. [{Pattern Name}]({link}) — {Third step}

---

## Validation Checklist

Use this checklist to verify correct implementation:

- [ ] {Validation item 1}
- [ ] {Validation item 2}
- [ ] {Validation item 3}
- [ ] {Validation item 4}
- [ ] {Validation item 5}

---

## Troubleshooting

### Common Issues

**Issue**: {Problem description}  
**Cause**: {Why it happens}  
**Solution**: {How to fix}

**Issue**: {Problem description}  
**Cause**: {Why it happens}  
**Solution**: {How to fix}

---

## History & Evolution

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | {YYYY-MM-DD} | Initial pattern captured from {Project} | {Author} |
| {X.Y} | {YYYY-MM-DD} | {Change description} | {Author} |

### Deprecation Notice (if applicable)

{If pattern is deprecated, explain why and what replaces it.}

---

## References

- [Link to related documentation]({URL})
- [Link to framework guide]({URL})
- [Link to external resource]({URL})

---

**Pattern Status**: {Draft / Active / Deprecated}  
**Maintainer**: {Name or role}  
**Feedback**: {How to provide feedback or suggest improvements}
