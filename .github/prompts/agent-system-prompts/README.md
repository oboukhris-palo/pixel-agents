# 🤖 Agent System Prompts Library

Complete set of standardized system prompts for all agents in the PDLC & Implementation orchestration system.

## Agent Prompts (12 Total)

| Agent | File | Role | Purpose |
|-------|------|------|---------|
| **Orchestrator** | `orchestrator.system.md` | Master Coordinator | Gate management, workflow orchestration, agent handoffs |
| **Project Manager** | `pm.system.md` | Project Coordinator | Charter, timeline, risk, budget tracking |
| **Product Owner** | `po.system.md` | Requirements Leader | User stories, acceptance criteria, prioritization |
| **Business Analyst** | `ba.system.md` | Analysis Lead | Personas, business case, BDD scenarios |
| **UX Designer** | `ux.system.md` | Design Lead | Journey maps, wireframes, design system |
| **Solution Architect** | `architect.system.md` | Architecture Lead | System design, tech specs, deployment |
| **Tech Lead** | `dev-lead.system.md` | Dev Execution Lead | Implementation planning, TDD orchestration |
| **TDD RED Phase** | `dev-tdd-red.system.md` | Test-First Phase | Write failing tests, define requirements |
| **TDD GREEN Phase** | `dev-tdd-green.system.md` | Implementation Phase | Write minimal code to pass tests |
| **TDD REFACTOR Phase** | `dev-tdd-refactor.system.md` | Quality Phase | Improve code, reduce complexity |
| **AI Engineering** | `ai-engineering.system.md` | AI Specialist | Prompt optimization, model selection, quality |
| **Base Template** | `base.template.md` | Template | Starting point for creating new agent prompts |

## Structure of Each Prompt

Each system prompt contains:

1. **Agent Identity** - Role, expertise, core responsibility
2. **Mode & Scope** - What you do (✅) and don't do (❌)
3. **Collaboration** - Who hands off to you, who you hand off to
4. **Communication Style** - Tone, format, clarity expectations
5. **Critical Constraints** - Architecture rules, quality thresholds, handoff requirements
6. **Step-by-Step Process** - Exact procedures for executing your role
7. **Example Handoff** - JSON structure showing proper format
8. **Failure Recovery** - How to handle common failure modes
9. **Quality Checkpoints** - Pre-handoff validation checklist

## Usage

### For Human Team Members

When working with an agent, provide them their system prompt:

```
@orchestrator [Read your system prompt from .github/prompts/agent-system-prompts/orchestrator.system.md]

Please coordinate the PDLC workflow for ProjectX
```

Or more concisely, reference in your prompt:

```
@orchestrator 
Reference: .github/prompts/agent-system-prompts/orchestrator.system.md

Coordinate the PDLC workflow for ProjectX
```

### For Creating New Agents

1. Copy `base.template.md` as your starting point
2. Fill in Agent Identity section with your role
3. Define your responsibilities (✅ and ❌)
4. List collaborators (who hands off to you, who you hand off to)
5. Write step-by-step process specific to your domain
6. Add 2-3 examples of your work
7. Add failure recovery scenarios
8. Validate: 400-600 lines, no placeholders, clear examples

## Workflow Chain

```
Orchestrator (gates & handoffs)
├─ → PM Agent (charter)
├─ → PO Agent (requirements)
├─ → BA Agent (personas, business case)
├─ → UX Agent (design)
├─ → Architect (architecture & tech spec)
├─ → Dev-Lead (implementation plan)
│  └─ → TDD-RED (failing tests)
│     → TDD-GREEN (minimal code)
│     → TDD-REFACTOR (quality)
│     → Back to Dev-Lead (validation)
└─ → BA Agent (acceptance testing)
```

## Quality Standards

All prompts meet these standards:

- ✅ 400-600 lines (comprehensive but focused)
- ✅ No placeholder text ([TODO], [PLACEHOLDER], [FILL IN])
- ✅ Clear step-by-step procedures
- ✅ 2-3 concrete examples
- ✅ Failure recovery section
- ✅ Quality checkpoints before handoff
- ✅ Unambiguous responsibility boundaries
- ✅ Clear collaboration points

## Validation

Run validation to ensure all prompts meet standards:

```bash
npm run prompt:validate
```

This checks for:
- No ambiguous language
- No placeholder text
- All required sections present
- Proper formatting
- Valid JSON schema references

## Updates & Versioning

System prompts are versioned in `.github/prompts/variants/`:

- **v1-baseline**: Current stable version
- **v2-***: Tested variants ready for promotion
- **v3-***: Experimental variants being evaluated

See `variant-config.yml` for which version each agent uses.

## Files Overview

```
.github/prompts/
├── agent-system-prompts/          ← You are here
│   ├── README.md                  ← This file
│   ├── base.template.md           ← Template for new agents
│   ├── orchestrator.system.md     ← Master coordinator
│   ├── pm.system.md               ← Project manager
│   ├── po.system.md               ← Product owner
│   ├── ba.system.md               ← Business analyst
│   ├── ux.system.md               ← UX designer
│   ├── architect.system.md        ← Solution architect
│   ├── dev-lead.system.md         ← Tech lead
│   ├── dev-tdd-red.system.md      ← RED phase
│   ├── dev-tdd-green.system.md    ← GREEN phase
│   ├── dev-tdd-refactor.system.md ← REFACTOR phase
│   ├── ai-engineering.system.md   ← AI specialist
│   └── validation-rules.yml       ← Quality thresholds
│
├── variants/                       ← Prompt variants (Phase 2)
│   ├── orchestrator/
│   ├── dev-lead/
│   ├── variant-config.yml
│   └── variant-metrics.yml
│
└── [used in phases 2-3]
```

## Next Steps

1. **Phase 1**: All 12 agent prompts created + validation ✓
2. **Phase 2**: Handoff schema & variant management
3. **Phase 3**: Distributed tracing for handoff auditing

---

**Status**: Phase 1 in progress | **Target**: Week 1 completion  
**Questions?** Check PHASE_1_QUICKSTART.md for daily tasks and troubleshooting
