# Naming Conventions Instructions

## Overview

This document provides systematic instructions for naming conventions and identifier standards using the AI-first delivery methodology. These instructions follow established naming best practices and transform code organization requirements into consistent naming standards that enhance readability, maintain consistency, and facilitate team collaboration through clear, predictable naming patterns across all code elements.

## Process Overview

**Naming Conventions Implementation** transforms code organization requirements into systematic naming standards that deliver consistent identifier patterns, enhanced code readability, improved team collaboration, and maintainable codebase structure through established naming rules for variables, functions, classes, files, and directories across all programming languages and frameworks.

## Implementation Process - Edenred Assessment Repository

**Document Type**: Repository Standards  
**Status**: Active  
**Last Updated**: January 16, 2026  
**Scope**: All files and directories in the Edenred Assessment repository

---

## Core Principle

All filenames and directory names must use:
- ✅ **Lowercase letters only**
- ✅ **Hyphens** for word separation (kebab-case)
- ❌ **No spaces**
- ❌ **No underscores** (use hyphens instead)
- ❌ **No capital letters**

---

## File Naming Conventions

### Meeting Minutes (Compte-Rendus)

**Format**: `YYYYMMDD_topic-in-kebab-case_participant-names-in-kebab-case_CR.md`

**Structure**:
- `YYYYMMDD`: Date in ISO format (2025-12-17)
- `_`: Separator
- `topic-in-kebab-case`: Meeting topic using hyphens
- `_`: Separator
- `participant-names-in-kebab-case`: All participant names in kebab-case, hyphen-separated
- `_CR`: Suffix indicating "Compte-Rendu" (meeting notes)
- `.md`: Markdown extension

**Examples**:
- `20251217_pi-planning-smarter_sami-henchiri_CR.md`
- `20260114_alignment-point_gil-cruveiller-sami-henchiri-julien-rousselet_CR.md`
- `20251022_assessment-feedback_elvis-presley_CR.md`
- `20251001_devops-coe_tina-turner_CR.md`

---

### Assessment Reports

**Format**: `project-name-assessment-report.md`

**Structure**:
- Project name in kebab-case
- `-assessment-report` suffix
- `.md` extension

**Examples**:
- `explorer-assessment-report.md`
- `reward-gateway-assessment-report.md`
- `smarter-stream-assessment-report.md`

---

### Templates

**Format**: `type-specific-purpose-tmpl.md`

**Structure**:
- Document type in kebab-case
- Specific purpose in kebab-case
- `-tmpl` suffix indicating template
- `.md` extension

**Examples**:
- `instruction-tmpl.md`
- `assessment-interview-guide-tmpl.md`
- `assessment-project-report-tmpl.md`
- `deliverable-transformation-roadmap-tmpl.md`
- `assessment-maturity-levels-teams-tmpl.md`

---

### Instruction Documents

**Format**: `instruction-name-instructions.md`

**Structure**:
- Instruction name in kebab-case
- `-instructions` suffix
- `.md` extension

**Examples**:
- `assessment-scope-instructions.md`
- `project-assessment-report-instructions.md`
- `capability-gap-matrix-instructions.md`
- `transformation-roadmap-instructions.md`
- `making-your-life-easier-instructions.md`

---

### Prompt Files

**Format**: `purpose-in-kebab-case.prompt.md`

**Structure**:
- Purpose in kebab-case
- `.prompt` infix
- `.md` extension

**Examples**:
- `generate-meeting-minutes.prompt.md`
- `create-assessment-report.prompt.md`
- `analyze-capability-gaps.prompt.md`
- `develop-transformation-roadmap.prompt.md`

---

### Documentation & Analysis Files

**Format**: `description-in-kebab-case.md`

**Structure**:
- Descriptive name in kebab-case
- `.md` extension

**Examples**:
- `gen-e2-for-leaders-palo-it.md`
- `gen-e2-transformation-approach.md`
- `repository-conventions.md`
- `engagement-analysis-edenred.md`
- `gen-e2-powered-delivery-team-handbook.md`

