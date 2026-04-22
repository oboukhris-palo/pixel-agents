# Iteration Planning: Pixel Agents Dashboard

**Document Version**: 1.0.0  
**Created**: 2026-04-22  
**Author**: Project Manager + Product Owner  
**Phase**: Phases 6-7 (Planning)  
**Status**: Ready for Review  

---

## Executive Summary

This iteration plan delivers **Pixel Agents v2.0** through **6 bi-weekly sprints** (12 weeks total) from April 23 to July 1, 2026. The plan prioritizes MVP features first (EPIC-001, EPIC-002), followed by enhancement features (EPIC-003, EPIC-004, EPIC-005).

**Key Milestones**:
- **Sprint 1-2** (4 weeks): MVP Core (Workflow Visualization + Context Management)
- **Sprint 3-4** (4 weeks): Enhancement Features (Agent Customization + Multi-Project)
- **Sprint 5-6** (4 weeks): Extensibility + Beta Launch

**Team Velocity**: 13 story points per 2-week sprint (based on team capacity)

---

## 1. Sprint Overview

### Sprint Summary

| Sprint | Dates | Epic | Stories | Points | Focus | Status |
|--------|-------|------|---------|--------|-------|--------|
| **Sprint 1** | Apr 23 - May 6 | EPIC-001 | 3 | 13 | Workflow Visualization (MVP Foundation) | Planned |
| **Sprint 2** | May 7 - May 20 | EPIC-002 | 3 | 13 | Context & Task Management (MVP Core) | Planned |
| **Sprint 3** | May 21 - Jun 3 | EPIC-003 | 3 | 13 | Agent Customization (Enhancement) | Planned |
| **Sprint 4** | Jun 4 - Jun 17 | EPIC-004 | 3 | 13 | Multi-Project Coordination (Enhancement) | Planned |
| **Sprint 5** | Jun 18 - Jul 1 | EPIC-005 | 2 | 10 | Platform Extensibility (Future-Proofing) | Planned |
| **Sprint 6** | Jul 2 - Jul 15 | N/A | 0 | 0 | Beta Testing + Bug Fixes + Documentation | Planned |
| **TOTAL** | **12 weeks** | **5 Epics** | **14** | **62** | **Complete v2.0 Feature Set** | |

**Sprint Duration**: 2 weeks (10 working days)  
**Velocity**: 13 points/sprint (sustained)  
**Buffer Sprint**: Sprint 6 dedicated to quality + documentation (no new features)

---

## 2. MVP vs Phased Rollout Strategy

### 2.1 MVP Scope (Sprint 1-2: April 23 - May 20)

**Definition**: Minimum viable product delivering core value (workflow visibility + context optimization)

**MVP Epics**:
- ✅ **EPIC-001: Workflow Visualization** — Task Progression Bar, Workflow Status, Real-time Monitoring
- ✅ **EPIC-002: Context & Task Management** — Context Window Bar, Completeness Meter, Basic Gamification

**MVP Success Criteria**:
- ✅ Developers see real-time workflow context (previous/current/next tasks)
- ✅ Token usage visible with warning thresholds (90%+ alerts)
- ✅ Project progress tracked automatically (completeness meter)
- ✅ 60fps canvas animations with animated agents
- ✅ <100ms message protocol latency

**MVP Excludes** (deferred to post-MVP sprints):
- ❌ Agent sprite customization (EPIC-003)
- ❌ Multi-project switching (EPIC-004)
- ❌ Plugin ecosystem (EPIC-005)

**MVP Launch Date**: **May 20, 2026** (end of Sprint 2)

---

### 2.2 Phased Rollout Strategy

**Phase 1: Internal Alpha** (Sprint 1-2: Apr 23 - May 20)
- **Audience**: Internal development team only (8-10 developers)
- **Purpose**: Validate core architecture, identify critical bugs, refine UX
- **Distribution**: Manual installation (VSIX file shared internally)
- **Feedback Loop**: Daily standups + weekly retrospectives
- **Exit Criteria**: 0 P1 bugs, 60fps sustained, <100ms latency achieved

