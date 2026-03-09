# Assess Project Status

## Purpose

Determine project maturity level and recommend starting workflow based on existing documentation and implementation status.

## Command Template

```bash
@orchestrator Assess project status for [PROJECT_NAME]

**CRITICAL**: This command will:
1. **Check documentation status** - scan /docs/prd/ for PDLC documents
2. **Read /docs/user-stories/user-stories.md** - SINGLE SOURCE OF TRUTH for implementation status
3. **Analyze code completion** - estimate % implementation by layer
4. **Generate recommendations** - exact next workflow to execute
5. **Present 3 options** - conservative/balanced/stretch approach

**DO NOT** skip this assessment - it prevents wasted work and ensures correct workflow.
```

## Assessment Process

The orchestrator will:

1. **Check Documentation Status**
   - Look for `/docs/prd/` folder
   - Look for `/docs/design/` folder
   - Look for `/docs/user-stories/` folder
   - Check which PDLC stage documents exist:
     - Stage 1: requirements.md ✓/✗
     - Stage 2: personas.md ✓/✗, business-case.md ✓/✗
     - Stage 3: journey-maps.md ✓/✗, user-stories.md ✓/✗, architecture-design.md ✓/✗
     - Stage 4: tech-spec.md ✓/✗, design-systems.md ✓/✗
     - Stage 5: test-strategies.md ✓/✗, BDD scenarios ✓/✗
     - Stage 6: iteration-planning.md ✓/✗, deployment-plan.md ✓/✗

2. **Check Implementation Status**
   - Count implemented user stories
   - Count passing BDD tests
   - Review code structure against architecture
   - Check test coverage levels
   - Identify gaps between documentation and code

3. **Assess Project Maturity**
   - **NEW**: No docs, no code
   - **PDLC-IN-PROGRESS**: Some docs, no code (Stages 1-3 done)
   - **PLANNING-COMPLETE**: All docs complete (Stages 1-6 done)
   - **BROWNFIELD**: Partial docs, partial code
   - **NEAR-COMPLETE**: Most code done, needs validation
   - **MIGRATION**: New project taking existing code/patterns

4. **Recommend Next Steps**
   - If NEW: "Start PDLC workflow for new project"
   - If PDLC-IN-PROGRESS: "Continue PDLC at Stage X"
   - If PLANNING-COMPLETE: "Start implementation workflow"
   - If BROWNFIELD: "Create missing docs and plan remaining stories"
   - If NEAR-COMPLETE: "Validate implementation and plan final stories"
   - If MIGRATION: "Assess existing code and integrate with new workflow"

## Example Assessment Report

```
PROJECT STATUS ASSESSMENT REPORT
================================

Project: AuthenticationApp
Assessment Date: 2025-12-23
Requested By: @orchestrator

DOCUMENTATION STATUS
====================

PDLC Documents:
  Stage 1: Requirements
    ✓ requirements.md (complete, 15 requirements, approved 2025-12-20)
    
  Stage 2: Analysis
    ✓ personas.md (complete, 4 personas, approved 2025-12-21)
    ✓ business-case.md (complete, approved 2025-12-21)
    
  Stage 3: Design
    ✓ journey-maps.md (complete, 4 journeys)
    ✓ user-stories.md (complete, 3 epics, 12 stories)
    ✓ architecture-design.md (complete, microservices selected)
    ✓ blueprints.md (complete, 8 screens)
    
  Stage 4: Planning
    ✓ tech-spec.md (complete, Node.js + React stack)
    ✓ design-systems.md (complete, Tailwind CSS)
    ✗ code-generation.md (missing)
    
  Stage 5: Testing
    ✓ test-strategies.md (complete)
    ✓ BDD scenarios (complete, 25 Gherkin files)
    
  Stage 6: Deployment
    ✓ iteration-planning.md (complete, 3 phases)
    ✗ deployment-plan.md (missing)

Documentation Completeness: 11 of 13 documents (85%)
Missing: code-generation.md, deployment-plan.md

IMPLEMENTATION STATUS
====================

Codebase: Found at /src
Commits: 42 commits, last updated 2025-12-22

User Stories Implemented:
  Epic E001: Authentication (3/3 complete)
    ✓ US-001: User Registration (100%, 5 BDD tests passing)
    ✓ US-002: Email Verification (100%, 3 BDD tests passing)
    ✓ US-003: Password Reset (100%, 4 BDD tests passing)
    
  Epic E002: Profile Management (1/3 complete)
    ✓ US-004: User Profile View (100%, 3 BDD tests passing)
    ✗ US-005: Edit Profile (0%, not started)
    ✗ US-006: Avatar Upload (0%, not started)

Implementation Completeness: 4 of 7 stories (57%)
Passing BDD Tests: 15 of 22 (68%)
Code Test Coverage: 78%

ARCHITECTURE ALIGNMENT
====================

Implemented Layers:
  ✓ Layer 1: Database (PostgreSQL, 8 tables, migrations done)
  ✓ Layer 2: Backend (Node.js/Express, 12 endpoints implemented)
  ✓ Layer 3: Configuration (Auth middleware, error handling)
  ✓ Layer 4: Frontend (React components, 15 components)

Alignment with architecture-design.md: 95% aligned
Code follows tech-spec.md: 90% aligned
Design system implementation: 70% aligned (needs Tailwind refinement)

GAPS ANALYSIS
=============

Documentation Gaps:
  - code-generation.md (needed for consistency, 1 hour effort)
  - deployment-plan.md (needed for release strategy, 2 hours effort)

Implementation Gaps:
  - Epic E002: 2 of 3 stories incomplete (US-005, US-006)
  - BDD validation: 7 tests failing (need investigation)
  - Test coverage in Layer 4 (Frontend): 65% (target: 80%)

Code Quality:
  - Cyclomatic complexity: Average 5.2 (target: <10) ✓
  - SOLID principles: 85% adherence
  - Documentation: 70% (methods lack comments)

PROJECT MATURITY ASSESSMENT
===========================

Status: BROWNFIELD - Near Complete
Maturity Level: 4 of 5 (80%)

Reasoning:
- Planning phase nearly complete (2 docs missing)
- Implementation 57% done (4 of 7 stories)
- Code quality good
- BDD coverage decent but not 100%
- Architecture alignment high

RECOMMENDATIONS
===============

Priority 1 (Next 1 day):
1. Complete missing BDD tests for failing scenarios
2. Implement US-005 (Edit Profile) - blocked on Layer 4
3. Create code-generation.md and deployment-plan.md

Priority 2 (Next 3 days):
1. Increase frontend test coverage to 80%
2. Complete US-006 (Avatar Upload)
3. Improve code documentation

Priority 3 (Next week):
1. Full BDD validation on complete feature set
2. Performance testing against tech-spec requirements
3. Security audit against architecture-design.md

NEXT WORKFLOW
=============

**Recommended**: Continue Implementation Workflow

@orchestrator Continue implementation for AuthenticationApp
  Resume from: Epic E002
  Start with: US-005 (Edit Profile)
  Estimated effort: 3 story points
  
Expected outcomes:
- Complete 2 remaining stories in Epic E002
- 100% BDD passing for complete features
- All code quality gates passed
- Ready for deployment Phase 2

Alternative: If you want to fill documentation gaps first:
@orchestrator Complete missing PDLC documents
  Missing: code-generation.md, deployment-plan.md
  Estimated effort: 3 hours
  Then: Continue implementation workflow
```

