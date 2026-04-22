# Approval Gate: {GATE_NAME}

**Project**: {PROJECT_NAME}  
**Story/Feature**: {US-XXX or FEATURE_NAME}  
**Gate Type**: {Design Review | Code Review Approval | Security Approval | Compliance Sign-Off | Go-Live Approval | Budget Approval}  
**Gate Version**: {VERSION}  
**Date Created**: {YYYY-MM-DD}  
**Last Updated**: {YYYY-MM-DD}

---

## Related Documents

| Document | Type | Purpose |
|----------|------|---------|
| [Story Definition](../../user-stories/{US_REF}/description.md) | Requirements | Functional and non-functional requirements |
| [Implementation Plan](../../user-stories/{US_REF}/implementation-plan.md) | Technical | Technical approach with checkboxes |
| [Plan Approval](../../user-stories/{US_REF}/plan-approval.yaml) | Control | Human validation gate status |
| [BDD Scenarios](../../user-stories/{US_REF}/features/) | Testing | Acceptance criteria as executable tests |
| [Code Review Checklist](./code-review-checklist.template.md) | Standards | Quality gate criteria |
| [Compliance Checklist](./compliance-checklist.template.md) | Standards | Compliance requirements |
| [System Status Definitions](./SYSTEM-STATUS-DEFINITIONS.md) | Reference | Status and approval terminology |
| [Approval Block Template](./APPROVAL-BLOCK-TEMPLATE.md) | Template | Reusable approval structure |

---

## Gate Context

### What is being approved?
{Brief description of the deliverable/decision requiring approval}

### Why is this gate needed?
{Business/technical reason for this approval requirement}

### What are the consequences of approval/rejection?
- **If Approved**: {Next steps, dependencies that can proceed}
- **If Rejected**: {Remediation path, timeline impact}

---

## Approval Matrix

### Required Approvers (ALL must sign off)

| Role | Name | Email | Department | Approval Status | Remarks |
|------|------|-------|-----------|-----------------|---------|
| {Role} | {Name} | {Email} | {Dept} | ⬜ Pending / 🟨 Reviewing / ✅ Approved / 🔴 Rejected | {Notes} |

**Process**: All approvers must respond. Rejection triggers remediation cycle.

---

### Conditional Approvers (Triggered by specific conditions)

| Trigger Condition | Role | Approval Required? | Status |
|------------------|------|-------------------|--------|
| {Condition} | {Role} | Yes/No | {Status} |

---

## Approval Criteria (Checkpoints)

### Functional Completeness
- [ ] **All acceptance criteria met**: {Details}
  - [ ] Criterion 1: {Status}
  - [ ] Criterion 2: {Status}
  - [ ] Criterion 3: {Status}
- [ ] **BDD scenarios passing**: {X}/{Y} scenarios green
- [ ] **No critical defects**: {Defect count by severity}

### Code Quality
- [ ] **Code review passed**: All comments resolved
- [ ] **Test coverage**: >{X}% (Current: {X}%)
- [ ] **Cyclomatic complexity**: Average <{X} (Current: {X})
- [ ] **No linting errors**: {Status}
- [ ] **Documentation complete**: API docs, inline comments, type definitions

### Security Review
- [ ] **Security scan passed**: No critical/high-severity vulns
- [ ] **Secrets management**: No hardcoded credentials/keys
- [ ] **Authentication/Authorization**: Validated by security team
- [ ] **Data classification**: Aligned with policy ({Public/Internal/Confidential/Restricted})
- [ ] **Compliance requirements**: Met audit/regulatory requirements

### Performance & Reliability
- [ ] **Performance benchmarked**: Meets {X} ms latency SLA
- [ ] **Load testing complete**: Supports {X} concurrent users
- [ ] **Disaster recovery plan**: Documented and tested
- [ ] **Monitoring/alerting**: Configured and validated
- [ ] **Error handling**: Comprehensive with proper logging

### Compliance & Legal
- [ ] **Compliance checklist signed**: {Framework: GDPR/SOC2/PCI-DSS/HIPAA/etc.}
- [ ] **Data privacy reviewed**: By privacy officer
- [ ] **Legal review completed**: If regulatory/contractual implications
- [ ] **Audit trail enabled**: For compliance verification
- [ ] **Change log documented**: All modifications tracked

