# Gene2 Framework Pattern Library

**Version**: 1.0  
**Purpose**: Institutional memory system capturing reusable PDLC patterns, solutions, and best practices from past projects  
**Scope**: Cross-project knowledge sharing to reduce PRU costs and accelerate delivery  
**Status**: ACTIVE

---

## Overview

The Pattern Library is a curated collection of **proven solutions to recurring challenges** encountered across gene2 PDLC projects. Each pattern documents:
- **Context**: When to use this pattern
- **Problem**: What challenge it solves
- **Solution**: Detailed implementation with examples
- **Outcomes**: Metrics (PRU savings, time reduction, quality improvement)
- **Related Patterns**: Cross-references to similar or complementary patterns

---

## Pattern Library Structure

```
.github/patterns/
├── index.md                          # THIS FILE - Pattern catalog and search index
├── assessment/                       # Phase 00-assessment patterns
│   ├── tier-classification/          # Client maturity assessment patterns
│   ├── interview-synthesis/          # Stakeholder interview patterns
│   └── ai-readiness/                 # AI readiness assessment patterns
├── requirements/                     # Phase 01-requirements patterns
│   ├── epic-decomposition/           # Breaking down large domains
│   ├── acceptance-criteria/          # Writing effective AC
│   └── persona-development/          # User persona patterns
├── architecture/                     # Phase 02-architecture patterns
│   ├── tech-stack-selection/         # Technology choice patterns
│   ├── api-design/                   # API design patterns
│   └── database-schema/              # Schema design patterns
├── testing/                          # Phase 03-testing patterns
│   ├── bdd-scenarios/                # BDD scenario writing patterns
│   ├── edge-case-identification/     # Edge case patterns
│   └── test-data-generation/         # Test data patterns
├── planning/                         # Phase 04-planning patterns
│   ├── estimation/                   # Estimation patterns
│   ├── sprint-planning/              # Sprint organization patterns
│   └── dependency-management/        # Dependency tracking patterns
├── implementation/                   # Phase 05-implementation patterns
│   ├── tdd-cycles/                   # TDD cycle optimization patterns
│   ├── refactoring/                  # Refactoring patterns
│   └── code-review/                  # Code review patterns
├── prompts/                          # AI prompt engineering patterns
│   ├── context-optimization/         # Context window optimization
│   ├── structured-outputs/           # JSON/YAML generation patterns
│   └── chain-of-thought/             # Reasoning patterns
└── workflows/                        # Cross-phase workflow patterns
    ├── handoff-protocols/            # Agent handoff patterns
    ├── quality-gates/                # Quality gate patterns
    └── rework-loops/                 # Rework minimization patterns
```

---

## Pattern Catalog (Quick Reference)

### By Problem Category

#### 🎯 High-PRU Waste Areas (50-65% savings potential)
| Pattern | Phase | Problem | PRU Savings | Link |
|---------|-------|---------|-------------|------|
| **Reusable Personas** | 01-requirements | Regenerating persona profiles every project | 30-40% | [Link](requirements/persona-development/reusable-personas.md) |
| **Epic Template Library** | 01-requirements | Writing epics from scratch | 25-35% | [Link](requirements/epic-decomposition/epic-templates.md) |
| **BDD Scenario Templates** | 03-testing | Writing BDD scenarios without examples | 40-50% | [Link](testing/bdd-scenarios/template-library.md) |
| **Architecture Decision Records** | 02-architecture | Redoing tech stack evaluations | 20-30% | [Link](architecture/tech-stack-selection/adr-templates.md) |
| **Prompt Chains** | All phases | Inefficient multi-turn conversations | 35-45% | [Link](prompts/chain-of-thought/prompt-chains.md) |

#### ⚡ Time-to-Value Acceleration (20-40% faster)
| Pattern | Phase | Problem | Time Reduction | Link |
|---------|-------|---------|----------------|------|
| **Interview Synthesis Framework** | 00-assessment | Slow stakeholder interview analysis | 30-40% | [Link](assessment/interview-synthesis/framework.md) |
| **API-First Design** | 02-architecture | Rework from implementation-first approach | 25-35% | [Link](architecture/api-design/api-first-pattern.md) |
| **TDD Layer-by-Layer** | 05-implementation | Poorly structured TDD cycles | 20-30% | [Link](implementation/tdd-cycles/layer-by-layer-tdd.md) |

#### ✅ Quality Improvement (30-50% fewer defects)
| Pattern | Phase | Problem | Quality Boost | Link |
|---------|-------|---------|---------------|------|
| **Edge Case Checklist** | 03-testing | Missing edge cases in BDD scenarios | 40-50% | [Link](testing/edge-case-identification/checklist.md) |
| **Code Review Automation** | 05-implementation | Manual code review fatigue | 30-40% | [Link](implementation/code-review/automated-checklist.md) |
| **Acceptance Criteria Validator** | 01-requirements | Ambiguous acceptance criteria | 35-45% | [Link](requirements/acceptance-criteria/validator-checklist.md) |

