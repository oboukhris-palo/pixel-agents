# Sprint 2 Plan: Context & Task Management (EPIC-002)

**Sprint**: Sprint 2 of 5  
**Sprint Dates**: 2026-05-07 to 2026-05-20 (14 days)  
**Sprint Owner**: Project Manager (Michael)  
**Team Capacity**: 16 story points (based on Sprint 1 velocity: 17 points)

---

## Sprint Goal

Implement real-time context window monitoring and project completeness tracking to prevent token overflow and provide visual progress feedback to developers.

---

## Sprint Scope: Option 2 - Balanced (RECOMMENDED) 🎯

**Team Velocity**: 16 story points | **Planned**: 16 story points | **Utilization**: 100%

### Selected Stories

| US ID | Title | Points | Priority | Dependency | Status |
|-------|-------|--------|----------|-----------|--------|
| **US-002-001** | Context Window Monitor | 5 | P1 | US-001-003 ✅ | 🔵 Not Started |
| **US-002-002** | Completeness Metrics Engine | 6 | P1 | US-001-003 ✅ | 🔵 Not Started |
| **US-002-003** | Task Window State Manager | 5 | P2 | US-002-001 | 🔵 Not Started |

**Total Story Points**: 16 (100% of capacity)  
**Epic Impact**: EPIC-002 will be 100% complete by end of sprint

---

## Story Details

### US-002-001: Context Window Monitor (5 points)

**Priority**: P1 (MUST)  
**Owner**: TDD Orchestrator  
**Dependencies**: US-001-003 ✅ (Document Watcher complete)  
**Scheduled**: 2026-05-07 to 2026-05-10 (3 days)  
**BDD Scenarios**: 6 feature files prepared

**What**: Implement Context Window Bar component showing token usage breakdown:
- Total tokens used (0-100,000+)
- Breakdown: .github instructions | project code | chat history
- Color coding: 🟢 Green (0-70%) | 🟡 Yellow (71-89%) | 🔴 Red (90%+)
- Real-time updates from Copilot Chat
- Warning indicators at thresholds

**Acceptance Criteria**:
1. Context Window Bar displays in left sidebar with vertical progress
2. Shows real-time token count (refreshes <500ms)
3. Token breakdown calculated accurately (±5% tolerance)
4. Color warnings: 70% yellow, 90% red
5. Performance: <20MB memory, <10% CPU spike
6. Accessibility: WCAG 2.1 AA compliant

**Technical Approach**:
- Layer 1: Token types and calculator (math.ts)
- Layer 2: ContextAnalyzer service (subscription to activity monitor)
- Layer 3: Message protocol and hook integration
- Layer 4: React component with visual indicators

**Preparation**: [Story Description](./epics/EPIC-002/user-stories/US-002-001/description.md) | [Implementation Plan](./epics/EPIC-002/user-stories/US-002-001/implementation-plan.md)

---

### US-002-002: Completeness Metrics Engine (6 points)

**Priority**: P1 (MUST)  
**Owner**: TDD Orchestrator  
**Dependencies**: US-001-003 ✅ (Document Watcher complete)  
**Scheduled**: 2026-05-10 to 2026-05-16 (3 days + buffer)  
**BDD Scenarios**: 8 feature files prepared

**What**: Calculate project completion percentage and milestone progress:
- Scan `/docs/05-implementation/user-stories.md` for status
- Calculate: (Delivered + Implemented) / Total stories
- Track milestones: 25%, 50%, 75%, 100%
- Update whenever user-stories.md changes
- Trigger celebrations/notifications on milestone hits

**Acceptance Criteria**:
1. Completeness % calculated accurately from user-stories.md
2. Milestone logic: 25%→50%→75%→100%
3. Updates within 1 second of story status change
4. Stored in persistent state (localStorage)
5. Survives extension reload
6. Handles large projects (1000+ stories)

**Technical Approach**:
- Layer 1: Metrics types and calculators
- Layer 2: CompletenessCalculator service (parses SSOT)
- Layer 3: Message protocol and hook
- Layer 4: Completeness Bar + milestone celebration component

**Preparation**: [Story Description](./epics/EPIC-002/user-stories/US-002-002/description.md) | [Implementation Plan](./epics/EPIC-002/user-stories/US-002-002/implementation-plan.md)

---

### US-002-003: Task Window State Manager (5 points)

