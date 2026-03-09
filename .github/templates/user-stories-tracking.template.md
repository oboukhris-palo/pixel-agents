````markdown
# User Stories Implementation Status Template

**CRITICAL**: This template creates the **SINGLE SOURCE OF TRUTH** for implementation tracking.

## How to Use This Template

### 1. **At Project Start** (After PDLC Stage 4 Complete)
- Copy `/docs/prd/user-stories.md` structure to `/docs/user-stories/user-stories.md`
- Add status tracking fields for each user story
- Initialize all stories as "Not Started"
- This becomes the **SINGLE SOURCE OF TRUTH**

### 2. **During Implementation** 
- **Orchestrator reads this file FIRST** when assessing project status
- **Agents update statuses** as work progresses: Not Started → In Progress → In Review → Implemented  
- **Track epic completion** (% of stories "Implemented")
- **Determine next work** based on incomplete stories

### 3. **Status Definitions**
- **Not Started**: Story not yet begun, no work done
- **In Progress**: Currently being implemented (TDD cycles active)
- **In Review**: Implementation complete, BDD validation in progress  
- **Implemented**: All layers complete, BDD tests passing, code reviewed, approved

## Template Structure

````markdown
# User Stories Implementation Status
📊 **SINGLE SOURCE OF TRUTH** for Implementation Progress

**Project**: [PROJECT_NAME]
**Last Updated**: [DATE]  
**Updated By**: [AGENT/USER]

## 📈 Project Summary
- **Total Epics**: [X]
- **Total Stories**: [Y]
- **Completion Rate**: [Z]% ([IMPLEMENTED_COUNT]/[TOTAL_COUNT] stories)
- **Current Sprint**: Sprint [N] 
- **BDD Tests Passing**: [X]/[Y] scenarios ([Z]%)

## 🎯 Epic Status Overview
| Epic | Total Stories | Not Started | In Progress | In Review | Implemented | Completion % |
|------|---------------|-------------|-------------|-----------|-------------|--------------|
| E001: User Auth | 5 | 2 | 1 | 1 | 1 | 20% |
| E002: Profile | 4 | 3 | 1 | 0 | 0 | 0% |
| E003: Admin | 3 | 3 | 0 | 0 | 0 | 0% |

## 📋 Epics & User Stories

### Epic E001: User Authentication
**Epic Status**: IN_PROGRESS (1/5 stories implemented)
**Business Value**: [VALUE_STATEMENT]
**Dependencies**: [EPIC_DEPENDENCIES]

#### US-001: User Registration
**Status**: IMPLEMENTED ✅  
**Story Points**: 5
**Sprint**: Sprint 1
**Implementation Progress**:
- ✅ Layer 1 (Database): COMPLETED
- ✅ Layer 2 (Backend): COMPLETED  
- ✅ Layer 3 (Config): COMPLETED
- ✅ Layer 4 (Frontend): COMPLETED
**BDD Scenarios**: 5/5 passing (100%) ✅
**Test Coverage**: 89% (target >80%) ✅
**Code Review**: APPROVED ✅
**Last Updated**: 2024-12-24 by dev-tdd

#### US-002: Email Verification  
**Status**: IN_REVIEW ⏳
**Story Points**: 3
**Sprint**: Sprint 1
**Implementation Progress**:
- ✅ Layer 1 (Database): COMPLETED
- ✅ Layer 2 (Backend): COMPLETED
- ✅ Layer 3 (Config): COMPLETED  
- ✅ Layer 4 (Frontend): COMPLETED
**BDD Scenarios**: 3/3 passing (100%) - awaiting BA validation
**Test Coverage**: 85%
**Code Review**: PENDING
**Blockers**: None
**Last Updated**: 2024-12-24 by dev-tdd

#### US-003: Password Reset
**Status**: IN_PROGRESS 🔄
**Story Points**: 4  
**Sprint**: Sprint 1
**Implementation Progress**:
- ✅ Layer 1 (Database): COMPLETED
- ✅ Layer 2 (Backend): COMPLETED
- 🔄 Layer 3 (Config): IN_PROGRESS
- ⏳ Layer 4 (Frontend): NOT_STARTED  
**BDD Scenarios**: 2/4 passing (50%)
**Test Coverage**: 78%
**Code Review**: NOT_STARTED
**Blockers**: Email service integration (HIGH priority, assigned to dev-lead)
**Last Updated**: 2024-12-24 by dev-tdd

