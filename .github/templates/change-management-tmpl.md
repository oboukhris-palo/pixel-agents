# Change Management Plan: {CHANGE_ID}

**Change Title**: {CHANGE_DESCRIPTION}  
**Story/Feature**: {US-XXX or FEATURE_NAME}  
**Change Category**: {Feature Release | Hotfix | Data Migration | Infrastructure | Configuration | Security Patch}  
**Change Date**: {YYYY-MM-DD}  
**Change Owner**: {ROLE/NAME}  
**Change Status**: {Planned | Scheduled | In Progress | Completed | Rolled Back}  
**Risk Level**: {Low | Medium | High | Critical}

---

## Change Overview

### What is Changing?
{Clear description of what is being added/modified/removed}

### Why is this change needed?
{Business driver or technical justification}
- Business Impact: {Impact statement}
- Technical Requirement: {Requirement statement}
- Regulatory/Compliance: {If applicable}

### Affected Systems & Components
- {System/Component 1}: {Specific changes}
- {System/Component 2}: {Specific changes}
- {System/Component 3}: {Specific changes}

---

## Related Documents

| Document | Type | Purpose |
|----------|------|---------|
| [Implementation Plan](../../user-stories/{US_REF}/implementation-plan.md) | Technical | What is being deployed |
| [Approval Gate](../../approvals/{GATE_ID}.md) | Governance | Release approval status |
| [Monitoring Setup](./monitoring-setup.template.md) | Operational | Post-deployment monitoring |
| [Incident Response](./incident-response.template.md) | Operational | Rollback procedures |
| [Compliance Checklist](./compliance-checklist.template.md) | Compliance | Regulatory requirements |
| [System Status Definitions](./SYSTEM-STATUS-DEFINITIONS.md) | Reference | Status terminology |

---

## Impact Analysis

### Affected Users/Roles
| User Role/Group | Impact Type | Severity | Details |
|-----------------|-----------|----------|---------|
| {Role} | {Breaking/Non-breaking/Enhancement} | {High/Medium/Low} | {Specific impact} |

### Affected Business Processes
| Process | Change Details | Workaround During Transition | Training Needed? |
|---------|-----------------|---------------------------|------------------|
| {Process} | {What changes} | {Manual steps if any} | Yes/No |

### Data Impact
- [ ] Data structure changes: {Details}
- [ ] Data migration required: {Details}
- [ ] Data archival/deletion: {Details}
- [ ] Backward compatibility: {Maintained/Broken}

**Data Validation Plan**: 
```
Pre-Change:
- {Validation step 1}
- {Validation step 2}

Post-Change:
- {Validation step 1}
- {Validation step 2}
```

### API/Integration Impact
- [ ] API endpoint changes: {Details}
- [ ] Contract/schema changes: {Details}
- [ ] Third-party integration impact: {Details}
- [ ] Client SDK version requirements: {Details}

---

## Scope & Dependencies

### What is In-Scope?
- {Component/Feature 1}
- {Component/Feature 2}
- {Component/Feature 3}

### What is Out-of-Scope?
- {Explicitly excluded item 1}
- {Explicitly excluded item 2}

### Dependencies
| Dependency | Type | Status | Impact if Blocked |
|-----------|------|--------|-------------------|
| {System/Process} | {Hard/Soft} | {On Track/At Risk/Blocked} | {Impact} |

### Prerequisite Changes
{List any changes that must be completed before this one}
- [ ] {Prereq 1} (Due: {DATE})
- [ ] {Prereq 2} (Due: {DATE})

---

## Deployment Plan

### Deployment Strategy
**Strategy Type**: {Big Bang | Phased Rollout | Blue-Green | Canary | Feature Toggle}

**Strategy Details**:
```
{Detailed deployment approach}

Phase 1: {X}% of {target} deployed (Date: {DATE})
Phase 2: {X}% of {target} deployed (Date: {DATE})
Phase 3: {X}% of {target} deployed (Date: {DATE})
```

