# Phase 0: Assessment Quality Gate

gate_id: "gate-00-assessment"
phase: "00-assessment"
executed_by: "orchestrator.agent.md"

## Prerequisites

- [ ] At least 3 stakeholder interviews completed (executive, technical, domain expert)
- [ ] Client input inventory documented (what materials exist, what's missing)
- [ ] Technology audit conducted (current tech stack documented with versions)
- [ ] Business context captured (market opportunity, success metrics, budget/timeline)
- [ ] AI readiness assessed (score 1-10 across 8 dimensions + confidence)
- [ ] Client maturity tier classified (Tier 1-4)

## Artifacts Required

- [ ] `prerequisites-request.yml` (formal access/infrastructure request)
- [ ] `input-inventory-assessment.md`
- [ ] `technology-audit.md`
- [ ] `business-context-summary.md`
- [ ] `ai-readiness-report.md` (includes 8-dimension scores)
- [ ] `client-maturity-classification.md`
- [ ] `stakeholder-interview-notes/` (3+ interviews)

## Quality Metrics

| Metric | Threshold | Measurement | Status |
|--------|-----------|-------------|--------|
| Stakeholder coverage | >= 3 unique stakeholders | Count of unique stakeholder interviews | |
| Technology audit completeness | >= 90% of key tech stack documented | Completeness checklist in tech-audit.md | |
| AI readiness confidence | >= 70% (avg across 8 dimensions) | Average confidence from ai-readiness-report.md | |
| Business metric clarity | 3+ measurable success metrics defined | Count in business-context-summary.md | |

## Approval Process

- **Gatekeeper:** orchestrator + pm.agent
- **Review Time:** < 2 hours
- **Approval Method:** Automated checklist + manual review
- **Decision Format:** ✅ PASS | ⚠️ CONDITIONAL (with notes) | ❌ FAIL

## Conditional Approval Examples

- AI readiness only 65% confidence → conditional approval IF stakeholder confirms timeline flexibility
- Only 2 stakeholders interviewed → conditional IF more interviews scheduled within 2 days

## Outcomes

- **On PASS:** Proceed to Phase 1-2 (`01-requirements.workflows.yml`)
- **On CONDITIONAL:** Proceed WITH noted restrictions; document decisions in decision-log
- **On FAIL:** BLOCK progression; escalate to PM and orchestrator; document blockers

## Post-Gate Artifact

`assessment-gate-report.md` (generated after review using `gate-report-tmpl.md`)

## Override Procedures

If gate FAILS and override is justified, follow `.github/validation/override-mechanisms.md`.
Use `.github/templates/approval-block-tmpl.md` to document override approval.
Use `.github/templates/approval-gate-tmpl.md` for structured approval gate records.
Orchestrator enforces `.github/validation/workflow-compliance.yml` risk levels.
