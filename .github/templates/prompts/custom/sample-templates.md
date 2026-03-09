# 🎯 Sample Prompt Templates

Generated automatically from detected patterns. Use these templates to save time and tokens.

---

## Template: BDD Scenario Generation

**Target Agent**: @dev-lead  
**Frequency**: High (15+ occurrences/week)  
**Token Savings**: ~25% reduction

### Template

```
@dev-lead: Generate BDD scenarios for {FEATURE_NAME}

Requirements:
- Reference: {USER_STORY_PATH}
- Format: Given/When/Then
- Coverage: Happy path + {NUM_EDGE_CASES} edge cases
- Validation: Check against acceptance criteria in {REQUIREMENTS_PATH}

Output: Feature file in /features/{FEATURE_CATEGORY}/{FEATURE_NAME}.feature
```

### Parameters

- **FEATURE_NAME**: Name of the feature (e.g., "login", "user-registration")
- **USER_STORY_PATH**: Path to user story (e.g., "/docs/user-stories/US-001/")
- **NUM_EDGE_CASES**: Number of edge cases to cover (default: 2)
- **REQUIREMENTS_PATH**: Path to requirements (e.g., "/docs/prd/user-stories.md")
- **FEATURE_CATEGORY**: Category folder (e.g., "auth", "profile")

### Example Usage

```
@dev-lead: Generate BDD scenarios for login

Requirements:
- Reference: /docs/user-stories/US-001/
- Format: Given/When/Then
- Coverage: Happy path + 2 edge cases
- Validation: Check against acceptance criteria in /docs/prd/user-stories.md

Output: Feature file in /features/auth/login.feature
```

---

## Template: Implementation Plan Request

**Target Agent**: @dev-lead  
**Frequency**: Medium (8-10 occurrences/week)  
**Token Savings**: ~35% reduction

### Template

```
@dev-lead: Create implementation plan for {USER_STORY_REF}

Context:
- User Story: {USER_STORY_PATH}
- BDD Scenarios: {BDD_PATH}
- Architecture: {ARCH_DOC_PATH}

Structure:
- 4 layers: Database → Backend → Config → Frontend
- Include: TDD test cases, file structure, complexity estimates
- Reference: Design specs in {DESIGN_PATH}

Output: {USER_STORY_PATH}/implementation-plan.md
```

### Parameters

- **USER_STORY_REF**: Story reference (e.g., "US-001")
- **USER_STORY_PATH**: Story folder path
- **BDD_PATH**: BDD scenarios location
- **ARCH_DOC_PATH**: Architecture document (default: "/docs/prd/architecture-design.md")
- **DESIGN_PATH**: Design specs (default: "/docs/design/design-systems.md")

### Example Usage

```
@dev-lead: Create implementation plan for US-001

Context:
- User Story: /docs/user-stories/US-001/
- BDD Scenarios: /docs/user-stories/US-001/bdd-scenarios/
- Architecture: /docs/prd/architecture-design.md

Structure:
- 4 layers: Database → Backend → Config → Frontend
- Include: TDD test cases, file structure, complexity estimates
- Reference: Design specs in /docs/design/design-systems.md

Output: /docs/user-stories/US-001/implementation-plan.md
```

---

## Template: Prompt Optimization Request

**Target Agent**: @ai-engineering  
**Frequency**: Medium (5-7 occurrences/week)  
**Token Savings**: ~40% reduction

### Template

```
@ai-engineering: Optimize prompt for {OPTIMIZATION_GOAL}

Original Prompt:
{ORIGINAL_PROMPT}

Focus Areas: {FOCUS_AREAS}
Context: {CONTEXT}
Constraints: {CONSTRAINTS}

Provide: 3 variants (Conservative/Balanced/Aggressive) with token analysis
```

### Parameters

- **OPTIMIZATION_GOAL**: Goal (e.g., "clarity", "token efficiency", "specificity")
- **ORIGINAL_PROMPT**: The prompt to optimize
- **FOCUS_AREAS**: Comma-separated list (e.g., "clarity, token_efficiency")
- **CONTEXT**: Additional context (optional)
- **CONSTRAINTS**: Any constraints (optional)

### Example Usage

```
@ai-engineering: Optimize prompt for clarity and token efficiency

Original Prompt:
"Can you please help me create a new user story for the authentication feature that we're building, and make sure it follows BDD format?"

Focus Areas: clarity, token_efficiency, specificity
Context: Creating user stories for PDLC Stage 4
Constraints: Must maintain BDD format requirement

Provide: 3 variants (Conservative/Balanced/Aggressive) with token analysis
```

