---
description: "System-wide status definitions for consistent terminology across all templates"
version: "1.0"
last_updated: "2026-03-16"
applies_to: ["user-story", "epic", "implementation-tracking", "project-status", "approval-gate"]
---

# System Status Definitions

**Purpose**: Single source of truth for workflow states and approval statuses across all templates.  
**Usage**: Reference these definitions in all template metadata and status fields.

---

## Workflow States (5-State Model)

Used to track the progression of work items (stories, tasks, features) through the development lifecycle.

### State Diagram
```
⬜ NOT_STARTED → 🟨 IN_PROGRESS → 🟠 IN_REVIEW → ✅ IMPLEMENTED → 📦 DELIVERED
                     ↓
              (can return to)
              NOT_STARTED if blocked
```

### State Definitions

#### 1. NOT_STARTED ⬜
- **ID**: `1-not-started`
- **Jira Equivalent**: "To Do"
- **Emoji**: ⬜
- **Description**: No work has begun; item is backlogged or planned
- **Conditions**:
  - Dependencies not yet started OR not met
  - No resources allocated
  - No commits to repository
- **Allowed Transitions**: → IN_PROGRESS (when work begins)
- **Used in Templates**:
  - user-stories.md (status field)
  - project-status.md (epic progress)
  - sprint-planning.md (story status)
- **Example in YAML**:
  ```yaml
  status: not_started  # Always lowercase with underscores
  status_emoji: "⬜"
  status_readable: "Not Started"
  ```

#### 2. IN_PROGRESS 🟨
- **ID**: `2-in-progress`
- **Jira Equivalent**: "In Progress"
- **Emoji**: 🟨
- **Description**: Active development underway; someone is actively working
- **Conditions**:
  - At least one team member assigned
  - Code commits or design artifacts created
  - Tests are being written/updated
  - Fewer than 100% of acceptance criteria met
- **Allowed Transitions**: 
  - → IN_REVIEW (when dev work complete, ready for validation)
  - → NOT_STARTED (if blocked or deprioritized; with reason)
- **Used in Templates**:
  - user-stories.md (status field)
  - implementation-plan.md (checkbox progress tracking)
  - project-status.md (epic progress)
- **Example in YAML**:
  ```yaml
  status: in_progress
  status_emoji: "🟨"
  progress_percentage: 45  # Optional numeric progress
  last_update: "2026-03-16T14:30:00Z"
  ```

#### 3. IN_REVIEW 🟠
- **ID**: `3-in-review`
- **Jira Equivalent**: "In Review"
- **Emoji**: 🟠
- **Description**: Implementation complete; awaiting validation and approval
- **Conditions**:
  - All acceptance criteria technically met
  - All BDD scenarios written
  - Code review initiated
  - Tests passing (unit/integration)
  - Awaiting: security review, compliance review, B A validation, or approval gate
- **Allowed Transitions**:
  - → IMPLEMENTED (when all reviews pass, BDD tests green)
  - → IN_PROGRESS (if issues found during review, rework needed)
- **Used in Templates**:
  - user-stories.md (status field)
  - code-review-checklist.md (review status)
  - approval-gate.template.md (approval status)
- **Example in YAML**:
  ```yaml
  status: in_review
  status_emoji: "🟠"
  reviews_pending:
    - reviewer: "Security Officer"
      state: pending
      since: "2026-03-15T10:00:00Z"
    - reviewer: "Product Owner"
      state: approved
      date: "2026-03-16T09:00:00Z"
  ```

#### 4. IMPLEMENTED ✅
- **ID**: `4-implemented`
- **Jira Equivalent**: "Done"
- **Emoji**: ✅
- **Description**: Development complete, all reviews passed, ready for deployment
- **Conditions**:
  - 100% of acceptance criteria met
  - All BDD scenarios passing
  - All code reviews approved
  - Security/compliance review approved
  - Test coverage > 80% (or project threshold)
  - No CRITICAL/HIGH defects
  - Quality gates passed
- **Allowed Transitions**: → DELIVERED (after deployment validation)
- **Used in Templates**:
  - user-stories.md (status field)
  - project-status.md (completion tracking)
  - user-stories-tracking.md (SSOT)
