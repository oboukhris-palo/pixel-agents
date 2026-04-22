---
applyTo: "**"
description: Guidelines for using the centralized documentation index
priority: high
---

# Documentation Index Usage Guidelines

## Purpose

This instruction ensures all agents use the centralized documentation index (`docs/INDEX.md`) for navigating project documentation, instead of hardcoded absolute paths.

---

## Core Principle

**❌ Don't do this** (Hardcoded paths):
```markdown
Read `/docs/01-requirements/user-stories.md`
Check `/docs/02-architecture/tech-spec.md`
Update `/docs/05-implementation/user-stories.md`
```

**✅ Do this instead** (Index-based navigation):
```markdown
1. Reference #file:docs/INDEX.md for document locations
2. Navigate using "Quick Reference by Agent Role" section
3. Use relative paths from index
```

---

## Benefits of Index-Based Approach

### 1. Single Source of Truth
- All document paths maintained in ONE location
- No duplication across 14+ agent files
- Easy to update when structure changes

### 2. Simplified Maintenance
**Scenario**: Move `user-stories.md` to new location

**Old Approach** (Manual):
- Update 8+ agent files with hardcoded paths
- Risk missing occurrences
- Time: 30+ minutes

**New Approach** (Index-based):
- Update `docs/INDEX.md` only (1 file)
- All agents automatically get new path
- Time: 2 minutes

### 3. Better Context
Index provides:
- Document purpose
- Who uses it
- Key sections
- Related documents

---

## How Agents Should Use the Index

### Step 1: Load the Index
```markdown
**Before navigating documentation:**
1. Read #file:docs/INDEX.md
2. Identify your agent role (BA, Dev-Lead, UX, etc.)
3. Use "Quick Reference by Agent Role" section
```

### Step 2: Navigate to Documents
```markdown
**Example for BA Agent:**

From INDEX.md → "For Business Analyst (BA)" section:
- User Stories (PRD): `01-requirements/user-stories.md`
- BDD Test Strategies: `03-testing/test-strategies.md`
- User Stories (Implementation): `05-implementation/user-stories.md`

**Full path construction:**
Base: `docs/`
Relative: `01-requirements/user-stories.md`
Result: `docs/01-requirements/user-stories.md`
```

### Step 3: Use Path Patterns for Dynamic Paths
```markdown
**For user story folders:**

Pattern from INDEX.md:
`05-implementation/epics/epic-{NN}/user-stories/{US-REF}/`

**Example substitution:**
Epic 02, User Story US-006:
`docs/05-implementation/epics/epic-02/user-stories/us-006/`

Files in this folder:
- description.md
- implementation-plan.md
- plan-approval.yaml
- features/
```

---

## Agent Instruction Template

### For Agent `.agent.md` Files

**Replace hardcoded path sections with:**

```markdown
## 📚 Document Locations

**All document paths are maintained in**: #file:docs/INDEX.md

**Quick Access for [AGENT_ROLE]:**
1. Open #file:docs/INDEX.md
2. Navigate to "For [AGENT_ROLE]" section
3. Use relative paths from base: `docs/`

**Common Documents for [AGENT_ROLE]:**
- [Document 1]: See INDEX.md → "[Doc1 Name]"
- [Document 2]: See INDEX.md → "[Doc2 Name]"
- [Document 3]: See INDEX.md → "[Doc3 Name]"

**Path Patterns:**
- User Story Folder: `05-implementation/epics/epic-{NN}/user-stories/{US-REF}/`
- Epic Folder: `05-implementation/epics/epic-{NN}/`
- Sprint Folder: `04-planning/sprints/sprint-{N}/`
```

---

## Migration Examples

### Example 1: BA Agent (Before/After)

**Before** (Hardcoded):
```markdown
### From Product Owner & UX Designer
- **Input**: 
  - PO-validated acceptance criteria from `/docs/01-requirements/user-stories.md`
  - UX designs and prototypes from `/docs/design/design-systems.md`
  - UI component specifications and design tokens
```

**After** (Index-based):
```markdown
### From Product Owner & UX Designer
- **Input**: 
  - PO-validated acceptance criteria (see #file:docs/INDEX.md → "User Stories (PRD)")
  - UX designs and prototypes (see #file:docs/INDEX.md → "Design Systems")
  - UI component specifications and design tokens
```

---

### Example 2: Dev-Lead Agent (Before/After)

**Before** (Hardcoded):
```markdown
3. Review functional specifications and acceptance criteria from `/docs/05-implementation/user-stories.md`
4. Conduct technical feasibility assessment using `/docs/02-architecture/architecture-design.md` and `/docs/02-architecture/tech-spec.md`
```

**After** (Index-based):
```markdown
3. Review functional specifications (see #file:docs/INDEX.md → "User Stories (Implementation)")
4. Conduct technical feasibility assessment:
   - Architecture: #file:docs/INDEX.md → "Architecture Design"
   - Technical specs: #file:docs/INDEX.md → "Tech Spec"
```

