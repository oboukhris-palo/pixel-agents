---
description: "Standardized metadata frontmatter format for all templates"
version: "2.0"
last_updated: "2026-04-07"
applies_to: ["all-yaml-templates", "all-markdown-templates-with-frontmatter"]
---

# Metadata Frontmatter Standard

**Purpose**: Establish consistent, **minimal** metadata structure across all templates.

**Applies to**: All `.yml` templates (user-story, epic, func-doc, etc.) and Markdown templates with YAML frontmatter

**Key Principle (v2.0)**: Keep frontmatter **under 15 lines**. Omit fields that don't apply.

---

## ⚡ Minimal Frontmatter Format (v2.0 — Default)

Every generated document MUST use this minimal format:

```yaml
---
# Minimal metadata (10-15 lines max)
templateId: "{template_name}"           # e.g., "user-story", "epic", "implementation-plan"
templateVersion: "1.0"
documentType: "{type}"                  # e.g., "story", "specification", "implementation-guide"
title: "{title}"
author: "{AGENT_NAME}"                  # Agent that generated this
date_created: "{YYYY-MM-DD}"
version: "1.0"
status: "draft|review|approved"

# AI generation tracking (essential only)
ai_model: "{MODEL_NAME}"                # e.g., "claude-3.5-sonnet", "gpt-4"

# Lifecycle context (if applicable — omit if not relevant)
phase: "{PHASE_NAME}"                   # e.g., "requirements", "implementation"
epic_ref: "{EPIC_REF}"                  # e.g., "AUTH-001"
user_story_ref: "{US_REF}"              # e.g., "US-001"
---
```

### What Does NOT Need Metadata Frontmatter
- `description.md` (pure specification — no metadata, no log references)
- Configuration files (`*.yml`, `*.yaml` used for execution)
- BDD feature files (`features/*.feature`)
- Agent log files (use `agent-log-tmpl.md` instead)

---

## Universal Metadata Fields (Full Reference — Use Only What Applies)

```yaml
---
# Document Identification
templateId: "{template_identifier}"              # e.g., "user-story", "epic", "func-doc"
templateVersion: "1.0"                           # e.g., "1.0", "1.5", "2.0"
documentType: "{document_type}"                  # e.g., "story", "epic", "specification"

# Document Control
title: "{title_or_name}"                         # User-facing title/name
author: "{creator_name}"                         # Agent or person who created document
date_created: "{YYYY-MM-DD}"                     # ISO 8601 format
version: "1.0"                                   # Semantic versioning (major.minor)
status: "draft|review|approved|deprecated"       # Document lifecycle status

# AI generation tracking (if AI-generated)
ai_model: "{MODEL_NAME}"                         # LLM model used

# Lifecycle context (if applicable)
phase: "{PHASE_NAME}"                            # e.g., "requirements", "architecture"
epic_ref: ""                                     # Parent epic reference
user_story_ref: ""                               # Parent story reference

# Optional: Jira Integration (IF project uses Jira)
jira:
  project_key: ""
  issue_key: ""                                  # e.g., "PROJ-123"

# Optional: tags
tags: []                                         # e.g., ["frontend", "api"]
---
```

---

## Template-Specific Metadata

### Story Templates (user-story.template.yml)

```yaml
metadata:
  templateId: "user-story"
  templateVersion: "1.0"
  documentType: "story"
  title: "{US-XXX}: {Story Title}"
  description: "User story for {feature/capability}"
  author: "{Product Owner Name}"
  date_created: "{YYYY-MM-DD}"
  date_updated: "{YYYY-MM-DD}"
  version: "1.0"
  status: "draft"
  
  jira:
    project_key: ""
    issue_id: ""
    issue_key: ""
    issue_type: "Story"
  
  project_name: ""
  epic_ref: ""
  related_documents:
    - type: "parent_epic"
      reference: "{EPIC-ID}"
    - type: "blocking_story"
      reference: "{US-XXX}"
    - type: "blocked_by_story"
      reference: "{US-XXX}"
  
  compliance_frameworks: []
  security_level: "internal"
  tags: ["story", "implementation"]
```

### Epic Templates (epic.template.yml)

```yaml
metadata:
  templateId: "epic"
  templateVersion: "1.0"
  documentType: "epic"
  title: "{EPIC-XXX}: {Epic Name}"
  description: "Epic grouping {X} user stories for {capability}"
  author: "{Product Owner Name}"
  date_created: "{YYYY-MM-DD}"
  date_updated: "{YYYY-MM-DD}"
  version: "1.0"
  status: "draft"
  
  jira:
    project_key: ""
    issue_id: ""
    issue_key: ""
    issue_type: "Epic"
  
  project_name: ""
  epic_ref: null                          # Epics don't have parent epics
  related_documents:
    - type: "child_stories"
      reference: "docs/01-requirements/user-stories.md"
    - type: "architecture"
      reference: "docs/02-architecture/architecture-design.md"
  
  compliance_frameworks: []
  security_level: "internal"
  tags: ["epic", "planning"]
```

### Functional Spec Templates (func-doc.template.yml)