---

## Directory Naming Conventions

### Project Directories

**Format**: `project-name` (lowercase, hyphen-separated)

**Structure**:
- Project name in kebab-case
- No numbers or version suffixes at directory level
- Lowercase throughout

**Examples**:
- `explorer/`
- `reward-gateway/`
- `smarter-stream/`

---

### Meeting Directories

**Format**: `YYYYMMDD_topic-in-kebab-case_participant-names`

**Structure**:
- Date in ISO format
- `_` separator
- Topic in kebab-case
- `_` separator
- Participant names in kebab-case, hyphen-separated
- **Note**: No `_CR` suffix for directories (only files)

**Examples**:
- `20251217_pi-planning-smarter_sami-henchiri/`
- `20260114_alignment-point_gil-cruveiller-sami-henchiri-julien-rousselet/`
- `20251022_project-alpha_jimi-hendrix/`

---

### Functional Directories

**Format**: `description-in-kebab-case/`

**Structure**:
- Descriptive name in kebab-case
- Lowercase throughout

**Examples**:
- `00-context/`
- `01-assess/`
- `.gene2-core/`
- `01-initial-scope/`
- `assessment/`
- `deliverables/`
- `templates/`
- `agents/`

---

## Quick Reference

| Content Type | Format | Example |
|---|---|---|
| **Meeting Minutes** | `YYYYMMDD_topic_participants_CR.md` | `20251217_pi-planning-smarter_sami-henchiri_CR.md` |
| **Assessment Report** | `project-assessment-report.md` | `explorer-assessment-report.md` |
| **Template** | `type-purpose-tmpl.md` | `assessment-project-report-tmpl.md` |
| **Instructions** | `name-instructions.md` | `assessment-scope-instructions.md` |
| **Prompt** | `purpose.prompt.md` | `create-assessment-report.prompt.md` |
| **Documentation** | `description.md` | `repository-conventions.md` |
| **Project Dir** | `project-name/` | `explorer/` |
| **Meeting Dir** | `YYYYMMDD_topic_participants/` | `20251217_pi-planning-smarter_sami-henchiri/` |

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---|---|
| `Meeting_Notes_20251217.md` | `20251217_meeting-notes_user_CR.md` |
| `Assessment_Report.md` | `project-assessment-report.md` |
| `Template_v1.md` | `assessment-template-tmpl.md` |
| `AI_Transformation_Coach.md` | `ai-transformation-coach.md` |
| `Gen-e2_Modernisation.md` | `gen-e2-modernisation-palo-it.md` |
| `Project/Assessment/` | `project/assessment/` |
| `Project_Alpha/` | `project-alpha/` |
| `my_instructions_file.md` | `my-instructions-file.md` |

---

## Implementation Guidelines

### When Creating New Files

1. **Identify the file type** (meeting, assessment, template, instruction, prompt, documentation)
2. **Check the appropriate format** in this document
3. **Use kebab-case** for all words except dates
4. **Apply consistent suffixes** (`_CR` for meetings, `-tmpl` for templates, `-instructions` for instructions, `.prompt` for prompts)
5. **Verify lowercase** - scan the filename for any capital letters

### When Creating New Directories

1. **Use kebab-case** for all directory names
2. **Keep names descriptive** but concise
3. **Maintain hierarchy consistency** - subdirectories follow the same convention
4. **Avoid version numbers** in directory names - use document versioning instead

### Validating Your Filenames

Ask yourself:
- ❓ Are all letters lowercase?
- ❓ Are word separators hyphens (not underscores or spaces)?
- ❓ Does it match the appropriate format pattern?
- ❓ Is it descriptive enough for future discovery?

---

## Related Documents

- [Repository Conventions](../../.gene2-core/repository-conventions.md) - Complete repository structure and organization standards
- [Copilot Instructions](../copilot-instructions.md) - AI agent guidance and workflows

---

**Note**: These conventions ensure consistency, improve discoverability, and optimize AI context management in the repository. All team members should follow these standards when creating new files and directories.
