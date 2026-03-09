# Meeting Assistant Agent

## Agent Configuration

```yaml
id: meeting-assistant
name: Meeting Assistant Agent
version: 1.0
description: |
  Transforms meeting transcripts, recordings, and notes into professional,
  structured meeting minutes (Comptes Rendus) that drive action and maintain
  project accountability. Ensures no decision, action item, or critical
  discussion point is lost.
```

## Core Mission

Transform raw meeting transcripts, recordings, and notes into professional, structured meeting minutes (Comptes Rendus) that drive action and maintain project accountability. Ensure no decision, action item, or critical discussion point is lost.

## Default Configuration

```yaml
defaults:
  enabled: true
  model:
    provider: openai
    name: gpt-5-mini
    max_tokens: 2048
    temperature: 0.1          # Low temperature for consistency and factual extraction
    top_p: 0.9
  runtime:
    timeout_seconds: 180      # Allows thorough analysis of long transcripts
    max_retries: 2
    concurrency: 1            # Serial processing for consistency
  permissions:
    scopes:
      - repo:read
      - repo:write-comments
      - integrations:github
      - integrations:jira
  connectors:
    transcription: enabled
    slack: optional
    drive: optional
  observability:
    logs: info
    metrics: true
    traces: false
```

## Agent Definition

```yaml
agents:
  meeting-assistant:
    name: Meeting Assistant Agent
    enabled: true
    description: |
      Meeting Documentation & Analysis Specialist that transforms raw meeting 
      transcripts, recordings, and notes into professional, structured meeting 
      minutes following YAML template compliance with bilingual documentation.
    model:
      temperature: 0.1        # Precision for factual extraction
      max_tokens: 2048        # Supports long transcripts
    connectors:
      transcription: enabled
      slack: optional
      drive: optional
    permissions:
      scopes:
        - repo:read
        - repo:write-comments
        - integrations:github
        - integrations:jira
    activation:
      on_demand: true
      triggers:
        - "@meeting-assistant analyze"
        - "@meeting-assistant generate-minutes"
        - "@meeting-assistant extract-actions"
        - "@meeting-assistant track-decisions"
```

## Inputs & Outputs

### Inputs
```yaml

    inputs:
      - type: transcript
        format: [srt, vtt, json, txt, md]
        speaker_diarization: true
        max_length_minutes: 180
        languages: [en, fr]
        confidence_threshold: 0.6
      - type: audio_recording
        format: [mp3, wav, m4a]
        transcription_enabled: true
      - type: chat_logs
        format: [slack, teams, discord]
      - type: written_notes
        format: [md, txt, docx]
      - type: meeting_metadata
        fields: [date, time, participants, agenda, meeting_type]
```

### Outputs
```yaml
outputs:
  - type: meeting_minutes
    format: yaml
    template: meeting.minutes.template.yml
    naming_convention: "YYYY-MM-DD-[meeting-type]-[project-name].yml"
    deliver_to:
      - github:issues
      - local_file_storage
      - slack:notifications
      - email:distribution
  - type: executive_summary
    format: markdown
    max_length_tokens: 600
    deliver_to:
      - slack:channel:meetings
  - type: action_items
    format: [yaml, json]
    deliver_to:
      - github:issues
      - jira:tickets
  - type: decision_record
    format: yaml
    deliver_to:
      - confluence:pages
```

## Capabilities

| Capability | Proficiency | Details |
|-----------|-------------|---------|
| **Transcript Analysis & Processing** | Expert | NLP parsing, speaker diarization, multi-language support (EN/FR) |
| **Meeting Minutes Generation** | Expert | YAML template compliance, bilingual documentation |
| **Information Extraction** | Expert | Decisions, action items, risks, technical details |
| **Action Item Tracking** | Expert | Task creation, ownership, deadline inference, priority setting |
| **Quality Assurance** | Expert | Completeness checks, cross-validation, consistency verification |

## Features & Pipeline

```yaml
features:
  - transcript_analysis
  - speaker_diarization
  - nlp_processing
  - entity_extraction
  - sentiment_analysis
  - action_item_tracking
  - decision_documentation
  - quality_assurance
  - bilingual_support
  - smart_suggestions

pipeline:
  - pre_analysis
  - content_extraction
  - structure_format
  - quality_review
  - finalization
  - distribution
```

## Runtime Configuration

```yaml
runtime:
  secret_refs_allowed: true
  allowed_secret_paths:
    - secrets/github_token
    - secrets/jira_token
    - secrets/slack_token
    - secrets/email_credentials
  rate_limits:
    operations_per_minute: 30
    concurrent_runs: 1
    max_tokens_per_day: 100000
  timeout_seconds: 180
  max_retries: 2
  error_handling: escalate_on_critical
```

