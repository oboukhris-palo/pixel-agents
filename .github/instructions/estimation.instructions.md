---
applyTo: '**'
description: AI-era estimation framework for user stories and epics (PM-owned)
priority: high
enforcement: strict
---

# AI-Era Estimation Framework Instructions

## Overview

Traditional man-day estimation (5 story points = 3 days) breaks down in the AI-first delivery era. This framework provides **Project Manager-led estimation** that accounts for AI code generation acceleration, context quality, team skill levels, and integration complexity.

**Ownership**: Project Manager (PM) estimates stories, aggregates epics, forecasts project timelines.

**Privacy**: Team skill assessments stored in `.github/team-profile.yml` (internal only, NEVER in stakeholder documents).

---

## Core Formula

```
FINAL_ESTIMATE = (BASE_TIME × CONTEXT_FACTOR × SKILL_FACTOR) + INTEGRATION_BUFFER
```

**Components**:
- **BASE_TIME**: Layer-by-layer work breakdown (Domain → Service → API → UI)
- **CONTEXT_FACTOR**: Documentation quality multiplier (0.7× to 4.0×)
- **SKILL_FACTOR**: Team experience with tech stack (0.8× to 2.0×)
- **INTEGRATION_BUFFER**: Coordination overhead (10% to 100%)

---

## Step 1: Classify Work by AI Effectiveness

### 🟢 RED Work (50-70% AI Acceleration)
**What**: Boilerplate, test generation, scaffolding, CRUD endpoints, data models
**AI Role**: Generates 70%+ of code structure; developer validates
**Time Reduction**: ~4-6 hours → 1-2 hours

**Examples**:
- Writing BDD scenarios from acceptance criteria
- Generating entity classes with validation
- Creating API endpoint stubs
- Test file generation

### 🟡 YELLOW Work (20-40% AI Acceleration)
**What**: Business logic, service orchestration, integration, refactoring
**AI Role**: Suggests patterns; developer implements and verifies
**Time Reduction**: 2-4 hours → 1.5-3 hours

**Examples**:
- Service layer orchestration
- State management patterns
- Database migration logic
- Component composition

### 🔴 ORANGE Work (5-20% AI Acceleration)
**What**: Complex domain logic, debugging, optimization, novel algorithms
**AI Role**: Assistant only; human does heavy thinking
**Time Reduction**: 1-2 hours → 0.8-1.8 hours

**Examples**:
- Performance tuning and profiling
- Production debugging
- Novel business rule implementation
- Complex state machine logic

---

## Step 2: Base Time by Layer (Optimistic Case)

**Assumes**: Good documentation, team familiar with stack, clear acceptance criteria

| Layer | Manual | AI-Assisted | AI Effectiveness | Notes |
|-------|--------|-------------|------------------|-------|
| **Layer 1: Domain** | 2-4h | 1-1.5h | HIGH (RED) | Test-driven, well-defined |
| **Layer 2: Service** | 3-6h | 1.5-2.5h | MEDIUM (YELLOW) | Business logic iteration |
| **Layer 3: API** | 2-4h | 0.5-1h | HIGH (RED) | Documented contracts |
| **Layer 4: UI** | 3-5h | 1-2h | MEDIUM (YELLOW) | Variations, accessibility |
| **Testing** | 4-8h | 1.5-3h | HIGH (RED) | Test generation, edge cases |
| **TOTAL** | **14-27h** | **6-10h** | **50-60% reduction** | |

**Layer Complexity Adjustments**:
- **Simple Story**: Use lower bounds (6h total)
- **Medium Story**: Use midpoints (8h total)
- **Complex Story**: Use upper bounds (10h+ total)

---

## Step 3: Apply Context Quality Multiplier

**Context = Documentation clarity + Acceptance criteria + Schema definition + API contracts**

| Quality Level | Factor | Indicators | When to Apply |
|---------------|--------|------------|---------------|
| 🟢 **Excellent** | ×0.7-0.8 | Clear specs, schema defined, BDD written, API documented | Use base hours as-is |
| 🟡 **Good** | ×1.0-1.2 | Mostly clear, some ambiguity, examples exist | Add 10-20% |
| 🟠 **Moderate** | ×1.5-2.0 | Vague specs, unclear schema, minimal examples | Add 50-100% |
| 🔴 **Poor** | ×2.5-4.0 | Missing specs, conflicting info, no examples | 2x-4x base time |