## Running the Assessment

### Minimal Command
```bash
@orchestrator Assess project status for [PROJECT_NAME]
```

### Detailed Command
```bash
@orchestrator Assess project status for [PROJECT_NAME]
  Project Path: /path/to/project
  Check Documentation: yes
  Check Implementation: yes
  Check Code Quality: yes
  Detail Level: comprehensive
```

## Assessment Report Sections

1. **Documentation Status**
   - Which PDLC documents exist and are complete
   - Approval status and dates
   - Last update dates

2. **Implementation Status**
   - Which user stories are done
   - Which user stories are in progress
   - Which user stories haven't started

3. **BDD Status**
   - Total BDD scenarios defined
   - Passing scenarios
   - Failing scenarios (with details)
   - Coverage percentage

4. **Code Quality**
   - Test coverage percentage
   - Code complexity metrics
   - Design pattern adherence
   - Documentation completeness

5. **Architecture Alignment**
   - Code follows architecture.md
   - Code follows tech-spec.md
   - Code follows design-systems.md

6. **Gaps Analysis**
   - Missing documentation
   - Missing implementations
   - Quality gaps
   - Test gaps

7. **Project Maturity**
   - Current maturity level (0-5)
   - Recommendations by priority

8. **Next Steps**
   - Recommended workflow
   - Command to execute
   - Expected outcomes and timeline

## Project Maturity Levels

### Level 0: NEW
- No documentation
- No implementation
- No tests
- **Recommended Workflow**: Start PDLC workflow

### Level 1: REQUIREMENTS
- Stages 1-2 docs complete
- No implementation
- No tests
- **Recommended Workflow**: Continue PDLC at Stage 3

### Level 2: DESIGN
- Stages 1-4 docs complete
- No implementation
- No tests
- **Recommended Workflow**: Continue PDLC at Stage 5

### Level 3: READY
- Stages 1-6 docs complete
- No implementation
- Tests defined (BDD)
- **Recommended Workflow**: Start implementation workflow

### Level 4: BROWNFIELD
- Most docs complete
- 25-75% implementation
- Some tests passing
- **Recommended Workflow**: Continue implementation (skip completed stories)

### Level 5: NEAR-COMPLETE
- All docs complete
- 75%+ implementation
- Most tests passing
- **Recommended Workflow**: Complete remaining stories and validate

## How Assessment Impacts Workflow

Once assessment is complete, the orchestrator adapts the workflow:

### For NEW Projects
```
→ Start PDLC Workflow (Stage 1)
→ Full 8-stage process
→ No assumptions about existing work
```

### For BROWNFIELD Projects
```
→ Load existing docs and code
→ Skip completed PDLC stages
→ Resume at first incomplete stage
→ OR skip directly to implementation (if PDLC complete)
→ Only implement remaining user stories
→ Validate implementation against docs
```

### For MIGRATION Projects
```
→ Assess existing codebase patterns
→ Create minimal docs for existing code
→ Plan new features in PDLC
→ Integrate new features with existing code
```

### For NEAR-COMPLETE Projects
```
→ Validate implementation against docs
→ Complete final stories
→ Fix BDD test failures
→ Prepare for deployment
```

## Workflow Continuity

The assessment creates a **checkpoint** that allows:
- **Resuming workflows**: Continue at any stage
- **Merging workflows**: Brownfield projects can jump to implementation
- **Parallel work**: Some agents work on missing docs while others implement
- **Validation**: Ensure code matches docs

This enables true **project adaptability** instead of forcing every project through the same path.

## See Also

- [Start PDLC Workflow](start-pdlc.prompts.md)
- [Start Implementation Workflow](start-implementation.prompts.md)
- [ORCHESTRATION_GUIDE.md](../ORCHESTRATION_GUIDE.md)
