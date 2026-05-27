## Objective
Provide comprehensive navigation index for AI-first delivery framework, mapping everyday development tasks to specific files, prompts, and agents for efficient workflow execution.

## Context
This quick reference serves as the primary navigation tool for developers and AI agents working within the AI-first delivery framework. It connects specific development tasks to the correct files, templates, and agent configurations needed for execution.

## Requirements

### Task-Based Navigation
Map common development activities to:
- Specific prompt files for task execution
- Appropriate AI agents for specialized work
- Required template files for consistent output
- Context files for background information

### Phase-Based Organization
Organize framework usage by:
- **Phase 0**: Assessment and discovery workflows
- **Phases 1-7**: Documentation and development planning
- **Phase 8**: Implementation with TDD cycles

### Role-Based Access
Provide agent-specific guidance for:
- Workflow Orchestrator (master coordination)
- Product Owner (requirements and user stories)
- Solution Architect (system design and technical strategy)
- Tech Lead (implementation planning and TDD coordination)
- Development agents (RED/GREEN/REFACTOR cycles)

## Deliverables

### 1. Task Reference Table
| Development Task | Required Files | Agent | Context |
|------------------|----------------|-------|---------|
| Starting new project | start-pdlc.prompt.md | @Workflow Orchestrator | Phase 0 assessment |
| Planning user story | plan-us.prompt.md + user-story-tmpl.yml | @Product Owner | Documentation phase |
| Creating implementation plan | implementation-plan-tmpl.md | @Tech Lead | Pre-implementation |
| TDD session execution | tdd.prompt.md + implementation plan | @TDD Orchestrator | Implementation cycles |
| Code review | code-review.instructions.md | @QA Engineer | Quality gates |
| API design | tech-spec.md (project level) | @Solution Architect | Architecture phase |

**Phases 1-7: Documentation**
- Workflows: 01-requirements.workflows.yml, 02-architecture.workflows.yml, 03-testing.workflows.yml, 04-planning.workflows.yml
- Route Reference: See `00-assessment.workflows.yml` for routing framework (Routes A/B/C/D based on maturity tier)
- Templates: user-story-tmpl.yml, prd-tmpl.yml
- Agents: @Product Owner, @Solution Architect, @UX/UI Designer

**Phase 8: Implementation**
- Workflow: 05-implementation.workflows.yml
- Templates: implementation-plan-tmpl.md, plan-approval-tmpl.yaml, user-story-folder-tmpl.md
- Agents: @TDD Orchestrator, @TDD RED/GREEN/REFACTOR Phase Agents
- Progress tracking: Checkboxes in implementation-plan.md + git commits

### 3. Agent-Specific Quick Access
- **Orchestrator**: Project coordination and workflow orchestration
- **Product Owner**: Requirements definition and user story creation
- **Solution Architect**: System design and technical decision making
- **Tech Lead**: Implementation planning and technical leadership
- **QA Engineer**: Testing strategies and quality validation

## Quality Standards

- ✅ All file references use correct workspace-relative paths
- ✅ Agent names match exactly with configured agent definitions
- ✅ Task mappings reflect actual workflow requirements
- ✅ Phase organization aligns with AI-first delivery methodology
- ✅ Quick reference supports efficient task execution
- ✅ Navigation paths are validated and accessible
- ✅ Context information is accurate and helpful

## File Management

### Reference Structure
- Organize by frequency of use (most common tasks first)
- Cross-reference related files and templates
- Maintain links to instruction files for detailed guidance
- Update references when file locations change

### Usage Patterns
- Load via `/` command in Copilot Chat
- Reference directly when planning development work
- Use as onboarding guide for new team members
- Consult during workflow decision points

#### 🧪 TDD Orchestrator
**When to invoke**: Managing RED → GREEN → REFACTOR cycles  
**Use prompts**:
- `#file:.github/tasks/tdd-session-start.prompt.md` — Start TDD session
- `#file:.github/tasks/write-tests.prompt.md` — Write tests

#### 💡 AI Engineering Agent
**When to invoke**: Optimizing prompts, cost analysis, AI strategy  
**Key files**:
- `#file:.github/guides/context-optimization-strategy.guide.md` — Context design
- `#file:.github/instructions/pru-optimization.instructions.md` — Token budgets

#### 🎨 UX/UI Designer
**When to invoke**: Creating user journeys, designing interfaces  
**Key files**:
- Templates: `#file:.github/templates/epic.template.yml` (user journey mapping)

