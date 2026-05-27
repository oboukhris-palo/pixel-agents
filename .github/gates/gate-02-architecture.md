# Phase 3-4: Architecture Quality Gate

gate_id: "gate-02-architecture"
phase: "02-architecture"
executed_by: "architect.agent.md + ux.agent.md"

## Prerequisites

- [ ] System architecture documented (all major components, integrations)
- [ ] Technology stack justified (OpenAPI spec, tech choices documented)
- [ ] Non-functional requirements specified (performance, scalability, availability, security)
- [ ] Design system created (UI components, design tokens, Figma/Penpot library)
- [ ] Figma/Penpot high-fidelity designs created for major flows
- [ ] Design validated with stakeholders (1-2 iteration rounds)
- [ ] Integration architecture mapped (external systems, data flows)
- [ ] Database schema designed and documented
- [ ] API contracts specified (OpenAPI/Swagger complete)
- [ ] Security architecture reviewed (CISO/security lead approval if required)

## Artifacts Required

- [ ] `architecture-design.md` (system architecture)
- [ ] `tech-spec.md` (technology choices + justification)
- [ ] `design-systems.md` (UI components, design tokens)
- [ ] `api/openapi.yaml` (complete API specification)
- [ ] `database/schema.sql` (database design)
- [ ] `figma-design-link.md` (link to Figma/Penpot high-fidelity designs)
- [ ] `design-validation-report.md` (stakeholder feedback summary)
- [ ] `security-architecture.md` (if security-critical)
- [ ] `non-functional-requirements.md` (performance, scalability specs)

## Quality Metrics

| Metric | Threshold | Measurement | Status |
|--------|-----------|-------------|--------|
| Architecture completeness | >= 95% of major components documented | Checklist in architecture-design.md | |
| Tech stack justification | Each major technology has documented rationale | Review tech-spec.md decision section | |
| Design system coverage | >= 20 reusable UI components defined | Count in design-systems.md or Figma library | |
| API specification completeness | >= 90% of endpoints specified | Validate OpenAPI spec against architecture | |
| Stakeholder design validation | Design reviewed with >= 2 stakeholders | Stakeholder names + feedback in validation report | CRITICAL |
| Security review completion | If security-critical: CISO review completed | Approval sign-off in security-architecture.md | CONDITIONAL |

## Approval Process

- **Gatekeeper:** architect.agent.md + ux.agent.md + security (if applicable)
- **Review Time:** < 6 hours
- **Approval Method:** Automated checklist + stakeholder design validation
- **Decision Format:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

## Outcomes

- **On PASS:** Proceed to Phase 5 (`03-testing.workflows.yml`)
- **On CONDITIONAL:** Iterate design with stakeholders; re-run gate within 3 days
- **On FAIL:** BLOCK progression; conduct architecture review workshop

## Post-Gate Artifact

`architecture-gate-report.md` (generated after review using `gate-report-tmpl.md`)

## Override Procedures

If gate FAILS and override is justified, follow `.github/validation/override-mechanisms.md`.
Use `.github/templates/approval-block-tmpl.md` to document override approval.
Use `.github/templates/approval-gate-tmpl.md` for structured approval gate records.
Orchestrator enforces `.github/validation/workflow-compliance.yml` risk levels.