---

## Template: Code Review Request

**Target Agent**: @dev-lead  
**Frequency**: Medium (6-8 occurrences/week)  
**Token Savings**: ~20% reduction

### Template

```
@dev-lead: Review implementation for {USER_STORY_REF}

Files Changed:
{FILE_PATHS}

Checklist:
- SOLID principles
- Test coverage > 80%
- Coding standards: {CODING_STANDARDS_PATH}
- BDD tests passing: {BDD_TEST_STATUS}
- Complexity < 10

References:
- Implementation plan: {IMPL_PLAN_PATH}
- Architecture constraints: {ARCH_DOC_PATH}
```

### Parameters

- **USER_STORY_REF**: Story reference
- **FILE_PATHS**: List of changed files (one per line)
- **CODING_STANDARDS_PATH**: Standards doc (default: "/.github/instructions/coding.instructions.md")
- **BDD_TEST_STATUS**: Test status (e.g., "All passing", "3 failing")
- **IMPL_PLAN_PATH**: Implementation plan location
- **ARCH_DOC_PATH**: Architecture doc (default: "/docs/prd/architecture-design.md")

### Example Usage

```
@dev-lead: Review implementation for US-001

Files Changed:
/src/database/migrations/001_create_users.ts
/src/backend/controllers/auth.controller.ts
/src/backend/services/auth.service.ts
/src/frontend/components/LoginForm.tsx

Checklist:
- SOLID principles
- Test coverage > 80%
- Coding standards: /.github/instructions/coding.instructions.md
- BDD tests passing: All passing
- Complexity < 10

References:
- Implementation plan: /docs/user-stories/US-001/implementation-plan.md
- Architecture constraints: /docs/prd/architecture-design.md
```

---

## Template: Weekly PDLC Status Report

**Target Agent**: @orchestrator  
**Frequency**: Low (1 occurrence/week)  
**Token Savings**: ~30% reduction

### Template

```
@orchestrator: Generate PDLC status report for {PROJECT_NAME}

Scope:
- Time Period: {START_DATE} to {END_DATE}
- PDLC Stages: {STAGES_FILTER}
- Implementation: {IMPLEMENTATION_FILTER}

Include:
- Completed stages and deliverables
- User stories status (Not Started/In Progress/Implemented)
- Blockers and risks
- Next week priorities

Output: {REPORT_PATH}
```

### Parameters

- **PROJECT_NAME**: Project name
- **START_DATE**: Report start date
- **END_DATE**: Report end date
- **STAGES_FILTER**: Stages to include (e.g., "Stage 1-8" or "all")
- **IMPLEMENTATION_FILTER**: Implementation scope (e.g., "Sprint 1", "all")
- **REPORT_PATH**: Output location (default: "/docs/reports/")

### Example Usage

```
@orchestrator: Generate PDLC status report for ProjectX

Scope:
- Time Period: 2026-01-02 to 2026-01-09
- PDLC Stages: Stage 1-6
- Implementation: Sprint 1

Include:
- Completed stages and deliverables
- User stories status (Not Started/In Progress/Implemented)
- Blockers and risks
- Next week priorities

Output: /docs/reports/weekly-status-2026-W02.md
```

---

## 🎯 How to Use Templates

1. **Copy the template** for your use case
2. **Replace parameters** (marked with `{PARAMETER_NAME}`)
3. **Paste to the target agent** (e.g., `@dev-lead`)
4. **Review and adjust** as needed

## 💡 Tips for Maximum Efficiency

- **Use consistent parameter formats** - Helps pattern detection
- **Reference file paths explicitly** - Improves context accuracy
- **Specify output locations** - Reduces back-and-forth
- **Include validation criteria** - Ensures quality gates

## 📊 Template Performance

| Template | Avg Tokens Before | Avg Tokens After | Savings |
|----------|------------------|------------------|---------|
| BDD Scenario Generation | 800 | 600 | 25% |
| Implementation Plan | 1200 | 780 | 35% |
| Prompt Optimization | 1000 | 600 | 40% |
| Code Review | 900 | 720 | 20% |
| Status Report | 1500 | 1050 | 30% |

---

**Auto-generated by AI Activity Logger**  
**Last Updated**: Week 02, 2026
