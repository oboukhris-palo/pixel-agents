# Requirements Workflow (Phases 1-2)

**Workflow ID:** REQUIREMENTS-001  
**PDLC Phase:** Phases 1-2 (Requirements Definition)  
**Output Location:** `/docs/01-requirements/`  
**Input:** Assessment handoff from `00-assessment.workflows.md`  
**Handoff Target:** `02-architecture.workflows.md`  
**Agents:** PM (coordination), PO (product definition, epic ownership), BA (requirements/BDD, validation), Architect (feasibility)  
**Logging:** `/logs/01-requirements/agent-{name}-YYYYMMDD.md`  
**Quality Gate:** `.github/gates/gate-01-requirements.md`

---

## Referenced Artifacts

### Templates
- `.github/templates/epic-tmpl.yml` — Epic metadata schema (Jira-compatible)
- `.github/templates/user-story-tmpl.yml` — User story schema with epic linkage
- `.github/templates/prd-tmpl.yml` — Product requirements document template
- `.github/templates/agent-log-tmpl.md` — Agent logging format
- `.github/templates/gate-report-tmpl.md` — Quality gate report format

### Quality Gates
- `.github/gates/gate-01-requirements.md` — Phase 1-2 validation (epic-story linkage, BDD format, PO sign-off)

### Guides
- `.github/guides/gate-blocker-resolution.guide.md` — Blocker resolution strategies
- `.github/guides/pattern-capture.guide.md` — Pattern documentation workflow

### Instructions
- `.github/instructions/documentation.instructions.md` — Documentation standards
- `.github/instructions/framework-standards.instructions.md` — Naming conventions
- `.github/instructions/agent-logging.instructions.md` — Mandatory logging rules
- `.github/instructions/estimation.instructions.md` — AI-era estimation framework (Stage 3.5)

### Scripts
- `.github/scripts/update-decision-trail.mjs` — Decision trail automation (after gate execution)

---

## Overview

This workflow covers **Phases 1-2** of the PDLC: Requirements Gathering and Analysis & Business Justification. It transforms assessment handoff artifacts into a complete requirements suite including PRD, personas, business case, and user stories organized by epics.

**Routing Context:** This workflow is executed after route selection in Phase 0 (assessment). The approach varies by client maturity tier — see `00-assessment.workflows.md` for routing decision framework (Routes A/B/C/D).

---

## Epic-Story Document Structure & Hierarchy

**Core Principle**: All user stories MUST be organized within epic groups following Jira-compatible schema.

### Document Organization

```
docs/01-requirements/
├── requirements.md              # Master PRD
├── personas.md                  # User personas
├── business-case.md             # Business justification
├── user-stories.md              # MASTER catalog: All epics + stories
└── themes/                      # Route B: Functional theme organization
    └── epics/
        └── {EPIC-KEY}/          # e.g., AUTH-001/
            ├── epic.yml         # Epic metadata (epic-tmpl.yml)
            └── stories/
                └── {EPIC-KEY}-US-001.yml  # Story metadata (user-story-tmpl.yml)
```

### Templates Used
- `.github/templates/epic-tmpl.yml` — Jira-compatible epic schema
- `.github/templates/user-story-tmpl.yml` — Jira-compatible story schema with epic linkage

---

## STAGE 1: Requirements Gathering

**Inputs:** Stakeholder workshops, market research, business objectives  
**Output:** `requirements.md` (approved)  
**Agents:** PM (kickoff), PO (requirements), Architect (feasibility)

**Steps:**
1. PM kickoff (`pm-kickoff`) → Project charter, stakeholder map
2. PM discovery (`pm-stakeholder-discovery`) → Business objectives, pain points
3. PO analysis (`po-requirements-analysis`) → requirements.md categorized/prioritized
4. Architect review (`architect-requirements-review`) → Feasibility assessment
5. **Approval Gate:** ✓ Requirements defined ✓ Business value justified ✓ Feasibility confirmed ✓ Metrics measurable

