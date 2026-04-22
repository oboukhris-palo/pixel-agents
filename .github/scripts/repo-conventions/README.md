# Repository Conventions Scripts

Automated tools for enforcing and managing project naming conventions and documentation structure.

## Scripts

### `enforce-naming.mjs`
**Purpose**: Validates naming conventions for Gen-e2 framework compliance

**Validates**:
- Folder names match `EPIC-xxx`/`US-xxx` patterns (configurable prefixes)
- File references match their folder IDs
- Git branch names include correct story/epic IDs
- Git commit messages follow framework patterns (`TDD-*/DOC-*/ASSESSMENT-*`)

**Usage**:
```bash
node repo-conventions/enforce-naming.mjs [options]

Options:
  --fix          Attempt to auto-fix naming violations
  --branch       Check current git branch naming
  --strict       Fail on any naming violation (exit 1)
```

**Example**:
```bash
# Validate entire project
node repo-conventions/enforce-naming.mjs

# Fix violations automatically
node repo-conventions/enforce-naming.mjs --fix

# Check current branch
node repo-conventions/enforce-naming.mjs --branch --strict
```

**Environment Variables** (optional, set by orchestrator agent):
```bash
APP_PREFIX=MYAPP         # Application prefix (e.g., AUTH, PAYMENT)
EPIC_PREFIX=EPIC         # Epic ID prefix (default: EPIC)
STORY_PREFIX=US          # User story ID prefix (default: US)
ID_WIDTH=3               # Width of numeric ID (default: 3 → US-001)
```

### `update-index.mjs`
**Purpose**: Auto-generates and updates `INDEX.md` files throughout project structure

**Functionality**:
- Recursively scans directory structure
- Creates `INDEX.md` with all files and folders
- Generates intelligent descriptions based on file names (e.g., `requirements.md` → "Master product requirements document")
- Includes last modified dates
- Excludes build artifacts, node_modules, hidden files, etc.

**Usage**:
```bash
# Update INDEX.md files for entire project
node repo-conventions/update-index.mjs

# Update specific directory
node repo-conventions/update-index.mjs docs/

# Update with verbose output
node repo-conventions/update-index.mjs --verbose
```

**Output**:
- Creates `INDEX.md` in each directory
- Includes table of contents with file descriptions
- Tracks modification timestamps
- Supports markdown formatting with proper links

**Example Output** (docs/INDEX.md):
```markdown
# Documentation Index

Last Updated: 2026-04-09

## Files
- [requirements.md](requirements.md) - Master product requirements document (PRD)
- [personas.md](personas.md) - User personas and target audience definitions
- [business-case.md](business-case.md) - Business justification and ROI analysis

## Folders
- [01-requirements/](01-requirements/) - Phase 1-2 requirements and analysis
- [02-architecture/](02-architecture/) - Phase 3-4 architecture and design
```

### `init-project-structure.mjs`
**Purpose**: Initialize complete project folder structure for new or existing client repositories

**Functionality**:
- Creates phased directory structure (docs/00-assessment through 05-implementation)
- Creates logs directory for agent logging (all 6 phases)
- Creates application source code structure (src/backend, src/frontend)
- Creates .github subdirectories (agents, instructions, workflows, templates, etc.)
- **Preserves existing** `/docs` and `/logs` content (never deletes)
- **Smart archiving** of large artifacts (>5MB) to `.archives/` with timestamp
- Generates configuration files for project structure reference

**When to use** (Client Repo Initialization Workflow):
- After `cli.mjs init-client` to create directory structure
- Before BA agent starts creating user stories
- As part of Step 2b in complete setup sequence
- For legacy projects being migrated to the framework

**Usage**:
```bash
# Preview structure (dry-run, no changes)
node repo-conventions/init-project-structure.mjs \
  --client . \
  --dry-run

# Create structure for real
node repo-conventions/init-project-structure.mjs \
  --client .

# With custom archive directory
node repo-conventions/init-project-structure.mjs \
  --client . \
  --archive-dir ./backups

# Verbose output
node repo-conventions/init-project-structure.mjs \
  --client . \
  --verbose
```

**Options**:
- `--client` (required) — Client repo path
- `--dry-run` — Preview without making changes
- `--archive-dir` — Directory for archived artifacts (default: `.archives/`)
- `--verbose` — Show all created directories and details

**Output Structure Created**:
```
docs/
├── 00-assessment/        ← Phase 0: Assessment & discovery
├── 01-requirements/      ← Phase 1-2: Requirements & personas
├── 02-architecture/      ← Phase 3-4: Architecture & design
├── 03-testing/           ← Phase 5: Testing strategy
├── 04-planning/          ← Phase 6-7: Deployment planning
├── 05-implementation/    ← Phase 8: Implementation tracking
│   └── epics/           ← Epic container (EPIC-001, EPIC-002, etc.)
│       └── user-stories/← Story container (US-001, US-002, etc.)
├── design/              ← UX/UI design documents
├── features/            ← Feature documentation
├── development/         ← Development guidelines
└── architecture/        ← Architecture diagrams

logs/
├── 00-assessment/        ← Phase 0 agent logs
├── 01-requirements/      ← Phase 1 agent logs
├── 02-architecture/      ← Phase 2 agent logs
├── 03-testing/           ← Phase 3 agent logs
├── 04-planning/          ← Phase 4 agent logs
└── 05-implementation/    ← Phase 5 agent logs
```

