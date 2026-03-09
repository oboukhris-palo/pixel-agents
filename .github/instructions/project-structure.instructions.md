# Project Structure Instructions

This document defines the standardized project structure for Gen-e2 projects, covering both **greenfield** (new projects) and **brownfield** (legacy replatforming) scenarios.

## Overview

All Gen-e2 projects follow a consistent structure that supports:
- Clear separation of concerns
- Scalable architecture
- Infrastructure as Code
- Comprehensive documentation
- CI/CD automation

## Base Project Structure (Greenfield)

Use this structure when starting a **new project from scratch**:

```
.
├── README.md                        # Project overview and goals
├── scripts/                         # Project management scripts
│   ├── manage.sh                    # Manages servers and services (start, stop, status)
│   ├── setup.sh                     # Installs project dependencies
│   └── init_db.sh                   # Initializes the database (if required)
├── apps/                            # frontend applications
│   ├── mobile/                      # Mobile application
│   └── web/                         # Web application
├── docs/                            # Project documentation
│   ├── features/                    # Feature documentation (one file per feature)
│   ├── project-overview/            # Project overview documentation
│   ├── meeting-transcripts/         # Meeting & Mob Programming session transcripts
│   ├── index.md                     # Main documentation index
│   └── CONTRIBUTE.md                # Contribution guidelines and best practices
├── backend/                        # backend application
│   ├── api/                         # API code
│   ├── services/                    # Business logic services
│   ├── data/                        # Data access layer (ORM, database, SQL)
│   └── docs/                        # backend documentation
├── infra/                           # Infrastructure as Code
│   ├── modules/                     # Terraform modules
│   ├── tf-components/               # Terraform components
│   └── docs/                        # Infrastructure documentation
│       └── feature/
│           └── authentication/
├── DevOps/                          # DevOps automation
│   ├── pipeline/                    # CI/CD pipeline definitions
│   └── docs/                        # DevOps documentation
└── services/                        # Serverless functions
    └── functions/                   # Function implementations
```

## Legacy Replatforming Structure (Brownfield)

Use this structure when **replatforming an existing legacy application**:

```
.
├── README.md                        # Project overview and replatforming goals
├── LegacyApps/                      # ⭐ Legacy application archive
│   ├── legacy-app/                  # Original legacy app code
│   └── docs/                        # Legacy app documentation
├── scripts/                         # Project management scripts
│   ├── manage.sh                    # Manages servers and services (start, stop, status)
│   ├── setup.sh                     # Installs project dependencies
│   └── init_db.sh                   # Initializes the database (if required)
├── apps/                            # frontend applications (new)
│   ├── mobile/                      # Mobile application
│   └── web/                         # Web application
├── backend/                        # backend application (new)
│   ├── api/                         # API code
│   ├── services/                    # Business logic services
│   ├── data/                        # Data access layer (ORM, database, SQL)
│   └── docs/                        # backend documentation
├── docs/                            # Project documentation
│   ├── features/                    # Feature documentation (one file per feature)
│   ├── legacy-app/                  # ⭐ Legacy app analysis and documentation
│   ├── CriticalFeatures.md          # ⭐ Prioritized critical features for migration
│   ├── infrastructure.md            # Infrastructure architecture documentation
│   ├── api.md                       # API architecture documentation
│   ├── backend.md                  # backend architecture documentation
│   ├── frontend/                   # frontend architecture documentation
│   ├── testing/                     # Testing strategy documentation
│   ├── testing.md                   # Testing strategy overview
│   ├── deployment/                  # Deployment strategy documentation
│   ├── deployment.md                # Deployment strategy overview
│   ├── deployment-pipeline/         # Deployment pipeline details
│   ├── deployment-pipeline.md       # Deployment pipeline overview
│   ├── monitoring/                  # Monitoring and logging strategy
│   ├── monitoring.md                # Monitoring and logging overview
│   ├── security/                    # Security strategy documentation
│   ├── security.md                  # Security strategy overview
│   ├── migration/                   # Migration plan and data migration
│   ├── migration.md                 # Migration plan overview
│   ├── rollback/                    # Rollback plan documentation
│   ├── rollback.md                  # Rollback plan overview
│   ├── development-environment/     # Development environment setup
│   ├── development-environment.md   # Dev environment setup overview
│   ├── project-overview/            # Project overview documentation
│   ├── meeting-transcripts/         # Meeting & Mob Programming session transcripts
│   ├── index.md                     # Main documentation index
│   ├── issue-tracker.md             # Issue tracker for clarifications
│   └── CONTRIBUTE.md                # Contribution guidelines and best practices
├── infra/                           # Infrastructure as Code
│   ├── modules/                     # Terraform/CloudFormation modules
│   └── docs/                        # Infrastructure documentation with diagrams
├── services/                        # Serverless functions
│   └── functions/                   # Function implementations
└── TODO.md                          # Project task breakdown
```

## Directory Descriptions

### Core Directories (All Projects)

- **`README.md`**: Project overview, goals, setup instructions, and quick start guide
- **`scripts/`**: Automation scripts for project management, setup, and database initialization
- **`apps/`**: frontend applications (web, mobile)
- **`backend/`**: Server-side application code including API, services, and data access layers
- **`docs/`**: Comprehensive project documentation
- **`infra/`**: Infrastructure as Code (Terraform, CloudFormation, etc.)
- **`DevOps/`**: CI/CD pipeline configurations and automation
- **`services/`**: Serverless functions (AWS Lambda, Azure Functions, etc.)

