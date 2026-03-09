# Project Status Dashboard

**Project Name**: [PROJECT_NAME]  
**Created**: [CREATION_DATE]  
**Last Updated**: [TIMESTAMP]  
**Overall Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total User Stories** | [N] | Reference from `/docs/prd/user-stories.md` |
| **Stories Completed** | [N] | "Delivered" status in `/docs/user-stories/user-stories.md` |
| **Stories In Progress** | [N] | "In Progress" or "Implemented" status |
| **Stories Not Started** | [N] | "Not Started" status |
| **Project Completion** | [X]% | (Delivered / Total) × 100 |
| **Current Iteration** | Iteration [N] | Active sprint from `/docs/user-stories/current-sprint.md` |
| **Velocity** | [N] points/sprint | Average from last 3 sprints |
| **Projected Completion** | [DATE] | Based on current velocity |

---

## Epic Progress

### By Epic (Auto-calculated)

| Epic Name | Total Stories | Delivered | In Progress | Not Started | Completion % | Status |
|-----------|---------------|-----------|-------------|-------------|--------------|--------|
| [Epic Name] | [N] | [N] | [N] | [N] | [X]% | 🟢/🟡/🔴 |
| [Epic Name] | [N] | [N] | [N] | [N] | [X]% | 🟢/🟡/🔴 |
| [Epic Name] | [N] | [N] | [N] | [N] | [X]% | 🟢/🟡/🔴 |

**Legend**:
- 🟢 **Delivered**: 100% of stories complete
- 🟡 **In Progress**: 25-99% of stories complete
- 🔴 **Not Started**: <25% of stories complete

---

## Current Sprint

**Sprint**: Iteration [N] | Period: [START_DATE] - [END_DATE]  
**Sprint File**: `/docs/user-stories/current-sprint.md`

### Sprint Metrics
- **Stories Selected**: [N]
- **Total Points**: [X] / [Capacity]
- **Completion Rate**: [X]%
- **On-Track Stories**: [N]
- **At-Risk Stories**: [N]
- **Blocked Stories**: [N]

### Sprint Stories Status

| Story ID | Title | Status | Owner | % Complete | Due |
|----------|-------|--------|-------|-----------|-----|
| [US-XXX] | [Title] | Not Started / In Progress / Implemented / Delivered | [Owner] | [%] | [DATE] |

---

## Key Metrics & Health Indicators

### Velocity Trend
```
Sprint Points Completed:
Iteration 1: [X] points
Iteration 2: [X] points
Iteration 3: [X] points (Current Average: [X] points/sprint)
```

### Code Quality Metrics
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test Coverage | >80% | [X]% | 🟢/🟡/🔴 |
| Code Review Pass Rate | 100% | [X]% | 🟢/🟡/🔴 |
| Cyclomatic Complexity | <10 | [X] avg | 🟢/🟡/🔴 |
| BDD Test Pass Rate | 100% | [X]% | 🟢/🟡/🔴 |

### Release Readiness
- [ ] All requirements captured in `/docs/prd/requirements.md`
- [ ] All user stories defined in `/docs/prd/user-stories.md`
- [ ] Architecture documented in `/docs/prd/architecture-design.md`
- [ ] Tech specs completed in `/docs/prd/tech-spec.md`
- [ ] Design system finalized in `/docs/design/design-systems.md`
- [ ] Test strategies defined in `/docs/prd/test-strategies.md`
- [ ] CI/CD pipeline configured
- [ ] Security review passed
- [ ] Performance testing complete

---

## Active Blockers & Risks

### Critical Blockers (Impact Immediate)
1. **[Blocker Title]**
   - **Status**: [Story/Task blocked]
   - **Root Cause**: [Description]
   - **Impact**: [Affected stories, timeline impact]
   - **Owner**: [Responsible agent/person]
   - **ETA to Resolution**: [Date]

### At-Risk Items (Monitored)
1. **[Risk Title]**
   - **Story**: [US-XXX]
   - **Risk Level**: High/Medium/Low
   - **Probability**: [%]
   - **Mitigation**: [Action taken]

---

## Project Timeline & Milestones

| Milestone | Planned Date | Actual Date | Status | Notes |
|-----------|--------------|-------------|--------|-------|
| PDLC Complete | [DATE] | [DATE] | ✅/❌ | All 13 PRD documents |
| Architecture Approved | [DATE] | [DATE] | ✅/❌ | Architect sign-off |
| Sprint 1 Complete | [DATE] | [DATE] | ✅/❌ | [N] stories delivered |
| Sprint 2 Complete | [DATE] | [DATE] | ⏳ | Planned [N] stories |
| Beta Release | [DATE] | [DATE] | ⏳ | [X]% scope |
| GA Release | [DATE] | [DATE] | ⏳ | Full scope |

