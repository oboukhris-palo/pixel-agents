# Gate Blocker Resolution Guide

> **Purpose:** Provide systematic resolution strategies when quality gates return CONDITIONAL or FAIL  
> **Used By:** All agents when phase progression is blocked  
> **Reference:** `.github/gates/gate-*.md` (gate specifications)

---

## Resolution Framework

When a quality gate blocks progression, follow this escalation path:

```
Gate FAIL/CONDITIONAL
    ↓
Step 1: Identify root cause (which metrics/prerequisites failed?)
    ↓
Step 2: Classify blocker type (Missing Artifact / Quality Deficit / External Dependency)
    ↓
Step 3: Apply resolution strategy (see tables below)
    ↓
Step 4: Re-run gate within deadline
    ↓
Step 5: If still blocked → Escalate to orchestrator + PM
```

---

## Blocker Classification

### Type 1: Missing Artifacts

**Symptom:** Required files/documents not present  
**Typical Gates:** All gates  
**Resolution Time:** 2-8 hours

| Missing Artifact | Responsible Agent | Resolution |
|-----------------|-------------------|------------|
| `requirements.md` | PO | Generate from available inputs using prd-tmpl.yml |
| `personas.md` | BA | Create from interview data or stakeholder inputs |
| `architecture-design.md` | Architect | Design system architecture from requirements |
| `test-strategies.md` | Dev-Lead + QA | Define testing approach from user stories |
| `iteration-planning.md` | PM | Create sprint plan from estimated stories |
| BDD feature files | BA | Write Given/When/Then scenarios from acceptance criteria |

### Type 2: Quality Deficits

**Symptom:** Artifacts exist but don't meet quality thresholds  
**Typical Gates:** gate-01 (BDD format), gate-02 (API completeness), gate-03 (BDD coverage)  
**Resolution Time:** 4-16 hours

| Quality Issue | Threshold | Typical Fix |
|--------------|-----------|-------------|
| BDD coverage < 95% | gate-03-testing | BA reviews acceptance criteria → writes missing scenarios |
| Epic-story linkage < 100% | gate-01-requirements | BA validates epicKey/epicLink in all story YAML files |
| API spec < 90% complete | gate-02-architecture | Architect documents missing endpoints in openapi.yaml |
| Test coverage target unset | gate-03-testing | Dev-Lead sets targets per component/layer |
| PO sign-off missing | gate-01-requirements | Schedule PO review session (< 2 hours) |

### Type 3: External Dependencies

**Symptom:** Blocker requires action outside the team's control  
**Typical Gates:** gate-00 (client access), gate-02 (security review)  
**Resolution Time:** Variable (1 day to 2 weeks)

| Dependency | Escalation Path | Mitigation |
|-----------|----------------|------------|
| Client access/credentials | PM → Client contact | Document as CONDITIONAL; proceed with available access |
| Security review (CISO) | PM → Security team | Schedule review; proceed CONDITIONAL if non-security-critical |
| Third-party API access | PM → Vendor | Mock API for development; real integration later |
| Stakeholder availability | PM → Schedule | Async review via document comments |
| Infrastructure provisioning | PM → DevOps | Use local/mock environments; deploy later |

---

## CONDITIONAL Approval Guidelines

A CONDITIONAL approval allows progression with documented restrictions:

### When to Use CONDITIONAL
- Missing metric is close to threshold (within 10%)
- External dependency has scheduled resolution date
- Non-critical artifact can be completed in parallel
- Stakeholder review scheduled within 48 hours

### CONDITIONAL Requirements
1. **Document the condition** in gate report (what's missing, why it's acceptable)
2. **Set a deadline** for condition resolution (max 48 hours for most conditions)
3. **Assign an owner** for each condition
4. **Schedule re-validation** (gate re-run at deadline)
5. **Log in checkpoint.yaml** as rework decision with retry deadline

### When NOT to Use CONDITIONAL
- Critical prerequisites missing (PO sign-off, architecture design)
- Quality metrics below 70% of threshold
- Security-critical blockers
- Multiple metrics failing simultaneously

---

## Escalation Protocol

If a gate fails **twice** after remediation:

1. **Orchestrator review** — Assess if gate thresholds are realistic
2. **PM escalation** — Resource/timeline adjustment needed?
3. **Stakeholder communication** — If timeline impact > 2 days
4. **Gate threshold review** — Are metrics appropriate for this project?

---

## Common Patterns & Quick Fixes

### Pattern: "BDD scenarios keep failing gate"
**Root Cause:** BA writing vague scenarios (not implementation-ready)  
**Fix:** Pair BA with Dev-Lead for 1 hour; use concrete examples in Given/When/Then

### Pattern: "Architecture gate always CONDITIONAL"
**Root Cause:** Design stakeholder validation hard to schedule  
**Fix:** Use async review (document comments + 48h deadline); 2 stakeholder minimum

### Pattern: "Planning gate blocked on estimates"  
**Root Cause:** PM missing context quality data for estimation  
**Fix:** Run context quality assessment first (5-point checklist); estimate in batches

### Pattern: "Assessment gate blocked on interviews"
**Root Cause:** Stakeholders unavailable for scheduled interviews  
**Fix:** Use written questionnaires as supplement; reduce minimum to 2 interviews + 1 questionnaire

---

**Version:** 1.0 | **Last Updated:** April 21, 2026 | **Status:** ACTIVE