---

## How to Use This Library

### For Agents

**Before starting any PDLC phase task:**
1. **Search for related patterns** using the Pattern Catalog above
2. **Review pattern applicability** to current project context
3. **Apply pattern** and adapt to specific needs
4. **Capture new learnings** if pattern needs modification (see Pattern Capture Workflow below)

### For Framework Maintainers

**Pattern Maintenance Workflow:**
1. **Monthly review**: Assess pattern usage and effectiveness
2. **Quarterly updates**: Add new patterns from recent projects
3. **Annual pruning**: Archive obsolete patterns
4. **Quality gates**: Ensure patterns meet quality standards (see Pattern Quality Checklist below)

---

## Pattern Quality Standards

Every pattern MUST include:

✅ **Metadata**:
- Pattern ID (unique identifier)
- Phase applicability (which PDLC phases)
- Problem category (PRU waste, time reduction, quality improvement)
- Last updated date
- Author/source (which project contributed this pattern)

✅ **Context**:
- When to use this pattern (triggers, preconditions)
- When NOT to use (anti-patterns, exceptions)

✅ **Problem**:
- Clear problem statement
- Impact metrics (cost, time, quality)

✅ **Solution**:
- Step-by-step implementation guide
- Code/template examples
- Expected outcomes

✅ **Validation**:
- Success criteria
- Metrics to measure effectiveness
- Related patterns (cross-references)

---

## Pattern Capture Workflow

**When to capture a pattern:**
- ✅ Solved a problem that wasted >500 PRU
- ✅ Found a reusable solution used 3+ times
- ✅ Discovered a quality improvement technique

**How to capture:**
1. Create pattern file: `.github/patterns/{phase}/{category}/{pattern-name}.md`
2. Use Pattern Template: `.github/templates/pattern-tmpl.md`
3. Document problem, solution, outcomes
4. Add to Pattern Catalog (this index)
5. Cross-reference related patterns
6. Commit with message: `PATTERN: Add {pattern-name} pattern`

---

## Search Index

**By Phase**:
- [Assessment Patterns](assessment/) — Client maturity, interviews, AI readiness
- [Requirements Patterns](requirements/) — Epics, stories, acceptance criteria, personas
- [Architecture Patterns](architecture/) — Tech stack, API design, database schema
- [Testing Patterns](testing/) — BDD scenarios, edge cases, test data
- [Planning Patterns](planning/) — Estimation, sprint planning, dependencies
- [Implementation Patterns](implementation/) — TDD cycles, refactoring, code review
- [Prompt Patterns](prompts/) — Context optimization, structured outputs, reasoning

**By Problem Type**:
- [PRU Waste Reduction](#-high-pru-waste-areas-50-65-savings-potential)
- [Time-to-Value Acceleration](#-time-to-value-acceleration-20-40-faster)
- [Quality Improvement](#-quality-improvement-30-50-fewer-defects)

**By Tag**:
- `#epic-decomposition` — Breaking down large domains
- `#bdd-scenarios` — BDD scenario writing
- `#api-design` — API design patterns
- `#tdd-cycles` — TDD optimization
- `#persona-development` — User persona patterns
- `#tech-stack-selection` — Technology choice patterns
- `#estimation` — Estimation patterns
- `#context-optimization` — AI prompt optimization
- `#code-review` — Code review patterns
- `#rework-reduction` — Rework minimization

---

## Pattern Statistics

| Category | Patterns | Avg PRU Savings | Avg Time Reduction | Quality Boost |
|----------|----------|-----------------|---------------------|---------------|
| **Assessment** | TBD | TBD | TBD | TBD |
| **Requirements** | TBD | TBD | TBD | TBD |
| **Architecture** | TBD | TBD | TBD | TBD |
| **Testing** | TBD | TBD | TBD | TBD |
| **Planning** | TBD | TBD | TBD | TBD |
| **Implementation** | TBD | TBD | TBD | TBD |
| **Prompts** | TBD | TBD | TBD | TBD |
| **Workflows** | TBD | TBD | TBD | TBD |

---

## Related Documentation

- **Pattern Template**: `.github/templates/pattern-tmpl.md` — Standard format for new patterns
- **Pattern Capture Workflow**: `.github/guides/pattern-capture.guide.md` — How to document new patterns
- **Quality Standards**: `.github/guides/pattern-quality-standards.md` — Quality criteria for patterns
- **PRU Optimization Guide**: `.github/instructions/pru-optimization.instructions.md` — Cost reduction strategies

---

**Status**: ACTIVE | **Maintainer**: Framework Lead | **Last Updated**: April 20, 2026
