---
description: "Reusable approval block template - standardized sign-off across all templates"
version: "1.0"
file_type: "template include"
use_in: ["approval-gate.template.md", "executive-status-report.template.md", "func-doc.yaml", "change-management.template.md"]
---

# Standard Approval Block Template

**Purpose**: Copy this block into any template requiring formal approvals. Ensures consistent approval structure across all documents.

**Reference**: See [SYSTEM-STATUS-DEFINITIONS.yml](SYSTEM-STATUS-DEFINITIONS.yml) for status definitions.

---

## For YAML Templates

```yaml
approval_matrix:
  # Unique gate identifier
  gate_id: "{GATE_NAME}" # e.g., "CODE-REVIEW-US001", "SECURITY-SIGN-OFF"
  gate_type: "code_review|security|compliance|design|go_live" # Gate category
  
  # Timeline
  approval_opened_date: "2026-03-16T10:00:00Z"
  approval_due_date: "2026-03-18T17:00:00Z"
  approval_completed_date: null  # Filled on completion
  
  # Overall gate status (see SYSTEM-STATUS-DEFINITIONS.yml)
  gate_status: "pending"  # pending | reviewing | approved | conditional | rejected | remediation
  gate_status_emoji: "⏳"
  gate_status_message: "Awaiting code review from Alice"
  
  # Required approvers (ALL must approve)
  required_approvers:
    - approver_id: APPROVER-001
      name: "Alice Chen"
      role: "Tech Lead"
      email: "alice@company.com"
      approval_date: null
      approval_status: "pending"  # pending | reviewing | approved | rejected
      approval_decision: null  # approved | rejected | conditional
      approval_rationale: ""
      conditional_items: []  # If conditional approval
      
    - approver_id: APPROVER-002
      name: "Bob Smith"
      role: "Security Officer"
      email: "bob@company.com"
      approval_date: null
      approval_status: "pending"
      approval_decision: null
      approval_rationale: ""
      conditional_items: []
  
  # Conditional approvers (triggered by specific conditions)
  conditional_approvers:
    - trigger_condition: "if payment integration involved"
      approver_name: "Payment Team Lead"
      approval_required: true  # Will this trigger? Set to false if not applicable
      approval_status: "not_triggered"
      
    - trigger_condition: "if database schema changed"
      approver_name: "Database Administrator"
      approval_required: false  # This condition not met
      approval_status: "not_triggered"
  
  # Approval criteria checklist (what must be satisfied)
  approval_criteria:
    - criterion_id: "AC-001"
      category: "Functional Completeness"
      criterion: "All acceptance criteria met"
      status: "pending"  # pending | met | not_met | n/a
      notes: ""
      
    - criterion_id: "AC-002"
      category: "Quality"
      criterion: "Test coverage > 80%"
      current_value: "78%"
      required_value: "> 80%"
      status: "not_met"
      notes: "Need 2 more unit tests"
      
    - criterion_id: "AC-003"
      category: "Security"
      criterion: "No CRITICAL vulnerabilities"
      status: "met"
      notes: "Security scan passed"
  
  # Approval summary
  approval_summary:
    required_approvals: 2
    approvals_received: 0
    approvals_pending: 2
    approvals_rejected: 0
    criteria_met: 1
    criteria_not_met: 1
    criteria_pending: 3
    overall_readiness_percentage: 33  # % of approvals + criteria met
    
  # Rejection tracking (if applicable)
  rejections:
    - rejection_id: "REJ-001"
      rejected_by: "Bob Smith"
      rejected_date: "2026-03-16T16:30:00Z"
      rejection_reason: "SQL injection vulnerability in query at line 45"
      rejection_severity: "critical"  # critical | high | medium | low
      remediation_required: true
      remediation_owner: "dev-team"
      remediation_target_date: "2026-03-17T17:00:00Z"
      remediation_status: "in_progress"  # not_started | in_progress | complete
  
  # Conditional items (if conditional approval)
  conditional_items:
    - condition_id: "COND-001"
      condition: "Post-deployment security scan must pass"
      owner: "Security Team"
      target_date: "2026-03-18T10:00:00Z"
      status: "pending"
      
    - condition_id: "COND-002"
      condition: "Performance baseline established (p99 < 200ms)"
      owner: "DevOps"
      target_date: "2026-03-18T16:00:00Z"
      status: "in_progress"
  
  # Sign-off (approver signatures)
  sign_off:
    all_required_approvals_obtained: false
    gate_approved: false
    gate_approved_date: null
    gate_approved_by: null
    
    approver_signatures:
      - approver_name: "Alice Chen"
        signature_image_or_digital_id: "DIGITAL_SIGNATURE_001"
        signed_date: null
        
      - approver_name: "Bob Smith"
        signature_image_or_digital_id: "DIGITAL_SIGNATURE_002"
        signed_date: null
```

---

## For Markdown Templates