**Phase 2: Beta Launch** (Sprint 3-4: May 21 - Jun 17)
- **Audience**: Friendly beta testers (50-100 external developers)
- **Purpose**: Validate enhancement features, gather usage analytics, refine gamification
- **Distribution**: Private GitHub release + beta channel in VS Code Marketplace
- **Feedback Loop**: Bi-weekly user surveys + GitHub Discussions
- **Exit Criteria**: 75%+ daily active users, <5% churn, 0 critical accessibility violations

**Phase 3: Public v1.0 Release** (Sprint 5-6: Jun 18 - Jul 15)
- **Audience**: General public (VS Code Marketplace)
- **Purpose**: Full feature set launch with platform extensibility
- **Distribution**: VS Code Marketplace + Cursor registry
- **Feedback Loop**: GitHub Issues + monthly release notes
- **Exit Criteria**: 1,000+ installs in first month, 4+ star rating

**Phase 4: Continuous Improvement** (Post-Jul 15)
- Monthly feature releases
- Community-driven roadmap
- Plugin ecosystem growth

---

## 3. Sprint-by-Sprint Breakdown

### Sprint 1: Workflow Visualization (Apr 23 - May 6) — EPIC-001

**Sprint Goal**: Deliver real-time PDLC workflow visualization foundation

**User Stories** (13 points):
1. **US-001-001**: Task Progression Bar Implementation (5 points)
   - Backend: AgentActivityMonitor, TaskProgressionTracker
   - Frontend: TaskProgressionBar component (React)
   - Testing: BDD scenarios (9 scenarios), unit tests (>85% coverage)
   - **Definition of Done**: Task bar visible, updates <1s, color-coded by phase

2. **US-001-002**: Workflow Status Bar with PDLC Phase Detection (4 points)
   - Backend: WorkflowDetector (folder structure analysis)
   - Frontend: WorkflowStatusBar component
   - Testing: BDD scenarios (7 scenarios), integration tests
   - **Definition of Done**: Phase detected automatically, milestone info shown

3. **US-001-003**: Real-Time Document Monitoring Engine (4 points)
   - Backend: chokidar file watcher + debouncing (300ms)
   - Performance: <500ms update latency, no memory leaks
   - Testing: Unit tests (watcher resilience), performance benchmarks
   - **Definition of Done**: Dashboard updates <500ms after file changes

**Sprint 1 Deliverables**:
- ✅ 7 backend monitors operational (AgentActivityMonitor, WorkflowDetector, TaskProgressionTracker)
- ✅ 2 React components (TaskProgressionBar, WorkflowStatusBar)
- ✅ Message protocol foundation (AgentActivityMessage, TaskProgressionMessage)
- ✅ 16 BDD scenarios passing
- ✅ File watcher infrastructure with EMFILE error recovery

**Sprint 1 Risks**:
- ⚠️ File watcher EMFILE errors on large projects — **Mitigation**: Implement graceful restart + resource limits
- ⚠️ Message protocol latency >100ms — **Mitigation**: Batch updates, debounce aggressively

---

### Sprint 2: Context & Task Management (May 7 - May 20) — EPIC-002

**Sprint Goal**: Deliver token optimization and project progress tracking (MVP completion)

**User Stories** (13 points):
1. **US-002-001**: Context Window Bar with Token Usage Visualization (5 points)
   - Backend: ContextWindowAnalyzer (Copilot Chat event hooks)
   - Frontend: ContextWindowBar (vertical progress bar, color zones)
   - Testing: BDD scenarios (7 scenarios), integration tests with mock Copilot events
   - **Definition of Done**: Token usage visible, 90%+ warnings shown, <100ms updates

2. **US-002-002**: Project Completeness Meter with Milestone Tracking (5 points)
   - Backend: CompletenessCalculator (file stats aggregation)
   - Frontend: CompletenessBar (horizontal meter, milestone markers)
   - Testing: BDD scenarios (8 scenarios), unit tests for metrics calculation
   - **Definition of Done**: Progress 0-100%, milestones at 25/50/75/100%, real-time updates

3. **US-002-003**: Gamification Engine with Achievement System (3 points)
   - Backend: Achievement logic (TDD Master, Project Victory, Streak Counter)
   - Frontend: AchievementNotifications (toast popups, unlock animations)
   - Testing: BDD scenarios (6 scenarios), E2E tests for celebrations
   - **Definition of Done**: Achievements unlock, celebrations animate, PRU scoring visible

