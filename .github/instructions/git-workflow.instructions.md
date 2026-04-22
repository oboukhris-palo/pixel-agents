---
description: Comprehensive git workflow standards for branch naming, commits, and PRs
applyTo: "**"
priority: high
enforcement: strict
---

# Git Workflow Instructions

## Branch Naming

**Format**: `<type>/<scope>-<description>`

Always create a branch before committing. Never commit directly to main.

### Assessment Phase
- **Type**: `assessment`
- **Scope**: Brief domain or focus area
- **Example**: `assessment-client_inputs_analysis`, `assessment-technology_inventory`

### Documentation Phases (1-7)
- **Type**: Phase name (e.g., `requirements`, `architecture`, `testing`, `planning`)
- **Scope**: Content focus area
- **Examples**: 
  - `requirements-prd_update_post_stakeholder_interview`
  - `architecture-system_design_diagrams`
  - `testing-bdd_scenario_validation`

### Implementation Phase (8 - TDD)
- **Type**: `feat` (feature), `fix` (bug fix), or `chore` (infrastructure)
- **Scope**: EPIC-xxx/US-xxx or feature name
- **Examples**:
  - `feat/EPIC-001-US-045-auth-register`
  - `fix/EPIC-001-US-045-email-validation-bug`
  - `chore/update-dependencies`

---

## Commit Message Format

### Assessment Phase
```
ASSESSMENT - [description]

Example:
ASSESSMENT - Client maturity analysis and prerequisites request
```

### Documentation Phases (1-7)
```
<PHASE-NAME> - [description]

Examples:
- REQUIREMENTS - Design persona profiles from interviews
- ARCHITECTURE - Document REST API endpoints and database schema
- TESTING - Define BDD test scenarios for login flow
- PLANNING - Create deployment strategy and rollback plan
```

### Implementation Phase (8 - TDD)
```
TDD-<EPIC-REF>-<US-REF>-<PHASE>-<CYCLE>: [description]

Examples:
- TDD-EPIC-09-US-045-RED-01: Write failing test for email validation
- TDD-EPIC-09-US-045-GREEN-01: Implement email validator using regex
- TDD-EPIC-09-US-045-REFACTOR-01: Extract validator to separate service

Where:
- EPIC-REF: Epic identifier (e.g., EPIC-01, EPIC-09)
- US-REF: User story identifier (e.g., US-045)
- PHASE: RED | GREEN | REFACTOR
- CYCLE: Two-digit cycle number (01, 02, 03, ...)
```

---

## Commit Frequency Guidelines

### Assessment Phase
- **1 commit per major deliverable** (prerequisites, AI readiness report)
- Typical: 3-5 commits per assessment

### Documentation Phases (1-7)
- **1 commit per deliverable** (user stories, architecture, test strategy, deployment plan)
- Add commits per significant update or review cycle
- Typical: 5-10 commits per phase

### Implementation Phase (TDD)
- **1 commit per TDD cycle** (RED, GREEN, REFACTOR each = 1 commit)
- Mark implementation-plan.md checkpoint after each commit
- Typical: 3-6 commits per user story layer (RED, GREEN, REFACTOR × 2 iterations)

### Rule: Never Commit Directly to Main
- Always create a branch following naming conventions first
- Create a Pull Request before starting commits
- All commits happen on the feature branch
- Merge to main only after PR approval
- Use atomic commits: each should be self-contained and testable

---

## Pull Request Workflow

### Branch Workflow
1. Create branch following naming conventions: `git checkout -b <type>/<scope>-<description>`
2. Create Pull Request immediately (mark as Draft if not ready)
3. Commit all changes to this branch (never to main)
4. Once ready, convert PR from Draft to Ready for Review

### Before Pushing to PR
1. Ensure branch is up to date: `git pull --rebase origin main`
2. Run git hooks validation locally: pre-commit hook checks run automatically
3. Verify all commits follow naming standards (commit-msg hook enforces)
4. Ensure implementation-plan.md checkboxes updated (for Phase 8)

### PR Template
Use `.github/templates/pull_request_template.md` - includes:
- Branch naming validation
- Commit message pattern verification
- Story artifacts checklist (description.md, implementation-plan.md, BDD scenarios)
- Documentation hygiene (links, INDEX.md updates)
- Technical quality checklist

### PR Description Requirements
- Reference EPIC and US identifiers: "Closes #US-xxx" or "Relates to EPIC-xxx"
- Link to GitHub Issue for story tracking
- Summary of changes and business impact
- Reference implementation-plan.md for Phase 8 work

### Code Review Checklist
- All BDD tests passing (Phase 8)
- Commit messages follow standards
- 13-point code review checklist satisfied
- Acceptance criteria met
- Documentation updated

---

## Git Hooks Integration

**Setup**: See `.github/instructions/git-hooks-setup.instructions.md`

