# Decision Trail Entry Template

> **Template ID:** decision-entry-tmpl  
> **Purpose:** Standard format for recording PDLC workflow decisions in checkpoint.yaml  
> **Used By:** Orchestrator agent (automatic recording at phase transitions and gate outcomes)  
> **Storage:** Appended to `orchestrator_decisions` array in `.github/checkpoint.yaml`

---

## Entry Types

### 1. Phase Transition Entry

```yaml
- timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  entry_type: "phase_transition"
  phase: "{current_phase}"
  transition:
    from_phase: "{from_phase}"          # e.g., "00-assessment" (null for first phase)
    to_phase: "{to_phase}"              # e.g., "01-requirements"
    trigger: "{trigger_description}"     # e.g., "gate-00-assessment PASSED"
    rationale: "{why_this_transition}"   # e.g., "All prerequisites met, AI readiness 75%"
  recorded_by: "orchestrator"
  workflow_ref: "{NN-phase}.workflows.yml"
  git_commit: "{sha}"                   # Git SHA for auditability (null if not yet committed)
```

### 2. Gate Outcome Entry

```yaml
- timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  entry_type: "gate_outcome"
  phase: "{phase}"
  gate_result:
    gate_id: "{gate_id}"               # e.g., "gate-01-requirements"
    decision: "PASS"                    # PASS | CONDITIONAL | FAIL
    quality_score: 8.5                  # Weighted average (1-10)
    metrics:
      metric_name_1: "value"            # e.g., epic_story_linkage: "100%"
      metric_name_2: "value"            # e.g., bdd_format_coverage: "95%"
    details: "{summary of gate results}"
  recorded_by: "orchestrator"
  workflow_ref: "{NN-phase}.workflows.yml"
  git_commit: "{sha}"
```

### 3. Rework Decision Entry

```yaml
- timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  entry_type: "rework_decision"
  phase: "{phase}"
  rework:
    gate_id: "{gate_id}"               # Gate that triggered rework
    issue: "{specific problem}"          # e.g., "BDD coverage 78% (target 95%)"
    action: "{remediation action}"       # e.g., "Return to BA for scenario refinement"
    retry_deadline: "YYYY-MM-DDTHH:MM:SSZ"  # Gate re-run deadline
    estimated_rework_hours: 4           # Estimated hours to fix
  recorded_by: "orchestrator"
  workflow_ref: "{NN-phase}.workflows.yml"
  git_commit: "{sha}"
```

---

## Usage Rules

1. **Append-only**: Never edit existing decision entries
2. **Immediate recording**: Log within minutes of decision
3. **Git commit**: Include git SHA when available for auditability
4. **Timestamp accuracy**: Use ISO8601 format with timezone
5. **No agent actions**: Only log phase transitions, gate outcomes, and rework decisions — NOT individual agent actions

---

## What Gets Logged vs What Doesn't

### ✅ Log These
- Phase transitions (00 → 01 → 02, etc.)
- Gate outcomes (PASS / CONDITIONAL / FAIL with metrics)
- Rework decisions (loop back to same phase for refinement)

### ❌ Do NOT Log These
- Individual agent actions (agents follow workflows; workflows are the decisions)
- Agent deviation attempts (audit trail handled by agent logs, not decision trail)
- Internal agent reasoning or intermediate steps