---

## STAGE 2: Analysis & Business Justification

**Inputs:** requirements.md, market research  
**Outputs:** `personas.md`, `business-case.md` (approved)  
**Agents:** BA (personas/business-case), PO (validation), Architect (complexity)

### Personas Workflow
1. BA (`ba-personas`) → personas.md with goals, pain points, behaviors
2. PO (`po-personas-validation`) → Validate against requirements, approve

### Business Case Workflow
1. BA (`ba-business-case`) → business-case.md with ROI, projections, risks
2. Architect (`architect-complexity-assessment`) → Technical complexity input
3. PO (`po-business-case-approval`) → Verify ROI, approve

**Approval Gate:** ✓ Personas complete ✓ Business case justified ✓ ROI aligned ✓ Risks mitigated

---

## Epic & Story Creation (STAGE 3 Substage)

**Epics & User Stories** (structured with templates):

### Epic Creation Process
1. PO (`po-epics-definition`) → Define epic groupings using `epic-tmpl.yml`
2. BA (`ba-epics-validation`) → Validate epic scope, dependencies, and completeness
3. PO (`po-epic-approval`) → Review and approve each epic

### User Story Creation Process
1. PO (`po-user-stories`) → Create user-stories.md with epic grouping using `user-story-tmpl.yml`
2. BA (`ba-stories-validation`) → Validate stories (epic linkage, Gherkin scenarios, acceptance criteria)
3. UX (`ux-story-enrichment`) → Enrich stories with design requirements
4. Architect (`architect-story-technical-review`) → Add technical constraints

### Validation Rules
- Every story MUST have `epicLink` and `epicKey` fields
- Story key format: `{EPIC-KEY}-{STORY-NUMBER}` (e.g., AUTH-001-US-001)
- Epic completion = all child stories done

---

## Route-Specific Variations

### Route A (Tier 1: Documentation-Rich)
Traditional PDLC — Stages 1-2 execute sequentially with validation.

### Route B (Tier 2-3: Functional Extraction)
Epic/story mining by business domains → Theme-based PRD generation → Consolidation.
See `00-assessment.workflows.md` routing framework for full Route B details.

### Route C (Tier 3-4: Interview-Driven)
Comprehensive stakeholder discovery → Persona development → Requirements assembly.
See `00-assessment.workflows.md` routing framework for full Route C details.

### Route D (Mixed)
Hybrid assembly combining available inputs with targeted gap-filling.
See `00-assessment.workflows.md` routing framework for full Route D details.

---

## Phase Exit: Quality Gate

Execute `.github/gates/gate-01-requirements.md`. Gate outcome determines progression:

- ✅ PASS → Proceed to `02-architecture.workflows.md`
- ⚠️ CONDITIONAL → Document conditions; proceed with restrictions
- ❌ FAIL → BLOCK; see `.github/guides/gate-blocker-resolution.guide.md` for resolution

---

## Agent Logging Requirements (MANDATORY)

| Agent | Activities | Log Path |
|-------|-----------|----------|
| **po** | PRD creation, user story definition, epic management | `/logs/01-requirements/agent-po-YYYYMMDD.md` |
| **ba** | Functional specs, BDD scenarios, acceptance criteria | `/logs/01-requirements/agent-ba-YYYYMMDD.md` |
| **pm** | Kickoff, stakeholder discovery, coordination | `/logs/01-requirements/agent-pm-YYYYMMDD.md` |
| **architect** | Feasibility review, technical constraints | `/logs/01-requirements/agent-architect-YYYYMMDD.md` |
| **orchestrator** | Phase transitions, quality gate execution | `/logs/01-requirements/agent-orchestrator-YYYYMMDD.md` |

**Template:** `.github/templates/agent-log-tmpl.md`

---

**Status:** ACTIVE | **Version:** 2.0 | **Last Updated:** April 21, 2026