- **Example in YAML**:
  ```yaml
  status: implemented
  status_emoji: "✅"
  completion_date: "2026-03-16T17:30:00Z"
  all_reviews_approved: true
  ```

#### 5. DELIVERED 📦
- **ID**: `5-delivered`
- **Jira Equivalent**: "Done" (closed)
- **Emoji**: 📦
- **Description**: Deployed to production and validated; feature is live
- **Conditions**:
  - Deployed to production environment
  - Post-deployment validation passed
  - Monitoring confirmed no errors
  - Users can access new feature (if applicable)
  - Release notes published
- **Allowed Transitions**: (Terminal state)
- **Used in Templates**:
  - user-stories.md (final status)
  - project-status.md (completion rate)
  - executive-status-report.md ("Delivered" count)
- **Example in YAML**:
  ```yaml
  status: delivered
  status_emoji: "📦"
  deployed_date: "2026-03-17T08:00:00Z"
  deployment_window: "2026-03-17T08:00:00Z to 2026-03-17T08:15:00Z"
  rollout_percentage: 100
  ```

---

## Approval Statuses (For Review Gates)

Used in approval-gate.template.md, code-review-checklist.template.md, and similar review workflows.

### Approval State Diagram
```
⏳ PENDING → 🟨 REVIEWING → ✅ APPROVED → 🎯 CONDITIONAL → 📋 IMPLEMENTATION
                  ↓
             🔴 REJECTED → 🔧 REMEDIATION
```

### Approval State Definitions

#### 1. PENDING ⏳
- **ID**: `approval-pending`
- **Emoji**: ⏳
- **Description**: Approval not yet requested or request sent but not started
- **Conditions**:
  - Gate created but approvals not yet requested
  - Approvers haven't yet reviewed
  - Gate just transitioned from template/placeholder
- **Duration SLA**: Should not exceed 2 business days
- **Example**:
  ```yaml
  approval_status: pending
  approval_status_emoji: "⏳"
  requested_date: "2026-03-16T10:00:00Z"
  ```

#### 2. REVIEWING 🟨
- **ID**: `approval-reviewing`
- **Emoji**: 🟨
- **Description**: Approver is actively reviewing; decision pending
- **Conditions**:
  - At least one approver has opened the document
  - Comments/questions may be pending
  - No final decision yet
- **Duration SLA**: Should not exceed 1 business day from "PENDING"
- **Example**:
  ```yaml
  approval_status: reviewing
  approval_status_emoji: "🟨"
  reviewers_active:
    - name: "Security Officer"
      started: "2026-03-16T14:00:00Z"
  ```

#### 3. APPROVED ✅
- **ID**: `approval-approved`
- **Emoji**: ✅
- **Description**: All required approvers have signed off; gate passes
- **Conditions**:
  - All required approvers: APPROVED status
  - All conditional triggers evaluated
  - No blockers remain
  - Rationale documented
- **Effect**: Gate automatically transitions to NEXT_PHASE
- **Example**:
  ```yaml
  approval_status: approved
  approval_status_emoji: "✅"
  approved_date: "2026-03-16T17:00:00Z"
  approvers:
    - name: "Product Owner"
      decision: approved
      rationale: "Feature meets all requirements"
      date: "2026-03-16T15:30:00Z"
    - name: "Tech Lead"
      decision: approved
      rationale: "Architecture validated"
      date: "2026-03-16T17:00:00Z"
  ```

#### 4. CONDITIONAL 🎯
- **ID**: `approval-conditional`
- **Emoji**: 🎯
- **Description**: Gate passes with conditions; proceed only if conditions met
- **Conditions**:
  - All required approvals obtained ("yes, but...")
  - Specific conditions must be resolved first
  - Blockers are removable (not showstoppers)
  - Can proceed in parallel with condition remediation
- **Duration for Conditions**: Max 3 business days
- **Example**:
  ```yaml
  approval_status: conditional
  approval_status_emoji: "🎯"
  conditions:
    - id: COND-001
      description: "Security scan must run post-deployment"
      owner: "Security Officer"
      target_date: "2026-03-18T10:00:00Z"
      status: pending
    - id: COND-002
      description: "Performance baseline must be established"
      owner: "DevOps"
      target_date: "2026-03-18T16:00:00Z"
      status: in_progress
  ```

