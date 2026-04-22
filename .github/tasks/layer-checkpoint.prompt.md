# Layer Checkpoint - Validate Layer Completion

## Command

```bash
@orchestrator Show Layer X completion for US-XXX

Check if Layer X is complete:
1. BDD assertions (X/Y passing) 
2. Code quality checklist
3. What's left to finish layer
4. Ready for next layer? (Yes/No with blockers)
```

## Example Usage

```bash
@orchestrator Show Layer 2 completion for US-003

Layer 2 (Backend): 8/10 BDD assertions passing
Code Quality: 11/13 checks passed  
Remaining: Fix input validation, add error handling
Ready for Layer 3: No (2 quality gates failing)
```

## Expected Output Format

```
# ✅ Layer X Checkpoint - US-XXX

## 🎯 BDD Assertion Progress
| ID | Assertion | Status | Notes |
|----|-----------|--------|-------|
| A1 | [DESCRIPTION] | ✅ PASSING | [DETAILS] |  
| A2 | [DESCRIPTION] | ❌ FAILING | [ISSUE] |
| A3 | [DESCRIPTION] | ⏸️ NOT_ATTEMPTED | [REASON] |

**Progress**: [X/Y] passing ([PERCENTAGE]%)

## 🧪 Code Quality Gates  
- [✅/❌] Test Coverage ≥80% ([ACTUAL]%)
- [✅/❌] Cyclomatic Complexity ≤10 ([MAX_FOUND])
- [✅/❌] SOLID Principles Applied
- [✅/❌] No Hardcoded Values
- [✅/❌] Error Handling Complete
- [✅/❌] Input Validation Added
- [✅/❌] Architecture Compliance
- [✅/❌] Security Requirements Met

**Quality Score**: [X/13] checks passed ([PERCENTAGE]%)

## 📂 Implementation Status
**Files Created**: [FILE_COUNT] of [PLANNED_COUNT]  
**TDD Cycles**: [COMPLETED] of [ESTIMATED]  
**Blockers**: [COUNT] ([CRITICAL/MEDIUM/LOW])

## ⏭️ Next Steps
{IF_LAYER_COMPLETE}
**✅ Layer X COMPLETE**  
- All BDD target assertions passing
- Code quality gates met  
- Ready for Layer [X+1]
- **Next**: `@dev-lead Start Layer [X+1] for US-XXX`

{IF_LAYER_INCOMPLETE}  
**❌ Layer X INCOMPLETE**  
**Remaining Work**:
- [ ] [TASK_1] ([ESTIMATED_TIME])
- [ ] [TASK_2] ([ESTIMATED_TIME])
- [ ] [TASK_N] ([ESTIMATED_TIME])

**Blockers**:
- 🚨 [BLOCKER_1] (escalate to [AGENT])
- ⚠️ [BLOCKER_2] (can resolve in next cycle)

**Estimated Completion**: [TIME_ESTIMATE]  
**Next**: Continue TDD cycles or escalate blockers

{IF_QUALITY_ISSUES}
**⚠️ Quality Issues Detected**  
**Failed Gates**:
- ❌ [FAILED_GATE_1]: [ISSUE_DESCRIPTION]  
- ❌ [FAILED_GATE_2]: [ISSUE_DESCRIPTION]

**Remediation**:
- [ ] [FIX_1] ([TIME_ESTIMATE])
- [ ] [FIX_2] ([TIME_ESTIMATE])
```

## Context Sources
- `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md` (layer targets)
- `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md` (layer checkboxes and progress)
- BDD test results (live test execution)
- Code quality metrics (coverage, complexity tools)

## Orchestrator Instructions

1. **Identify current layer**: Read implementation-plan.md for active layer
2. **Check BDD status**: Run BDD tests for current layer assertions  
3. **Validate code quality**: Run quality checks against validation-rules.yml
4. **Review TDD progress**: Check implementation-plan.md checkboxes for layer completion
5. **Identify blockers**: Review plan-approval.yaml and git log for issues
6. **Calculate completion**: Determine if layer meets Definition of Done
7. **Recommend action**: Next layer, continue TDD, or escalate

## Quality Thresholds (from validation-rules.yml)
- **BDD Assertions**: 100% of target assertions must pass
- **Code Coverage**: ≥80% for layer code
- **Complexity**: Cyclomatic complexity ≤10  
- **Quality Gates**: All 13-point checklist items passed
- **Architecture**: No violations of architecture-design.md

## Integration Points
- Uses existing quality validation from validation-rules.yml
- References layer-completion-checklist.template.md
- Follows simplified progress tracking (checkboxes + git commits)
- Validates layer completion before advancing to next layer

## Automation Opportunities
- **BDD Test Runner**: Auto-execute tests and parse results
- **Quality Scanner**: Auto-run coverage/complexity/lint tools  
- **Progress Calculator**: Auto-update completion percentages
- **Blocker Detector**: Auto-identify common failure patterns

## Escalation Triggers
- **Layer stuck >24 hours**: Escalate to dev-lead
- **Quality gates failing >3 cycles**: Escalate to architect
- **BDD assertions impossible**: Escalate to BA for scenario refinement
- **Cross-layer assertions passing**: Escalate immediately (boundary violation)