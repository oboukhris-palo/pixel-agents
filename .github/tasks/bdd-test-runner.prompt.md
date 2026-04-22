# BDD Test Runner - Execute and Report BDD Status

## Command

```bash
@orchestrator Run BDD tests for US-XXX show passing/failing

Execute BDD test suite for story:
1. Run all feature files for this story
2. Map results to layer assignments from implementation-plan.md
3. Show which assertions should be passing vs failing  
4. Identify any cross-layer boundary violations
5. Report overall story completion percentage
```

## Example Usage

```bash
@orchestrator Run BDD tests for US-003 show passing/failing

Feature: User Registration (US-003)
Results: 8/12 scenarios passing (67%)
Layer Progress: Layer 1✅, Layer 2✅, Layer 3❌, Layer 4❌  
Cross-layer Issues: None detected
Story Status: 67% complete (Layers 1-2 done, 3-4 remaining)
```

## Expected Output Format

```
# 🧪 BDD Test Results - US-XXX ([STORY_TITLE])

## 📊 Test Execution Summary
- **Feature Files**: [FILE_COUNT] executed
- **Total Scenarios**: [TOTAL_COUNT]  
- **Passing**: [PASS_COUNT] ✅ ([PASS_PERCENTAGE]%)
- **Failing**: [FAIL_COUNT] ❌ ([FAIL_PERCENTAGE]%)
- **Not Executed**: [SKIP_COUNT] ⏸️ ([SKIP_PERCENTAGE]%)

## 🎯 Layer-by-Layer Analysis

### Layer 1: Database ✅ COMPLETE  
- **Target Assertions**: [A1, A2, A3]
- **Status**: [3/3] passing (100%) ✅
- **Completion Date**: [DATE]

### Layer 2: Backend API ✅ COMPLETE
- **Target Assertions**: [A4, A5, A6, A7]  
- **Status**: [4/4] passing (100%) ✅
- **Completion Date**: [DATE]

### Layer 3: Configuration ❌ IN PROGRESS
- **Target Assertions**: [A8, A9]
- **Status**: [1/2] passing (50%) ⚠️
- **Failing**: A9 (Route registration not complete)
- **Expected**: A8 ✅, A9 ❌ (Layer 3 incomplete)

### Layer 4: Frontend ❌ NOT STARTED  
- **Target Assertions**: [A10, A11, A12]
- **Status**: [0/3] passing (0%) ❌
- **Expected**: All failing until Layer 4 starts

## 🚨 Anomaly Detection

{IF_NO_ANOMALIES}
**✅ No boundary violations detected** - All assertions failing/passing as expected per layer assignments

{IF_ANOMALIES_FOUND}
**🚨 Cross-Layer Boundary Violations**:
- **A10** (Frontend assertion) is PASSING but Layer 4 not started
  - 🚨 **Impact**: Layer boundaries violated  
  - 🚨 **Action**: Escalate to Dev-Lead immediately
  - 🚨 **Root Cause**: Layer 3 implementation doing too much

**🚨 Regression Detected**:  
- **A2** (Database assertion) is FAILING but Layer 1 was complete
  - 🚨 **Impact**: Previous layer broken by current work
  - 🚨 **Action**: Stop Layer 3 work, fix regression  
  - 🚨 **Root Cause**: Database schema change in Layer 3

## 📋 Detailed Test Results

| ID | Assertion | Layer | Expected | Actual | Status | Notes |
|----|-----------|-------|----------|--------|--------|-------|
| A1 | User.create() works | 1 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 1 complete |
| A2 | User.tier field exists | 1 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 1 complete |
| A3 | Email uniqueness enforced | 1 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 1 complete |
| A4 | POST /api/register works | 2 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 2 complete |
| A5 | Password hashing works | 2 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 2 complete |
| A6 | Validation errors returned | 2 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 2 complete |
| A7 | JWT token generated | 2 | ✅ PASS | ✅ PASS | ✅ CORRECT | Layer 2 complete |
| A8 | Route /register available | 3 | ❌ FAIL | ✅ PASS | ✅ CORRECT | Layer 3 in progress |
| A9 | Feature flag enabled | 3 | ❌ FAIL | ❌ FAIL | ✅ CORRECT | Layer 3 incomplete |
| A10 | Register form renders | 4 | ❌ FAIL | ❌ FAIL | ✅ CORRECT | Layer 4 not started |
| A11 | Form validation works | 4 | ❌ FAIL | ❌ FAIL | ✅ CORRECT | Layer 4 not started |
| A12 | Success page redirects | 4 | ❌ FAIL | ❌ FAIL | ✅ CORRECT | Layer 4 not started |

## 📈 Story Progress Tracking

**Overall Completion**: [8/12] assertions passing (67%)

**Progress by Epic**: [EPIC_NAME]  
- [X/Y] stories complete in this epic
- This story: 67% complete (Layer 3 in progress)

**Sprint Progress**:
- [X/Y] stories complete in current sprint  
- [X/Y] story points delivered
- Velocity: [POINTS/WEEK] (trending [UP/DOWN/STABLE])

## ⏭️ Next Actions

{IF_ALL_LAYERS_COMPLETE}
**🎉 Story Complete**: All BDD assertions passing
- **Next**: `@ba Validate US-XXX for acceptance testing`
- **Then**: `@orchestrator Start next story in sprint`

{IF_CURRENT_LAYER_COMPLETE}
**✅ Layer [X] Complete**: Ready for next layer  
- **Next**: `@dev-lead Layer [X] complete, hand off to Layer [X+1] for US-XXX`

{IF_CURRENT_LAYER_IN_PROGRESS}
**⚠️ Layer [X] Incomplete**: Continue TDD cycles
- **Failing**: [ASSERTION_LIST] 
- **Next**: `@dev-tdd Continue TDD cycle for US-XXX Layer [X]`

{IF_ANOMALIES_DETECTED}
**🚨 Anomalies Detected**: Stop and escalate  
- **Violation**: [VIOLATION_DESCRIPTION]
- **Next**: `@orchestrator Escalate boundary violation US-XXX to dev-lead`
```