**Priority**: P2 (SHOULD)  
**Owner**: TDD Orchestrator  
**Dependencies**: US-002-001 (Context Window Monitor)  
**Scheduled**: 2026-05-15 to 2026-05-20 (2 days + buffer)  
**BDD Scenarios**: 5 feature files prepared

**What**: Maintain a 3-task window in real-time dashboard state:
- Previous task (completed)
- Current task (in progress)
- Next task (predicted)
- Update when TDD phases transition
- Persist to localStorage for recovery

**Acceptance Criteria**:
1. Three-task window always visible and accurate
2. Updates immediately on phase transitions
3. State survives extension reload
4. Correctly identifies next story (from implementation-plan.md)
5. Handles edge cases: sprint end, blocked stories

**Technical Approach**:
- Layer 1: Task window types
- Layer 2: TaskProgressionTracker service (query SSOT)
- Layer 3: Hook integration with message protocol
- Layer 4: Display component (already in US-001-001, enhance here)

**Preparation**: [Story Description](./epics/EPIC-002/user-stories/US-002-003/description.md) | [Implementation Plan](./epics/EPIC-002/user-stories/US-002-003/implementation-plan.md)

---

## Epic Dependency Visualization

```
EPIC-001 ✅ COMPLETE
  ├─ US-001-001: Task Progression Bar ✅
  ├─ US-001-002: Agent Activity Monitor ✅
  └─ US-001-003: Document Watcher ✅
       ↓ (foundation)
EPIC-002 🔵 STARTING 2026-05-07
  ├─ US-002-001: Context Window Monitor (depends on US-001-003)
  ├─ US-002-002: Completeness Metrics (depends on US-001-003)
  └─ US-002-003: Task Window State Manager (depends on US-002-001)
```

---

## Sprint Risks & Mitigations

| Risk | Probability | Impact | Severity | Mitigation Strategy | Owner |
|------|-------------|--------|----------|-------------------|-------|
| Context API integration complexity | Medium (40%) | Medium (1-2 days) | 🟡 MEDIUM | Create mock API for testing early; integration test ready by day 1 | dev-lead |
| Completeness parser fails on non-standard markdown | Low (20%) | High (2-3 days) | 🟡 MEDIUM | Robust markdown parser with fallbacks; test with edge cases | dev-lead |
| Task prediction algorithm unreliable | Low (25%) | Medium (1-2 days) | 🟡 MEDIUM | Start with simple next-story detection; enhance after feedback | product-owner |

---

## Sprint Preparation Checklist

### Pre-Sprint (Complete by 2026-05-05)

- [ ] QA validation of EPIC-001 stories ✅ (due 2026-04-27)
- [ ] Merge PR #1 (Task Progression + Activity) ✅ (due 2026-04-30)
- [ ] Merge PR #2 (Document Watcher) ✅ (due 2026-04-30)
- [ ] Finalize EPIC-002 user story descriptions (by 2026-04-28)
- [ ] Create BDD scenarios for all 3 stories (by 2026-04-29)
- [ ] Dev-Lead reviews implementation plans (by 2026-05-02)
- [ ] Get team sign-off on sprint scope (by 2026-05-05)

### Week 1: 2026-05-07 to 2026-05-13

- [ ] Kick-off sprint with team alignment (2026-05-07)
- [ ] US-002-001 Layer 1 RED tests passing (2026-05-07)
- [ ] US-002-001 complete (Layer 4 REFACTOR done) (2026-05-10)
- [ ] US-002-002 Layer 1-2 complete (2026-05-12)

### Week 2: 2026-05-14 to 2026-05-20

- [ ] US-002-002 Layer 3-4 complete (2026-05-15)
- [ ] US-002-003 all layers complete (2026-05-18)
- [ ] Code review & QA validation (2026-05-19)
- [ ] Sprint closure & PRs merged (2026-05-20)

---

## Daily Progress Tracking

### Week 1 Status

| Date | Story | Layer | Status | Notes | Owner |
|------|-------|-------|--------|-------|-------|
| 2026-05-07 | US-002-001 | Layer 1 | Starting | Kick-off day | @dev-lead |
| 2026-05-08 | US-002-001 | Layer 1-2 | In Progress | RED tests complete | @dev-lead |
| 2026-05-09 | US-002-001 | Layer 2-3 | In Progress | GREEN implementation | @dev-lead |
| 2026-05-10 | US-002-001 | Layer 4 | Completing | REFACTOR & code review | @dev-lead |
| 2026-05-11 | US-002-002 | Layer 1-2 | Starting | Dependency met | @dev-lead |
| 2026-05-12 | US-002-002 | Layer 2-3 | In Progress | Service complete | @dev-lead |
| 2026-05-13 | US-002-002 | Layer 3-4 | In Progress | Testing begins | @dev-lead |

