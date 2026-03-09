# Product Development Lifecycle (PDLC) Document Workflows

## Overview
Strict workflow for generating 13 PRD documents through PDLC stages. Each document driven by prior stage inputs.

**Agents**: PM (coordination) | PO (product definition) | BA (requirements/BDD) | UX (design) | Architect (architecture) | Dev-Lead (implementation) | TDD Navigator (development)

**Templates**: prd.template.yml (13 docs) | user-story.template.yml | func-doc.template.yml | tech-doc.template.yml

---

## Agent Ecosystem

| Agent | Domain | Subagent Types | Active Stages | Authority |
|-------|--------|---------------|---------------|----------|
| **PM** | Project execution, timeline, budget | kickoff, iteration-planning, deployment-coordination, sprint-planning | 1, 6, 8 | Timeline, resources |
| **PO** | Product definition, prioritization | requirements-analysis, user-stories, feature-acceptance, test-strategies-approval, monitoring-feedback, gather-feedback, analyze-impact, requirements-refinement | 1-6, 8 | Requirements, stories, acceptance |
| **BA** | Requirements analysis, BDD | personas, business-case, bdd-scenarios, bdd-execution | 2, 5, 7 | Persona accuracy, test completeness |
| **UX** | UX design, journey mapping | journey-maps, blueprints, design-systems | 3, 4 | UX/UI decisions, accessibility |
| **Architect** | System architecture, tech stack | requirements-review, tech-spec, design, flow-diagrams, deployment, impact-assessment | 1-4, 6, 8 | Architecture, technology, security |
| **Dev-Lead** | Technical execution, TDD orchestration | tech-spec-review, bdd-integration, implementation-planning, code-review | 4, 5, 7 | Implementation plans, code quality |
| **TDD Orchestrator** | Layer-by-layer TDD execution | layer-execution, tdd-cycle-coordination | 7 | Layer completion, BDD test validation |

---

## STAGE 1: REQUIREMENTS GATHERING

**Inputs**: Stakeholder workshops, market research, business objectives
**Output**: requirements.md (approved)
**Agents**: PM (kickoff), PO (requirements), Architect (feasibility)

**Steps**:
1. PM kickoff (`pm-kickoff`) → Project charter, stakeholder map
2. PM discovery (`pm-stakeholder-discovery`) → Business objectives, pain points
3. PO analysis (`po-requirements-analysis`) → requirements.md categorized/prioritized
4. Architect review (`architect-requirements-review`) → Feasibility assessment
5. Approval Gate: ✓ Requirements defined ✓ Business value justified ✓ Feasibility confirmed ✓ Metrics measurable

---

## STAGE 2: ANALYSIS & BUSINESS JUSTIFICATION

**Inputs**: requirements.md, market research
**Outputs**: personas.md, business-case.md (approved)
**Agents**: BA (personas/business-case), PO (validation), Architect (complexity)

**Personas Workflow**:
1. BA (`ba-personas`) → personas.md with goals, pain points, behaviors
2. PO (`po-personas-validation`) → Validate against requirements, approve

**Business Case Workflow**:
1. BA (`ba-business-case`) → business-case.md with ROI, projections, risks
2. Architect (`architect-complexity-assessment`) → Technical complexity input
3. PO (`po-business-case-approval`) → Verify ROI, approve

**Approval Gate**: ✓ Personas complete ✓ Business case justified ✓ ROI aligned ✓ Risks mitigated

---

## STAGE 3: DESIGN & ARCHITECTURE

**Inputs**: requirements.md, personas.md, business-case.md (approved)
**Outputs**: journey-maps.md, user-stories.md (with epics), blueprints.md, architecture-design.md, flow-diagrams.md
**Agents**: UX (journey/blueprints/design), PO (stories), Architect (architecture), BA (validation)

**Journey Maps**: UX (`ux-journey-maps`) → journey-maps.md | PO validates

