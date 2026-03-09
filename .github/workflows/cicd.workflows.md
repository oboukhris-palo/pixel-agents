# CI/CD Workflow

## Overview
Automated CI/CD pipeline evolving through 3 phases: Bootstrap → Stabilization → Optimization.

## Governance

**Scope**: Automated validation, testing, and deployment for all code changes
**Agents Involved**: Dev-Lead (CI/CD orchestration), Architect (deployment strategy), PM (release coordination)
**Key Documents**: [documents.workflows.md](.github/workflows/documents.workflows.md), [architecture-design.md](../docs/prd/architecture-design.md), [tech-spec.md](../docs/prd/tech-spec.md), [coding.instructions.md](../instructions/coding.instructions.md)

**Version Control**: Git with feature branches → develop → main
**Issue Tracking**: GitHub Issues with CI/CD status checks and deployment logs
**Deployment Strategy**: Progressive rollout from dev → staging → production

---

## CI/CD Pipeline Stages Overview

```
Commit → Build+Test → Quality+Security → Deploy (dev/staging/prod) → Monitor → Feedback
```

---

## Project Phases & CI/CD Evolution

### PHASE 1: BOOTSTRAP (Weeks 1-4)
**Goal**: Basic automation for rapid MVP development

**CI Pipeline**: Build → Unit tests → Basic linting → Security scan (critical only)
**CD**: Auto-deploy to dev | Manual staging tests | No prod
**Quality Gates**: ❌ Block: Build fail, critical vulns | ⚠️ Warn: Coverage <60%, lint issues
**Monitoring**: Health checks (5min), error logs, manual review
**Agents**: Dev-Lead monitors, BA tests manually
**Cost**: $50-100/mo

---

### PHASE 2: STABILIZATION (Weeks 5-8)
**Goal**: Production-grade automation with staging

**CI**: All Phase 1 + SonarQube + Architecture checks + SAST + Container scanning
**CT**: Integration tests → Deploy staging → Automated BDD → E2E tests → Performance baseline
**CD**: Canary deployment (10%→50%→100%) with auto-rollback | Approval gates (Dev-Lead+Architect)
**Quality Gates**: ❌ Block: Test fail, coverage decline, vulns, arch violations | ⚠️ Warn: Quality/perf decline >5%
**Monitoring**: Real-time errors (Sentry), APM (New Relic/Datadog), health (2min), automated alerts
**Agents**: Dev-Lead+Architect approve prod, BA validates BDD, PM coordinates releases
**Cost**: $200-500/mo

---

### PHASE 3: OPTIMIZATION (Weeks 9+)
**Goal**: Enterprise-grade with zero-downtime

**CI**: All Phase 2 + Mutation testing + Complexity analysis + DAST + Secret detection
**CT**: All Phase 2 + Load tests + Chaos engineering + Accessibility (WCAG)
**CD**: Blue-green deployment (zero downtime) + Synthetic tests + RUM + DB validation + Cost optimization
**Quality Gates**: ❌ Block: Any Phase 2 gate + Mutation decline + Chaos fail + Load >10% worse
**Monitoring**: Full observability (Prometheus+Grafana+ELK), distributed tracing (Jaeger), RUM, predictive alerts
**Agents**: All Phase 2 + optimization reviews
**Cost**: $1K-5K/mo

---

## Implementation

**Tech Stack**: GitHub Actions, Docker, K8s (Phase 2+), monitoring stack per phase

### Branch Strategy
main ← develop ← feature/bugfix/hotfix/refactor
**Merge**: CI pass, 1+ approval (Phase 1), 2+ (Phase 2+), code review

### Artifacts

**Phase 1**: Store in GitHub Actions cache
**Phase 2**: Container registry (Docker Hub, ECR, GCR)
**Phase 3**: Multi-region registry with cache optimization

**Artifact Retention**:
- Keep latest 10 releases
- Keep releases for 90 days
- Delete old feature branch artifacts after 7 days

### Rollback Strategy

**Phase 1**: Manual rollback via redeployment
**Phase 2**: One-click rollback to previous version (30 min window)
**Phase 3**: Instant rollback via blue-green switching (any time)

---



## Failure Recovery
**Build fail**: Dev fixes → Re-run CI
**Test fail**: Fix code or update test → Re-run
**Deploy fail**: Phase 1: Fix+redeploy | Phase 2+: Auto-rollback
**Performance**: Architect reviews → Accept or optimize

## Integrations

**PDLC**: test-strategies.md defines coverage, tech-spec defines targets, architecture enforced
**Implementation**: Phase 3 TDD code → CI validates → Phase 4 BDD on deployed env → Feedback loop
**Architecture**: CI validates layer separation, API contracts, patterns
**Coding Standards**: Linting+quality enforce standards, update standards from findings

- **Code Standards**: Linting and quality checks enforce coding standards
- **Continuous Improvement**: When violations found, coding.instructions.md updated by Dev-Lead
- **Quality Gates**: CI/CD enforces updated standards on future commits

---

## Agent Responsibilities
**Dev-Lead**: Monitor pipeline, approve deploys, fix builds, optimize performance, update coding standards
**Architect**: Validate architecture, approve changes, review performance/cost, security, update architecture docs
**PM**: Coordinate releases, track metrics, schedule windows
**BA**: Validate BDD tests, confirm acceptance criteria, update iteration plans

**Responsibilities**:
- Validate BDD test results in CI/CD
- Confirm feature behavior matches acceptance criteria
- Report functional validation results
- Update iteration-planning.md based on test results

**Invocation**: `ba-bdd-test-validation`, `ba-feature-acceptance`

---

## Metrics
**Efficiency**: Build <10min (P1), <5min (P2+) | Deploy 1-4x/day (P2+) | Time-to-prod <30min
**Quality**: Build success >95% | Test pass 100% | Coverage >80% | Deploy fail <5% (P1), <1% (P2-3)
**Reliability**: Rollback <10% (P1), <5% (P2), <1% (P3) | MTTR <30min | Uptime >99.5% (P2+), >99.9% (P3)
**Security**: 0 critical vulns, <5 high vulns, 100% scan pass

---

## Related Docs
[documents.workflows.md | implementation.workflows.md | architecture-design.md | tech-spec.md | test-strategies.md | coding.instructions.md]

## Evolution Summary

| Aspect | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| **Build Time** | 10 min | 5 min | 3 min |
| **Test Coverage** | Unit only | Unit + Integration + e2e | All + Load + Chaos |
| **Environments** | Dev only | Dev + Staging | Dev + Staging + Prod |
| **Deployments** | Manual | Automated (staging) | Fully automated |
| **Deployment Safety** | Basic checks | Approval gates | Blue-green + rollback |
| **Monitoring** | Logs only | Real-time dashboards | Observability stack |
| **Performance Testing** | Manual | Automated baseline | Continuous optimization |
| **Rollback** | Manual redeployment | One-click (30 min) | Instant blue-green |