**Generated Files**:
- `project-structure-config.json` — Configuration reference
- `structure-summary.json` — Execution summary with statistics

### `analyze-project-artifacts.mjs`
**Purpose**: Analyze and report on existing `/docs` and `/logs` artifacts with completeness metrics and recommendations

**Functionality**:
- Scans existing `/docs` and `/logs` directories
- Calculates completeness percentage (0-100%) per phase
- Identifies missing documentation phases
- Tracks file counts and directory sizes
- Generates gap analysis with severity ratings (HIGH/MEDIUM/LOW)
- Provides actionable recommendations for missing content
- Supports multiple output formats (JSON, Markdown, HTML)

**When to use** (Client Repo Context):
- After `init-project-structure.mjs` creates folders to assess what needs to be filled
- Before BA agent starts creating documentation
- For reporting on documentation health/status
- In CI/CD pipelines to track documentation completeness
- As part of Step 2c in complete setup sequence (optional but recommended)

**Usage**:
```bash
# JSON report (machine-readable)
node repo-conventions/analyze-project-artifacts.mjs \
  --client . \
  --output artifact-report.json

# Markdown report (human-readable, for documentation)
node repo-conventions/analyze-project-artifacts.mjs \
  --client . \
  --format markdown \
  --output artifact-report.md

# HTML report (interactive visualization)
node repo-conventions/analyze-project-artifacts.mjs \
  --client . \
  --format html \
  --output artifact-report.html

# Verbose console output
node repo-conventions/analyze-project-artifacts.mjs \
  --client . \
  --verbose
```

**Options**:
- `--client` (required) — Client repo path
- `--output` — Output file path (default: `artifact-analysis.json`)
- `--format` — Report format: `json|markdown|html` (default: `json`)
- `--verbose` — Detailed console logging

**Output Formats**:

**JSON** (machine-readable, suitable for automation):
```json
{
  "completeness": {
    "docs": 67,
    "logs": 45,
    "overall": 56
  },
  "docs": {
    "exists": true,
    "fileCount": 24,
    "totalSize": 2097152,
    "phases": {
      "00-assessment": { "exists": true, "files": 3 },
      "01-requirements": { "exists": true, "files": 5 },
      "02-architecture": { "exists": false, "files": 0 }
    }
  },
  "recommendations": [
    {
      "severity": "high",
      "title": "Missing Documentation Phases",
      "action": "Create 02-architecture, 03-testing phases"
    }
  ]
}
```

**Markdown** (human-readable, for reports):
```markdown
# Artifact Analysis Report
Generated: 2026-04-09T15:30:00Z

## Overall Completeness
- **Docs**: 67% (4/6 phases present)
- **Logs**: 45% (3/6 phases present)  
- **Overall**: 56%

## Documentation Analysis
| Phase | Status | Files | Size |
|-------|--------|-------|------|
| 00-assessment | ✅ | 3 | 64KB |
| 01-requirements | ✅ | 5 | 128KB |
| 02-architecture | ❌ | 0 | 0KB |

## Recommendations
**HIGH**: Missing Architecture Documentation  
Create 02-architecture/ phase directory
```

**HTML** (interactive visualization with charts and statistics)

**Metrics Tracked**:
- Completeness % per phase (0-100%)
- File counts by type
- Directory sizes (human-readable)
- Modification timestamps
- Gap identification
- Severity-based recommendations (HIGH/MEDIUM/LOW)

## Configuration

Both scripts respect project configuration:
```yaml
# .github/framework-config.mjs (if present)
export default {
  framework: {
    naming: {
      epic_prefix: 'EPIC',
      story_prefix: 'US',
      app_prefix: 'APP',
      id_width: 3
    }
  }
};
```

## Common Issues

**Issue**: Script doesn't find repositories to check
- **Solution**: Run from project root: `cd /path/to/project && node .github/scripts/repo-conventions/enforce-naming.mjs`

**Issue**: "Unknown prefixes" error
- **Solution**: Set environment variables: `export EPIC_PREFIX=EPIC US_PREFIX=US && node ...`

**Issue**: INDEX.md files not being created
- **Solution**: Ensure write permissions: `chmod +x .github/scripts/repo-conventions/update-index.mjs`

## Integration with CI/CD

These scripts are designed for:
- Pre-commit hooks (validate before allowing commits)
- CI/CD pipelines (block PRs with naming violations)
- Developer workflows (auto-fix with `--fix` option)

**Example GitHub Actions**:
```yaml
- name: Validate Naming Conventions
  run: node .github/scripts/repo-conventions/enforce-naming.mjs --strict

- name: Update Documentation Index
  run: node .github/scripts/repo-conventions/update-index.mjs
```

---

**Created**: 2026-04-09  
**Framework**: Gen-e2 v2.0.0  
**Location**: `.github/scripts/repo-conventions/`