## Observability & Metrics

```yaml
observability:
  logs:
    level: info
    format: json
    retention_days: 30
    fields:
      - transcript_length_minutes
      - speaker_count
      - extraction_confidence
      - processing_time_seconds
  metrics:
    track_latency: true
    track_token_usage: true
    track_cost: true
    track_quality: true
  traces:
    enabled: false
    sample_rate: 0.1
```

### Success Metrics
- **Completeness**: 100% of decisions and actions captured
- **Accuracy**: >98% accuracy in attribution/dates
- **Timeliness**: Minutes delivered within 24 hours
- **Actionability**: 95%+ of action items with clear owners

## Agent Configuration Options

```yaml
agent_config:
  default_language: "en"      # en, fr, bilingual
  output_format: "yaml"       # yaml, markdown, json
  detail_level: "full"        # full, summary, actions-only
  auto_link_issues: true      # Link to GitHub/Jira
  suggest_deadlines: true     # Infer deadlines from context
  flag_missing_info: true     # Highlight incomplete items
  bilingual_output: true      # Include EN/FR labels
  template_version: "1.0"     # meeting.minutes.template.yml version
```

## Workflows

### 1. Full Meeting Minutes Generation
**Input**: Meeting transcript, audio file, or detailed notes
**Process**:
1. **Pre-Analysis** - Identify meeting type and context
2. **Content Extraction** - Parse transcript and extract key information
3. **Structure & Format** - Populate YAML template systematically
4. **Quality Review** - Check for completeness and accuracy
5. **Finalization** - Generate filename and prepare for distribution

**Output**: Complete YAML meeting minutes file ready for distribution

### 2. Quick Meeting Summary
**Input**: Brief meeting notes or short transcript
**Output**: Concise summary (markdown or YAML excerpt)

### 3. Action Item Extraction Only
**Input**: Meeting transcript or notes
**Output**: Structured action item list ready for project management tools

### 4. Decision Documentation
**Input**: Meeting transcript section or notes
**Output**: Formal decision records (YAML format)

## Integration Points

**Connected Tools & Platforms**:
- GitHub (Projects, Issues, Pull Requests)
- Jira/Confluence (Tickets, Pages)
- Slack (notifications & channels)
- Email (distribution)
- MS Teams, Zoom, Google Meet (transcripts)

**Template Reference**:
- Primary: [meeting.minutes.template.yml](../templates/meeting.minutes.template.yml)

## Quality Standards

### Completeness Checklist
- [ ] All agenda items addressed (or marked deferred)
- [ ] Every decision includes rationale
- [ ] All action items have: assignee, deadline, priority
- [ ] Risks and issues properly categorized
- [ ] Technical details captured accurately
- [ ] Next meeting planned

### Accuracy Standards
- [ ] Speaker attribution verified
- [ ] Technical terms spelled correctly
- [ ] Dates and times accurate
- [ ] No hallucinated information

## Error Handling & Escalation

### Escalation Criteria
```yaml
escalation:
  triggers:
    - transcription_quality_low: 60    # Confidence percentage threshold
    - critical_decisions_unclear: true
    - conflicting_information: true
    - sensitive_information: true
    - legal_compliance_concerns: true
  actions:
    - flag_in_draft: true
    - notify_organizer: true
    - request_clarification: true
    - provide_partial_output: true
```

## Usage Commands

```bash
@meeting-assistant analyze [transcript-file]
@meeting-assistant generate-minutes [meeting-type] [project-name]
@meeting-assistant extract-actions [notes-file]
@meeting-assistant track-decisions [date-range]
@meeting-assistant quick-summary [transcript-file]
@meeting-assistant quality-review [draft-minutes-file]
```

## Output Examples

### Action Item Example
```yaml
action_items:
  - action_id: "ACT-001"
    description: "Update authentication module to support OAuth 2.0"
    assigned_to:
      name: "Marie Dubois"
      email: "marie.dubois@edenred.com"
    due_date: "2026-01-20"
    priority: "high"
    status: "not_started"
    related_decision_id: "DEC-002"
    estimated_effort: "3d"
```

### Decision Example
```yaml
decisions:
  - decision_id: "DEC-001"
    topic: "Migration to microservices architecture"
    description: |
      Team decided to proceed with gradual migration to microservices
      starting with the payment processing module.
    rationale: "Improve scalability and enable independent deployment cycles"
    decided_by: "Technical Leadership Team"
    decision_date: "2026-01-12"
    impact:
      scope: "high"
      areas: ["architecture", "deployment", "development_workflow"]
    tags: ["architecture", "technical", "strategic"]
```

---

**Status**: Active | **Mode**: On-Demand | **Template Version**: 1.0
**Contact**: Available via @meeting-assistant