**Assessment Checklist** (PM evaluates during story review):
- ☐ Acceptance criteria clear and PO-validated? (20%)
- ☐ Database schema specified? (20%)
- ☐ API contracts documented? (20%)
- ☐ BDD scenarios written? (20%)
- ☐ UI/design specifications detailed? (20%)

**Score Calculation**: (Checks passed / 5)
- 80-100% → EXCELLENT (×0.8)
- 60-79% → GOOD (×1.1)
- 40-59% → MODERATE (×1.7) ← **Most common**
- 20-39% → POOR (×3.0)
- <20% → MISSING (×4.0)

---

## Step 4: Apply Team Skill Multiplier

**Note**: Skill levels stored in `.github/team-profile.yml` (internal only, NEVER in stakeholder documents)

| Experience Level | Factor | Indicators |
|------------------|--------|------------|
| 🟢 **Senior** (5+ years) | ×0.8 | Expert in stack, quickly validates AI output |
| 🟡 **Mid** (2-4 years) | ×1.0 | Solid foundation, baseline assumption |
| 🟠 **Junior** (0-2 years) | ×1.3-1.5 | Learning curve, validation time |
| 🔴 **New to Stack** | ×1.5-2.0 | Expert in other tech, new to this stack |

**Combine Factors**: If junior dev new to stack: ×1.4 × ×1.6 = ×2.24

**Where PM Gets This Info**: Reference `.github/team-profile.yml` (maintained by PM/Dev-Lead)

---

## Step 5: Add Integration & Risk Buffer

| Scenario | Buffer % | Reason |
|----------|----------|--------|
| **Isolated Story** | +10-15% | Minimal cross-team coordination |
| **Story Dependencies** | +25-40% | Waiting on other stories, API handoffs |
| **High Uncertainty** | +30-50% | Unclear requirements, new patterns |
| **External Dependencies** | +20-100% | Third-party APIs, DevOps, procurement delays |
| **Performance-Critical** | +15-30% | Profiling, optimization, load testing |
| **Cross-Team Coordination** | +30-50% | Billing, payments, compliance reviews |