```markdown
### Approval & Sign-Off

#### Overall Gate Status
- **Gate**: {GATE_NAME}
- **Opened**: 2026-03-16 at 10:00 UTC
- **Due**: 2026-03-18 at 17:00 UTC
- **Status**: 🟨 Reviewing (1 of 2 approvals)
- **Progress**: 50% (1/2 approvers, 2/4 criteria met)

#### Required Approvers

| Approver | Role | Status | Decision | Rationale | Date |
|----------|------|--------|----------|-----------|------|
| Alice Chen | Tech Lead | ✅ Approved | Approved | Architecture validated | 2026-03-16 14:30 |
| Bob Smith | Security Officer | 🟨 Reviewing | — | In progress | — |

#### Conditional Approvers

| Trigger | Approver | Required? | Status |
|---------|----------|-----------|--------|
| If payment involved | Payment Team Lead | No | Not Triggered |
| If schema changed | Database Admin | Yes | Triggered - Pending |

#### Approval Criteria Checklist

| # | Criterion | Category | Status | Notes |
|---|-----------|----------|--------|-------|
| 1 | All AC met | Functional | ✅ Met | All user stories validated |
| 2 | Coverage > 80% | Quality | 🔴 Not Met | Currently 78%, need 2 more tests |
| 3 | No CRITICAL vulns | Security | ✅ Met | Security scan passed |
| 4 | Performance validated | Quality | ⏳ Pending | Wait for monitoring data |

**Overall Readiness**: 3/4 criteria met (75%)

#### Rejections (if any)

| Rejection ID | Rejected By | Reason | Severity | Remediation | Owner | Status |
|---|---|---|---|---|---|---|
| REJ-001 | Bob Smith | SQL injection at line 45 | 🔴 CRITICAL | Use parameterized queries | Dev Team | 🟨 In Progress |

**Remediation Target**: 2026-03-17 17:00 UTC

#### Conditional Items (if approved with conditions)

| Condition | Owner | Target | Status |
|-----------|-------|--------|--------|
| Post-deploy security scan | Security | 2026-03-18 10:00 | ⏳ Pending |
| Performance baseline (p99 < 200ms) | DevOps | 2026-03-18 16:00 | 🟨 In Progress |

#### Sign-Off

**All Required Approvals**: ⏳ Pending (1 of 2)

**Approver Signatures**:
```
___________________________    ___________________________
Alice Chen (Tech Lead)         Date: 2026-03-16

___________________________    ___________________________
Bob Smith (Security Officer)   Date: ________________
```

**Gate Decision**: ⏳ Pending (awaiting all approvals)

**Gate Approved By**: _______________________________

**Gate Approval Date**: ______________________________
```

---

## For Markdown with Embedded JSON

```markdown
### Approval Gate Status

<details open>
<summary>Approval Matrix (Click to expand)</summary>

```json
{
  "gate_id": "CODE-REVIEW-US001",
  "gate_status": "reviewing",
  "gate_status_emoji": "🟨",
  "required_approvers": [
    {
      "name": "Alice Chen",
      "role": "Tech Lead",
      "approval_status": "approved",
      "approval_date": "2026-03-16T14:30:00Z",
      "rationale": "Architecture validated"
    },
    {
      "name": "Bob Smith",
      "role": "Security Officer",
      "approval_status": "reviewing",
      "approval_date": null,
      "rationale": null
    }
  ],
  "approval_summary": {
    "required_approvals": 2,
    "approvals_received": 1,
    "readiness_percentage": 50
  }
}
```

</details>
```

---

## Integration Instructions

### Step 1: Choose Format
- YAML for data-heavy templates (epic, user-story, approval-gate)
- Markdown table for readable templates (executive report, change management)
- JSON embed for complex dashboards

### Step 2: Copy Block
Copy the relevant approval block above into your template.

### Step 3: Customize
Replace placeholders:
- `{GATE_NAME}` → Specific gate name (e.g., "CODE_REVIEW_US001")
- `{GATE_TYPE}` → Type of gate
- `APPROVER-001` → Real approver IDs
- Dates → Real dates or null if not yet filled

### Step 4: Reference
Add this at the top/bottom of your template:
```markdown
See [SYSTEM-STATUS-DEFINITIONS.yml](SYSTEM-STATUS-DEFINITIONS.yml) for status definitions.
See [APPROVAL-BLOCK-TEMPLATE.md](APPROVAL-BLOCK-TEMPLATE.md) for this structure.
```

### Step 5: Validate
Before using:
- ✅ Status values match SYSTEM-STATUS-DEFINITIONS.yml
- ✅ All required fields populated (or set to null with reason)
- ✅ Approver names and roles are accurate
- ✅ Timeline (opened, due, completed) is specified
- ✅ Criteria or conditions clearly listed

---

## Common Uses

**Code Review Gate**: Use YAML version with approval criteria focused on code quality (coverage, complexity, style)

**Security Review**: Use Markdown version with criteria focused on security (vulns, auth, encryption, data handling)

**Executive Approval**: Use Markdown table version for high-level stakeholders (simple, readable)

**Design Review**: Use YAML version with stakeholder list (designers, PO, leads)

**Go-Live Gate**: Use Markdown version with comprehensive checklist (operational readiness, monitoring, rollback)

---

**Template Version**: 1.0  
**Last Updated**: 2026-03-16  
**Next Review**: 2026-06-16
