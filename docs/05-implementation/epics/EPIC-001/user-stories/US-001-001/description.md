---
generated_from_template: user-story-tmpl.yml
template_path: .github/templates/user-story-tmpl.yml
generation_date: 2026-04-22
generator_agent: dev-lead
story_key: US-001-001
epic_key: EPIC-001
project_key: pixel-agents
schema_version: "1.0.0"
---

# User Story: US-001-001 - Task Progression Bar Implementation

**Story Key**: US-001-001  
**Epic**: EPIC-001 (Workflow Visualization Enhancement)  
**Status**: In Progress  
**Priority**: P1 (MUST)  
**Story Points**: 5  
**Sprint**: Sprint 1 (2026-04-23 to 2026-05-06)  
**Assignee**: dev-lead  
**GitHub Issue**: #TBD  

---

## User Story

```
As a developer using Pixel Agents,
I want to see the previous, current, and next tasks in real-time,
So that I can understand my workflow context and plan ahead.
```

---

## Acceptance Criteria

**PO Validated**: ✅ Yes  
**Validated By**: Product Owner  
**Validation Date**: 2026-04-22  

- [ ] Task Progression Bar visible at top of dashboard (36px height, full width)
- [ ] Displays Phase Pill (80×24px, border-radius: 12px) showing current PDLC phase
- [ ] Displays 3 task cards: Previous (240×24px, completed ✅), Current (300×24px, active 🔄), Next (240×24px, upcoming ⏭️)
- [ ] Updates within 1 second of workflow state changes
- [ ] Color-coded by TDD phase: RED (#FF5500, bg #3E1D00), GREEN (#10B981, bg #052E16), REFACTOR (#8B5CF6, bg #1E0A3C), DOCUMENT (#06B6D4, bg #0A2530)
- [ ] Clicking tasks navigates to corresponding implementation files
- [ ] Handles empty/unavailable task states gracefully
- [ ] Compact metrics (CTX % + Done %) displayed right-aligned in task bar (10px text)

---

## BDD Scenarios

**Feature File**: `/docs/05-implementation/epics/EPIC-001/user-stories/US-001-001/features/task-progression-bar.feature`

**Scenarios**:
1. Display task progression bar with three sections
2. Show previous task details
3. Show current task details with layer and cycle information
4. Show next task prediction
5. Update task progression within 1 second of changes
6. Color-code task sections by PDLC phase
7. Navigate to story by clicking task
8. Handle empty/incomplete story information gracefully
9. Show multiple parallel tasks (TDD zones)

**Coverage**: 9 scenarios (6 essential @priority-p1, 3 edge cases)

---

## Technical Constraints

**From**: `/docs/02-architecture/architecture-design.md`

- **Technology Stack**: TypeScript, React, VS Code Extension API
- **State Management**: VS Code webview messaging protocol
- **File System Monitoring**: VS Code FileSystemWatcher for /docs/ changes
- **Performance**: Dashboard must render within 100ms of file changes
- **Debouncing**: File system events must be debounced to prevent excessive updates
- **Error Handling**: Graceful fallback for missing or malformed PDLC data

**From**: `/docs/02-architecture/tech-spec.md`

- **Component Architecture**: React functional components with hooks
- **Message Protocol**: Backend → Frontend via strongly-typed message interface
- **Testing**: Jest for unit tests, React Testing Library for component tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Accessibility**: WCAG 2.1 AA compliance for all UI elements

**From**: `/docs/02-architecture/design-systems.md` v2.0.0 (Palo IT Branding)

- **Layout**: VS Code bottom panel, 36px height task bar, Phase Pill + 3 task cards + compact metrics
- **Phase Pill**: 80×24px, border-radius: 12px, border: TDD phase color, bg: phase color @ 15%
- **Task Cards**: Previous (240×24px), Current (300×24px), Next (240×24px), bg: #252526, borders with phase colors
- **TDD Phase Colors**: RED #FF5500 (bg #3E1D00), GREEN #10B981 (bg #052E16), REFACTOR #8B5CF6 (bg #1E0A3C), DOCUMENT #06B6D4 (bg #0A2530)
- **Palo IT Brand Colors**: Green #00C853, Yellow #FFD600, Orange #FF6D00 (used in celebrations and highlights)
- **Typography**: 9-level scale (--text-mini 8px through --text-h1 24px), system fonts only (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Spacing**: 4px base scale (--space-1: 4px through --space-16: 64px)
- **Icons**: Codicons icon library + emoji indicators (✅ ✓ 🔄 ⏭️)
- **Animations**: CSS transitions 150ms fast, 250ms base, 350ms slow for state changes

---

## Dependencies

- **Technical**: VS Code Extension API, TypeScript 5.x, React 19.x, Tailwind CSS (80%+ utility styling), CSS Modules for component-specific styles
- **Infrastructure**: Webview messaging protocol must be established
- **Data**: /docs/05-implementation/user-stories.md must exist and be readable
- **Prior Stories**: None (first story in epic)

---

## Definition of Done

- [ ] All 9 BDD scenarios pass
- [ ] Test coverage ≥80% (unit + integration)
- [ ] Code review approved (13-point checklist)
- [ ] Technical specifications met (architecture-design.md, tech-spec.md)
- [ ] Design requirements implemented (design-systems.md)
- [ ] Documentation complete (JSDoc, inline comments)
- [ ] No console errors or warnings
- [ ] Accessibility validated (WCAG 2.1 AA)
- [ ] Performance benchmarks met (<100ms render time)

---

## Requirements Traceability

- **Functional Requirements**: FR-002 (Real-time workflow visualization)
- **Non-Functional Requirements**: NFR-001 (Performance), NFR-002 (Responsiveness)
- **Business Case**: Enable developers to maintain context and plan ahead during TDD cycles
- **User Persona**: Primary Developer (needs workflow visibility and context)

---

## Implementation Path

**Folder**: `/docs/05-implementation/epics/EPIC-001/user-stories/US-001-001/`

**Documents**:
- **description.md** (this file): Story definition and acceptance criteria
- **implementation-plan.md**: Layer-by-layer implementation guide
- **plan-approval.yaml**: Human validation gate before TDD execution
- **features/**: BDD scenario files (Gherkin format)

**Log Path**: `/logs/05-implementation/epics/EPIC-001/user-stories/US-001-001/`

---

**Created**: 2026-04-22  
**Last Updated**: 2026-04-22  
**Status**: Ready for implementation planning