### Deployment Timeline
| Phase | Start Date | End Date | Duration | Approver |
|-------|-----------|---------|----------|----------|
| Planning & Approval | {DATE} | {DATE} | {X} days | {Role} |
| Testing & Validation | {DATE} | {DATE} | {X} days | {Role} |
| Pre-Production Staging | {DATE} | {DATE} | {X} days | {Role} |
| Production Deployment | {DATE} | {DATE} | {X} days | {Role} |
| Monitoring & Verification | {DATE} | {DATE} | {X} days | {Role} |
| Rollback Window (if needed) | {DATE} | {DATE} | {X} hours | {Role} |

### Deployment Checklist
- [ ] Code reviewed and approved
- [ ] All tests passing (unit/integration/e2e)
- [ ] Security scan passed (no critical/high vulns)
- [ ] Performance testing completed
- [ ] Database migrations tested (and rollback validated)
- [ ] Configuration validated for target environment
- [ ] Monitoring/alerting rules configured
- [ ] Communication sent to users
- [ ] Support team briefed
- [ ] Runbook published to {location}

---

## Rollback Plan

### Rollback Trigger Conditions
**Automatic Checks** (triggers immediate rollback if threshold exceeded):
- {Metric}: If {condition}, rollback starts at {threshold}
- {Metric}: If {condition}, rollback starts at {threshold}

**Manual Trigger Conditions**:
- {Condition that would warrant manual rollback}
- {Condition that would warrant manual rollback}

### Rollback Procedure
**Rollback Decision Authority**: {Role/Person}

**Step-by-Step Rollback**:
```
1. {Step 1 - e.g., "Stop accepting new requests"}
2. {Step 2 - e.g., "Revert database schema migration"}
3. {Step 3 - e.g., "Rollback deployment to version X"}
4. {Step 4 - e.g., "Verify health checks pass"}
5. {Step 5 - e.g., "Notify stakeholders of rollback"}
6. {Step 6 - e.g., "Run data reconciliation"}
```

**Estimated Rollback Time**: {X} minutes  
**Acceptable Service Downtime**: {X} minutes  
**Data Loss Risk**: {None | Acceptable | {details}}

**Rollback Validation**:
- [ ] Application metrics normal
- [ ] Error rate within acceptable range
- [ ] User transactions processing normally
- [ ] Database integrity verified
- [ ] No orphaned/inconsistent data
- [ ] All health checks passing

**Post-Rollback Actions**:
- Incident post-mortem scheduled
- Root cause analysis initiated
- Remediation plan created
- Stakeholder communication sent

---

## Communication Plan

### Pre-Change Communication
| Audience | Message | Channel | Timing | Owner |
|----------|---------|---------|--------|-------|
| {Role} | {What they need to know} | {Email/Slack/Meeting} | {When} | {Owner} |

**Sample Message Template**:
```
Subject: Scheduled {Service} Update - {DATE}

We will be deploying a {new feature/fix/update} on {DATE} at {TIME}.

What's changing: {Brief description}
Impact: {User impact}
Expected downtime: {Minutes or "None"}
What you need to do: {Actions required, if any}
Support contact: {Contact info}
```

### During-Change Communication
- [ ] Deploy status page updated in real-time
- [ ] Incident channel opened ({Slack channel})
- [ ] Stakeholders notified of milestones
- [ ] Issue tracker updated with deployment progress

### Post-Change Communication
- [ ] Completion announcement sent
- [ ] Known issues documented
- [ ] Feedback collection initiated
- [ ] Success metrics shared

---

## Monitoring & Verification

### Monitoring During Deployment
| Metric | Baseline (Before) | Success Threshold | Alert Threshold | Monitoring Tool |
|--------|-----------------|------------------|-----------------|-----------------|
| {Metric} | {X} | {X} | {X} | {Tool} |
| {Metric} | {X} | {X} | {X} | {Tool} |

**Monitoring Dashboard**: {Link or location}

