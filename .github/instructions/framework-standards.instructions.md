---
description: Framework naming conventions and terminology standards for the gene2 orchestration framework
applyTo: "**"
priority: high
enforcement: strict
---

# Framework Standards: Naming Conventions & Terminology

## Overview

This document provides systematic instructions for implementing naming conventions and terminology standards using the **gene2 orchestration framework**. These standards ensure consistency in documentation, folder naming, terminology usage, and references throughout the codebase. The standards apply universally across all projects, clients, and deliverables to maintain professional IT terminology and clear communication.

**Key Principle**: The gene2 framework is a product development lifecycle orchestration tool that implements the AI-first delivery methodology. All documentation and references must reflect this clearly and consistently.

---

## Part 1: PDLC Phase Naming & Numbering Convention

### 📋 Standard Phase Organization

All phases use a consistent `NN-name` folder naming convention. For the canonical phase table (folder names, workflows, status), see:

> `#file:.github/reference/pdlc-phases.md` — source of truth for all phase descriptions, folder names, and status

**Key rule**: Always use the two-digit prefix format (`00-XX` through `05-XX`). Never use plain phase names without the numeric prefix.

### 🎯 Folder Structure References

When referencing folders in documentation, always use the **numbered prefix format**:

```bash
# ✅ CORRECT
/docs/00-assessment/
/docs/01-requirements/
/docs/02-architecture/
/docs/03-testing/
/docs/04-planning/
/docs/05-implementation/

# ❌ INCORRECT
/docs/assessment/          # Missing "00-" prefix
/docs/requirements/        # Missing "01-" prefix
/docs/architecture/        # Missing "02-" prefix
```

### 📝 Phase References in Text

When describing phases, use this format:

```markdown
# ✅ CORRECT
Phase 0: Assessment
Phases 1-2: Requirements
Phases 3-4: Architecture
Phase 5: Testing
Phases 6-7: Planning
Phase 8: Implementation

# ❌ INCORRECT
Phase 1: Requirements     # Omits the fact it covers both 1-2
Phase 3: Architecture     # Omits the fact it covers both 3-4
Phase 6: Planning         # Omits the fact it covers both 6-7
```

### 🔧 Workflow File References

When linking to workflow files, use the standard pattern:

```bash
# ✅ CORRECT
.github/workflows/00-assessment.workflows.yml      # Phase 0
.github/workflows/01-requirements.workflows.yml   # Phases 1-2
.github/workflows/02-architecture.workflows.yml    # Phases 3-4
.github/workflows/03-testing.workflows.yml         # Phase 5
.github/workflows/04-planning.workflows.yml        # Phases 6-7
.github/workflows/05-implementation.workflows.yml  # Phase 8
.github/workflows/cicd.workflows.yml            # CI/CD (cross-phase)

# ❌ INCORRECT
.github/workflows/assessment.yml               # Wrong extension
.github/workflows/ASSESSMENT.md                # Uppercase
```

### 📋 Agent Log Paths

All agent logs MUST use phase folder prefixes in their paths:

```bash
# ✅ CORRECT (Phase 0)
/logs/00-assessment/agent-orchestrator-20260410.md

# ✅ CORRECT (Phases 1-2)
/logs/01-requirements/agent-ba-20260410.md

# ✅ CORRECT (Phase 5)
/logs/03-testing/agent-qa-20260410.md

# ✅ CORRECT (Phase 8 - Story Specific)
/logs/05-implementation/epics/EPIC-001/user-stories/US-001/agent-dev-tdd-red-20260410.md

# ❌ INCORRECT
/logs/phase-0/...                    # Wrong prefix format
/logs/assessment/...                 # Missing numeric prefix
/logs/agent-orchestrator.md          # Missing phase path
```

---

## Part 2: Terminology & Naming Standards

### 📚 Official Framework Terminology

The following terminology standards MUST be applied consistently across all documentation and communications:

#### Framework & Methodology
- **✅ Approved Terms**:
  - "gene2 framework" — The orchestration tool/platform
  - "gene2 core" — The core implementation (`.gene2-core/` directory)
  - "AI-first delivery methodology" — The development approach implemented by the framework
  - "gene2-orchestrated workflow" — Processes managed by the framework

- **Context**: The gene2 framework implements the AI-first delivery methodology. Both terms are primary and should be used appropriately:
  - Use "gene2 framework" when discussing the orchestration tool
  - Use "AI-first delivery" when discussing the methodology or development approach
  - Use both together when describing the complete implementation

