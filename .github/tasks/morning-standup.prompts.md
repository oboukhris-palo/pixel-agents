# Morning Standup - Daily Status Check

## Command

```bash
@orchestrator Daily standup for [PROJECT_NAME]

Show me today's focus in this order:
1. Current user story (US-XXX) and epic
2. Current layer (1-4) and BDD progress (X/Y assertions passing)  
3. Latest blocker (if any)
4. What should I code today (from implementation-plan.md "Today's Checklist")
5. One-line next action

Format as compact bullet list, not prose.
```

## Example Usage

```bash
@orchestrator Daily standup for EcommerceApp

Project: EcommerceApp  
Current Story: US-003 (User Registration)
Layer: 2/4 (Backend API)  
BDD Status: 5/12 assertions passing
Blockers: None
Today: Complete password validation API, add email uniqueness check
Next: Hand off to TDD-GREEN for validation implementation
```

## Expected Output Format

```
# 📊 Daily Standup - [PROJECT_NAME]

## ✅ Current Focus
- **Story**: US-XXX ([STORY_TITLE])
- **Epic**: [EPIC_NAME] ([X/Y stories complete])  
- **Layer**: [1-4]/4 ([LAYER_NAME])
- **BDD Progress**: [X/Y] assertions passing ([PERCENTAGE]%)

## 🎯 Today's Work
- [ ] [TODAY_TASK_1]  
- [ ] [TODAY_TASK_2]
- [ ] [TODAY_TASK_3]

## 🚨 Blockers  
{IF_NO_BLOCKERS: None}
{IF_BLOCKERS: - [BLOCKER_DESCRIPTION] (escalated to [AGENT])}

## ⏭️ Next Action
[ONE_LINE_NEXT_ACTION_COMMAND]
```

## Context Sources
- `/docs/user-stories/user-stories.md` (implementation status)
- `/docs/user-stories/current-sprint.md` (active sprint)
- `/docs/user-stories/<US-REF>/implementation-plan.md` (today's tasks)
- `/docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md` (current context)

## Orchestrator Instructions

1. **Read current sprint**: Check `/docs/user-stories/current-sprint.md` for active stories
2. **Find in-progress story**: Look for status "In Progress" in user-stories.md
3. **Get layer context**: Read implementation-plan.md for current layer assignment  
4. **Check BDD status**: Count passing vs total BDD assertions for current layer
5. **Scan for blockers**: Check handoff files for any escalated issues
6. **Extract today's tasks**: Get "Today's TDD Checklist" from current layer section
7. **Format output**: Use compact bullet format, not paragraphs

## Quality Gates
- Response time: <30 seconds
- Context size: <500 tokens  
- Always include next action command
- No placeholder text (TBD, TODO, etc.)
- If no active story, recommend starting one

## Integration Points
- Uses existing `/docs/` structure
- Compatible with handoff.schema.json
- References validation-rules.yml for quality checks
- Works with existing agent prompts