---

## 📖 Core Reference Guides

| Guide | Purpose | When to Read |
|-------|---------|--------------|
| **[copilot-instructions.md](./../copilot-instructions.md)** | Framework overview + agent roles | First thing — defines everything |
| **[tdd-enforcement.guide.md](./guides/tdd-enforcement.guide.md)** | TDD sequencing rules + quality gates | Before starting implementation |
| **[context-optimization-strategy.guide.md](./guides/context-optimization-strategy.guide.md)** | Token efficiency + 3-level model | When optimizing prompts |
| **[tdd-enforcement.guide.md](./guides/tdd-enforcement.guide.md)** | TDD sequencing rules | Before starting implementation |
| **[pru-optimization.instructions.md](./../instructions/pru-optimization.instructions.md)** | Token budgets by agent type | Planning PRU strategy |

---

## 🎯 Coding Standards & Instructions

| Standard | File | Applies To |
|----------|------|-----------|
| **General coding** | `#file:.github/instructions/coding.instructions.md` | All code |
| **Code documentation** | `#file:.github/instructions/code-comments.instructions.md` | All code comments |
| **Code review checklist** | `#file:.github/instructions/code-review.instructions.md` | Code review |
| **API design** | `#file:.github/instructions/api-design.instructions.md` (project-level tech-spec.md) | API routes |
| **Test strategy** | `#file:.github/instructions/test-strategy.instructions.md` | Test files |
| **Documentation rules** | `#file:.github/instructions/documentation.instructions.md` | Markdown files |
| **Analysis guardrails** | `#file:.github/instructions/ai.analysis.guardrails.instructions.md` | Artifact analysis |

**Language-Specific**:
- TypeScript: `#file:.github/instructions/coding/typescript.instructions.md`
- .NET/C#: `#file:.github/instructions/coding/dot-net.instructions.md`
- React: `#file:.github/instructions/coding/react.instructions.md`
- Angular: `#file:.github/instructions/coding/angular.instructions.md`
- Next.js: `#file:.github/instructions/coding/nextjs.instructions.md`
- [View all languages](./instructions/coding/)

---

## 📁 All Available Templates

**User Story & Planning**:
- User story: `#file:.github/templates/user-story.template.yml`
- Epic: `#file:.github/templates/epic.template.yml`
- User story folder structure: `#file:.github/templates/user-story-folder.template.md`

**Documentation**:
- PRD: `#file:.github/templates/prd.template.yml`
- Implementation plan: `#file:.github/templates/implementation-plan.template.md`
- Tech doc: `#file:.github/templates/tech-doc.template.yml`
- Architecture design: `#file:.github/templates/architecture-design.template.md`

**Implementation**:
- Plan approval: `#file:.github/templates/plan-approval-tmpl.yaml`
- User story folder: `#file:.github/templates/user-story-folder-tmpl.md`
- Layer completion: Checkboxes in implementation-plan.md (mark [x] as tasks complete)

**Review & QA**:
- Code review checklist: `#file:.github/templates/code-review-checklist.template.md`
- Project status: `#file:.github/templates/project-status.template.md`
- Sprint planning: `#file:.github/templates/sprint-planning.template.md`

**Meetings**:
- Meeting minutes: `#file:.github/templates/meeting.minutes.template.yml`

---

## 🚀 Quick Copy-Paste Prompts

**For daily work**, copy these prompts and paste into a new chat:

| Task | Prompt File |
|------|-------------|
| New project assessment | `#file:.github/tasks/assess-project-status.prompt.md` |
| Morning standup | `#file:.github/tasks/morning-standup.prompt.md` |
| Start TDD session | `#file:.github/tasks/tdd-session-start.prompt.md` |
| Write tests | `#file:.github/tasks/write-tests.prompt.md` |
| Start implementation | `#file:.github/tasks/start-implementation.prompt.md` |
| Layer checkpoint | `#file:.github/tasks/layer-checkpoint.prompt.md` |
| Commit user story | `#file:.github/tasks/commit-us.prompt.md` |
| Start CI/CD | `#file:.github/tasks/start-cicd.prompt.md` |

---

## 🔧 Agent System Prompts (Advanced)

**For customizing agent behavior**, reference these system prompts:

