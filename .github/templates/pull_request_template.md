# Pull Request Checklist - Gen‑e2 Compliance

## 📋 Naming Convention Validation

**Git Workflow Standards**: See `.github/instructions/git-workflow.instructions.md` for complete reference

### Branch Naming
- [ ] Branch name follows pattern: `<type>/<scope>-<description>`
  - Assessment: `assessment-client_inputs_analysis`
  - Documentation: `requirements-prd_update_post_stakeholder_interview`
  - Implementation: `feat/EPIC-xxx-US-xxx-<description>`
  - Other: `fix/...` or `chore/...`
- [ ] Branch references correct EPIC-xxx and US-xxx identifiers (if applicable)
- [ ] Description is kebab-case and descriptive

### PR Title & Description
- [ ] PR title references EPIC-xxx and US-xxx identifiers
- [ ] PR description links to relevant story: `Closes #US-xxx` or `Relates to EPIC-xxx`
- [ ] Clear summary of changes and business impact

### Commit Message Patterns
- [ ] ALL commits follow pattern in `.github/instructions/git-workflow.instructions.md`
  - **Assessment**: `ASSESSMENT - description`
  - **Documentation**: `<PHASE-NAME> - description` (e.g., `REQUIREMENTS - ...`, `ARCHITECTURE - ...`)
  - **TDD**: `TDD-<EPIC-REF>-<US-REF>-<PHASE>-<CYCLE>: description` (e.g., `TDD-EPIC-09-US-045-RED-01: ...`)
  - **General**: `<type>(<scope>): description`
- [ ] No dates in commit messages or branch names (git provides this info)

## 📄 Documentation Requirements

### Story Artifacts
- [ ] **description.md** present and current for affected stories
- [ ] **implementation-plan.md** updated with checkboxes for affected stories
- [ ] All acceptance criteria clearly documented and measurable
- [ ] BDD scenarios mapped to implementation layers (if applicable)

### Documentation Hygiene
- [ ] **INDEX.md** refreshed in affected folders using `node .github/scripts/repo-conventions/update-index.mjs`
- [ ] Links use relative paths (avoid absolute paths)
- [ ] No broken links or missing references
- [ ] CHANGELOG.md updated if docs structure changed

## 🔗 Logging & Traceability

### Progress Tracking
- [ ] **implementation-plan.md checkboxes** mark [x] for completed tasks
- [ ] Git commit messages follow TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD format
- [ ] All BDD scenarios in features/ folder pass

### No Documentation Pollution
- [ ] No verbose logs or execution details in /docs folder
- [ ] Only 3 files + 1 folder per user story (description.md, implementation-plan.md, plan-approval.yaml, features/)

## ⚙️ Technical Quality

### Implementation Standards
- [ ] Code follows established patterns from `.github/instructions/`
- [ ] All tests pass (unit, integration, E2E)
- [ ] BDD scenarios validate successfully (if applicable)
- [ ] No regressions introduced

### File Organization
- [ ] Files placed in correct PDLC phase directories:
  - `/docs/01-requirements/` - Requirements & personas (IMMUTABLE)
  - `/docs/02-architecture/` - Architecture & tech specs (IMMUTABLE)
  - `/docs/03-testing/` - Testing strategies (IMMUTABLE)
  - `/docs/04-planning/` - Planning & deployment (IMMUTABLE)
  - `/docs/05-implementation/` - Implementation status (MUTABLE)
- [ ] Epic structure follows: `/docs/05-implementation/epics/<EPIC-xxx>/user-stories/<US-xxx>/`

## 🔍 Pre-PR Validation

### Automated Checks (if available)
- [ ] `node .github/scripts/repo-conventions/update-index.mjs` runs without errors
- [ ] `node .github/scripts/repo-conventions/enforce-naming.mjs` passes validation
- [ ] Link checker validates all references
- [ ] No hardcoded paths in agent prompts (use docs/INDEX.md navigation)

### Manual Review
- [ ] Changes align with user story acceptance criteria
- [ ] Implementation follows layer architecture (DB → Backend → Config → Frontend)
- [ ] Security and error handling considerations addressed
- [ ] Performance implications considered and documented

## 📝 Additional Context

### Related Stories/Epics
<!-- List any related EPIC-xxx or US-xxx that this PR impacts -->

### Risk Assessment
<!-- Describe any risks or breaking changes introduced -->

### Testing Strategy
<!-- Describe how changes were tested, including BDD validation if applicable -->

### Deployment Notes
<!-- Any special deployment considerations or migration steps required -->

---

## ✅ Final Checklist

Before merging, confirm:
- [ ] All checkboxes above completed
- [ ] Peer review completed (if applicable)
- [ ] CI/CD pipeline passes
- [ ] Documentation accurately reflects implemented changes
- [ ] No temporary or debug code left in commit

---

**Framework Version**: 2.0.0 | **Created**: 2026-04-01 | **Type**: Gen‑e2 Compliance Template