# Start PDLC Workflow

## Prerequisites

Before starting, verify:
- ✅ Project vision defined
- ✅ Stakeholders identified

## Command Template

```
@orchestrator Start new PDLC workflow for [PROJECT_NAME]

Project Type: [web-app / mobile / api / other]
Description: [Brief description]

Orchestrate through 8 stages:
1. Go step-by-step interactively
2. Present 3 options with pros/cons for decisions
3. Invoke agents with correct subagentType
4. Track progress via todo list
5. Enforce quality gates

Start with Stage 1: Requirements Gathering
```

## Stages

### 1: Requirements (Week 1)
**Agents**: PM, PO, Architect  
**Deliverables**: Charter, requirements.md, feasibility  
**Gates**: Charter approval, Requirements approval

### 2: Analysis (Week 1-2)
**Agents**: BA, PO  
**Deliverables**: personas.md, business-case.md  
**Gates**: Persona validation, Business case approval

### 3: Design (Week 2-4)
**Agents**: UX, Architect, PO  
**Deliverables**: journey-maps.md, architecture-design.md, user-stories.md, flow-diagrams.md  
**Gates**: Architecture selection (3 options), UX approval, Stories validation

### 4: Planning (Week 4-5)
**Agents**: Architect, Tech Lead, UX  
**Deliverables**: tech-spec.md, code-generation.md, design-systems.md  
**Gates**: Tech stack selection (3 options), Spec approval

### 5: Testing Strategy (Week 5-6)
**Agents**: BA, Tech Lead  
**Deliverables**: Gherkin features, test-strategies.md  
**Gates**: BDD completeness, Test strategy approval

### 6: Deployment (Week 6)
**Agents**: PO, Architect, PM  
**Deliverables**: iteration-planning.md, deployment-plan.md  
**Gates**: Iteration approval, Deployment readiness

### 7: Development (Weeks 7+)
**Agents**: Tech Lead, TDD Navigator, BA  
**Deliverables**: Code, tests, BDD passing  
**Gates**: Sprint scope (3 options), Story acceptance, Sprint review

### 8: Improvement (Ongoing)
**Agents**: PO, Architect, PM  
**Deliverables**: Feedback reports, updated requirements.md  
**Gates**: Improvement prioritization (3 options)

---

### Stage 2: Analysis & Business Justification (Week 1-2)
**Agents**: BA, PO, Architect

**Orchestrator Actions**:
1. Invokes BA Agent (ba-personas) → Creates personas.md
2. Invokes BA Agent (ba-business-case) → Creates business-case.md
3. Invokes Architect Agent (architect-assessment) → Technical risk assessment
4. Invokes PO Agent (po-validate-personas) → Validates alignment

**Deliverables**:
- docs/prd/personas.md
- docs/prd/business-case.md
- Technical risk matrix

**Decision Gates**:
- ✋ **Gate 2.1**: Persona validation (PO, BA, UX)
- ✋ **Gate 2.2**: Business case approval (PO, PM, Stakeholders)

---

### Stage 3: Design & Architecture (Week 2-4)
**Agents**: UX, Architect, PO, BA

**Orchestrator Actions**:
1. Invokes UX Agent (ux-journey-maps) → Creates journey-maps.md
2. Invokes UX Agent (ux-blueprints) → Creates blueprints.md
3. Invokes Architect Agent (architect-design) → Creates architecture-design.md
4. **Decision Gate**: Present 3 architecture options with pros/cons
5. User selects architecture
6. Invokes PO Agent (po-user-stories) → Creates user-stories.md with epics and stories
7. Invokes Architect Agent (architect-flow-diagrams) → Creates flow-diagrams.md

**Deliverables**:
- docs/prd/journey-maps.md
- docs/prd/blueprints.md
- docs/prd/architecture-design.md
- docs/prd/user-stories.md (with Epics and User Stories sections)
- docs/prd/flow-diagrams.md

**Decision Gates**:
- ✋ **Gate 3.1**: Architecture selection (3 options presented - USER DECIDES)
- ✋ **Gate 3.2**: UX design approval (UX, PO, BA)
- ✋ **Gate 3.3**: User stories validation (PO, BA, Tech Lead)

---

### Stage 4: Development Planning (Week 4-5)
**Agents**: Architect, Tech Lead, UX

**Orchestrator Actions**:
1. Invokes Architect Agent (architect-tech-spec) → Creates tech-spec.md
2. **Decision Gate**: Present 3 technology stack options with pros/cons
3. User selects technology stack
4. Invokes Tech Lead Agent (dev-lead-code-generation) → Creates code-generation.md
5. Invokes UX Agent (ux-design-systems) → Creates design-systems.md