**Multiple Buffers**: Use highest applicable (don't stack all of them)

---

## Complete Worked Examples

### Example 1: Simple Story (Good Context)

**Story**: US-015 - Display user profile data
- **Base Time**: 6 hours (simple CRUD)
- **Context Quality**: EXCELLENT (clear specs, schema done, BDD written) → ×0.8
- **Team**: Mid-level dev → ×1.0
- **Integration**: Isolated (internal only) → +15%

**Calculation**:
```
6 × 0.8 × 1.0 = 4.8 hours
4.8 + (4.8 × 0.15) = 5.52 hours
```

**FINAL ESTIMATE**: **5.5 hours** (~0.7 days)

---

### Example 2: Complex Story (Moderate Context)

**Story**: US-025 - Customer tier upgrade with credit sync
- **Base Time**: 10 hours (4 layers, complex business logic)
- **Context Quality**: MODERATE (specs 60%, missing schema detail) → ×1.7
- **Team**: Junior dev, first C# project → ×1.5
- **Integration**: Billing API + notifications → +35%

**Calculation**:
```
10 × 1.7 × 1.5 = 25.5 hours
25.5 + (25.5 × 0.35) = 34.43 hours
```

**FINAL ESTIMATE**: **34.5 hours** (~4.3 days at 8h/day)

**PM Note**: Recommend senior dev pairing for Layer 2 (business logic) to reduce risk.

---

### Example 3: Epic Estimation (5 Stories)

**Epic**: AUTH-001 - User Authentication

| Story | Base | Context | Skill | Subtotal | Buffer | Final |
|-------|------|---------|-------|----------|--------|-------|
| US-001: Login endpoint | 6h | ×0.8 | ×1.0 | 4.8h | +15% | 5.5h |
| US-002: Password reset | 8h | ×1.2 | ×1.0 | 9.6h | +25% | 12h |
| US-003: OAuth integration | 12h | ×1.5 | ×1.3 | 23.4h | +40% | 32.8h |
| US-004: Session mgmt | 7h | ×1.0 | ×1.0 | 7h | +20% | 8.4h |
| US-005: Auth UI | 8h | ×1.2 | ×1.0 | 9.6h | +15% | 11h |
| **Subtotal** | **41h** | | | **54.4h** | | **69.7h** |

**Epic Coordination Overhead**: +15% (API handoffs, schema dependencies) = +10.5h
**Security Review**: +10% (auth is critical) = +7h
**Buffer for Unknowns**: +20% (OAuth first time) = +14h

**EPIC TOTAL**: 69.7 + 10.5 + 7 + 14 = **101.2 hours** (~12.6 days, ~2.5 weeks)

**Project-Level Insight**: If team = 2 devs, calendar time = ~1.5 weeks with parallelization

---

## Project-Level Estimation

**Formula**:
```
PROJECT_TIME = Σ(EPIC_TIME) + SYSTEM_INTEGRATION + E2E_TESTING + DISCOVERY_BUFFER
```

**Example Project**: 3 Epics

| Component | Hours | Notes |
|-----------|-------|-------|
| Epic 1 (AUTH) | 101h | Authentication |
| Epic 2 (PAY) | 145h | Payment processing (external API) |
| Epic 3 (REPORTS) | 78h | Reporting dashboard |
| **Subtotal** | **324h** | |
| System Integration (+15%) | +49h | Cross-epic API contracts, DB joins |
| E2E Testing (+10%) | +32h | Full workflow testing |
| Discovery/Clarification (+20%) | +65h | Questions, spec updates, unknowns |
| **PROJECT TOTAL** | **470 hours** | ~59 developer-days (~12 weeks for 2 devs) |

**Calendar Estimate**: With 2 developers, parallelization, meetings → **3-4 months** realistic delivery

---

## PRU Supplementary Tracking

**Use alongside time estimates for cost visibility** (not a replacement):

**Per-Story PRU Costs**:
- Dev-Lead planning: ~500 PRU
- RED phase (per cycle): ~300-600 PRU
- GREEN phase (per cycle): ~400-800 PRU
- REFACTOR phase (per cycle): ~200-400 PRU
- QA review: ~300-500 PRU

**Total per Story**: ~2000-3500 PRU (~$4-7 GPT-4 equivalent)

**Project Budget**: 50 stories × 2500 PRU avg = **125,000 PRU** (~$250-300)

**Use PRU For**:
- Monthly budget tracking (alert at 75%, 90%, 100%)
- Cost per story trending
- Identifying over-reliance on AI
- Capacity planning (PRU/day metric)

---

## PM Workflow Integration

### When PM Estimates Stories

**Timing**: STAGE 3 (after PO creates stories, before architecture finalized)

**Process**:
1. **Assess Context Quality** (5 min per story)
   - Review acceptance criteria clarity
   - Check schema documentation status
   - Verify API contract availability
   - Confirm BDD scenario completeness
   - Score: (Checks / 5) × 100 = context %

2. **Estimate Base Hours by Layer** (10 min per story)
   - Classify work type (RED/YELLOW/ORANGE)
   - Break down by architectural layers
   - Apply complexity adjustments
   - Sum base hours

3. **Apply Multipliers** (5 min per story)
   - Look up team skill level from `.github/team-profile.yml`
   - Apply context multiplier
   - Apply skill multiplier
   - Calculate subtotal

4. **Add Integration Buffer** (5 min per story)
   - Identify dependencies (other stories, external APIs)
   - Assess uncertainty level
   - Apply buffer percentage
   - Calculate final estimate

5. **Document Rationale** (3 min per story)
   - Write estimation notes in story YAML
   - Flag risks or assumptions
   - Recommend mitigations (pairing, spikes, tech debt)

**Total Time**: ~30 min per story for rigorous estimation

---

### Epic-Level Aggregation

**After all stories estimated**:
1. Sum story estimates
2. Add epic coordination overhead (+10-20%)
3. Add cross-story dependencies (+5-15%)
4. Add risk buffer (+15-30% for high-risk epics)
5. Document epic total in epic YAML

**PM tracks**:
- Epic budget (hours)
- Epic velocity (story completion rate)
- Epic burn-down (remaining hours)

---

### Project-Level Forecasting

**Quarterly Planning**:
1. Sum all epic estimates
2. Add system integration overhead (+10-20%)
3. Add E2E testing buffer (+10-15%)
4. Add discovery/clarification buffer (+20-30%)
5. Calculate calendar time with team size
6. Present 3 scenarios to stakeholders:
   - **Conservative**: Use high-end multipliers + 40% buffer
   - **Balanced**: Use midpoint multipliers + 25% buffer
   - **Aggressive**: Use low-end multipliers + 15% buffer

---

## Estimation Quality Gates

### Pre-Estimation Checklist (PM Validates Before Estimating)
✅ Story has PO-validated acceptance criteria
✅ Story sized appropriately (not >10 hour-equivalent)
✅ Dependencies identified and understood
✅ Tech stack and team assignments known
✅ Similar stories available for benchmarking

### Post-Estimation Review (PM Self-Check)
✅ Estimate has clear rationale documented
✅ Multipliers justified with evidence
✅ Buffer is explicit (not hidden in base hours)
✅ Risks documented with mitigation plan
✅ Confidence level appropriate for uncertainty

---

## Estimation Accuracy Tracking

**After each sprint**, PM compares actual vs. estimated:

| Story | Estimated | Actual | Variance | Root Cause | Learning |
|-------|-----------|--------|----------|------------|----------|
| US-001 | 5.5h | 4.2h | -24% | Context better than assessed | Lower context multiplier next time |
| US-002 | 12h | 14.5h | +21% | API contract unclear | Add +20% buffer for API deps |
| US-003 | 32.8h | 30h | -9% | Senior dev paired with junior | Pairing reduces risk |

**Quarterly Calibration**:
- If consistently under-estimating → increase buffers by 10%
- If consistently over-estimating → reduce multipliers by 10%
- Track by team, tech stack, story type
- Update `.github/team-profile.yml` as skills evolve

---

## Common Pitfalls & Solutions

| Pitfall | Why It Fails | Solution |
|---------|--------------|----------|
| **No context assessment** | Optimism bias | Use 5-point checklist, score every story |
| **Skip integration buffer** | Hidden coordination work | Add minimum +25% for cross-team stories |
| **Ignore team skill** | One-size-fits-all fails | Reference team-profile.yml, apply multiplier |
| **Estimate alone** | Groupthink/blind spots | Review with Dev-Lead, get dissenting views |
| **No tracking** | Can't improve | Track actual vs. estimated, calibrate quarterly |
| **Hide team info in story** | Unprofessional, privacy risk | Store in internal team-profile.yml only |

---

## Privacy & Professionalism Rules

### ✅ ALWAYS Store Team Info Here
- `.github/team-profile.yml` (internal file, git-ignored for client repos)
- PM's private notes/spreadsheets
- HR systems (if integrated)

### ❌ NEVER Include Team Info In
- User story YAML files (stakeholder-visible)
- Epic YAML files
- PRD documents
- Client-facing reports
- Git commit messages

**Why**: Labeling developers as "junior" or "low skill" in documents is:
- Unprofessional and demoralizing
- Privacy violation in some jurisdictions
- Creates liability if leaked to stakeholders
- Undermines team confidence

**Instead**: Use anonymous skill factors in story YAML (e.g., `skillMultiplier: 1.5` without developer names)

---

## Related Documentation

- **Workflow Integration**: Phase-specific workflows (`01-requirements.workflows.yml`, `02-architecture.workflows.yml`, `03-testing.workflows.yml`, `04-planning.workflows.yml`) - STAGE 3.5 estimation process
- **Team Tracking**: `.github/team-profile.yml` (INTERNAL ONLY - skill levels, experience)
- **User Story Template**: `.github/templates/user-story-tmpl.yml` (estimation section structure)
- **Epic Template**: `.github/templates/epic-tmpl.yml` (epic-level aggregation)
- **PRU Optimization**: `.github/instructions/pru-optimization.instructions.md` (cost tracking)

---

**Version**: 1.0  
**Created**: April 2026  
**Owner**: Project Manager (PM)  
**Status**: ACTIVE
