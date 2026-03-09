# Agent Prompt Library & Standards

## 🎯 Purpose
Reusable, tested prompt templates for all PDLC agents. Ensures consistent quality, reduces hallucinations, provides clear output formats.

---

## 📋 Prompt Template Structure

Every agent prompt must include:

```yaml
## Context Section
- Current Stage/Phase
- Available Inputs (documents/files)
- Dependencies resolved
- Previous decisions/constraints

## Task Definition
- Specific objective
- Success criteria
- Output format requirements
- Quality thresholds

## Instructions
- Step-by-step execution
- Decision criteria
- Edge case handling
- Validation checks

## Output Format
- Structured template (YAML/Markdown/JSON)
- Required sections
- Optional sections
- Examples

## Quality Gates
- Minimum completeness threshold
- Validation checklist
- Escalation triggers
- Confidence scoring

## Examples
- Input example
- Output example
- Common variations
```

---

## 🎨 Prompt Engineering Best Practices

### 1. Specificity Over Generality
❌ Bad: "Analyze the requirements"  
✅ Good: "Read requirements.md, identify 5-10 functional requirements, 3-5 non-functional requirements, categorize by MoSCoW priority (Must/Should/Could/Won't)"

### 2. Explicit Output Formats
❌ Bad: "Create personas"  
✅ Good: "Generate 3-5 personas in YAML format with fields: name, role, age, goals (3 items), pain_points (3 items), behaviors (3 items), quote"

### 3. Validation Criteria
❌ Bad: "Make sure it's complete"  
✅ Good: "Validate: ✓ All MUST requirements addressed ✓ Each requirement has acceptance criteria ✓ No vague terms like 'fast' or 'user-friendly' ✓ Measurable metrics defined"

### 4. Confidence Scoring
❌ Bad: "Here's the architecture"  
✅ Good: "Architecture confidence: 85% (High certainty on API design, Medium on database scaling, Need clarification: data retention policy)"

### 5. Escalation Triggers
❌ Bad: "Let me know if you need changes"  
✅ Good: "⚠️ ESCALATE IF: Requirements contradict (flag conflicts) | >30% of requirements lack acceptance criteria | Technical constraints unclear | Budget/timeline unrealistic"

---

## 📚 Common Prompt Patterns

### Pattern 1: Document Generation
```markdown
You are a [ROLE] working on [PROJECT_NAME] in PDLC Stage [X].

**Context:**
- Input Document: [DOCUMENT_PATH]
- Template: [TEMPLATE_PATH]
- Prior Decisions: [DECISION_SUMMARY]

**Task:**
Create [DOCUMENT_NAME] following these steps:

1. Read [INPUT_DOCUMENT] and extract [SPECIFIC_ELEMENTS]
2. Analyze [SPECIFIC_ASPECTS] considering [CONSTRAINTS]
3. Generate [OUTPUT_SECTIONS] using [TEMPLATE]
4. Validate against [QUALITY_CHECKLIST]

**Output Format:**
```yaml
[STRUCTURED_TEMPLATE]
```

**Quality Gates:**
- ✓ [GATE_1]
- ✓ [GATE_2]
- ✓ [GATE_3]

**Confidence Scoring:**
Rate confidence (0-100%) for:
- [ASPECT_1]: ___%
- [ASPECT_2]: ___%
- Overall: ___%

⚠️ **Escalate if:** [ESCALATION_TRIGGERS]
```

