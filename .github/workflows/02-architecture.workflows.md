# Architecture & Design Workflow (Phases 3-4)

**Workflow ID:** ARCHITECTURE-001  
**PDLC Phase:** Phases 3-4 (Architecture & Technical Design)  
**Output Location:** `/docs/02-architecture/`  
**Input:** Requirements gate passed from `01-requirements.workflows.md`  
**Handoff Target:** `03-testing.workflows.md`  
**Agents:** Architect (architecture/tech-spec), UX (design-systems/blueprints), PO (stories/validation), Dev-Lead (tech-spec review), PM (estimation)  
**Logging:** `/logs/02-architecture/agent-{name}-YYYYMMDD.md`  
**Quality Gate:** `.github/gates/gate-02-architecture.md`

---

## Referenced Artifacts

### Templates
- `.github/templates/tech-doc-tmpl.yml` — Technical documentation template
- `.github/templates/api-specification-tmpl.md` — API contract specification
- `.github/templates/agent-log-tmpl.md` — Agent logging format
- `.github/templates/gate-report-tmpl.md` — Quality gate report format
- `.github/templates/epic-tmpl.yml` — Epic metadata (referenced from Phase 1-2)
- `.github/templates/user-story-tmpl.yml` — Story enrichment (UI/UX, API contracts)

### Quality Gates
- `.github/gates/gate-02-architecture.md` — Phase 3-4 validation (architecture completeness, API spec, design)

### Guides
- `.github/guides/gate-blocker-resolution.guide.md` — Blocker resolution strategies
- `.github/guides/diagram-usage.guide.md` — Mermaid/PlantUML diagram standards

### Instructions
- `.github/instructions/api-design.instructions.md` — OpenAPI specification generation
- `.github/instructions/documentation.instructions.md` — Documentation standards
- `.github/instructions/framework-standards.instructions.md` — Naming conventions
- `.github/instructions/agent-logging.instructions.md` — Mandatory logging rules
- `.github/instructions/estimation.instructions.md` — AI-era estimation framework (STAGE 3.5 process)

### Scripts
- `.github/scripts/update-decision-trail.mjs` — Decision trail automation (after gate execution)
- `.github/scripts/generate-dashboard.mjs` — Weekly decision dashboard generation

---

## Overview

This workflow covers **Phases 3-4** of the PDLC: Design & Architecture and Development Planning. It transforms validated requirements into system architecture, technical specifications, design systems, and development-ready plans.

---

## STAGE 3: Design & Architecture

**Inputs:** requirements.md, personas.md, business-case.md (approved)  
**Outputs:** journey-maps.md, user-stories.md (with epics), blueprints.md, architecture-design.md, flow-diagrams.md  
**Agents:** UX (journey/blueprints/design), PO (stories), Architect (architecture), BA (validation)

### Journey Maps
UX (`ux-journey-maps`) → journey-maps.md | PO validates

### Blueprints
UX (`ux-blueprints`) → blueprints.md | PO approves

### Architecture Design
Architect (`architect-design`) → architecture-design.md | PM/PO review

### Flow Diagrams
Architect (`architect-flow-diagrams`) → flow-diagrams.md

### Design Generation (Figma/Penpot)
1. UX creates high-fidelity designs in Figma or Penpot for all major user flows
2. Design system components defined with design tokens
3. Stakeholder validation of designs (1-2 iteration rounds)
4. Design artifacts linked in `figma-design-link.md`

**Approval Gate:** ✓ Journeys align with personas ✓ Stories trace to requirements ✓ Blueprints support stories ✓ Architecture supports requirements ✓ Flows connect journeys to architecture ✓ Designs validated with stakeholders

---

## STAGE 3.5: Story Estimation & Cost Analysis (PM-Led)

**Purpose:** Apply rigorous time and cost estimates to each user story using AI-first delivery estimation methodology.

**Inputs:** user-stories.md (from Stage 3), architecture-design.md, `.github/team-profile.yml` (internal)  
**Output:** user-stories.md with `estimation` section populated  
**Agents:** PM (estimation lead), Architect (technical complexity), orchestrator (validation)  
**Duration:** 1 day per 8-10 stories  
**Reference:** `.github/instructions/estimation.instructions.md`

### Steps
1. **Context Quality Assessment** (`pm-story-context-assessment`) → 5-point quality checklist scoring
2. **Base Time by Layer** (`pm-layer-breakdown-estimation`) → Layer-by-layer hour estimates
3. **Team Skill Factor** (`pm-team-skill-assessment`) → Anonymized skill multipliers from `.github/team-profile.yml`
4. **Integration Risk** (`pm-integration-risk-assessment` + `architect-technical-complexity`) → Buffer percentages
5. **Final Calculation** (`pm-final-estimate-calculation`) → Formula: `(Base × Context × Skill) + Buffer`
6. **Epic Aggregation** (`pm-epic-cost-aggregation`) → Roll up to epic totals
7. **Project Forecast** (`pm-project-forecast`) → 3-scenario presentation (Conservative/Balanced/Aggressive)
8. **Orchestrator Validation** (`orchestrator-estimation-validation`) → Pre-approve estimates

### Exit Criteria
✅ Every story has estimation section populated  
✅ Context quality scores documented  
✅ Privacy rules enforced (no personal team info in stories)  
✅ Orchestrator validation passed

---

## STAGE 4: Development Planning

**Inputs:** All Stage 3 docs + Stage 3.5 estimates  
**Outputs:** tech-spec.md, design-systems.md, code-generation.md  
**Agents:** Architect (tech-spec), Dev-Lead (implementation), UX (design-systems)

### Tech Spec
Architect (`architect-tech-spec`) → API contracts, DB schema | Dev-Lead (`dev-lead-tech-spec`) → Finalize specs

### Design Systems
UX (`ux-design-systems`) → design-systems.md with tokens, components | Dev-Lead validates feasibility

### Code Generation Strategy
Dev-Lead (`dev-lead-code-generation`) → code-generation.md with templates, scaffolding | Architect reviews

**Approval Gate:** ✓ Tech specs complete ✓ Design systems clear ✓ Code generation consistent ✓ Aligned with architecture

---

## Phase Exit: Quality Gate

Execute `.github/gates/gate-02-architecture.md`. Gate outcome determines progression:

- ✅ PASS → Proceed to `03-testing.workflows.md`
- ⚠️ CONDITIONAL → Iterate design with stakeholders; re-run gate within 3 days
- ❌ FAIL → BLOCK; see `.github/guides/gate-blocker-resolution.guide.md` for resolution

---

## Agent Logging Requirements (MANDATORY)

| Agent | Activities | Log Path |
|-------|-----------|----------|
| **architect** | System architecture, tech stack, API design | `/logs/02-architecture/agent-architect-YYYYMMDD.md` |
| **ux** | Design systems, prototypes, UI components | `/logs/02-architecture/agent-ux-YYYYMMDD.md` |
| **ai-engineering** | Prompt optimization, model selection | `/logs/02-architecture/agent-ai-engineering-YYYYMMDD.md` |
| **pm** | Story estimation, cost analysis | `/logs/02-architecture/agent-pm-YYYYMMDD.md` |
| **dev-lead** | Tech spec review, code generation | `/logs/02-architecture/agent-dev-lead-YYYYMMDD.md` |
| **orchestrator** | Phase transitions, quality gate execution | `/logs/02-architecture/agent-orchestrator-YYYYMMDD.md` |

**Template:** `.github/templates/agent-log-tmpl.md`

---

**Status:** ACTIVE | **Version:** 2.0 | **Last Updated:** April 21, 2026
