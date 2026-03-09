# TDD Session Start - Begin Development Session

## Command

```bash
@dev-tdd Start TDD session for US-XXX Layer Y

I'm starting a TDD development session.

Show me:
1. Layer Y section from implementation-plan.md (files, BDD coverage, approach)
2. Which BDD assertions should pass after this layer (from plan)
3. Today's TDD checklist (what tests to write)
4. Any blockers or red flags
5. Command to hand off to RED phase when ready
```

## Example Usage

```bash
@dev-tdd Start TDD session for US-003 Layer 2

Layer: 2 (Backend API)
Target: Registration endpoint with validation
BDD Assertions: [A3, A4, A5] should pass after this layer
Today's Checklist: Write validation tests, implement POST /api/register
Blockers: None
Next: Hand off to dev-tdd-red for failing test creation
```

## Expected Output Format

```
# 🔴 TDD Session: US-XXX Layer Y

## 📋 Layer Overview  
- **Layer**: [Y] - [LAYER_NAME]
- **Purpose**: [LAYER_PURPOSE_FROM_PLAN]
- **Files to Create**: [FILE_LIST]
- **Estimated Cycles**: [CYCLE_ESTIMATE]

## 🎯 BDD Target Assertions
**MUST PASS after this layer:**
- [✅ A1] [BDD_ASSERTION_DESCRIPTION]
- [✅ A2] [BDD_ASSERTION_DESCRIPTION]

**MUST REMAIN FAILING (future layers):**  
- [❌ A3] [BDD_ASSERTION_DESCRIPTION] (Layer 3)
- [❌ A4] [BDD_ASSERTION_DESCRIPTION] (Layer 4)

## 📝 Today's TDD Checklist
- [ ] [TDD_TASK_1]
- [ ] [TDD_TASK_2]  
- [ ] [TDD_TASK_3]

## 🚨 Red Flags & Constraints
- ❌ [RED_FLAG_1_FROM_PLAN]
- ❌ [RED_FLAG_2_FROM_PLAN]
- 🏗️ Architecture: [CONSTRAINT_FROM_ARCHITECTURE_DESIGN]

## ⏭️ Ready to Start
**Next Command**: `@dev-tdd-red Write failing test for [FIRST_BDD_ASSERTION]`
```

## Context Sources
- `/docs/user-stories/<US-REF>/implementation-plan.md` (layer breakdown)
- `/docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md` (current context)
- `/docs/prd/architecture-design.md` (constraints)
- `features/` directory (existing BDD files)

## TDD Orchestrator Instructions

1. **Validate story exists**: Check that US-XXX folder and implementation-plan.md exist
2. **Extract layer section**: Read "Layer Y" section from implementation-plan.md
3. **Parse BDD mapping**: Get "BDD Assertions for This Layer" list
4. **Get today's checklist**: Extract "Today's TDD Checklist" 
5. **Check constraints**: Note architectural constraints and red flags
6. **Prepare handoff**: Initialize handoff context for RED phase
7. **Format session brief**: Present actionable summary for developer

## Quality Gates
- Implementation plan must exist
- Layer must have defined BDD assertion mapping
- Today's checklist must be non-empty
- No ambiguous next actions

## Integration Points  
- Creates/updates `<US-REF>-HANDOFF.md` with TDD session start
- References handoff-contracts.yaml validation rules
- Integrates with existing dev-tdd agent chain
- Uses layer-completion-checklist template for tracking

## Session Lifecycle
1. **Start**: This prompt initializes TDD session
2. **RED Phase**: Hand off to dev-tdd-red agent  
3. **GREEN Phase**: Automatic progression via TDD orchestrator
4. **REFACTOR Phase**: Quality improvement cycle
5. **Validation**: Layer completion checklist
6. **Next Layer**: Return to this prompt for Layer Y+1