**Epics & User Stories** (same document):
- **Concept**: Epics = organizational groupings, User-Stories = work units
- PO (`po-epics-definition`) → Define epic groupings
- BA (`ba-epics-validation`) → Validate scope
- PO (`po-user-stories`) → user-stories.md with:
  - Section 1: Epics (objectives, completion = all child stories done)
  - Section 2: Stories grouped by epic (acceptance criteria, BDD outline)
- BA (`ba-stories-validation`) → Validate + attach Gherkin scenarios per story

**Blueprints**: UX (`ux-blueprints`) → blueprints.md | PO approves

**Architecture**: Architect (`architect-design`) → architecture-design.md | PM/PO review

**Flow Diagrams**: Architect (`architect-flow-diagrams`) → flow-diagrams.md

**Approval Gate**: ✓ Journeys align with personas ✓ Stories trace to requirements ✓ Blueprints support stories ✓ Architecture supports requirements ✓ Flows connect journeys to architecture

---

## STAGE 4: DEVELOPMENT PLANNING

**Inputs**: All Stage 3 docs, requirements.md, business-case.md
**Outputs**: tech-spec.md, design-systems.md, code-generation.md
**Agents**: Architect (tech-spec), Dev-Lead (implementation), UX (design-systems)

**Tech Spec**: Architect (`architect-tech-spec`) → API contracts, DB schema | Dev-Lead (`dev-lead-tech-spec`) → Finalize specs | Architect reviews
**Design Systems**: UX (`ux-design-systems`) → design-systems.md with tokens, components | Dev-Lead validates feasibility
**Code Generation**: Dev-Lead (`dev-lead-code-generation`) → code-generation.md with templates, scaffolding | Architect reviews

**Approval Gate**: ✓ Tech specs complete ✓ Design systems clear ✓ Code generation consistent ✓ Aligned with architecture

---

## STAGE 5: TESTING STRATEGY

**Inputs**: user-stories.md (with BDD), tech-spec.md, flow-diagrams.md
**Output**: test-strategies.md
**Agents**: Dev-Lead (strategy), BA (BDD consolidation), PO (approval)

**Note**: BDD scenarios already attached to each user-story (from Stage 3). This stage consolidates overall testing strategy.

**Steps**:
1. Dev-Lead (`dev-lead-test-strategies`) → Define unit (80%+ coverage), integration, e2e, performance, security testing
2. BA (`ba-bdd-scenarios-consolidation`) → Verify BDD coverage, organize by epic/story
3. PO (`po-test-strategies-approval`) → Validate coverage, approve

**Approval Gate**: ✓ BDD covers acceptance criteria ✓ Unit coverage 80%+ ✓ Integration tests cover flows ✓ E2E tests cover journeys ✓ Performance/security aligned with requirements

---

## STAGE 6: DEPLOYMENT & MONITORING

**Inputs**: All Stage 4-5 docs, requirements.md, business-case.md
**Output**: iteration-planning.md
**Agents**: PO (planning), PM (coordination), Architect (deployment)

**Steps**:
1. PO (`po-iteration-planning`) → MVP vs phased rollout, feature phasing, release timeline
2. Architect (`architect-deployment`) + PM (`pm-deployment-coordination`) → Deployment architecture, logistics
3. PO (`po-monitoring-feedback`) → Monitoring metrics, feedback loop

**Approval Gate**: ✓ Release phases sequenced ✓ MVP identified ✓ Deployment sound ✓ Monitoring covers business/technical metrics ✓ Feedback loop defined

---

## STAGE 7: DEVELOPMENT & TESTING EXECUTION

**Inputs**: All Stage 1-6 docs (approved), particularly user-stories.md, tech-spec.md, test-strategies.md
**Agents**: Dev-Lead (sprint orchestration), TDD Orchestrator (layer execution), BA (validation), PO (acceptance)