- **✅ Usage Examples**:
  - "The gene2 framework orchestrates AI-first delivery workflows..."
  - "Using the gene2-based AI-first delivery approach..."
  - "This project follows the gene2 framework with AI-first delivery principles..."

#### Repository Structure
- **Technical Directory**: `.gene2-core/` (preserved for technical/system reasons)
- **Documentation Reference**: "gene2 core" or "core framework"
- **Framework Integration**: "gene2 framework integration" or "framework implementation"

#### Terminology Application Scope

Apply terminology standards consistently across:
- **Documentation**: All markdown files, technical docs, README files
- **Code Comments**: Inline documentation, API descriptions
- **Meeting Records**: Discussion summaries, decision logs
- **Deliverables**: Reports, presentations, architectures, specifications
- **Communication**: Team discussions, client interactions, stakeholder updates
- **File Structure**: Folder names, file references, path descriptions

#### Professional IT Standards

All documentation MUST maintain professional information technology terminology:
- Use industry-standard terms (e.g., "orchestration", "pipeline", "deployment", "integration")
- Avoid colloquialism, slang, or informal language in formal documentation
- Use consistent terminology throughout all documents
- Apply proper technical grammar and formatting
- Maintain clear, unambiguous language for all technical concepts

---

## Part 3: Implementation Standards

### ✅ Implementation Checklist

Use this checklist when creating new files, directories, or documentation:

- [ ] **Folder creation**: Use `00-XX` to `05-XX` prefix (not `phase-0`, `p0`, etc.)
- [ ] **Markdown links**: Reference as `/docs/XX-name/` (always with 2-digit prefix)
- [ ] **Phase descriptions**: Use "Phase N" or "Phases N-M" format consistently
- [ ] **Workflow references**: Use `.github/workflows/[workflow].workflows.yml`
- [ ] **Log paths**: Include phase folder in log path: `/logs/XX-phase-name/agent-{name}-YYYYMMDD.md`
- [ ] **Documentation**: Link to other phases using standard folder format
- [ ] **Code comments**: Reference phases by number (Phase 0, Phases 1-2, etc.)
- [ ] **Framework references**: Use "gene2 framework" and "AI-first delivery" correctly
- [ ] **Client-agnostic language**: Remove project/client-specific references
- [ ] **Professional terminology**: Use industry-standard IT terminology

### 📍 Files Using This Convention

The following files MUST strictly adhere to these naming and terminology standards:

✅ **Always apply standards to:**
- `README.md` — Main operational guide
- `setup.md` — Setup instructions  
- `.github/copilot-instructions.md` — AI agent instructions
- `.github/instructions/*.md` — All instruction files
- `.github/workflows/*.md` — All workflow definitions
- `docs/` folder structure — All directory creation
- All documentation files and technical specifications

---

## Part 4: Quality Assurance

### Pre-Implementation Validation

Before creating new documentation or files:
- ✅ Framework and methodology naming understood correctly
- ✅ Phase numbering scheme and folder structure clear
- ✅ Appropriate terminology selected for context
- ✅ Client-agnostic language used throughout
- ✅ Professional IT terminology standards applied

### Post-Implementation Review

After creating documentation or files:
- ✅ All phase references use correct numbering format (00-XX)
- ✅ Framework references consistent (gene2 framework, AI-first delivery)
- ✅ Terminology applied consistently throughout
- ✅ No client-specific or project-specific naming in generic framework files
- ✅ Professional IT terminology maintained
- ✅ All links and references follow standard patterns
- ✅ Folder structure follows phase naming convention

### Confidence Validation Requirements

All implementations MUST meet these standards:
- **Naming Consistency**: Phase folders use correct XX-name format
- **Terminology Accuracy**: Framework and methodology terms used correctly
- **Professional Standards**: Technical documentation maintains industry-standard language
- **Client Agnosticism**: Generic framework files contain no client-specific content
- **Technical Compatibility**: System functionality preserved while maintaining clarity

---

## Part 5: Reference & Examples

### 🔄 Migration Pattern (Old → New)

If you encounter non-standard references, update them using this pattern:

