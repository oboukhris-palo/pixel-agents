---
description: Mandatory agent logging standards for all PDLC phases and agent interactions
applyTo: "**"
priority: critical
enforcement: strict
---

# Agent Logging Standards Instructions

## ⚠️ CRITICAL: Unbreakable Logging Rule

**EVERY agent interaction MUST be logged. NO EXCEPTIONS.**

This applies to:
- ✅ All agents (orchestrator, dev-lead, dev-tdd-*, ba, po, architect, qa, ux, pm, ai-engineering, meeting-assistant)
- ✅ All PDLC phases (Assessment, Requirements, Architecture, Testing, Planning, Implementation)
- ✅ All action types (read, write, analyze, design, test, refactor, coordinate, review)

**Violation Consequences**: Agent actions without logs are **non-compliant** and require remediation.

---

## Log Location Standards

### Phase-Specific Log Paths

| PDLC Phase | Agent Log Location |
|------------|-------------------|
| **Assessment** | `/logs/00-assessment/agent-{name}-YYYYMMDD.md` |
| **Requirements** | `/logs/01-requirements/agent-{name}-YYYYMMDD.md` |
| **Architecture** | `/logs/02-architecture/agent-{name}-YYYYMMDD.md` |
| **Testing** | `/logs/03-testing/agent-{name}-YYYYMMDD.md` |
| **Planning** | `/logs/04-planning/agent-{name}-YYYYMMDD.md` |
| **Implementation (TDD)** | `/logs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/agent-{name}-YYYYMMDD.md` |
| **Implementation (Non-TDD)** | `/logs/05-implementation/agent-{name}-YYYYMMDD.md` |
| **Cross-Phase** | `/logs/agent-{name}-YYYYMMDD.md` |

**Date Format**: `YYYYMMDD` (8 digits, zero-padded)

---

## Template Usage

**All logs MUST use**: `.github/templates/agent-log-tmpl.md`

Always reference the template - do not create inline templates or examples.

---

## Mandatory Logging Points

### TDD Agents (dev-tdd-red, dev-tdd-green, dev-tdd-refactor)
- Before phase execution
- After file modifications  
- After test execution
- Before handoff
- On failure/blocking

### Other Agents
- Workflow initiation
- Decision gates
- Agent handoffs  
- Phase transitions
- Quality gates

**Always include**:
- Phase, Epic/Story, Layer, Cycle (if applicable)
- Files touched
- PRU consumption estimate
- Status (success|failure|partial|blocked)
- Handoff information

---

## PRU Tracking

**Estimation Guidelines**:
- Small action: ~100-500 PRU
- Medium action: ~500-2000 PRU  
- Large action: ~2000-5000 PRU

---

## File Management

### Daily Log Files
**Pattern**: `agent-{agent_name}-{YYYYMMDD}.md`
- One file per agent per day
- Append-only (never edit existing entries)
- Auto-create directories if missing

### Validation Enforcement
**Orchestrator validates logs at**:
- Every agent handoff
- Every phase transition
- Every quality gate
- End of day summary

**Missing logs = non-compliant action**

---

## Integration with Workflows

All workflow files must reference phase-specific logging:

**Assessment**: `/logs/00-assessment/`
**Documents**: `/logs/01-requirements/`, `/logs/02-architecture/`, `/logs/03-testing/`, `/logs/04-planning/`  
**Implementation**: `/logs/05-implementation/`

---

**Document Status**: ACTIVE AND MANDATORY  
**Enforcement**: STRICT (no exceptions)  
**Template Reference**: `.github/templates/agent-log-tmpl.md`
