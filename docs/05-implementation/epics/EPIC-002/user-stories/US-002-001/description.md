---
generated_from_template: user-story-tmpl.yml
template_path: .github/templates/user-story-tmpl.yml
generation_date: 2026-04-23
generator_agent: product-owner
story_key: US-002-001
epic_key: EPIC-002
project_key: pixel-agents
schema_version: "1.0.0"
---

# User Story: US-002-001 - Context Window Bar with Token Usage Visualization

**Story Key**: US-002-001  
**Epic**: EPIC-002 (Context & Task Management)  
**Status**: ✅ **COMPLETE** (QA Approved)  
**Priority**: P1 (MUST)  
**Story Points**: 5  
**Sprint**: Sprint 2 (2026-05-07 to 2026-05-20)  
**Assignee**: TDD Team  
**GitHub Issue**: #TBD  
**Completion Date**: 2026-04-23  

---

## User Story

```
As a developer using GitHub Copilot,
I want to see real-time context window usage (0-100%),
So that I can optimize prompts and prevent token overflow.
```

---

## Acceptance Criteria

**PO Validated**: ✅ Yes  
**Validated By**: Product Owner  
**Validation Date**: 2026-04-23  

- [ ] Context Window Bar visible on left side of right metrics panel (60px width, full height)
- [ ] "CTX" label at top: 9px text, #F59E0B (Palo Yellow variant), weight 600, uppercase
- [ ] Vertical progress bar: 30×180px, background #1E1E1E, border: 1px #3E3E42 @ 50%, border-radius: 4px
- [ ] Displays 0-100% token usage with visual stacked segments (bottom-to-top)
- [ ] Color-coded warnings: 🟢 green #10B981 (0-70%), 🟡 yellow #F59E0B (71-89%), 🔴 red #EF4444 (90%+)
- [ ] Segment breakdown with opacity: .github (#3B82F6 @ 70%), project code (#10B981 @ 60%), chat history (#F59E0B @ 70%)
- [ ] Updates within 100ms of Copilot Chat activity
- [ ] Legend below bar: 8px text, segment color with label (e.g., ".github 26%", "project 45%", "chat 16%")
- [ ] Tooltip shows exact token counts: "Context: 174,000 / 200,000 tokens (87%)" with breakdown
- [ ] Warning notifications at 70% and 90% thresholds (toast notifications)

---

## BDD Scenarios

**Feature Files Location**: `/docs/05-implementation/epics/EPIC-002/user-stories/US-002-001/features/`

**Planned Scenarios**:
1. Display context window bar with token usage percentage
2. Show color-coded warnings based on usage thresholds
3. Display token breakdown by category (.github, project, chat)
4. Update token count within 100ms of Copilot activity
5. Show tooltip with detailed token information
6. Trigger warning notification at 70% threshold
7. Trigger critical warning at 90% threshold
8. Handle edge cases (no tokens, max tokens reached)

**Coverage**: 8 scenarios (5 essential @priority-p1, 3 edge cases)

---

## Technical Constraints

**From**: `/docs/02-architecture/architecture-design.md`

- **Technology Stack**: TypeScript, React, VS Code Extension API
- **State Management**: VS Code webview messaging protocol
- **Context Tracking**: Integration with GitHub Copilot Chat API
- **Performance**: Updates must render within 100ms of context changes
- **Debouncing**: Context analysis events must be debounced to prevent excessive calculations
- **Error Handling**: Graceful fallback if Copilot API unavailable

**From**: `/docs/02-architecture/tech-spec.md`

- **Component Architecture**: React functional components with hooks
- **Message Protocol**: Backend → Frontend via strongly-typed message interface
- **Token Calculation**: Custom analyzer service for token breakdown
- **Testing**: Jest for unit tests, React Testing Library for component tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Accessibility**: WCAG 2.1 AA compliance for all UI elements

**From**: `/docs/02-architecture/design-systems.md` v2.0.0 (Palo IT Branding)

- **Layout**: Right metrics panel, left column (60px width × 246px height)
- **Bar Container**: 30×180px vertical bar, bg: #1E1E1E, border: 1px #3E3E42 @ 50%, border-radius: 4px
- **CTX Label**: 9px text (#F59E0B), weight 600, uppercase, positioned above bar
- **Segment Colors**: .github (#3B82F6 @ 70%), project (#10B981 @ 60%), chat (#F59E0B @ 70%) — stacked bottom-to-top
- **Threshold Colors**: Safe (0-70%: #10B981), Warning (71-89%: #F59E0B with ⚠️), Critical (90%+: #EF4444 with 🔴)
- **Legend Items**: 8px text, left-aligned below bar, format: "[segment name] [percentage]%"
- **Palo IT Brand**: Yellow #FFD600 used in CTX label variant, Green #00C853 for safe state celebrations
- **Typography**: 9-level scale (--text-micro 9px for CTX, --text-mini 8px for legend)
- **Spacing**: 4px base scale (--space-1 for legend gaps, --space-2 for label padding)
- **Animations**: CSS transition 500ms cubic-bezier(0.4, 0, 0.2, 1) for progress bar fill

---

## Dependencies

- **Technical**: VS Code Extension API, TypeScript 5.x, React 18.x, GitHub Copilot API
- **User Stories**: US-001-003 (Document Watcher - provides file change events)
- **External**: GitHub Copilot Chat context tracking capabilities

---

## Definition of Done

- [ ] All acceptance criteria met and PO validated
- [ ] All 8 BDD scenarios passing (100% coverage)
- [ ] Unit test coverage ≥85% for all layers
- [ ] Code review approved (13-point checklist ✅)
- [ ] No critical or high-severity issues
- [ ] Accessibility validated (WCAG 2.1 AA)
- [ ] Performance targets met (<100ms updates)
- [ ] Documentation complete (JSDoc, inline comments)
- [ ] Merged to main branch

---

## Notes

**Implementation Approach**: Follow 4-layer TDD pattern established in EPIC-001:
- Layer 1: Token types and calculation utilities
- Layer 2: Context analyzer service (tracks token usage)
- Layer 3: Message protocol and hook integration
- Layer 4: React Context Window Bar component

**Key Challenges**:
- Integration with Copilot Chat API (may require fallback estimation)
- Accurate token breakdown calculation (need to parse .github vs project files)
- Real-time performance (<100ms constraint is aggressive)

**Risk Mitigation**:
- Early spike on Copilot API integration (day 1)
- Mock API for testing if real API unavailable
- Progressive enhancement: start with total tokens, add breakdown later

---

**Created**: 2026-04-23  
**Last Updated**: 2026-04-23  
**Status**: Ready for Implementation