**Sprint 2 Deliverables**:
- ✅ Context Window Bar operational (token tracking + warnings)
- ✅ Completeness Meter functional (0-100% progress)
- ✅ Gamification engine with 5+ achievements
- ✅ Message protocol complete (all 5 message types implemented)
- ✅ **MVP COMPLETE** (ready for internal alpha testing)

**Sprint 2 Risks**:
- ⚠️ Copilot token counting API unavailable — **Mitigation**: Use estimation formula (context length approximation)
- ⚠️ Gamification feels gimmicky — **Mitigation**: User testing with internal team, toggle to disable

---

### Sprint 3: Agent Customization (May 21 - Jun 3) — EPIC-003

**Sprint Goal**: Enable user personalization and agent visibility controls

**User Stories** (13 points):
1. **US-003-001**: Agent Sprite Customization (color, shape, icon) (5 points)
   - Frontend: Sprite editor UI, color picker, shape selector
   - Backend: Persist customizations to workspace storage
   - Testing: BDD scenarios (8 scenarios), accessibility tests (color contrast)
   - **Definition of Done**: Agents customizable, persisted across sessions, WCAG 2.1 AA compliant

2. **US-003-002**: Agent Skill Builder (custom agent definitions) (5 points)
   - Frontend: Skill builder wizard, prompt template editor
   - Backend: Load custom .agent.md files from workspace
   - Testing: BDD scenarios (9 scenarios), validation tests for agent YAML
   - **Definition of Done**: Custom agents loadable, visible in registry, invokable

3. **US-003-003**: Agent Visibility Controls (filter, search, hide) (3 points)
   - Frontend: Filter dropdown, search box, hide/show toggles
   - Testing: BDD scenarios (7 scenarios), E2E tests for filtering
   - **Definition of Done**: Agents filterable by role/status, search functional, toggles persist

**Sprint 3 Deliverables**:
- ✅ Agent customization UI (sprite editor + skill builder)
- ✅ Custom agent support (.agent.md loading)
- ✅ Visibility controls (filter, search, hide)
- ✅ Beta feature flags enabled

**Sprint 3 Risks**:
- ⚠️ Custom agent validation complex — **Mitigation**: Use JSON Schema validation, provide clear error messages

---

### Sprint 4: Multi-Project Coordination (Jun 4 - Jun 17) — EPIC-004

**Sprint Goal**: Scale to multi-project workflows with unified dashboard

**User Stories** (13 points):
1. **US-004-001**: Multi-Project Switcher (4 points)
   - Frontend: Project dropdown, workspace switcher
   - Backend: ProjectRegistry (track multiple projects)
   - Testing: BDD scenarios (7 scenarios), state management tests
   - **Definition of Done**: Projects switchable, state persisted per project, <500ms switch time

2. **US-004-002**: Cross-Project Activity Feed (5 points)
   - Backend: Aggregate agent activity across projects
   - Frontend: Activity feed (chronological timeline)
   - Testing: BDD scenarios (9 scenarios), performance tests (5+ projects)
   - **Definition of Done**: Activity from all projects visible, real-time updates, filterable by project

3. **US-004-003**: Multi-Project Health Dashboard (4 points)
   - Backend: Aggregate metrics (completion %, blocker count, velocity)
   - Frontend: Health cards (one per project)
   - Testing: BDD scenarios (8 scenarios), integration tests for metrics
   - **Definition of Done**: Health shown per project, warnings for blockers, exportable reports

**Sprint 4 Deliverables**:
- ✅ Multi-project support (up to 10 concurrent projects)
- ✅ Unified activity feed
- ✅ Health dashboard with blockers/warnings
- ✅ Beta launch ready

**Sprint 4 Risks**:
- ⚠️ Performance degradation with 5+ projects — **Mitigation**: Lazy loading, virtual scrolling, background aggregation

---

### Sprint 5: Platform Extensibility (Jun 18 - Jul 1) — EPIC-005

**Sprint Goal**: Future-proof with framework abstraction and plugin ecosystem

**User Stories** (10 points):
1. **US-005-001**: Framework Abstraction Layer (5 points)
   - Backend: Abstract IFrameworkAdapter interface
   - Adapters: GitHub Copilot, Cursor, Claude implementations
   - Testing: BDD scenarios (12 scenarios), adapter integration tests
   - **Definition of Done**: 3 frameworks supported, adapter pattern documented, plugin SDK published

