---
metadata:
  # Template identification
  templateId: "agent-log"
  templateVersion: "2.0"
  documentType: "agent-activity-log"
  title: "Agent Log: {AGENT_NAME}"

  # AI generation tracking (minimal)
  template_source: ".github/templates/agent-log-tmpl.md"
  ai_model: "{MODEL_NAME}"              # e.g., "claude-3.5-sonnet"
  agent_name: "{AGENT_NAME}"            # e.g., "dev-tdd-red"

  # Timeline & version
  date: "{YYYY-MM-DD}"
  version: "1.0"
  status: "active"

  # Lifecycle context (if applicable)
  lifecycle:
    phase: "{PHASE_NAME}"               # e.g., "implementation"
    epic_ref: "{EPIC_REF}"              # e.g., "AUTH-001" (if applicable)
    user_story_ref: "{US_REF}"          # e.g., "US-001" (if applicable)
    tdd_cycle: "{TDD_CYCLE}"            # e.g., "RED-001" (if applicable)

  # Classification
  classification: "internal"
  tags: ["agent-log", "{AGENT_NAME}", "{PHASE_NAME}"]
---

# Agent Log: {AGENT_NAME}

## {ISO8601_TIMESTAMP} | {ACTION_SUMMARY}

**Status**: {success|failure|blocked|partial}

| Field | Value |
|-------|-------|
| **Phase** | {PDLC_PHASE} |
| **Layer/Cycle** | {LAYER}/{CYCLE} (if applicable) |
| **Files Changed** | {file1.ext, file2.ext, ...} |
| **Summary** | {One-line action summary} |

---

<!-- ============================================================
AGENT LOGGING RULES (v2.0)

1. One log file per agent per day at: /logs/{PHASE}/agent-{name}-YYYYMMDD.md
2. Append-only format - never edit existing entries
3. Max 200 lines per day - keep minimal
4. Required info only:
   - ISO8601 timestamp
   - Action summary (1 line)
   - Status (success/failure/blocked/partial)
   - Phase & layer/cycle
   - Files changed (comma-separated)
5. No verbose descriptions - use commit messages for details
6. Frontmatter mandatory - validated via pre-commit hook
7. No handoff file references - handoff is chat-based
   (Next agent reads chat history + .github/checkpoint.yaml)

HANDOFF PROTOCOL (Chat-Based, No File Artifacts):
- Post completion summary in chat
- Next agent reads: chat history + checkpoint.yaml + .agent.md
- FORBIDDEN: handoff.json, tdd-execution.md file creation
============================================================ -->