**Refined Process with Clear Role Boundaries**:
1. **Dev-Lead** (`dev-lead-sprint-planning`) → Plan sprint scope + create implementation plans
2. **Dev-Lead** (`dev-lead-bdd-integration`) → Setup BDD feature files + assign Layer 1 to TDD Orchestrator  
3. **TDD Orchestrator** (`tdd-layer-execution`) → Execute RED-GREEN-REFACTOR cycles for Layer 1
4. **Dev-Lead** (`dev-lead-layer-review`) → Approve Layer 1 completion, assign Layer 2 
5. **TDD Orchestrator** → Execute Layer 2 (repeat for Layers 3-4)
6. **Dev-Lead** (`dev-lead-story-review`) → Final code review when all layers complete
7. **BA** (`ba-bdd-execution`) → Validate story in full test environment
8. **PO** (`po-feature-acceptance`) → Accept story

**Key Clarifications**:
- **Dev-Lead Domain**: Strategic orchestration (sprint/story/architecture compliance)
- **TDD Orchestrator Domain**: Tactical execution (layer-by-layer TDD cycles)
- **Handoff Trigger**: Implementation plan ready + failing BDD tests + layer assignment
- **Return Trigger**: Layer complete + BDD assertions passing + code committed

**TDD Cycle per Layer**: RED (failing test supporting BDD) → GREEN (minimal code) → REFACTOR (improve quality) | **Entry**: Failing BDD tests for layer | **Exit**: Layer BDD tests pass

**Output**: Working features, test reports, deployment-ready artifacts

---

## STAGE 8: CONTINUOUS IMPROVEMENT & FEEDBACK LOOP

**Inputs**: iteration-planning.md, user feedback, analytics, performance metrics
**Agents**: PO (feedback/analysis/refinement), Architect (impact), PM (planning)

**Process**:
1. PO (`po-gather-feedback`) → Collect feedback, monitor metrics
2. PO (`po-analyze-impact`) + Architect (`architect-impact-assessment`) → Business/technical impact
3. PO (`po-requirements-refinement`) → Update requirements.md, create new stories
4. PM (`pm-iteration-planning`) + PO (`po-next-iteration`) → Plan next cycle

**Feedback Loop**: Deployed Features → Monitor Metrics → Gather Feedback → Analyze Impact → Update Requirements → Repeat PDLC

**Output**: Updated requirements.md, refined user-stories.md, revised priorities, ready for next iteration

---

## Document Traceability Matrix

**Requirements Flow**: requirements.md → personas.md, business-case.md, user-stories.md, architecture-design.md, tech-spec.md, test-strategies.md

**User Story Flow**: user-stories.md → blueprints.md, flow-diagrams.md, test-strategies.md, acceptance validation

**Architecture Flow**: architecture-design.md → flow-diagrams.md, tech-spec.md, design-systems.md, code-generation.md, deployment

**Design Flow**: design-systems.md → code-generation.md, blueprints.md, implementation

**Testing Flow**: test-strategies.md → BDD scenarios, unit tests, integration tests, e2e tests, feature validation

---

## Document Governance

**Storage**: `/docs/prd/` | Version control: Git | Approval history tracked

**Approval Gates**:
- Stage 1: PM, PO, Stakeholders
- Stage 2: PO, BA, Architect
- Stage 3: PO, UX, Architect, Dev-Lead
- Stage 4: Architect, Dev-Lead, PO
- Stage 5: BA, QA, PO
- Stage 6: PM, PO, Architect

**Standards**: Clear, concise, actionable | Visual diagrams | Full traceability | Version history | Approval dates

---

## Key Success Factors

1. Sequential dependency (no skipping stages)
2. Clear traceability (everything traces to requirements)
3. Agent collaboration (right agents per stage)
4. Quality gates (approval before progression)
5. Continuous feedback (learning feeds next iteration)
6. Complete documentation (audit trail)
7. Stakeholder alignment (regular reviews)
8. Version control (clear history)

---

## Anti-Patterns

❌ Skip stages | ❌ Unclear ownership | ❌ No approval gates | ❌ Traceability gaps | ❌ Ignore feedback | ❌ Documents out of sync | ❌ Mix responsibilities