### Pattern 2: Code Generation (TDD)
```markdown
You are implementing [USER_STORY_REF] in [LAYER_NAME] using TDD.

**Context:**
- BDD Scenario: [FEATURE_FILE_PATH]
- Implementation Plan: [PLAN_PATH]
- Current Phase: [RED/GREEN/REFACTOR]
- Failing Test: [TEST_DESCRIPTION]

**Task (RED Phase):**
Write a failing unit test that:
1. Tests [SPECIFIC_BEHAVIOR]
2. Supports BDD assertion: [GHERKIN_STEP]
3. Follows pattern: [TEST_PATTERN]
4. Uses mocks for: [DEPENDENCIES]

**Output:**
```typescript
// File: [TEST_FILE_PATH]
describe('[COMPONENT]', () => {
  it('[BEHAVIOR]', () => {
    // Arrange
    [SETUP_CODE]
    
    // Act
    [EXECUTION_CODE]
    
    // Assert
    expect([ACTUAL]).toBe([EXPECTED])
  })
})
```

**Validation:**
- ✓ Test fails for right reason
- ✓ Clear failure message
- ✓ No implementation code
- ✓ Aligns with implementation plan

⚠️ **Escalate if:** Test is flaky | Unclear how to mock dependency | BDD step is ambiguous
```

### Pattern 3: Review & Validation
```markdown
You are reviewing [DOCUMENT/CODE] for quality and completeness.

**Context:**
- Artifact: [PATH]
- Stage: [STAGE_NAME]
- Quality Threshold: [PERCENTAGE]%
- Checklist: [CHECKLIST_NAME]

**Task:**
1. Read [ARTIFACT]
2. Evaluate against [CHECKLIST]
3. Score each criterion (0-10)
4. Calculate overall quality score
5. Identify gaps and recommendations

**Output Format:**
```yaml
quality_score: [0-100]
criteria:
  - name: [CRITERION_1]
    score: [0-10]
    status: [PASS/FAIL]
    notes: [EXPLANATION]
    
gaps:
  - severity: [HIGH/MEDIUM/LOW]
    description: [GAP_DESCRIPTION]
    recommendation: [FIX_RECOMMENDATION]
    
overall_assessment: [PASS/FAIL/NEEDS_WORK]
confidence: [0-100]%
```

**Thresholds:**
- PASS: ≥70% overall, no HIGH severity gaps
- NEEDS_WORK: 50-69% or 1-2 HIGH gaps
- FAIL: <50% or ≥3 HIGH gaps

⚠️ **Escalate if:** Fundamental architectural issues | Conflicting requirements | Missing critical information
```

---

## 🔧 Agent-Specific Prompt Variables

### PM (Project Manager)
- `{PROJECT_NAME}`: Current project
- `{TIMELINE_ESTIMATE}`: Duration in weeks
- `{BUDGET_CONSTRAINT}`: Budget limits
- `{TEAM_SIZE}`: Number of team members
- `{RISK_TOLERANCE}`: Low/Medium/High

### PO (Product Owner)
- `{BUSINESS_GOALS}`: Primary objectives
- `{USER_SEGMENTS}`: Target audiences
- `{PRIORITIZATION_METHOD}`: MoSCoW/RICE/Kano
- `{ACCEPTANCE_CRITERIA_FORMAT}`: Given-When-Then/Checklist

### BA (Business Analyst)
- `{PERSONA_COUNT}`: 3-5 typically
- `{SCENARIO_FORMAT}`: Gherkin/Tabular
- `{VALIDATION_METHOD}`: User testing/Stakeholder review

### Architect (Solution Architect)
- `{ARCHITECTURE_STYLE}`: Monolith/Microservices/Serverless
- `{TECH_STACK}`: Languages/frameworks
- `{SCALE_REQUIREMENTS}`: Users/transactions
- `{COMPLIANCE_NEEDS}`: GDPR/HIPAA/SOC2

### Dev-Lead (Technical Lead)
- `{LAYER_CURRENT}`: DB/Backend/Config/Frontend
- `{TEST_COVERAGE_TARGET}`: 80% default
- `{COMPLEXITY_THRESHOLD}`: Cyclomatic complexity <10

### TDD (TDD Navigator)
- `{TDD_PHASE}`: RED/GREEN/REFACTOR
- `{TEST_FRAMEWORK}`: Jest/Pytest/JUnit
- `{MOCK_STRATEGY}`: Manual/Auto/Spy

---

## 📊 Quality Scoring Rubric