#### US-004: User Login
**Status**: NOT_STARTED ⏳
**Story Points**: 3
**Sprint**: Sprint 2 (planned)
**Implementation Progress**:  
- ⏳ Layer 1 (Database): NOT_STARTED
- ⏳ Layer 2 (Backend): NOT_STARTED
- ⏳ Layer 3 (Config): NOT_STARTED
- ⏳ Layer 4 (Frontend): NOT_STARTED
**BDD Scenarios**: 0/3 passing (0%)
**Dependencies**: US-001 (Registration) must be complete
**Last Updated**: 2024-12-24 by pm

#### US-005: User Logout
**Status**: NOT_STARTED ⏳
**Story Points**: 2
**Sprint**: Sprint 2 (planned) 
**Implementation Progress**:
- ⏳ Layer 1 (Database): NOT_STARTED
- ⏳ Layer 2 (Backend): NOT_STARTED  
- ⏳ Layer 3 (Config): NOT_STARTED
- ⏳ Layer 4 (Frontend): NOT_STARTED
**BDD Scenarios**: 0/2 passing (0%)
**Dependencies**: US-004 (Login) must be complete
**Last Updated**: 2024-12-24 by pm

### Epic E002: User Profile Management  
**Epic Status**: NOT_STARTED (0/4 stories implemented)
**Business Value**: [VALUE_STATEMENT]
**Dependencies**: Epic E001 (Authentication) must be complete

#### US-006: View User Profile
**Status**: NOT_STARTED ⏳
**Story Points**: 3
**Sprint**: Sprint 3 (planned)
[... similar structure for remaining stories ...]

## 📊 Metrics & Tracking

### Sprint Velocity
- **Sprint 1**: 12 points planned, 8 points delivered (67% velocity) 
- **Average Velocity**: 8 points/sprint (last 2 sprints)
- **Estimated Completion**: Sprint 4 (2025-01-15)

### Quality Metrics
- **Overall BDD Pass Rate**: 68% (15/22 scenarios)
- **Average Test Coverage**: 84% (target >80%) ✅
- **Code Review Approval Rate**: 100% (2/2 stories reviewed approved)
- **Cyclomatic Complexity**: Avg 6.2 (target <10) ✅

### Active Blockers
| Story | Blocker | Severity | Owner | ETA |
|-------|---------|----------|-------|-----|  
| US-003 | Email service integration | HIGH | dev-lead | 2024-12-25 |

### Next Sprint Planning
**Stories Ready for Sprint 2**:
- US-004: User Login (3 points) - Dependencies: US-001 ✅
- US-005: User Logout (2 points) - Dependencies: US-004
**Estimated Sprint Capacity**: 8 points
**Recommended Sprint Scope**: BALANCED (US-004 + US-005)
````

## 🔄 Update Workflow

### **When Orchestrator Reads This File**:
1. **Assess current state** - which stories are incomplete
2. **Identify next work** - prioritize "Not Started" stories by dependencies
3. **Check epic progress** - calculate completion %
4. **Determine workflow** - continue implementation vs create missing docs
5. **Update user** - report current progress and next steps

### **When Agents Update This File**:
1. **Dev-Lead** (Phase 2): Updates stories from "Not Started" to "In Progress" 
2. **TDD Agents** (Phase 3): Updates layer progress, BDD test status
3. **TDD Agents** (Phase 3 complete): Updates story to "In Review"
4. **BA Agent** (Phase 4): Validates BDD, keeps as "In Review" if approved  
5. **Dev-Lead** (Phase 5): Updates story to "Implemented" after code review
6. **Dev-Lead** (Phase 5): Updates epic to "Implemented" if all stories done

### **Synchronization Rules**:
- **Daily**: Update after any story status change
- **Sprint Planning**: Update sprint assignments and estimates
- **Sprint Review**: Update velocity and metrics
- **Epic Completion**: Mark epic "Implemented" when ALL stories "Implemented"

## 🎯 Critical Success Factors

1. **This file is the SINGLE SOURCE OF TRUTH** - orchestrator reads it first
2. **Update statuses immediately** when work progresses  
3. **Track at story level** - epics are organizational containers
4. **Epic completion is automatic** - when all its stories are "Implemented"
5. **Synchronize with issue tracker** - GitHub Issues match story statuses
````