## Technical Implementation

### BDD Test Execution
```bash
# Run feature files for specific story
npm run test:bdd -- --grep "US-003"

# Or with Cucumber/Jest
npx cucumber-js features/ --tags "@US-003"  

# Parse results and map to layer assignments
node .github/scripts/parse-bdd-results.js US-003
```

### Integration Points
- **Feature Files**: `features/**/*.feature` (Gherkin scenarios)
- **Implementation Plan**: `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md` (layer mapping)
- **Test Results**: Parse JSON output from test runner
- **Quality Metrics**: Integration with validation-rules.yml thresholds

### Automation Opportunity
Create `.github/scripts/run-bdd-tests.js`:
```javascript
// Auto-execute BDD tests for story
// Parse results against layer assignments  
// Detect boundary violations automatically
// Generate formatted report
// Update story progress metrics
```

## Context Sources
- `features/` directory (BDD feature files)
- `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md` (layer assertion mapping)
- `/docs/05-implementation/current-sprint.md` (sprint context)
- BDD test runner output (JSON results)
- `/docs/05-implementation/user-stories.md` (story status tracking)

## Quality Gates
- **No false positives**: All passing assertions should be expected to pass
- **No false negatives**: All failing assertions should be expected to fail  
- **Boundary compliance**: No cross-layer assertion violations
- **Regression detection**: Previously passing assertions still pass
- **Progress accuracy**: Completion percentage reflects actual implementation

## Orchestrator Instructions  

1. **Identify story features**: Find feature files tagged with US-XXX
2. **Execute test suite**: Run BDD tests and capture results
3. **Load layer mapping**: Read implementation-plan.md for assertion assignments  
4. **Validate expectations**: Compare actual vs expected results per layer
5. **Detect anomalies**: Flag boundary violations or regressions
6. **Calculate progress**: Determine story completion percentage
7. **Recommend actions**: Next layer, continue TDD, or escalate issues

## Error Handling
- **Feature files not found**: Check if story has BDD scenarios defined  
- **Test runner fails**: Report infrastructure issue and escalate
- **Mapping not found**: Implementation plan missing layer assignments
- **Results parsing error**: Handle malformed test output gracefully