### Document Quality (0-100%)
```yaml
Completeness: 30 points
  - All required sections present: 10
  - All sections have content: 10
  - Content depth adequate: 10

Clarity: 25 points
  - No vague terms: 10
  - Technical accuracy: 10
  - Consistent terminology: 5

Traceability: 25 points
  - Links to prior documents: 10
  - Requirements traced: 10
  - Decisions justified: 5

Actionability: 20 points
  - Clear next steps: 10
  - Acceptance criteria defined: 10
```

### Code Quality (0-100%)
```yaml
Correctness: 30 points
  - Tests pass: 15
  - No runtime errors: 15

Test Coverage: 25 points
  - >80% coverage: 15
  - Edge cases covered: 10

Code Quality: 25 points
  - Complexity <10: 10
  - No code smells: 10
  - Follows conventions: 5

Documentation: 20 points
  - Functions documented: 10
  - README updated: 10
```

---

## 🚨 Common Failure Modes & Fixes

### Failure Mode 1: Vague Requirements
**Symptom**: Requirements like "fast", "user-friendly", "scalable"  
**Detection**: Grep for subjective adjectives  
**Fix Prompt**: "Replace vague term '[TERM]' with measurable metric (e.g., 'page loads in <2 seconds', 'supports 10K concurrent users')"

### Failure Mode 2: Missing Acceptance Criteria
**Symptom**: User story has no testable conditions  
**Detection**: Story lacks "Given-When-Then" or "Accepts if"  
**Fix Prompt**: "For user story '[STORY]', generate 3-5 acceptance criteria in Given-When-Then format covering happy path, edge cases, and error scenarios"

### Failure Mode 3: Circular Dependencies
**Symptom**: Story A depends on Story B depends on Story A  
**Detection**: Dependency graph analysis  
**Fix Prompt**: "Dependency cycle detected: [CYCLE]. Refactor stories to remove cycle by [STRATEGY: extract shared component | change implementation order | split story]"

### Failure Mode 4: Test Doesn't Match BDD
**Symptom**: Unit test passes but BDD scenario fails  
**Detection**: BDD test suite execution  
**Fix Prompt**: "BDD scenario '[SCENARIO]' fails at step '[STEP]'. Review unit tests in '[LAYER]' and identify which assertion is missing to support this BDD step."

### Failure Mode 5: Overengineering
**Symptom**: 500-line function, excessive abstraction  
**Detection**: Cyclomatic complexity >10, function length >100 lines  
**Fix Prompt**: "Function '[FUNCTION]' has complexity [VALUE]. Refactor using [PATTERN: Extract Method | Strategy Pattern | Compose Functions] to reduce complexity below 10."

---

## 🎯 Success Examples

### Example 1: PM Project Charter
**Input**: Stakeholder wants "better authentication"  
**Prompt Applied**: PM-kickoff template  
**Output**:
```yaml
project_charter:
  name: "Enhanced Authentication System"
  business_objective: "Reduce password reset tickets by 40% (current: 200/month)"
  success_metrics:
    - metric: "Password reset requests"
      baseline: 200/month
      target: 120/month
      measurement: Helpdesk ticket tracking
    - metric: "Account takeover incidents"
      baseline: 5/quarter
      target: 0/quarter
      measurement: Security incident log
  timeline: "8 weeks (MVP), 12 weeks (full)"
  constraints:
    - budget: "$50K (development only)"
    - compliance: "GDPR, CCPA"
    - technology: "Integrate with existing Node.js stack"
```
**Quality Score**: 92% ✅

---

### Example 2: BA BDD Scenario
**Input**: User story "As a user, I want to reset my password"  
**Prompt Applied**: BA-bdd-scenarios template  
**Output**:
```gherkin
Feature: Password Reset
  As a registered user
  I want to reset my password
  So that I can regain access to my account

Scenario: Successful password reset via email
  Given I am a registered user with email "user@example.com"
  And I am on the login page
  When I click "Forgot Password"
  And I enter "user@example.com"
  And I click "Send Reset Email"
  Then I should see "Password reset email sent"
  And I should receive an email at "user@example.com" within 60 seconds
  And the email should contain a reset link valid for 24 hours
  When I click the reset link
  And I enter a new password "NewSecure123!"
  And I confirm the password "NewSecure123!"
  And I click "Reset Password"
  Then I should see "Password successfully reset"
  And I should be redirected to the login page
  When I log in with "user@example.com" and "NewSecure123!"
  Then I should be logged in successfully

Scenario: Password reset link expires
  Given I requested a password reset 25 hours ago
  When I click the reset link
  Then I should see "Reset link expired"
  And I should see a button "Request new reset link"
```
**Quality Score**: 95% ✅