---

### Example 3: UX Agent (Before/After)

**Before** (Hardcoded):
```markdown
**Context Required**:
- /docs/01-requirements/personas.md (all personas with goals/pains)
- /docs/01-requirements/requirements.md
- /docs/01-requirements/business-case.md (problem statement)
```

**After** (Index-based):
```markdown
**Context Required** (see #file:docs/INDEX.md):
- Personas (For UX Designer section)
- Requirements (For UX Designer section)
- Business Case (For UX Designer section)
```

---

## Update Process for Document Moves

### Scenario: Reorganize Documentation Structure

**Example**: Move all Phase 1-3 documents to `requirements-and-design/` folder

**Old Structure**:
```
docs/
├── 01-requirements/
├── 02-architecture/
└── 03-testing/
```

**New Structure**:
```
docs/
└── requirements-and-design/
    ├── requirements/
    ├── architecture/
    └── testing/
```

**Update Steps**:
1. ✅ Update `docs/INDEX.md` paths (15 minutes)
   - Change `01-requirements/` → `requirements-and-design/requirements/`
   - Change `02-architecture/` → `requirements-and-design/architecture/`
   - Change `03-testing/` → `requirements-and-design/testing/`

2. ✅ No agent file updates needed (agents reference INDEX.md)

3. ✅ Commit changes:
   ```bash
   git commit -m "docs: reorganize structure to requirements-and-design/"
   ```

**Result**: All 14 agents automatically use new paths

---

## Common Lookup Patterns (Quick Cheat Sheet)

### For BA Agent
```markdown
"Where are acceptance criteria?" 
→ #file:docs/INDEX.md → "User Stories (PRD)"

"Where are BDD scenarios?"
→ #file:docs/INDEX.md → "BDD Test Strategies"

"Where is implementation status?"
→ #file:docs/INDEX.md → "User Stories (Implementation)"
```

### For Dev-Lead
```markdown
"Where is the architecture?"
→ #file:docs/INDEX.md → "Architecture Design"

"Where are user story folders?"
→ #file:docs/INDEX.md → Path Pattern: `05-implementation/epics/...`

"Where is the tech spec?"
→ #file:docs/INDEX.md → "Tech Spec"
```

### For UX Designer
```markdown
"Where are personas?"
→ #file:docs/INDEX.md → "Personas"

"Where is the design system?"
→ #file:docs/INDEX.md → "Design Systems"

"Where are journey maps?"
→ #file:docs/INDEX.md → "Journey Maps"
```

---

## Enforcement Rules

### For Agent Developers
1. ❌ **Never hardcode full paths** in agent instructions
2. ✅ **Always reference** `#file:docs/INDEX.md`
3. ✅ **Use relative paths** from `docs/` base
4. ✅ **Use path patterns** for dynamic paths (epic-{NN}, {US-REF})

### For Documentation Maintainers
1. ✅ **Update INDEX.md** when adding/moving/renaming documents
2. ✅ **Follow checklist** in INDEX.md "Maintenance Guidelines"
3. ✅ **Test navigation** after updates (verify paths work)
4. ✅ **Update version** number and last_updated date

---

## Exception: When Hardcoded Paths Are Acceptable

**Acceptable** (within same user story context):
```markdown
# In implementation-plan.md for US-006
Reference `implementation-plan.md` in same folder for progress tracking
Reference `plan-approval.yaml` in same folder
Reference `bdd-scenarios/` in same folder
```

**Why**: Relative paths within same user story folder are stable and local

**Not Acceptable** (cross-phase references):
```markdown
# In implementation-plan.md for US-006
Reference `/docs/01-requirements/user-stories.md`  ❌
Use: #file:docs/INDEX.md → "User Stories (PRD)" ✅
```

---

## Metrics & Success Criteria

### Measurable Goals
- **Path duplication**: Reduce from 50+ occurrences to 1 (INDEX.md only)
- **Maintenance time**: Reduce restructure time from 30min → 2min (93% faster)
- **Error rate**: Zero broken paths after restructure
- **Onboarding**: New agents learn navigation in 5min (vs 20min before)

### Quality Indicators
- ✅ All agents reference INDEX.md for cross-phase navigation
- ✅ INDEX.md maintained within 24 hours of structure changes
- ✅ Zero hardcoded paths in agent prompt templates
- ✅ Path patterns documented for all dynamic paths

---

## Related Instructions

- **Naming Conventions**: `.github/instructions/naming-conventions.instructions.md`
- **Project Structure**: `.github/instructions/project-structure.instructions.md`
- **Documentation Rules**: `.github/instructions/documentation.instructions.md`

---

**Version**: 1.0.0  
**Created**: 2026-03-25  
**Last Updated**: 2026-03-25  
**Status**: ACTIVE  
**Priority**: HIGH
