# Layer {LAYER_NUMBER} Completion Checklist Template
# User Story: {US-REF} - {STORY_TITLE}
# Epic: {EPIC_NAME}
# Layer: {LAYER_NAME} ({DATABASE|BACKEND|CONFIG|FRONTEND})

**Generated**: {TIMESTAMP}  
**Dev-Lead**: {DEV_LEAD_NAME}  
**TDD Orchestrator**: {TDD_ORCHESTRATOR_NAME}

---

## 📌 BDD Assertion Status

**Target Assertions for {LAYER_NAME}**: (from implementation-plan.md)

| Assertion ID | Description | Status | Notes |
|-------------|-------------|---------|-------|
| {A1} | {BDD_ASSERTION_DESCRIPTION} | {✅ PASSING / ❌ FAILING / ⏸️ NOT_ATTEMPTED} | {TEST_RESULT_DETAILS} |
| {A2} | {BDD_ASSERTION_DESCRIPTION} | {✅ PASSING / ❌ FAILING / ⏸️ NOT_ATTEMPTED} | {TEST_RESULT_DETAILS} |
| {A3} | {BDD_ASSERTION_DESCRIPTION} | {✅ PASSING / ❌ FAILING / ⏸️ NOT_ATTEMPTED} | {TEST_RESULT_DETAILS} |

**BDD Progress**: {X}/{Y} assertions passing ({PERCENTAGE}%)

### ❌ Red Flags - Immediate Escalation Needed

- [ ] **Cross-Layer Assertions Passing**: If Layer {LAYER_NUMBER} implementation causes Layer {LAYER_NUMBER+1} or {LAYER_NUMBER+2} assertions to pass unexpectedly
  - 🚨 **Found**: {UNEXPECTED_PASSING_ASSERTIONS}
  - 🚨 **Action**: Escalate to Dev-Lead - layer boundaries violated

- [ ] **Target Assertions Still Failing**: If any "MUST PASS" assertion for this layer is still failing
  - 🚨 **Found**: {FAILING_TARGET_ASSERTIONS}  
  - 🚨 **Action**: Continue TDD cycles or escalate blocker to Dev-Lead

---

## 🎯 TDD Cycle Summary

### RED → GREEN → REFACTOR Cycles Completed

| Cycle | RED Test | GREEN Implementation | REFACTOR Improvement | BDD Impact |
|-------|----------|---------------------|---------------------|------------|
| 1 | {TEST_DESCRIPTION} | {CODE_IMPLEMENTATION_SUMMARY} | {REFACTOR_SUMMARY} | {BDD_ASSERTIONS_NOW_PASSING} |
| 2 | {TEST_DESCRIPTION} | {CODE_IMPLEMENTATION_SUMMARY} | {REFACTOR_SUMMARY} | {BDD_ASSERTIONS_NOW_PASSING} |
| {N} | {TEST_DESCRIPTION} | {CODE_IMPLEMENTATION_SUMMARY} | {REFACTOR_SUMMARY} | {BDD_ASSERTIONS_NOW_PASSING} |

**Total TDD Cycles**: {CYCLE_COUNT}  
**Average Cycle Duration**: {AVG_DURATION} minutes  
**Blockers Encountered**: {BLOCKER_COUNT}

---

## 📂 Files Created/Modified

### Created Files
- [ ] `{FILE_PATH_1}` - {PURPOSE} ({SIZE_KB} KB)
- [ ] `{FILE_PATH_2}` - {PURPOSE} ({SIZE_KB} KB)  
- [ ] `{FILE_PATH_N}` - {PURPOSE} ({SIZE_KB} KB)

### Modified Files  
- [ ] `{FILE_PATH_1}` - {MODIFICATION_DESCRIPTION} ({LINES_CHANGED} lines)
- [ ] `{FILE_PATH_2}` - {MODIFICATION_DESCRIPTION} ({LINES_CHANGED} lines)

### Database Migrations (Layer 1 Only)
- [ ] `{MIGRATION_FILE}` - {MIGRATION_DESCRIPTION}
- [ ] **Migration Tested**: UP and DOWN migrations both work
- [ ] **Rollback Verified**: Can revert changes cleanly

---

## 🧪 Code Quality Gates (From validation-rules.yml)

### Test Coverage
- [ ] **Unit Test Coverage**: ≥80% for this layer ({ACTUAL_COVERAGE}%)
- [ ] **Integration Test Coverage**: All layer interfaces tested  
- [ ] **BDD Test Coverage**: All target assertions have supporting tests

### Code Quality (13-Point Checklist from coding.instructions.md)
- [ ] **No Cyclomatic Complexity >10**: Max complexity {MAX_COMPLEXITY} 
- [ ] **SOLID Principles Followed**: SRP, OCP, LSP, ISP, DIP validated
- [ ] **Clear Naming**: Classes=nouns, Functions=verbs, Variables=specific
- [ ] **No Duplication**: DRY principle applied
- [ ] **Error Handling**: All error paths tested and documented
- [ ] **Input Validation**: All inputs validated at boundaries
- [ ] **No Hardcoded Values**: Configuration externalized
- [ ] **Security Implemented**: Authentication, authorization, input sanitization  
- [ ] **Performance Considered**: No obvious bottlenecks or N+1 queries
- [ ] **Documentation Updated**: Code self-documenting with necessary comments
- [ ] **Logging Added**: Appropriate debug/info/error logging
- [ ] **Resource Management**: Proper cleanup of connections, files, etc.
- [ ] **Thread Safety**: Concurrent access handled properly (if applicable)