### Verification Steps (Post-Change)
- [ ] **Functional Verification**: {Test case 1}, {Test case 2}, {Test case 3}
- [ ] **Performance Verification**: Response time <{X}ms, throughput >{X} TPS
- [ ] **Data Integrity**: {Query to validate data consistency}
- [ ] **User Acceptance**: {UAT scenario 1}, {UAT scenario 2}
- [ ] **Integration Verification**: {Third-party system connectivity check}

**Success Criteria**:
- All verification steps pass
- No critical alerts triggered
- Error rate < {X}%
- User feedback: {Threshold}

---

## Training & Documentation

### User Training Required?
- [ ] Yes - {Who needs training}
- [ ] No - {Change is transparent to users}

### Training Plan
| Audience | Content | Format | Schedule | Owner |
|----------|---------|--------|----------|-------|
| {Role} | {Training topic} | {Webinar/Doc/Workshop} | {DATE} | {Owner} |

### Documentation Updates
- [ ] User guide updated
- [ ] API documentation updated
- [ ] Admin documentation updated
- [ ] Runbook updated
- [ ] FAQ updated
- [ ] Knowledge base article created

**Documentation Location**: {Link/Path}

---

## Stakeholder Approvals

### Change Advisory Board (CAB) Review
**CAB Meeting Date**: {DATE}  
**CAB Status**: ⬜ Pending / 🟨 In Review / ✅ Approved / 🔴 Rejected

| Reviewer | Role | Decision | Comments | Date |
|----------|------|----------|----------|------|
| {Name} | {Role} | ✅ Approve / 🔴 Reject / ⏸️ Hold | {Notes} | {DATE} |

### Release Approvals
- [ ] **Product Owner**: Confirms business value aligned
- [ ] **Operations**: Confirms deployment plan feasible
- [ ] **Security**: Confirms no security risks
- [ ] **Compliance**: Confirms regulatory alignment (if applicable)
- [ ] **Finance**: Confirms cost/budget impact
- [ ] **Executive Sponsor**: Final approval to proceed

---

## Risk Assessment

### Identified Risks
| Risk ID | Risk Description | Probability | Impact | Mitigation | Owner | Status |
|---------|-----------------|-------------|--------|-----------|-------|--------|
| CHG-R001 | {Risk} | {Low/Med/High} | {High/Med/Low} | {Mitigation} | {Owner} | 🟢 Mitigated |
| CHG-R002 | {Risk} | {Low/Med/High} | {High/Med/Low} | {Mitigation} | {Owner} | 🟡 Contained |

### Contingency Plans
- **If {Risk occurs}**: {Contingency action}
- **If {Risk occurs}**: {Contingency action}

---

## Testing Evidence

### Test Coverage
- [ ] Unit tests: {X}% coverage
- [ ] Integration tests: {X} scenarios tested
- [ ] End-to-end tests: {X} user workflows validated
- [ ] Performance tests: Load tested at {X} TPS
- [ ] Security tests: Penetration testing complete / OWASP checklist passed
- [ ] Regression tests: {X}% of existing functionality re-tested

**Test Results Location**: {Link/Path}

---

## Audit Trail & Sign-Off

### Change Authorization
**Change Authorized By**: {Name/Title}  
**Authorization Date**: {DATE}  
**Authorization ID**: {ID}

### Change Implementation
**Implemented By**: {Name/Title}  
**Implementation Date**: {DATE}  
**Implementation Notes**: {Any deviations from plan}

### Verification & Closure
**Verified By**: {Name/Title}  
**Verification Date**: {DATE}  
**Verification Status**: ✅ Complete / 🟡 Partial / 🔴 Failed

**Change Closed Date**: {DATE}  
**Lessons Learned**: {Brief summary for future improvements}

---

## Documentation Attachments

- [ ] Deployment runbook
- [ ] Rollback procedure
- [ ] Test results report
- [ ] Security assessment
- [ ] Compliance certification (if applicable)
- [ ] User communication templates
- [ ] Training materials
- [ ] Monitoring alert configuration

---

**Next Review Date** (if phased): {DATE}  
**Change Template Version**: 1.0  
**Contact**: {CHANGE_OWNER_EMAIL}
