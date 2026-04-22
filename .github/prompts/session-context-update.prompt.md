## Objective
Maintain comprehensive session tracking by updating the session context log with timestamped activity records for AI context preservation across multiple assessment sessions.

## Context
You are maintaining AI-first delivery assessment repository documentation. The session-context.md tracks detailed chronological changes to ensure continuity and context preservation for AI agents working across multiple sessions and phases.

## Requirements

### Session Tracking Standards
1. **Timestamp Documentation**: Record precise date and time for all activities (YYYY-MM-DD HH:MM format)
2. **Activity Logging**: Document all significant repository changes and interactions
3. **Context Preservation**: Maintain chronological history for multi-session continuity
4. **User Interaction Recording**: Capture user prompts and AI responses verbatim
5. **Change Documentation**: List all files created, modified, or updated with rationale

### Session Context Requirements
- **Chronological Order**: Maintain strict time-based sequence of all activities
- **Complete Attribution**: Document who (user/AI) performed each action
- **Change Rationale**: Explain why changes were made and their impact
- **File Tracking**: Comprehensive list of all file modifications
- **Context Continuity**: Preserve information needed for future session resumption

## Deliverables

### 1. Updated Session-Context.md
Chronological activity log containing:
- **Timestamp Entries**: All activities with precise YYYY-MM-DD HH:MM timestamps
- **User Prompt Records**: Exact user requests and queries verbatim
- **AI Response Documentation**: Complete record of AI responses and actions taken
- **File Modification Log**: Comprehensive list of all files created/modified/updated
- **Action Rationale**: Clear explanations for why each change was made
- **Session Boundaries**: Clear markers for session start/end and agent transitions

### 2. Continuity Summary
Brief session overview including:
- Total activities logged in current session
- Major milestones or phase completions
- Outstanding tasks or follow-up requirements
- Context required for next session continuation

## Quality Standards

- ✅ All timestamps follow consistent YYYY-MM-DD HH:MM format
- ✅ Complete chronological change history preserved
- ✅ User interactions captured verbatim without interpretation
- ✅ AI responses documented with sufficient detail
- ✅ All file modifications tracked with rationale
- ✅ Professional formatting follows AI-first delivery documentation standards
- ✅ Session continuity information clearly documented

## File Management

### Primary Target
- **Main File**: `/00-context/session-context.md` (or equivalent session tracking file)
- **Append-Only**: Add new entries without modifying existing historical records
- **Backup**: Preserve complete chronological history for audit and reference

### Entry Format
```markdown
## Session Entry - YYYY-MM-DD HH:MM

### User Request
[Exact user prompt or query]

### AI Response Summary
[Summary of actions taken and responses provided]

### Files Modified
- [file1.md] - [reason for modification]
- [file2.yaml] - [reason for modification]

### Context Notes
[Any important context for future reference]
```