2. **US-005-002**: Plugin Ecosystem Foundation (5 points)
   - Frontend: Plugin manager UI
   - Backend: Plugin API (message hooks, state access)
   - Testing: BDD scenarios (16 scenarios), sample plugin created
   - **Definition of Done**: Plugin installation works, sample plugin functional, API docs published

**Sprint 5 Deliverables**:
- ✅ Framework adapters for 3 AI platforms
- ✅ Plugin ecosystem foundation
- ✅ Plugin SDK + documentation
- ✅ **v1.0 feature-complete**

**Sprint 5 Risks**:
- ⚠️ Plugin API too complex — **Mitigation**: Start with minimal API surface, expand based on feedback

---

### Sprint 6: Beta Testing + Hardening (Jul 2 - Jul 15) — NO NEW FEATURES

**Sprint Goal**: Quality assurance, documentation, and public launch preparation

**Activities**:
- ✅ **Bug Fixes**: Resolve all P1/P2 bugs from beta testing
- ✅ **Performance Optimization**: Ensure 60fps, <100ms latency on all hardware
- ✅ **Accessibility Audit**: WCAG 2.1 AA compliance validation (axe-core + manual)
- ✅ **Documentation**: User guide, developer docs, plugin SDK examples
- ✅ **E2E Testing**: Complete workflow validation (all 130 BDD scenarios)
- ✅ **VS Code Marketplace Submission**: Prepare listing, screenshots, demo video
- ✅ **Marketing**: Release notes, blog post, social media campaign

**Sprint 6 Deliverables**:
- ✅ 0 P1 bugs, <5 P2 bugs
- ✅ Performance targets met (60fps, <100ms)
- ✅ 0 accessibility violations
- ✅ Documentation complete
- ✅ VS Code Marketplace approved
- ✅ **Public v1.0 Launch: July 15, 2026**

---

## 4. Story Dependencies

### 4.1 Critical Path

```
EPIC-001 (Sprint 1) → Foundation for all subsequent work
  ├─ US-001-001 (Task Progression) → BLOCKS US-002-002 (Completeness Meter)
  ├─ US-001-002 (Workflow Status) → BLOCKS US-004-003 (Multi-Project Health)
  └─ US-001-003 (File Monitoring) → BLOCKS US-002-001 (Context Window), US-002-002

EPIC-002 (Sprint 2) → MVP Completion
  ├─ US-002-001 (Context Window) → BLOCKS US-004-002 (Activity Feed)
  └─ US-002-002 (Completeness Meter) → BLOCKS US-004-003 (Health Dashboard)

EPIC-003 (Sprint 3) → Independent (no blockers)

EPIC-004 (Sprint 4) → Depends on EPIC-001, EPIC-002
  └─ US-004-001 (Multi-Project Switcher) → BLOCKS US-004-002, US-004-003

EPIC-005 (Sprint 5) → Independent (framework abstraction)
```

**Key Insight**: EPIC-001 and EPIC-002 are foundational; delaying them impacts entire timeline.

### 4.2 Parallel Work Opportunities

**Sprint 1**:
- US-001-001 (Task Progression) can be implemented in parallel with US-001-002 (Workflow Status)
- US-001-003 (File Monitoring) can start backend work while frontend components are in progress

**Sprint 2**:
- US-002-001 (Context Window) and US-002-002 (Completeness Meter) fully independent
- US-002-003 (Gamification) can be developed in parallel

**Sprint 3-5**:
- Most stories independent, allowing full team parallelization

---

## 5. Resource Allocation

### 5.1 Team Composition

**Core Team** (full-time allocation):
- **1 Tech Lead (Sebastian)** — Architecture, unblocking, code reviews
- **2 Full-Stack Developers** — Backend monitors + React components
- **1 Frontend Specialist** — Phaser 3 canvas, animations, accessibility
- **1 QA Engineer** — BDD test automation, E2E testing, accessibility audits
- **0.5 Product Owner** — Sprint planning, backlog refinement, stakeholder communication
- **0.5 UX Designer** — Component design, accessibility, user testing