### Architecture Compliance (From architecture-design.md)  
- [ ] **Layer Boundaries Respected**: No direct calls to higher layers
- [ ] **Design Patterns Applied**: Patterns from architecture-design.md used correctly
- [ ] **Integration Points Defined**: APIs/contracts match tech-spec.md
- [ ] **Data Model Consistency**: Entities match database design
- [ ] **Security Architecture**: Follows security requirements from tech-spec.md

---

## ⚖️ Definition of Done Validation

### Layer {LAYER_NUMBER} Completion Criteria
- [ ] **All Target BDD Assertions Passing**: {X}/{Y} ✅
- [ ] **No Cross-Layer Assertions Passing**: Future layer assertions still failing ✅  
- [ ] **Code Quality Gates Met**: All 13 points passed ✅
- [ ] **Test Coverage ≥80%**: {ACTUAL_COVERAGE}% ✅
- [ ] **Architecture Compliance**: No violations found ✅
- [ ] **Implementation Plan Followed**: All planned files created ✅
- [ ] **Performance Acceptable**: No regressions introduced ✅
- [ ] **Security Requirements Met**: Layer-specific security implemented ✅

### Ready for Next Layer?
- [ ] **All DoD Criteria Met**: Every checkbox above is ✅
- [ ] **No Open Blockers**: All issues resolved or escalated
- [ ] **Progress Tracking Complete**: All layer checkboxes [x] in implementation-plan.md
- [ ] **BDD Test Suite Stable**: Test runs consistently green

---

## 🚨 Escalation Log

### Blockers Encountered
{IF_NO_BLOCKERS}
- ✅ **No blockers encountered** - Layer completed smoothly

{IF_BLOCKERS_FOUND}
| Blocker | Root Cause | Resolution | Escalated To | Time to Resolve |
|---------|------------|------------|--------------|-----------------|
| {BLOCKER_DESCRIPTION} | {ROOT_CAUSE} | {RESOLUTION} | {ESCALATED_AGENT} | {RESOLUTION_TIME} |

### Technical Decisions Made
| Decision Point | Options Considered | Choice | Rationale | Future Review Condition |
|----------------|-------------------|---------|-----------|------------------------|
| {DECISION_TOPIC} | {OPTION_1, OPTION_2, OPTION_3} | {CHOSEN_OPTION} | {RATIONALE} | {REVIEW_CONDITION} |

---

## 🔄 Next Layer Preparation  

### Context for Layer {LAYER_NUMBER+1}
**Files to Review**:
- `{FILE_PATH}` - {REVIEW_FOCUS}
- `{FILE_PATH}` - {REVIEW_FOCUS}

**Key Decisions to Consider**:
- {DECISION_CONTEXT_FOR_NEXT_LAYER}
- {ARCHITECTURAL_CONSTRAINT_TO_REMEMBER}

**BDD Assertions for Next Layer**:
- {NEXT_LAYER_TARGET_ASSERTIONS}

**Estimated Effort**: {NEXT_LAYER_HOURS} hours

---

## ✅ Sign-Off

### TDD Orchestrator Verification
- **BDD Assertions**: All target assertions passing ✅  
- **TDD Cycles**: All cycles completed successfully ✅
- **Quality Gates**: Code meets all standards ✅
- **Handoff Ready**: Context prepared for next agent ✅

**TDD Orchestrator**: {TDD_ORCHESTRATOR_NAME}  
**Date**: {COMPLETION_DATE}  
**Time Spent**: {TOTAL_HOURS} hours

### Dev-Lead Review  
- **Implementation Plan Alignment**: Code matches planned approach ✅
- **Architecture Compliance**: No violations of architecture-design.md ✅  
- **Code Review**: 13-point checklist passed ✅
- **Layer Boundaries**: No leakage to future layers ✅
- **Ready for Next Layer**: All prerequisites met ✅

**Dev-Lead**: {DEV_LEAD_NAME}  
**Review Date**: {REVIEW_DATE}  
**Approval**: ✅ **APPROVED FOR NEXT LAYER** / ❌ **REWORK REQUIRED**

{IF_REWORK_REQUIRED}
### Rework Required - Action Items
- [ ] {REWORK_ITEM_1}
- [ ] {REWORK_ITEM_2}  
- [ ] {REWORK_ITEM_N}

**Rework Estimate**: {REWORK_HOURS} hours  
**Target Completion**: {REWORK_TARGET_DATE}

---

## 📊 Layer Metrics (For Continuous Improvement)

- **TDD Cycle Efficiency**: {CYCLE_COUNT} cycles, {AVG_DURATION} min average
- **First-Time Quality**: {FIRST_TIME_PASS_RATE}% of tests passed first implementation  
- **Refactor Impact**: {REFACTOR_IMPROVEMENTS_COUNT} improvements applied
- **BDD Alignment**: {BDD_ALIGNMENT_PERCENTAGE}% of TDD tests directly supported BDD assertions
- **Blocker Rate**: {BLOCKER_COUNT} blockers per {CYCLE_COUNT} cycles ({BLOCKER_RATE}%)

**Lessons Learned**:
- {LESSON_1}
- {LESSON_2}
- {LESSON_N}

**Process Improvements for Next Layer**:  
- {IMPROVEMENT_1}
- {IMPROVEMENT_2}
- {IMPROVEMENT_N}

---

**Layer {LAYER_NUMBER} Status**: {✅ COMPLETE / ❌ INCOMPLETE / ⚠️ REWORK_NEEDED}  
**Next Action**: {NEXT_LAYER_ASSIGNMENT / REWORK_ITEMS / STORY_COMPLETE}