| Agent | System Prompt |
|-------|---------------|
| Base template | `#file:.github/prompts/agent-system-prompts/base.template.md` |
| Orchestrator | `#file:.github/prompts/agent-system-prompts/orchestrator.system.md` |
| Product Owner | `#file:.github/prompts/agent-system-prompts/po.system.md` |
| Tech Lead | `#file:.github/prompts/agent-system-prompts/dev-lead.system.md` |
| TDD Orchestrator | `#file:.github/prompts/agent-system-prompts/dev-tdd.system.md` |
| [View all agents](./agent-system-prompts/) |

---

## 📊 Context Engineering Quick Tips

### Loading Strategy (PRU Optimization)
```
✅ ALWAYS load: .github/copilot-instructions.md (auto-loaded, baseline)
✅ LOAD ON DEMAND: Task-specific files via #file: references
❌ NEVER LOAD: Full history or archive files
```

### Token Budget by Agent
| Agent Type | Budget | Example |
|-----------|--------|---------|
| Planning (PM, PO) | 5-10K | Requirements definition |
| Architecture | 10-15K | System design |
| TDD Implementation | 3-5K | Single layer, single file |
| Review/Strategy | 5-8K | Cost analysis |

### Simplified Context Model
1. **CANONICAL**: Single source of truth (description.md, implementation-plan.md, features/)
2. **PROGRESS**: Checkboxes in implementation-plan.md (mark [x] as tasks complete)
3. **AUDIT**: Git commits with `TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD` format (date in YYYYMMDD)

---

## ⚡ Common Workflows

### New Project (Assessment → Documentation → Implementation)
1. `@Workflow Orchestrator` — Run `#file:.github/prompts/start-pdlc.prompt.md`
2. `@Workflow Orchestrator` — Route documentation workflow
3. `@Tech Lead` — Create implementation plan
4. `@TDD Orchestrator` — Start TDD cycles

### User Story (Planning → Development → Validation)
1. `@Product Owner` — Run `#file:.github/prompts/plan-us.prompt.md`
2. `@Tech Lead` — Create `implementation-plan.md`
3. Human approves `plan-approval.yaml` (status: approved)
4. `@TDD Orchestrator` — Execute RED → GREEN → REFACTOR (checkboxes + commits)
5. `@Tech Lead` — Validate completion

### Code Review Checklist
1. Load: `#file:.github/instructions/code-review.instructions.md`
2. Load: `#file:.github/templates/code-review-checklist.template.md`
3. Review against 13-point checklist
4. Mark checkboxes in implementation-plan.md, commit with `TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD` format

---

## 🔗 Framework Structure at a Glance

```
.github/
├── agents/                      # 13 agent role definitions
├── instructions/                # Global rules + language-specific
├── workflows/                   # 4 PDLC phase workflows
├── prompts/                     # Reusable .prompt.md files
│   └── agent-system-prompts/   # Agent customization
├── tasks/                       # 11 daily copy-paste prompts
├── templates/                   # 22 document templates
├── guides/                      # 4 deep-dive guides
├── copilot-instructions.md      # Master entry point
└── [This file]                  # Quick-Reference Index
```

---

## 📚 Learning Path

**New to the framework?** Follow this sequence:

1. Read: `#file:.github/copilot-instructions.md` (5 min)
2. Review: `#file:.github/guides/tdd-enforcement.guide.md` (10 min)
3. Scan: `#file:.github/guides/context-optimization-strategy.guide.md` (5 min)
4. Reference: This quick-reference as needed (ongoing)

**Focused on implementation?**

1. Load: `#file:.github/workflows/05-implementation.workflows.yml`
2. Read: `#file:.github/guides/tdd-enforcement.guide.md`
3. Use: Copy-paste from `#file:.github/tasks/`

---

## 🎯 Need Help?

| Question | Action |
|----------|--------|
| "What do I do next?" | Load: `#file:.github/prompts/overview.prompt.md` |
| "How do I start a project?" | Load: `#file:.github/prompts/start-pdlc.prompt.md` |
| "What are my TDD rules?" | Load: `#file:.github/guides/tdd-enforcement.guide.md` |
| "How do I optimize tokens?" | Load: `#file:.github/instructions/pru-optimization.instructions.md` |
| "What's my role?" | Load: `#file:.github/agents/<role>.agent.md` |
| "How does TDD workflow work?" | Load: `#file:.github/guides/tdd-enforcement.guide.md` |

---

**Last Updated**: March 2026 | **Status**: Production Ready  
**Framework**: AI-first Delivery | **Version**: 1.0