**Total Team Size**: 6 FTE (full-time equivalents)

### 5.2 Sprint Capacity

**Capacity per Sprint** (2 weeks = 10 working days):
- Tech Lead: 6 days coding + 2 days reviews + 2 days meetings = 60% coding capacity
- Developers: 8 days coding + 2 days meetings = 80% coding capacity
- QA Engineer: 7 days testing + 2 days automation + 1 day meetings = 70% testing capacity

**Total Development Capacity**: ~30 developer-days/sprint (accounting for meetings, reviews, overhead)

**Story Point Velocity**: 13 points/sprint (sustained velocity based on team capacity)

---

## 6. Release Milestones

### 6.1 Milestone Timeline

| Milestone | Date | Deliverables | Success Criteria |
|-----------|------|--------------|------------------|
| **M1: Internal Alpha** | May 6, 2026 | EPIC-001 complete | 60fps animations, file monitoring works, 0 P1 bugs |
| **M2: MVP Ready** | May 20, 2026 | EPIC-001 + EPIC-002 complete | Token tracking works, progress visible, internal team using daily |
| **M3: Beta Launch** | Jun 3, 2026 | EPIC-003 complete | 50-100 beta users onboarded, customization functional |
| **M4: Multi-Project Ready** | Jun 17, 2026 | EPIC-004 complete | 5+ concurrent projects supported, performance maintained |
| **M5: v1.0 Feature-Complete** | Jul 1, 2026 | EPIC-005 complete | Plugin ecosystem functional, 3 framework adapters working |
| **M6: Public Launch** | Jul 15, 2026 | All epics + hardening | VS Code Marketplace live, 1,000+ installs target |

### 6.2 Quality Gates per Milestone

**Every Sprint Must Pass**:
- ✅ All BDD scenarios pass (100% pass rate)
- ✅ Unit test coverage ≥85% (backend + frontend)
- ✅ Integration tests pass (message protocol validated)
- ✅ Performance benchmarks met (60fps, <100ms latency)
- ✅ 0 accessibility violations (axe-core)
- ✅ Code review approved (Tech Lead sign-off)
- ✅ No P1 bugs (critical blockers resolved)

**Milestone-Specific Gates**:
- **M2 (MVP)**: User acceptance testing with internal team, 75%+ satisfaction
- **M4 (Multi-Project)**: Load testing with 10 concurrent projects, performance maintained
- **M6 (Launch)**: VS Code Marketplace approval, legal review, security scan

---

## 7. Risk Management

### 7.1 Top Risks & Mitigations

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **File watcher EMFILE errors** | High | High | Implement resource limits, graceful restart, chunked watching |
| **Copilot token API unavailable** | Medium | Medium | Use context length estimation formula, plan for API when available |
| **Performance <60fps with 5+ agents** | Medium | High | Profiling in Sprint 1, GPU acceleration if needed, optimize rendering |
| **Canvas accessibility fails WCAG** | Low | High | Screen reader descriptions from Sprint 1, keyboard nav mandatory |
| **Multi-project state corruption** | Low | Medium | Immutable state updates, state snapshots, rollback mechanism |
| **Plugin API too complex** | Medium | Low | Start minimal, expand iteratively based on feedback |
| **Beta user churn >10%** | Medium | Medium | Weekly surveys, rapid iteration on feedback, gamification tuning |

### 7.2 Contingency Plans

**If Sprint 1 Falls Behind** (EPIC-001 not complete by May 6):
- **Action**: Reduce scope of US-001-003 (file monitoring) to basic implementation, defer advanced features
- **Impact**: Sprint 2 may need to extend by 1 week
- **Mitigation**: Add 1 developer to Sprint 1 in Week 2

**If Performance Targets Missed** (60fps not achieved):
- **Action**: Sprint 6 becomes performance sprint, defer extensibility (EPIC-005) to v1.1
- **Impact**: Public launch delayed 2 weeks (Jul 29)
- **Mitigation**: Early profiling in Sprint 1, identify bottlenecks before Sprint 3

**If Accessibility Fails** (WCAG violations >0):
- **Action**: Dedicated accessibility sprint (insert between Sprint 5-6)
- **Impact**: Launch delayed 2 weeks
- **Mitigation**: Accessibility review every sprint, not just at end