---

## Documentation Status

### PRD Documents (Read in /docs/prd/)
- [ ] requirements.md - Stakeholder & business requirements
- [ ] personas.md - User archetypes and segments
- [ ] user-stories.md - All epics and user stories with BDD scenarios
- [ ] business-case.md - ROI and market justification
- [ ] architecture-design.md - System architecture and patterns
- [ ] tech-spec.md - Technical specifications and implementation guidance
- [ ] design-systems.md - Design tokens, components, and UI patterns
- [ ] test-strategies.md - Testing approach and quality metrics
- [ ] deployment-plan.md - Release and deployment strategy

### Implementation Artifacts
- [ ] `/docs/user-stories/user-stories.md` - ⭐ SINGLE SOURCE OF TRUTH (status tracking)
- [ ] `/docs/user-stories/current-sprint.md` - Active sprint planning
- [ ] `/docs/user-stories/<US-REF>/implementation-plan.md` - Per-story technical decomposition
- [ ] `/docs/user-stories/<US-REF>/ba-enrichment.md` - BA validated info and acceptance criteria
- [ ] `features/` - BDD feature files with failing tests

---

## Team & Ownership

### Agent Assignments
| Agent Role | Current Assignment | Status | Next Action |
|------------|------------------|--------|-------------|
| PM (Project Manager) | Sprint planning & velocity tracking | 🟢 Active | Review `/docs/user-stories/current-sprint.md` |
| PO (Product Owner) | Requirements & prioritization | 🟢 Active | Update user story definitions |
| BA (Business Analyst) | Acceptance testing & validation | 🟢 Active | Enrich stories in `ba-enrichment.md` |
| Architect | System design & tech decisions | 🟢 Standby | Architecture reviews as needed |
| Dev-Lead | Implementation planning & TDD | 🟢 Active | Create layer decomposition |
| TDD Orchestrator | RED/GREEN/REFACTOR cycles | ⏳ Waiting | Ready for layer implementation |

### GitHub Integration
- **Repository**: [REPO_URL]
- **Issue Tracker**: GitHub Issues (synchronized with `/docs/user-stories/user-stories.md`)
- **CI/CD Pipeline**: [PIPELINE_STATUS]
- **Deployment**: [ENVIRONMENT_STATUS]

---

## Recent Changes

### Last Sprint (Iteration [N-1])
- **Completed**: [N] stories, [X] points
- **Stories Delivered**: [US-XXX], [US-XXX], [US-XXX]
- **Bugs Found**: [N] (documented in related issues)
- **Technical Debt Added**: [Item 1], [Item 2]

### This Week
- **Stories Implemented**: [US-XXX]
- **Code Merged**: [N] PRs
- **Test Coverage**: +[X]%
- **Blockers Resolved**: [N]

---

## Quick Links

- **PRD Documents**: `/docs/prd/`
- **Implementation Tracking**: `/docs/user-stories/user-stories.md`
- **Current Sprint**: `/docs/user-stories/current-sprint.md`
- **Archive Sprints**: `/docs/user-stories/sprint-*.md`
- **Design System**: `/docs/design/design-systems.md`
- **GitHub Issues**: [REPO_URL]/issues
- **CI/CD Pipelines**: [PIPELINE_URL]
- **Code Repository**: [REPO_URL]

---

## Appendix: Reading Guide

### For Project Managers
→ Check **Current Sprint** section and **Key Metrics & Health Indicators**  
→ Review `/docs/user-stories/current-sprint.md` for detailed daily tracking  
→ Monitor **Active Blockers & Risks** for escalation needs

### For Product Owners
→ Review **Epic Progress** to prioritize next stories  
→ Check **Project Timeline & Milestones** for release planning  
→ Examine **Story Status** in `/docs/user-stories/user-stories.md`

### For Architects
→ Verify **Release Readiness** checklist completion  
→ Review tech decisions in `/docs/prd/architecture-design.md`  
→ Monitor **At-Risk Items** for architectural conflicts

### For Developers
→ Check **Current Sprint** for assigned stories  
→ Read implementation guidance in `/docs/user-stories/<US-REF>/implementation-plan.md`  
→ Review **Code Quality Metrics** for refactoring priorities

### For Business Analysts
→ Review **BA Enrichment** documents in `/docs/user-stories/<US-REF>/ba-enrichment.md`  
→ Check **Active Blockers** for validation delays  
→ Use **Acceptance Criteria** from `/docs/prd/user-stories.md` for testing

---

**Report Generated**: [TIMESTAMP]  
**Generated By**: Orchestrator Agent  
**Next Update**: [AUTO_REFRESH_SCHEDULE]