### Week 2 Status

| Date | Story | Status | Notes | Owner |
|------|-------|--------|-------|-------|
| 2026-05-14 | US-002-002 | Completing | Code review | @dev-lead |
| 2026-05-15 | US-002-003 | Starting | Layer 1 RED | @dev-lead |
| 2026-05-16 | US-002-003 | In Progress | Layers 2-3 | @dev-lead |
| 2026-05-17 | US-002-003 | In Progress | Layer 4 | @dev-lead |
| 2026-05-18 | US-002-003 | Completing | Testing & review | @dev-lead |
| 2026-05-19 | All | QA Validation | Final checks | @qa.agent |
| 2026-05-20 | All | Sprint Closure | Merge & archive | @pm |

---

## Team & Capacity

**Development Team**:
- **Dev-Lead** (Sebastian): 100% allocated to Sprint 2
- **TDD Agents**: Ready for orchestration under dev-lead
- **QA Engineer**: 25% (US-001 validation) → 100% (US-002 validation week of 2026-05-19)

**Capacity Verification**:
- Total Sprint Points: 16
- Team Velocity: 17 points (Sprint 1)
- Utilization: 94% (realistic & sustainable)
- Buffer: +1 point for unknowns

---

## Success Criteria

### Sprint Completion (by 2026-05-20)

✅ **Velocity Target**: Deliver 16 story points (all 3 stories)  
✅ **Quality Target**: Zero critical/high code review issues  
✅ **Test Target**: >85% code coverage, 100% BDD passing  
✅ **Blocker Target**: Zero blockers >1 day unresolved  
✅ **Morale Target**: Team reports HIGH confidence in sprint goal  

### Epic Completion

✅ **EPIC-002 at 100%** (all 3 stories implemented & merged)  
✅ **Ready for EPIC-003 Planning** (2026-05-21)  
✅ **Project Progress**: 43% complete (7/14 stories delivered)

---

## What's NOT in This Sprint

❌ **Agent Animations** (US-003-001) — Phase 3, EPIC-003  
❌ **Multi-Project Support** (US-004-*) — Phase 4, EPIC-004  
❌ **Extensibility Framework** (US-005-*) — Phase 5, EPIC-005  
❌ **Performance Optimization** — Post-Phase 1 tech debt, not sprint-critical  

---

## Handoff Information

**From PM to Dev-Lead**: 
- Sprint scope confirmed: 16 story points, 3 stories
- All stories have BDD scenarios prepared
- No external dependencies for sprint execution
- Expected completion: 2026-05-20

**Handoff Artifacts**:
1. This sprint plan (current document)
2. Story descriptions + implementation plans
3. BDD feature files (6+8+5 = 19 total scenarios)
4. Code review templates (from EPIC-001 learnings)

**Handoff Date**: 2026-05-05 (end of week)

---

## Next Sprint Preview (Sprint 3: EPIC-003)

**Target**: 2026-05-21 to 2026-06-03  
**Epic**: Agent Customization (3 stories, ~15 points)  
**Stories**: 
- US-003-001: Agent Character Sprites & Animation System (5 pts)
- US-003-002: Office Canvas Layout (6 pts)
- US-003-003: Gamification Engine (4 pts)

**Status**: Planning starts 2026-05-17

---

## References

- **EPIC-002 Definition**: [epic.yml](/docs/01-requirements/themes/epics/EPIC-002/epic.yml)
- **Project Status**: [project-status.md](/docs/project-status.md)
- **Implementation Tracking**: [user-stories.md](/docs/05-implementation/user-stories.md)
- **Sprint 1 Results**: [sprint-1.md](/docs/05-implementation/sprint-1.md) (when archived)

---

**Created**: 2026-04-23  
**Last Updated**: 2026-04-23 22:45:00Z  
**Owner**: Project Manager (Michael)  
**Status**: ✅ READY FOR APPROVAL

---

## Sign-Off

- [ ] **Product Owner** — Sprint scope approved
- [ ] **Dev-Lead** — Capacity confirmed, no blockers
- [ ] **QA Engineer** — Testing strategy reviewed
- [ ] **Project Manager** — Sprint documented, risks mitigated

**Expected Approval Date**: 2026-05-05  
**Sprint Start Date**: 2026-05-07