#### 5. REJECTED 🔴
- **ID**: `approval-rejected`
- **Emoji**: 🔴
- **Description**: Gate does not pass; work cannot proceed (blocker)
- **Conditions**:
  - One or more required approvals: REJECTED
  - Blocking issues identified
  - Remediation required before re-submission
- **Next Steps**: Transition to REMEDIATION
- **Example**:
  ```yaml
  approval_status: rejected
  approval_status_emoji: "🔴"
  rejected_date: "2026-03-16T16:30:00Z"
  rejections:
    - approver: "Security Officer"
      reason: "SQL injection vulnerability in query 45"
      severity: critical
      resolution_path: "Parameterized queries required"
      target_fix_date: "2026-03-17T17:00:00Z"
  ```

#### 6. REMEDIATION 🔧
- **ID**: `approval-remediation`
- **Emoji**: 🔧
- **Description**: Rejected items are being fixed; resubmission planned
- **Conditions**:
  - Issues being addressed
  - Team working on fixes
  - No resubmission date passed yet
- **Duration SLA**: Depends on issue severity (1-7 days typically)
- **Next Steps**: Resolve all issues → Resubmit → Gate returns to PENDING
- **Example**:
  ```yaml
  approval_status: remediation
  approval_status_emoji: "🔧"
  remediation_owner: "Backend Lead"
  fixes_in_progress: 2
  fixes_complete: 1
  target_resubmission: "2026-03-17T17:00:00Z"
  ```

---

## Status Field Usage by Template

### In YAML Templates

```yaml
# user-story.template.yml
basic_info:
  status: "not_started"  # Use ID: 1-not_started, 2-in_progress, etc.
  status_readable: "Not Started"
  status_emoji: "⬜"

# epic.template.yml
details:
  status: "in_progress"

# approval-gate.template.md
approvals:
  gate_status: "pending"  # ID from approval section
  gate_status_emoji: "⏳"
```

### In Markdown Templates

```markdown
# User Story: US-001

| Field | Value |
|-------|-------|
| Status | ⬜ Not Started |
| Workflow State | not_started |
| Last Updated | 2026-03-16 |

# Approval Gate: CODE_REVIEW_001

| Approval Status | Reviewer | Decision |
|---|---|---|
| Code Review | Alice | ✅ Approved |
| Security Review | Bob | 🟨 Reviewing |
| **Overall Gate** | **—** | **🟨 Reviewing** |
```

---

## Status Transitions & Rules

### Valid Workflow Transitions
```yaml
state_transitions:
  not_started:
    allowed_to: [in_progress]
    
  in_progress:
    allowed_to: [in_review, not_started]
    
  in_review:
    allowed_to: [implemented, in_progress]
    
  implemented:
    allowed_to: [delivered]
    
  delivered:
    allowed_to: []  # Terminal state

approval_transitions:
  pending:
    allowed_to: [reviewing, approved]
    
  reviewing:
    allowed_to: [approved, rejected, conditional]
    
  approved:
    allowed_to: []  # Terminal state
    
  conditional:
    allowed_to: [approved, rejected]
    
  rejected:
    allowed_to: [remediation]
    
  remediation:
    allowed_to: [pending, rejected]
```

### Transition Rules
- ✅ Forward progression only (mostly)
- ✅ Backward only if work found to be inadequate/blocked
- ✅ Always document "why" when transitioning backward
- ✅ Update timestamp on every transition
- ✅ Log transitions in git commit history (TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD messages)

---

## Implementation Checklist

When adding status to a new template:

- [ ] Choose status from this document (don't invent new ones)
- [ ] Use `status_id` (e.g., `not_started`) in code/YAML
- [ ] Use `status_emoji` (e.g., ⬜) for visible/readable output
- [ ] Use `status_readable` (e.g., "Not Started") for display
- [ ] Include `status_changed_date` or `last_updated` timestamp
- [ ] Document transition reason (especially for backward transitions)
- [ ] Reference this file in template documentation
- [ ] Ensure transitions follow rules above

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-16 | Initial system status definitions (5-state workflow + 6-state approval model) |

**Next Review**: 2026-06-16 (quarterly)
