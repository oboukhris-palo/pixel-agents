# Sprint Planning Template: Iteration [ITERATION_NUMBER]

**Sprint Period**: [START_DATE] - [END_DATE]  
**Team Capacity**: [TEAM_SIZE] engineers, [VELOCITY] story points available  
**Sprint Goal**: [HIGH_LEVEL_OBJECTIVE]  
**Status**: Active

---

## Sprint Scope

### Selected User Stories

| Rank | Story ID | Epic | Title | Story Points | Priority | Status | Owner | Notes |
|------|----------|------|-------|--------------|----------|--------|-------|-------|
| 1 | [US-XXX] | [Epic Name] | [User Story Title] | [Points] | [P0/P1/P2] | Not Started | [Team Member] | [Dependencies/Blockers] |
| 2 | [US-XXX] | [Epic Name] | [User Story Title] | [Points] | [P0/P1/P2] | Not Started | [Team Member] | [Dependencies/Blockers] |
| 3 | [US-XXX] | [Epic Name] | [User Story Title] | [Points] | [P0/P1/P2] | Not Started | [Team Member] | [Dependencies/Blockers] |

**Total Story Points**: [SUM] / [CAPACITY]  
**Sprint Utilization**: [PERCENTAGE]%

---

## Daily Progress Tracking

### Day 1: [DATE]
- **Stories In Progress**: [US-XXX]
- **Blockers Identified**: None
- **Status**: On track

### Day 2: [DATE]
- **Stories In Progress**: [US-XXX]
- **Blockers Identified**: [Description if any]
- **Status**: [On track / At risk]

---

## Sprint Burndown

```
Story Points Remaining by Day:
|
[CAPACITY] |  ╱╲
           | ╱  ╲
           |╱    ╲___
           |         ╲___
       0   |____________╲___
           |_________________
             Day 1 2 3 4 5 6 7
```

---

## Definition of Ready (DOR)

✅ Each story in this sprint has:
- [ ] User Story defined in `/docs/prd/user-stories.md`
- [ ] Acceptance criteria (BDD scenarios) documented
- [ ] GitHub Issue created with AC and BDD scenarios
- [ ] Technical feasibility reviewed by Architect
- [ ] UI inputs from UX agent (if frontend work)
- [ ] Estimated effort (story points)
- [ ] Clear dependencies identified

---

## Definition of Done (DOD)

✅ Each completed story must have:
- [ ] All BDD scenarios passing
- [ ] Implementation-plan.md completed by Dev-Lead
- [ ] Code implementation (all 4 layers or applicable subset)
- [ ] Test coverage > 80%
- [ ] Code review approved (13-point checklist)
- [ ] BA validation passed (Playwright E2E tests)
- [ ] GitHub Issue marked "Delivered" and closed
- [ ] `/docs/user-stories/user-stories.md` status "Delivered"
- [ ] Release notes entry created

---

## Risk Management

### Identified Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| [Risk Description] | High/Med/Low | High/Med/Low | [Mitigation Strategy] |

### Dependency Management
- **External Dependencies**: [List if any]
- **Internal Dependencies**: [Cross-team dependencies]
- **Blocked Stories**: [If any, with reason]

---

## Sprint Artifacts & Checkpoints

### Key Checkpoints
- **Kick-off**: [DATE] - All stories groomed and team aligned
- **Mid-Sprint Review**: [DATE] - 50% stories should be "Implemented" or "In Progress"
- **Sprint Review**: [DATE] - All completed stories demoed to stakeholders
- **Sprint Retrospective**: [DATE] - Team reflects on process improvements

### Generated Documents
- **Current Sprint File**: `/docs/user-stories/current-sprint.md`
- **Project Status**: `/docs/user-stories/project-status.md`
- **BA Enrichment**: Per-story in `/docs/user-stories/<US-REF>/ba-enrichment.md`

---

## Links & References

- **PRD User Stories**: `/docs/prd/user-stories.md`
- **Implementation Status**: `/docs/user-stories/user-stories.md`
- **Architecture**: `/docs/prd/architecture-design.md`
- **Tech Specs**: `/docs/prd/tech-spec.md`
- **Design System**: `/docs/design/design-systems.md`

---

## Notes

[Add sprint-specific notes, team discussions, or important context here]

---

**Created By**: [PM Agent Name]  
**Last Updated**: [TIMESTAMP]  
**Sprint Owner**: [PM or Scrum Master]