### Brownfield-Specific Directories

- **`LegacyApps/`**: Archive of the original legacy application code and documentation
- **`docs/legacy-app/`**: Analysis of legacy app architecture, features, and data structures
- **`docs/CriticalFeatures.md`**: Prioritized list of critical features requiring immediate migration
- **`docs/migration/`**: Detailed migration plan, data migration strategies, and rollback procedures

## Key Files

### Greenfield Projects

| File | Purpose |
|------|---------|
| `README.md` | Project overview and goals |
| `docs/index.md` | Documentation index |
| `docs/CONTRIBUTE.md` | Contribution guidelines |
| `infra/docs/feature/authentication/index.md` | Authentication infrastructure documentation |
| `TODO.md` | Task breakdown (if needed) |
| `.gitignore` | Version control exclusions |

### Brownfield Projects (Additional)

| File | Purpose |
|------|---------|
| `docs/CriticalFeatures.md` | Prioritized migration features |
| `docs/legacy-app/*.md` | Legacy app analysis |
| `docs/infrastructure.md` | Infrastructure architecture |
| `docs/api.md` | API architecture |
| `docs/backend.md` | backend architecture |
| `docs/testing.md` | Testing strategy |
| `docs/deployment.md` | Deployment strategy |
| `docs/deployment-pipeline.md` | CI/CD pipeline details |
| `docs/monitoring.md` | Monitoring and logging |
| `docs/security.md` | Security strategy |
| `docs/migration.md` | Migration plan |
| `docs/rollback.md` | Rollback procedures |
| `docs/development-environment.md` | Dev environment setup |
| `docs/issue-tracker.md` | Clarifications and questions |
| `TODO.md` | Task breakdown by domain |

## Documentation Standards

### docs/features/
- **One file per feature**
- Include acceptance criteria, user stories, and technical requirements
- Link to related API documentation and design documents

### docs/api/
- **Swagger/OpenAPI format** for API documentation
- Include examples of requests and responses
- Document authentication mechanisms and error codes

### docs/infrastructure/
- Use **PlantUML** for architecture diagrams
- Document cloud provider, services, and networking
- Include disaster recovery and scaling strategies

### docs/testing/
- Define testing scope (unit, integration, E2E)
- Document testing frameworks and tools
- Include test coverage requirements

## TODO.md Format

For all projects, create `TODO.md` with domain-based task breakdown:

```markdown
## Domain
[ ] Task to be done (owner)
```

**Requirements**:
- Tasks must be small enough to complete in a few hours
- Include tasks outside development (DevOps, security, documentation review)
- Add review tasks for all generated files (architecture, API docs, etc.)
- Organize by domain: frontend, backend, Infrastructure, DevOps, Testing, Security, Documentation

## Project Setup Checklist

### Greenfield Projects
1. ✅ Create base directory structure
2. ✅ Initialize Git repository
3. ✅ Create README.md with project overview
4. ✅ Set up .gitignore (language-specific)
5. ✅ Create docs/index.md documentation index
6. ✅ Set up dependency management (package.json, requirements.txt, etc.)
7. ✅ Create infrastructure files (if needed)
8. ✅ Set up CI/CD pipeline
9. ✅ Configure testing frameworks
10. ✅ Install project dependencies

### Brownfield Projects (Additional)
11. ✅ Archive legacy app in LegacyApps/
12. ✅ Document legacy app in docs/legacy-app/
13. ✅ Create feature list from legacy app
14. ✅ Prioritize features in docs/CriticalFeatures.md
15. ✅ Create migration plan in docs/migration/
16. ✅ Document rollback procedures in docs/rollback/
17. ✅ Set up issue tracker in docs/issue-tracker.md
18. ✅ Create API documentation (if legacy app lacks API)
19. ✅ Document interfaces to other systems
20. ✅ Create data migration strategy

## Best Practices

1. **Version Control**: Always initialize Git and create initial commit after setup
2. **Environment Variables**: Use .env files for secrets (add to .gitignore)
3. **Code Quality**: Set up linters and formatters from the start
4. **Security**: Include vulnerability scanning tools
5. **Documentation**: Keep documentation synchronized with code changes
6. **Testing**: Write tests alongside feature development
7. **Deployment**: Use staging environments before production
8. **Monitoring**: Set up logging and monitoring early

## Questions to Ask Before Setup

### All Projects
1. What are the project requirements and features?
2. Which cloud provider? (AWS, Azure, GCP, etc.)
3. What is the target architecture? (Monolith, Microservices, Serverless)
4. API-first or frontend first?
5. Specific languages or frameworks required?
6. Infrastructure format? (Terraform, CloudFormation, etc.)

### Brownfield Projects (Additional)
7. What legacy app needs replatforming?
8. Key challenges in replatforming?
9. Interfaces to other systems that must be maintained?
10. Requirements for replatforming process? (same data structure, UX consistency, etc.)
11. Critical features that must be migrated first?

## Maintenance

- **Review** .gitignore after file creation to ensure proper exclusions
- **Update** docs/index.md when adding new documentation
- **Sync** README.md with current project state
- **Validate** all generated files (architecture, API docs) and update as needed
- **Track** tasks in TODO.md and mark complete when done

---

**Last Updated**: January 2026  
**Version**: 1.0