### Hooks Installed
- **pre-commit**: Logs action, updates INDEX.md, validates naming
- **commit-msg**: Validates commit message format
- **post-merge**: Updates documentation indices and checkpoint.yaml

### Bypass Hooks (Only When Necessary)
```bash
git commit --no-verify  # Skip pre-commit and commit-msg hooks
git push --no-verify    # Skip pre-push hook if applicable
```

⚠️ **Use sparingly** - breaks audit trail and validation

---

## Phase-Specific Examples

### Assessment Phase
```
Branch: assessment-client_inputs_analysis

Commits:
- ASSESSMENT - Client maturity analysis and prerequisites request
- ASSESSMENT - Generate AI readiness report
- ASSESSMENT - Document technology inventory

PR Title: Assessment Complete: Client Ready for Phase 1-7
```

### Documentation Phase
```
Branch: requirements-persona_definitions_post_interviews

Commits:
- REQUIREMENTS - Design persona profiles from stakeholder interviews
- REQUIREMENTS - Map personas to user story acceptance criteria

PR Title: User Personas Complete
```

### TDD Implementation
```
Branch: feat/EPIC-001-US-045-auth-register

Commits:
- TDD-EPIC-001-US-045-RED-01: Write failing test for email format validation
- TDD-EPIC-001-US-045-GREEN-01: Implement email validation regex
- TDD-EPIC-001-US-045-REFACTOR-01: Extract validator to separate module
- TDD-EPIC-001-US-045-RED-02: Write failing test for password hashing
- TDD-EPIC-001-US-045-GREEN-02: Implement bcrypt password hashing
- TDD-EPIC-001-US-045-REFACTOR-02: Clean up error handling

PR Title: User Registration Implementation (US-045, EPIC-001)
```

---

## Validation & Enforcement

### Git Hooks Validation
Pre-commit hook validates:
1. Branch name follows pattern: `<type>/<scope>-<description>`
2. Commit messages follow required format
3. Documentation INDEX.md files updated
4. No violations of naming conventions

### PR Template Validation
PR template checklist enforces:
1. Branch naming compliance
2. Commit message pattern compliance
3. Story artifacts present (description.md, implementation-plan.md, BDD scenarios)
4. Documentation links valid
5. Acceptance criteria documented

### Commit Message Validation
Commit-msg hook rejects:
- ❌ Commits without required type prefix (ASSESSMENT, REQUIREMENTS, TDD-, etc.)
- ❌ Commits with incorrect format
- ❌ Commits to main branch (branch protection + hooks enforce this)

---

## Git Configuration for Clients

**New client repo setup**:
```bash
git clone <repo>
npm install                                    # Installs hooks via setup-git-hooks.mjs
```

OR manual setup:
```bash
git clone <repo>
node .github/scripts/setup-git-hooks.mjs      # Configure git hooks
node .gene2-core/.github/scripts/setup-git-hooks.mjs  # Installs hooks to .git/hooks/
```

---

## Common Workflows

### Starting New Feature (Phase 8 TDD)
```bash
# Create and push branch
git checkout -b feat/EPIC-001-US-045-auth-register
git push -u origin feat/EPIC-001-US-045-auth-register

# Create PR (mark as Draft initially if not ready)
# Then commit on the branch

# Red phase: write failing test
git add tests/
git commit -m "TDD-EPIC-001-US-045-RED-01: Write failing auth validation test"

# Green phase: implement minimal code
git add src/
git commit -m "TDD-EPIC-001-US-045-GREEN-01: Implement auth validation"

# Refactor phase: clean code
git add src/
git commit -m "TDD-EPIC-001-US-045-REFACTOR-01: Extract validation to service"

# Push commits and mark PR as ready for review
git push origin feat/EPIC-001-US-045-auth-register
```

### Keeping Branch Updated
```bash
git fetch origin
git rebase origin/main                         # Rebase instead of merge
git push --force-with-lease origin <branch>   # Update branch safely
```

### After PR Approval
git push --force-with-lease origin <branch>   # Update before merging
```bash
git log --oneline origin/main..                # Review commits
# Preserve full commit history (Do NOT squash). Keep all commits and agent audit details.
# If you need to reorder commits without squashing, use interactive rebase carefully:
git rebase -i origin/main                      # Reorder commits (avoid squash)
git push --force-with-lease origin <branch>   # Update before merging (only if necessary)

# Merge via GitHub UI using "Create a merge commit" (preserves branch commits and history). The branch may be deleted after merge.
```

---

## Related Documentation

- **Git Hooks Setup**: `.github/instructions/git-hooks-setup.instructions.md`
- **PR Template**: `.github/templates/pull_request_template.md`
- **Framework Standards**: `.github/instructions/framework-standards.instructions.md`
- **Agent Logging**: `.github/instructions/agent-logging.instructions.md`

---

**Version**: 1.0 | **Created**: April 13, 2026 | **Status**: ACTIVE | **Enforcement**: STRICT
