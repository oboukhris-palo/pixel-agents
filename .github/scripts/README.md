# Scripts — gene2 Framework Automation

**Format**: Node.js ES Modules (`.mjs`) | **Requirements**: Node.js >= 18

---

## Directory Layout

```
scripts/
├── cli.mjs                    # Unified CLI — main entry point
├── utils.mjs                  # Shared utilities (imported by all scripts)
├── package.json               # NPM metadata
│
├── init-client-repo.mjs       # Initialize a client repo (symlink + PDLC structure)
├── init-framework.mjs         # Extract framework from template (one-time)
├── setup-git-hooks.mjs        # Install pre-commit / commit-msg / post-merge hooks
├── verify-framework.mjs       # Validate framework setup in a client repo
├── cleanup-old-framework.mjs  # Remove legacy framework copies (migration helper)
├── update-decision-trail.mjs  # Append decision trail entry after gate execution
├── generate-dashboard.mjs     # Regenerate decision dashboard (weekly)
│
├── hooks/                     # Validators called by git hooks (via setup-git-hooks.mjs)
│   ├── validate-agent-logs.mjs          # Checks agent logs use correct template + metadata
│   └── validate-metadata-frontmatter.mjs # Checks docs have required frontmatter fields
│
├── repo-conventions/          # Repository structure & naming validation
│   ├── init-project-structure.mjs       # Create PDLC folder tree in client repo
│   ├── analyze-project-artifacts.mjs    # Report doc/log completeness
│   ├── enforce-naming.mjs               # Validate branch + commit naming conventions
│   └── update-index.mjs                 # (Re)generate INDEX.md for a directory
│
└── implementation-kpis/       # Implementation quality tracking
    ├── collect-metrics.mjs    # Gather agent performance & A/B metrics
    └── validate-prompts.mjs   # Check agent prompts against quality standards
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Initialize client repo | `node init-client-repo.mjs --name "my-project"` |
| Install git hooks | `node setup-git-hooks.mjs --client .` |
| Validate framework | `node verify-framework.mjs` |
| Refresh doc indexes | `node repo-conventions/update-index.mjs --root . docs` |
| Validate naming | `node repo-conventions/enforce-naming.mjs --root .` |
| Collect KPI metrics | `node implementation-kpis/collect-metrics.mjs` |
| CLI help | `node cli.mjs --help` |

---

## Hook Validators (`hooks/`)

These scripts are **called automatically by git hooks** installed via `setup-git-hooks.mjs`.
They run in the client repo at commit time via `.gene2-core/.github/scripts/hooks/`.

- `validate-agent-logs.mjs` — ensures staged log files use the agent-log template and required metadata fields
- `validate-metadata-frontmatter.mjs` — ensures staged markdown docs include `templateId`, `author`, `date_created`, and `version` fields

If a pre-commit hook fails, the validation message explains which requirement is unmet.

---

## Notes for AI Agents

- All scripts use native Node.js APIs — no `npm install` needed
- `utils.mjs` provides `logger`, `exec`, `parseArgs`, `resolvePath` — import it in any new script
- From a client repo git hook context, prefix with `.gene2-core/`: `.gene2-core/.github/scripts/<script>.mjs`
- `cli.mjs` wraps all root-level scripts; prefer it for interactive use