### Operational Readiness
- [ ] **Deployment runbook written**: Step-by-step procedure documented
- [ ] **Rollback procedure tested**: Can revert within {X} minutes
- [ ] **Operations team trained**: Handoff documentation provided
- [ ] **Support documentation**: Troubleshooting guide available
- [ ] **Infrastructure capacity validated**: Resources allocated/tested

### Stakeholder Alignment
- [ ] **Business owner sign-off**: Confirms business value
- [ ] **Product owner validated**: Feature matches requirements
- [ ] **Customer communication plan**: Ready for deployment announcement
- [ ] **Training/documentation**: User guides prepared (if applicable)

---

## Approval Decision

### For Each Approver

**Approver Name**: {NAME}  
**Approver Role**: {ROLE}  
**Approval Date**: {YYYY-MM-DD}  
**Approval Status**:
- [ ] ✅ **APPROVED** - All criteria met, no conditions
- [ ] ✅ **APPROVED WITH CONDITIONS** - Criteria met, but with specific caveats:
  ```
  Conditions (must be resolved before next phase):
  1. {Condition}
  2. {Condition}
  ```
- [ ] 🔴 **REJECTED** - Does not meet criteria
  ```
  Rejection Reasons:
  1. {Reason with severity}
  2. {Reason with severity}
  
  Remediation Path:
  - {Step 1}
  - {Step 2}
  
  Re-Submission Timeline: {DATE}
  ```

**Approver Signature**: _________________________ (Digital or Manual)  
**Approval Rationale** (Why did you approve/reject?):
```
{Detailed explanation of the decision, key factors considered, risk assessment}
```

---

## Approval Summary

### Overall Gate Status
- **Approved By**: {Count} of {Total Required}
- **Conditional Approvals**: {Count} (List additional work needed)
- **Rejections**: {Count} with remediation plan

### Gate Decision
- 🟢 **GATE PASSED** - Move forward to [NEXT_PHASE]
- 🟡 **CONDITIONAL PASS** - Move forward IF conditions met: {List}
- 🔴 **GATE FAILED** - Do not proceed until remediated. Re-submission: {DATE}

### Dependencies Unlocked (if approved)
- {Dependent story/task can now start}
- {Dependent story/task can now start}

---

## Approval Audit Trail

### History
| Date | Action | Actor | Notes |
|------|--------|-------|-------|
| {DATE} | Created | {USER} | Gate setup initiated |
| {DATE} | {Action} | {USER} | {Details} |

### Communication Log
- {DATE}: Email sent to all approvers
- {DATE}: Reminder 1 sent (after X days)
- {DATE}: Reminder 2 sent (after X days)
- {DATE}: Escalation to {ROLE}

---

## Conditional Approval Tracking

If gate was **APPROVED WITH CONDITIONS**, track resolution here:

| Condition | Required By | Assigned To | Status | Resolved Date |
|-----------|-----------|-----------|--------|---|
| {Condition} | {DATE} | {Owner} | ⬜ Pending / 🟨 In Progress / ✅ Resolved | {DATE} |

**All Conditions Resolved?**: ✅ Yes / ⬜ No (if No, use for gate re-check)

---

## Rejection Tracking (if applicable)

| Issue | Severity | Remediation | Owner | Target Date | Resolved? |
|-------|----------|-----------|-------|-----------|-----------|
| {Issue} | 🔴 CRITICAL / 🟠 HIGH | {Fix plan} | {Owner} | {DATE} | ✅/⬜ |

**Gate Re-submission Date**: {DATE}  
**Expected Status Change**: Rejected → {Approved/Conditional/Rejected Again}

---

## Compliance Documentation

### For regulated industries, attach supporting evidence:
- [ ] Security scan report
- [ ] Code review report
- [ ] Test coverage report
- [ ] Compliance checklist (GDPR/SOC2/PCI-DSS)
- [ ] Risk assessment
- [ ] Change request (for CAB)

---

## Sign-Off

**Gate Owner/Manager** (Responsible for orchestrating this gate):
```
Name: ________________________
Signature: ________________________
Date: ________________________
```

**Final Authority** (If gate needs executive override):
```
Name: ________________________
Title: ________________________
Signature: ________________________
Date: ________________________
Override Reason (if applicable): ________________________
```

---

## Additional Notes

{Any special circumstances, notes, or considerations for this gate}

---

**Next Review Date** (if conditional): {DATE}  
**Gate Template Version**: 1.0  
**Contact**: {GATE_OWNER_EMAIL}