```yaml
metadata:
  templateId: "func-doc"
  templateVersion: "1.0"
  documentType: "specification"
  title: "{Feature Name}: Functional Specification"
  description: "Detailed functional specification for {feature}"
  author: "{BA/Spec Writer Name}"
  date_created: "{YYYY-MM-DD}"
  date_updated: "{YYYY-MM-DD}"
  version: "1.0"
  status: "draft"
  
  jira: null                              # Functional specs may not sync to Jira
  
  project_name: ""
  epic_ref: ""
  related_documents:
    - type: "implements_stories"
      reference: "docs/01-requirements/user-stories.md"
    - type: "tech_spec"
      reference: "docs/02-architecture/tech-spec.md"
  
  compliance_frameworks: []
  security_level: "internal"
  tags: ["spec", "functional"]
```

### Operational Templates (monitoring, incident, compliance)

```yaml
metadata:
  templateId: "{template-name}"                  # e.g., "monitoring-setup"
  templateVersion: "1.0"
  documentType: "operational"
  title: "{Deployment/Story}: {Template Name}"
  description: "{Purpose and scope of operational document}"
  author: "{DevOps/Operations Owner Name}"
  date_created: "{YYYY-MM-DD}"
  date_updated: "{YYYY-MM-DD}"
  version: "1.0"
  status: "draft"
  
  jira: null                              # Operational docs tie to story via user_story_ref
  
  project_name: ""
  user_story_ref: ""                      # e.g., "US-001" - links to implementation
  related_documents:
    - type: "implementation_plan"
      reference: "docs/05-implementation/epics/{EPIC-REF}/user-stories/{US-REF}/implementation-plan.md"
    - type: "approval_gate"
      reference: "docs/approvals/{GATE-ID}.md"
  
  compliance_frameworks: []
  security_level: "confidential"          # Operational docs may contain sensitive info
  tags: ["operational", "deployment"]
```

---

## Frontmatter in Markdown Templates

For Markdown files with YAML frontmatter (e.g., implementation-plan.md):

```markdown
---
templateId: "implementation-plan"
templateVersion: "1.0"
documentType: "implementation-guide"
title: "US-XXX: Implementation Plan"
description: "Layer-by-layer implementation guide for {feature}"
author: "{Dev Lead Name}"
date_created: "{YYYY-MM-DD}"
date_updated: "{YYYY-MM-DD}"
version: "1.0"
status: "frozen"                    # Implementation plans freeze after creation
user_story_ref: ""
tags: ["implementation", "tdd"]
---

# Implementation Plan: {USER-STORY-REF}

...content follows...
```

---

## Migration Path (For Existing Templates)

### Priority 1 (Update First)
- user-story.template.yml
- epic.template.yml
- func-doc.template.yml
- implementation-plan.template.md
- handoff.template.json

### Priority 2 (Next)
- tech-doc.template.yml
- design-spec.template.yml
- meeting.minutes.template.yml

### Priority 3 (Future)
- All other templates

---

## Validation Checklist

Before publishing a template with new metadata, verify:

- ✅ All universal fields present and in correct order
- ✅ Template-specific fields aligned with standards
- ✅ Jira section handled correctly (included, null, or populated as needed)
- ✅ Related documents section properly formatted
- ✅ Tags are lowercase and hyphenated (e.g., "user-story", not "UserStory")
- ✅ Status field uses valid values only
- ✅ Security level appropriate for document type
- ✅ No custom fields added (use tags instead)
- ✅ YAML syntax validated

---

## Benefits

| Benefit | Impact |
|---------|--------|
| **Consistency** | All templates follow same structure; easier for teams to navigate |
| **Automation** | Scripts can parse metadata reliably for Jira sync, archiving, etc. |
| **Searchability** | Standardized fields enable full-text search and filtering |
| **Jira Integration** | Clear jira section enables semi-automated sync with Jira |
| **Compliance** | Metadata tags enable compliance audits and regulatory reporting |
| **Versioning** | Version field enables impact analysis for template changes |

---

## Examples

### Example 1: User Story Frontmatter
```yaml
---
templateId: "user-story"
templateVersion: "1.0"
documentType: "story"
title: "US-001: User Subscription Tier Upgrade"
description: "User story for implementing subscription tier upgrade workflow"
author: "Alice Chen (Product Owner)"
date_created: "2026-03-16"
date_updated: "2026-03-16"
version: "1.0"
status: "draft"

jira:
  project_key: "AUTH"
  issue_key: "US-XXX"
  issue_type: "Story"

project_name: "Merchant Platform"
epic_ref: "AUTH-EPIC-001"
related_documents:
  - type: "parent_epic"
    reference: "AUTH-EPIC-001"
  - type: "implementation"
    reference: "docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md"

compliance_frameworks: ["PCI-DSS", "GDPR"]
security_level: "internal"
tags: ["payment", "upgrade", "subscription"]
---
```

### Example 2: Operational Document Frontmatter
```yaml
---
templateId: "monitoring-setup"
templateVersion: "1.0"
documentType: "operational"
title: "US-001: Monitoring Setup"
description: "Post-deployment monitoring configuration for subscription tier upgrade"
author: "DevOps Team"
date_created: "2026-03-16"
date_updated: "2026-03-16"
version: "1.0"
status: "draft"

user_story_ref: "US-001"
related_documents:
  - type: "implementation_plan"
    reference: "docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md"
  - type: "incident_response"
    reference: "docs/05-implementation/epics/EPIC-001/user-stories/US-001/incident-response.md"

compliance_frameworks: ["SOC2"]
security_level: "confidential"
tags: ["monitoring", "production", "deployment"]
---
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-16 | Initial metadata frontmatter standard with universal fields, template-specific guidance, and migration path |

**Next Review**: 2026-06-16 (quarterly)