| Old Style | New Style | Category |
|-----------|-----------|----------|
| `docs/assessment/` | `docs/00-assessment/` | Phase folder naming |
| `docs/requirements/` | `docs/01-requirements/` | Phase folder naming |
| `docs/architecture/` | `docs/02-architecture/` | Phase folder naming |
| `Phase 1 Requirements` | `Phases 1-2: Requirements` | Phase reference |
| `logs/agent-name.md` | `logs/XX-phase/agent-name-YYYYMMDD.md` | Log organization |
| "Gen-e2 assessment" | "Project assessment" | Terminology (remove specific references) |
| "Gene2 orchestration" | "gene2 framework orchestration" | Terminology consistency |
| Framework-specific language | Client-agnostic language | Content review |

### ✨ Examples in Context

#### Example 1: Correct Phase Reference in Documentation

```markdown
## Phases 1-2: Requirements Definition

When working on requirements (Phases 1-2), reference:
- Requirements PRD: `/docs/01-requirements/requirements.md`
- User stories: `/docs/01-requirements/user-stories.md`
- Personas: `/docs/01-requirements/personas.md`

Link to workflow: See phase-specific workflows (`.github/workflows/01-requirements.workflows.yml`, `.github/workflows/02-architecture.workflows.yml`, `.github/workflows/03-testing.workflows.yml`, `.github/workflows/04-planning.workflows.yml`)

The gene2 framework manages requirements through a structured process that implements AI-first delivery principles.
```

#### Example 2: Correct Framework Reference in Code

```javascript
// ✅ CORRECT
const phaseFolder = './docs/01-requirements/';  // Phases 1-2
const archFolder = './docs/02-architecture/';   // Phases 3-4
const testFolder = './docs/03-testing/';        // Phase 5

// Framework integration comment
// Orchestrated via gene2 framework implementing AI-first delivery
```

#### Example 3: Correct Log Path

```bash
# TDD agent working on story in Phase 8 via gene2 framework
/logs/05-implementation/epics/EPIC-001/user-stories/US-001/agent-dev-tdd-red-20260410.md
```

#### Example 4: Correct Framework Documentation

```markdown
# gene2 Framework Implementation

The gene2 framework orchestrates the AI-first delivery methodology across 8 product development lifecycle phases.

## Framework Structure

The framework uses the following phase organization:
- **Phase 0**: Assessment and requirements discovery
- **Phases 1-2**: Requirements definition (requirements, personas, stories)
- **Phases 3-4**: Architecture and technical design
- **Phase 5**: Testing strategy and validation
- **Phases 6-7**: Planning and deployment strategy
- **Phase 8**: Implementation using TDD practices

All documentation and artifacts follow the XX-phasename folder structure.
```

---

## Part 6: Training & Onboarding

When onboarding team members or new projects working with the gene2 framework, ensure understanding of:

1. **Phase Organization**: Know the 8 PDLC phases and their folder names
   - Memorize the phase numbers and descriptions
   - Understand phase status (frozen vs. active)
   - Apply folder naming consistently

2. **Framework Terminology**: Understand gene2 framework and AI-first delivery
   - gene2 is the orchestration framework (the tool/platform)
   - AI-first delivery is the methodology (the approach)
   - Use both terms appropriately in different contexts

3. **Naming Conventions**: Apply standards in all new work
   - Phase references use Phase N or Phases N-M format
   - Folders use 00-XX naming pattern
   - Workflow references follow `.github/workflows/[name].workflows.yml`
   - Log paths include phase folder structure

4. **Professional Standards**: Maintain industry-standard IT terminology
   - Use formal, professional language
   - Avoid project/client-specific references in generic framework files
   - Apply consistent terminology throughout

5. **Validation**: Verify your work matches standards
   - Self-check using the implementation checklist
   - Validate against example patterns
   - Ensure consistency with existing documentation

---

## Related Documentation

- **Agent Logging Standards**: `.github/instructions/agent-logging.instructions.md`
- **Documentation Standards**: `.github/instructions/documentation.instructions.md`
- **Project Structure**: `.github/instructions/project-structure.instructions.md`
- **Naming Conventions**: `.github/instructions/naming-conventions.instructions.md`
- **PDLC Workflows**: `.github/workflows/` (assessment, documents, implementation)

---

**Framework Status**: Active | **Version**: 2.0 | **Created**: April 10, 2026 | **Last Updated**: April 10, 2026  
**Scope**: gene2 Framework Standards & Terminology  
**Enforcement**: STRICT | **Priority**: HIGH | **Applicability**: All Projects & Clients