---

### Example 3: Dev-Lead Implementation Plan
**Input**: BDD scenario above + architecture-design.md + tech-spec.md  
**Prompt Applied**: Dev-Lead-bdd-integration template  
**Output**:
```markdown
# Implementation Plan: US-042 (Password Reset)

## Layer 1: Database
**Tables:**
- `password_reset_tokens` (new)
  - id: UUID PRIMARY KEY
  - user_id: UUID FK → users(id)
  - token: VARCHAR(256) UNIQUE
  - expires_at: TIMESTAMP
  - used_at: TIMESTAMP NULL
  - created_at: TIMESTAMP

**Migrations:**
- `001_create_password_reset_tokens.sql` (up/down)

**Models:**
- `PasswordResetToken` class with validations

**BDD Coverage After Layer 1:**
- ✓ Token storage works

**Estimated Complexity:** 3 story points

## Layer 2: Backend Logic
**Endpoints:**
- POST /api/auth/password-reset/request
  - Input: { email: string }
  - Output: { message: string }
  - Business Logic: Validate email, generate token, store, send email
  
- POST /api/auth/password-reset/confirm
  - Input: { token: string, newPassword: string }
  - Output: { message: string }
  - Business Logic: Validate token, check expiry, hash password, update user

**Services:**
- `PasswordResetService.requestReset(email)`
- `PasswordResetService.confirmReset(token, password)`
- `EmailService.sendPasswordResetEmail(email, token)`

**BDD Coverage After Layer 2:**
- ✓ Reset email sent
- ✓ Token validation works
- ✓ Password updated in database
- ✓ Link expiry enforced

**Estimated Complexity:** 5 story points

## Layer 3: Configuration
**Routes:**
- Register /api/auth/password-reset/* routes in `auth.routes.ts`

**DI:**
- Wire EmailService with SMTP config

**Env Variables:**
- PASSWORD_RESET_TOKEN_EXPIRY=24h
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

**BDD Coverage After Layer 3:**
- ✓ Routes accessible

**Estimated Complexity:** 2 story points

## Layer 4: Frontend
**Components:**
- `ForgotPasswordForm` (email input)
- `ResetPasswordForm` (new password, confirm password)

**State:**
- `usePasswordReset` hook

**API Client:**
- `authAPI.requestPasswordReset(email)`
- `authAPI.confirmPasswordReset(token, password)`

**BDD Coverage After Layer 4:**
- ✓ All BDD scenarios pass end-to-end

**Estimated Complexity:** 5 story points

## Definition of Done
- ✅ All BDD scenarios pass
- ✅ Test coverage >80%
- ✅ Code review approved
- ✅ Security review passed (token security, rate limiting)
```
**Quality Score**: 98% ✅

---

## 🔄 Continuous Improvement

### Prompt Testing Protocol
1. **Create test scenario** with known input/output
2. **Run prompt** with 3 different LLMs (GPT-4, Claude, Gemini)
3. **Measure quality** using scoring rubric
4. **Iterate** if quality <80% on any LLM
5. **Document** best version in this library

### Prompt Version Control
- Track prompt changes in git
- Tag stable versions (v1.0, v1.1, etc.)
- Document breaking changes
- Maintain changelog per agent

### Feedback Loop
- Collect real usage data
- Identify common failures
- Update prompts quarterly
- A/B test improvements

---

**Last Updated**: December 24, 2025  
**Version**: 1.0  
**Maintainer**: PDLC Orchestration Team