---

## 8. Success Metrics & KPIs

### 8.1 Sprint-Level Metrics (Tracked Daily)

- **Velocity**: Story points completed vs. planned (target: 100% completion)
- **Burndown**: Work remaining vs. days left (track divergence)
- **Defect Rate**: Bugs introduced per story point (target: <0.5 bugs/point)
- **Test Coverage**: Cumulative coverage (target: ≥85%)
- **Code Review Time**: Time from PR open to merge (target: <24 hours)

### 8.2 Release-Level KPIs (Tracked Monthly)

**User Engagement**:
- Daily Active Users (DAU): Target 75%+ of installs
- Session Duration: Target 4+ hours/day (developers working with extension active)
- Feature Adoption: % of users using each epic's features

**Quality**:
- Crash-Free Rate: Target 99.5%+
- Average Rating: Target 4+ stars (VS Code Marketplace)
- Bug Resolution Time: Target <48 hours for P1, <1 week for P2

**Business Impact**:
- Time-to-Market Improvement: -35% (baseline: 12 weeks → target: 7.8 weeks)
- Developer Productivity: +45% (measured via survey)
- Token Overflow Incidents: -100% (target: 0 incidents)

---

## 9. Communication Plan

### 9.1 Sprint Ceremonies

**Daily Standup** (15 min, 9:00 AM):
- What did I complete yesterday?
- What will I work on today?
- Any blockers?

**Sprint Planning** (2 hours, Day 1 of sprint):
- Review sprint goal
- Break down stories into tasks
- Estimate tasks (hours)
- Assign tasks to developers

**Sprint Review** (1 hour, Day 10 of sprint):
- Demo completed stories
- Product Owner acceptance
- Gather feedback

**Sprint Retrospective** (1 hour, Day 10 of sprint):
- What went well?
- What could improve?
- Action items for next sprint

**Backlog Refinement** (1 hour, mid-sprint):
- Review upcoming stories
- Clarify acceptance criteria
- Update estimates

### 9.2 Stakeholder Communication

**Weekly Status Update** (Fridays):
- Sprint progress (burndown chart)
- Risks and mitigations
- Upcoming milestones
- Send to: Product Owner, Architect, Management

**Monthly Release Notes** (End of month):
- Features delivered
- Performance metrics
- User feedback summary
- Next month's roadmap

**Beta Feedback Loop** (Starting Sprint 3):
- Bi-weekly surveys to beta users
- GitHub Discussions for feature requests
- Monthly AMA sessions

---

## 10. Post-Launch Roadmap (Post-Jul 15, 2026)

### 10.1 v1.1 Features (Aug-Sep 2026)

**Planned Enhancements**:
- Advanced gamification (leaderboards, team challenges)
- AI-powered workflow recommendations
- Integration with Jira/Linear for task sync
- Performance improvements (GPU acceleration)
- Dark mode themes and customization

### 10.2 v2.0 Vision (Q4 2026)

**Strategic Features**:
- Multi-team coordination (manager dashboard)
- AI coaching mode (onboarding assistance)
- Advanced analytics (velocity forecasting)
- Mobile companion app (iOS/Android)
- Cloud sync for multi-device workflows

---

## 11. Approval & Sign-Off

**Document Reviewed By**:
- [ ] **Product Owner** — Sprint scope and MVP definition approved
- [ ] **Tech Lead** — Resource allocation and timeline feasible
- [ ] **Project Manager** — Risk mitigation and contingency plans adequate
- [ ] **QA Lead** — Testing strategy and quality gates clear

**Approval Required Before Sprint 1 Starts**: All 4 stakeholders must sign off by **April 22, 2026 EOD**

---

**Status**: ACTIVE | **Version**: 1.0.0 | **Last Updated**: 2026-04-22  
**Phase Gate**: ✅ READY FOR SIGN-OFF  
**Next Phase**: Phase 8 Implementation (→ `.github/workflows/05-implementation.workflows.md`)

**Related Documents**:
- User Stories: `/docs/01-requirements/user-stories.md`
- Architecture Design: `/docs/02-architecture/architecture-design.md`
- Testing Strategy: `/docs/03-testing/test-strategies.md`
- Deployment Plan: `/docs/04-planning/deployment-plan.md` (see below)