**Deliverables**:
- docs/prd/tech-spec.md
- docs/prd/code-generation.md
- docs/prd/design-systems.md

**Decision Gates**:
- ✋ **Gate 4.1**: Technology stack selection (3 options presented - USER DECIDES)
- ✋ **Gate 4.2**: Technical specification approval (Architect, Tech Lead, PO)
- ✋ **Gate 4.3**: Design system approval (UX, Tech Lead)

---

### Stage 5: Testing Strategy (Week 5-6)
**Agents**: BA, Tech Lead, PO

**Orchestrator Actions**:
1. Invokes BA Agent (ba-bdd-scenarios) → Creates Gherkin scenarios for all user stories
2. Invokes Tech Lead Agent (dev-lead-test-strategies) → Creates test-strategies.md
3. Invokes PO Agent (po-test-strategies-approval) → Validates test coverage

**Deliverables**:
- Gherkin feature files (features/**/*.feature) for each user story
- docs/prd/test-strategies.md
- Test coverage matrix

**Decision Gates**:
- ✋ **Gate 5.1**: BDD scenario completeness (BA, PO)
- ✋ **Gate 5.2**: Test strategy approval (Tech Lead, QA, PO)

---

### Stage 6: Deployment & Release Planning (Week 6)
**Agents**: PO, Architect, PM

**Orchestrator Actions**:
1. Invokes PO Agent (po-iteration-planning) → Creates iteration-planning.md
2. Invokes Architect Agent (architect-deployment) → Creates deployment-plan.md
3. Invokes PM Agent (pm-deployment-coordination) → Coordinates release schedule

**Deliverables**:
- docs/prd/iteration-planning.md
- docs/prd/deployment-plan.md
- Release schedule

**Decision Gates**:
- ✋ **Gate 6.1**: Iteration plan approval (PO, PM, Architect)
- ✋ **Gate 6.2**: Deployment readiness (Architect, PM)

---

### Stage 7: Development Execution (TDD) (Weeks 7+)
**Agents**: Tech Lead, TDD Navigator, BA, PO

**Orchestrator Actions**:
1. Invokes Tech Lead Agent (dev-lead-sprint-planning) → Sprint planning
2. **Decision Gate**: Present user-story sprint options with velocity and priorities
3. User approves sprint scope
4. Invokes Tech Lead Agent (dev-lead-bdd-integration) → Integrate BDD scenarios into project
5. Invokes TDD Navigator (dev-tdd-orchestrator) → Execute RED-GREEN-REFACTOR cycles per user-story
6. Invokes BA Agent (ba-bdd-execution) → Validate each completed story
7. **Decision Gate**: Present BDD test results for story acceptance
8. User accepts or requests changes
9. Invokes Tech Lead Agent (dev-lead-code-review) → Code quality validation
10. Repeat for all user-stories until sprint complete

**Deliverables**:
- Implemented features (code)
- Passing unit tests
- Passing BDD scenarios
- Code review reports

**Decision Gates**:
- ✋ **Gate 7.1**: Sprint scope selection (USER DECIDES stories to implement)
- ✋ **Gate 7.2**: Story acceptance per user-story (USER DECIDES based on BDD results)
- ✋ **Gate 7.3**: Sprint review (PO, Tech Lead, PM)

**Transition**: When all epics/stories implemented, transition to Stage 8

---

### Stage 8: Continuous Improvement (Ongoing)
**Agents**: PO, Architect, PM

**Orchestrator Actions**:
1. Invokes PO Agent (po-gather-feedback) → Collect user feedback from production
2. Invokes PO Agent (po-analyze-impact) → Business impact analysis
3. Invokes Architect Agent (architect-impact-assessment) → Technical impact analysis
4. **Decision Gate**: Present improvement options with priorities and effort
5. User selects improvements to pursue
6. Invokes PO Agent (po-requirements-refinement) → Update requirements.md
7. Return to Stage 1 with refined requirements

**Deliverables**:
- User feedback reports
- Business impact analysis
- Technical impact assessment
- Updated requirements.md for next iteration

**Decision Gates**:
- ✋ **Gate 8.1**: Improvement prioritization (USER DECIDES what to build next)
- ✋ **Gate 8.2**: Next iteration approval (PO, PM, Architect)

---

## Progress Tracking

The Orchestrator maintains a todo list throughout the workflow:

```yaml
pdlc_progress:
  current_stage: 3
  current_stage_name: "Design & Architecture"
  
  stages:
    - stage: 1
      name: "Requirements Gathering"
      status: "completed"
      approval_date: "2025-12-20"
      
    - stage: 2
      name: "Analysis & Business Justification"
      status: "completed"
      approval_date: "2025-12-21"
      
    - stage: 3
      name: "Design & Architecture"
      status: "in-progress"
      tasks:
        - task: "Create journey-maps.md"
          agent: "ux-journey-maps"
          status: "completed"
          
        - task: "Create architecture-design.md"
          agent: "architect-design"
          status: "in-progress"
          
        - task: "Architecture decision gate"
          status: "blocked"
          waiting_for: "user-decision"
          
    - stage: 4
      name: "Development Planning"
      status: "not-started"
      
    # ... stages 5-8
    
  quality_gates_passed: 4
  quality_gates_pending: 1
  documents_generated: 5
  documents_approved: 4
```

---

## Key Orchestration Principles

1. **Sequential Progression**: Complete each stage fully before moving to next
2. **Interactive Decision Gates**: Pause for user decisions at critical points (architecture, technology, priorities)
3. **3 Options Rule**: Always present 3 options with pros/cons for major decisions
4. **Traceability**: All documents trace back to requirements.md
5. **Quality Gates**: Enforce approval processes before stage progression
6. **Agent Specialization**: Invoke correct agent with proper subagentType
7. **Transparency**: Maintain updated todo list showing real-time progress
8. **Document Standards**: Follow templates and comply with documentation.instructions.md

---

## Example Session

```
USER: "@orchestrator Start new PDLC workflow for TaskMaster Pro
Project Type: web-application
Project Description: Team task management and collaboration platform
Initial Requirements: Task creation, assignment, tracking, team collaboration, reporting"

ORCHESTRATOR:
"I'll orchestrate the complete PDLC workflow for TaskMaster Pro. Let's start with Stage 1.

**Stage 1: Requirements Gathering**

Step 1: Invoking PM Agent for project kickoff..."

[PM Agent creates project charter]

"Project Charter created with the following highlights:
- Vision: Modern team task management with real-time collaboration
- Target Audience: Small to medium teams (5-50 people)
- Key Features: Task CRUD, assignment, status tracking, team communication
- Timeline: 4 months to MVP
- Budget: $300K
- Success Metrics: 1000 active teams, 80% user retention

Do you approve this charter? [Yes / No / Request Changes]"

USER: "Yes, approved"

ORCHESTRATOR:
"Great! Moving to requirements analysis...

[Invoking PO Agent for requirements.md]"

[PO Agent creates requirements.md]

"requirements.md created with:
- 15 functional requirements
- 8 non-functional requirements (performance, security, scalability)
- 3 user roles (Team Member, Team Lead, Admin)
- Success metrics and KPIs

[Invoking Architect Agent for feasibility review]"

[Architect reviews and provides feasibility assessment]

"Feasibility Assessment:
✓ Technical feasibility: HIGH
✓ Complexity: MEDIUM
⚠ Key risks: Real-time collaboration (WebSocket complexity)
✓ Timeline achievable: YES

**Quality Gate 1.2: Requirements Baseline Approval**
Do you approve requirements.md as baseline? [Yes / No / Request Changes]"

USER: "Yes, approved"

ORCHESTRATOR:
"Excellent! Stage 1 complete. ✓

Moving to Stage 2: Analysis & Business Justification...

[Invoking BA Agent for personas]"

[Continue orchestrating through all stages...]
```

---

## Quick Start Commands

**Start New Project:**
```
@orchestrator Start new PDLC workflow for [PROJECT_NAME]
```

**Resume at Specific Stage:**
```
@orchestrator Resume PDLC workflow at Stage [X]
```

**Check PDLC Progress:**
```
@orchestrator Show PDLC progress and next steps
```

**Generate Specific Document:**
```
@orchestrator Generate [document-name] for Stage [X]
```

---

## Related Files

- **Orchestrator Agent**: [.github/agents/orchestrator.agent.md](/.github/agents/orchestrator.agent.md)
- **PDLC Workflow**: [.github/workflows/documents.workflows.md](/.github/workflows/documents.workflows.md)
- **All Agent Definitions**: [.github/agents/](/.github/agents/)
- **Document Templates**: [.github/templates/](/.github/templates/)
- **PRD Documents**: [docs/prd/](docs/prd/)
