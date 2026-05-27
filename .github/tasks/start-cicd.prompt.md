# Start CI/CD Pipeline

## Prerequisites

- ✅ Git repo with main/develop
- ✅ Tech stack in architecture-design.md
- ✅ Build config (package.json/pom.xml)
- ✅ Tests runnable

## Command Template

```
@orchestrator Setup CI/CD pipeline for [PROJECT_NAME]

Project State:
- Tech Stack: [Backend, Frontend, Database]
- Phase: [Bootstrap / Stabilization / Optimization]
- Team: [Number]
- Target: [Cloud provider]

Orchestrate: Assess → Present 3 options → Configure → Test
```

---

## Expected Workflow Execution

### Phase Assessment (Day 1)
**Agents**: Architect, Dev-Lead

**Orchestrator Actions**:
1. Analyzes project state (codebase size, test coverage, team maturity)
2. **Decision Gate**: Presents 3 CI/CD phase options with requirements
3. User selects appropriate phase
4. Creates CI/CD roadmap

**Deliverables**:
- Project maturity assessment
- CI/CD phase recommendation
- Implementation roadmap

**Decision Gates**:
- ✋ **Gate 0.1**: CI/CD phase selection (USER DECIDES complexity level)

**Example Output**:
```
CI/CD Phase Assessment for TaskMaster Pro

Project Analysis:
├─ Codebase: 15 user stories implemented (5,000 LOC)
├─ Test Coverage: 87% (good)
├─ Team Size: 4 developers
├─ Stage: MVP nearing completion
├─ Deployment History: None yet (first deployment pending)
└─ Infrastructure: AWS selected, no IaC yet

Recommendation: Start with Phase 1 (Bootstrap), plan Phase 2 in 4-6 weeks

───────────────────────────────────────────────────────────────
🎯 DECISION GATE: Select CI/CD Phase
───────────────────────────────────────────────────────────────

**Phase 1: Bootstrap (RECOMMENDED for your project)**
├─ Infrastructure: Minimal (GitHub Actions, Docker, basic deployment)
├─ Automation: Build, unit tests, basic code quality, dev environment
├─ Deployment: Manual staging, automatic dev environment
├─ Quality Gates: Build passes, no critical vulnerabilities, basic coverage
├─ Monitoring: Error logs, basic health checks
├─ Timeline: 2-3 days setup
├─ Pros: Fast setup, low complexity, good for MVP/early stage
└─ Cons: Limited automation, manual staging deployment, basic monitoring

**Phase 2: Stabilization**
├─ Infrastructure: Kubernetes, staging environment, artifact registry
├─ Automation: Integration tests, API tests, automated BDD, canary deployment
├─ Deployment: Automated staging, canary to production (10% → 50% → 100%)
├─ Quality Gates: All tests pass, coverage maintained, performance baseline
├─ Monitoring: APM, log aggregation, performance metrics
├─ Timeline: 1-2 weeks setup
├─ Pros: Production-grade automation, safer deployments, good observability
└─ Cons: Higher complexity, requires DevOps expertise, infrastructure cost

**Phase 3: Optimization**
├─ Infrastructure: Full IaC (Terraform), blue-green deployment, secrets vault
├─ Automation: Mutation testing, DAST, chaos engineering, load testing
├─ Deployment: Zero-downtime blue-green, automated rollback, feature flags
├─ Quality Gates: Mutation score >80%, load test pass, chaos test resilience
├─ Monitoring: Full observability (Prometheus, Grafana, ELK, distributed tracing)
├─ Timeline: 2-3 weeks setup
├─ Pros: Enterprise-grade, highest quality, maximum reliability
└─ Cons: High complexity, expensive infrastructure, requires dedicated DevOps

Which phase do you want to implement? [1 / 2 / 3]
```

---

## Phase 1: Bootstrap Setup (2-3 Days)

### Day 1: GitHub Actions Configuration
**Agents**: Architect, Dev-Lead

**Orchestrator Actions**:
1. Creates .github/workflows/ci.yml for continuous integration
2. Configures build stage (Maven/npm)
3. Configures unit test execution
4. Configures code quality scan (SonarQube)
5. Configures security scan (OWASP dependency check)
6. Tests workflow execution

**Deliverables**:
- .github/workflows/ci.yml
- Build passing on all branches
- Unit tests running automatically
- Code quality reports

**Example Output**:
```
GitHub Actions CI Pipeline Created

File: .github/workflows/ci.yml

Pipeline Stages:
═══════════════════════════════════════════════════════════════
Stage 1: Build
├─ Checkout code
├─ Setup Java 17 / Node 18
├─ Install dependencies (mvn install / npm install)
├─ Build application (mvn package / npm run build)
└─ Expected Duration: 2-3 minutes

Stage 2: Unit Tests
├─ Run backend tests (mvn test)
├─ Run frontend tests (npm test)
├─ Generate coverage reports
└─ Expected Duration: 1-2 minutes

Stage 3: Code Quality
├─ Run SonarQube analysis
├─ Check code smells, duplications, complexity
├─ Report quality metrics
└─ Expected Duration: 1 minute

Stage 4: Security Scan
├─ OWASP dependency check
├─ npm audit / mvn dependency:check
├─ Report vulnerabilities
└─ Expected Duration: 1 minute
═══════════════════════════════════════════════════════════════

Quality Gates (Blocking):
❌ BLOCK if: Build fails
❌ BLOCK if: Critical security vulnerabilities found
⚠️  WARN if: Test coverage < 60%
⚠️  WARN if: Code quality issues detected

Testing pipeline now...

Pipeline Test Results:
✅ Build: PASSED (2m 15s)
✅ Unit Tests: PASSED (1m 42s) - 87% coverage
✅ Code Quality: PASSED (48s) - 0 critical issues
✅ Security: PASSED (1m 05s) - No critical vulnerabilities

Total Pipeline Duration: 5m 50s

🎉 CI Pipeline is operational! All commits will now be automatically built and tested.
```

### Day 2: Development Environment Deployment
**Agents**: Architect, Dev-Lead

**Orchestrator Actions**:
1. Creates Dockerfile for application
2. Configures Docker Compose for local development
3. Creates deployment workflow (.github/workflows/deploy-dev.yml)
4. Deploys to development environment (AWS ECS / DigitalOcean / Heroku)
5. Configures environment variables
6. Runs smoke tests

**Deliverables**:
- Dockerfile
- docker-compose.yml
- .github/workflows/deploy-dev.yml
- Development environment running

**Example Output**:
```
Development Environment Deployment

Container Configuration:
├─ Backend: Java 17 + Spring Boot (Port 8080)
├─ Frontend: Nginx + Angular (Port 80)
├─ Database: PostgreSQL 15 (Port 5432)
└─ Redis: Cache layer (Port 6379)

Deployment Target: AWS ECS (Fargate)
Environment: development
URL: https://dev.taskmaster-pro.example.com

Deployment Steps:
═══════════════════════════════════════════════════════════════
Step 1: Build Docker Images
✅ Backend image built: taskmaster-backend:latest (345 MB)
✅ Frontend image built: taskmaster-frontend:latest (25 MB)

Step 2: Push to Container Registry
✅ Pushed to AWS ECR: 123456789.dkr.ecr.us-east-1.amazonaws.com/taskmaster

Step 3: Deploy to ECS
✅ Task definition updated
✅ Service updated (rolling deployment)
✅ Health checks passing

Step 4: Database Migration
✅ Migrations applied (15 migrations executed)
✅ Seed data loaded (test users created)

Step 5: Smoke Tests
✅ Health endpoint: GET /health → 200 OK
✅ API endpoint: GET /api/tasks → 200 OK (empty list)
✅ Frontend: Load homepage → 200 OK
═══════════════════════════════════════════════════════════════

Deployment Complete! ✅
├─ Environment: development
├─ URL: https://dev.taskmaster-pro.example.com
├─ Duration: 4m 30s
├─ Status: Healthy
└─ Auto-deploy: ON (deploys on every push to develop branch)

Test credentials:
├─ Email: dev@example.com
└─ Password: DevTest123!

Next: Test the application in development environment
```

### Day 3: Monitoring & Documentation
**Agents**: Architect, Dev-Lead

**Orchestrator Actions**:
1. Configures basic monitoring (health checks, error logging)
2. Sets up log aggregation (CloudWatch / Papertrail)
3. Creates runbook documentation
4. Configures alerts for critical failures
5. Documents CI/CD process

**Deliverables**:
- Monitoring dashboard
- Alert configuration
- CI/CD runbook documentation
- Phase 1 complete ✅

**Example Output**:
```
Monitoring & Observability Setup (Phase 1)

Monitoring Components:
═══════════════════════════════════════════════════════════════
Health Checks:
├─ Endpoint: GET /health
├─ Frequency: Every 30 seconds
├─ Timeout: 5 seconds
└─ Status: ✅ Healthy

Error Logging:
├─ Platform: AWS CloudWatch Logs
├─ Log Groups: /ecs/taskmaster-backend, /ecs/taskmaster-frontend
├─ Retention: 7 days
└─ Status: ✅ Collecting logs

Basic Metrics:
├─ CPU Usage: Tracked
├─ Memory Usage: Tracked
├─ Request Count: Tracked
├─ Error Rate: Tracked
└─ Dashboard: CloudWatch Console

Alerts Configured:
├─ Alert 1: Service unhealthy for >2 minutes → Email to team
├─ Alert 2: Error rate >10% for 5 minutes → Email + Slack
├─ Alert 3: CPU >90% for 10 minutes → Email
└─ Alert 4: Build pipeline fails → Email + GitHub notification
═══════════════════════════════════════════════════════════════

CI/CD Documentation:
├─ Runbook: docs/cicd-runbook.md
├─ Troubleshooting: docs/cicd-troubleshooting.md
├─ Architecture: docs/deployment-architecture.md
└─ Status: ✅ Complete

🎉 Phase 1 (Bootstrap) Complete!

Summary:
✅ GitHub Actions CI pipeline operational
✅ Automated build, test, quality, security checks
✅ Development environment auto-deployed on push
✅ Basic monitoring and alerts configured
✅ Documentation complete

Current State:
├─ CI/CD Phase: Bootstrap ✅
├─ Automation Level: 60%
├─ Quality Gates: Basic
├─ Environments: Development only
└─ Monitoring: Basic health checks

Ready for Production? Not yet - recommend Phase 2 (Stabilization) for production deployment

Next Steps:
1. Continue development with auto-deploying dev environment
2. Plan Phase 2 (Stabilization) in 4-6 weeks when approaching production
3. Monitor CI/CD pipeline performance and adjust quality gates

Would you like to:
[A] Start Phase 2 now (add staging environment + production deployment)
[B] Continue with Phase 1 and revisit Phase 2 later
[C] Review Phase 1 configuration and adjust
```

---

## Phase 2: Stabilization Setup (1-2 Weeks)

### Prerequisites for Phase 2:
- Phase 1 complete and stable
- Multiple user stories deployed and tested
- Team comfortable with CI/CD process
- Production deployment planned

### Setup Components:
1. **Staging Environment**: Full production-like environment for final testing
2. **Integration Tests**: Automated API and integration tests
3. **BDD Automation**: Automated Gherkin scenario execution
4. **Canary Deployment**: Gradual production rollout (10% → 50% → 100%)
5. **APM Monitoring**: Application Performance Monitoring (New Relic / Datadog)
6. **Log Aggregation**: Centralized logging (ELK / Splunk)

---

## Phase 3: Optimization Setup (2-3 Weeks)

### Prerequisites for Phase 3:
- Phase 2 complete and stable
- High-traffic production environment
- Dedicated DevOps resources
- Budget for advanced infrastructure

### Setup Components:
1. **Infrastructure as Code**: Terraform for all infrastructure
2. **Blue-Green Deployment**: Zero-downtime deployments
3. **Feature Flags**: Gradual feature rollout and A/B testing
4. **Mutation Testing**: Advanced test quality validation
5. **Chaos Engineering**: Resilience testing in production
6. **Full Observability**: Prometheus, Grafana, ELK, distributed tracing

---

## Quick Start Commands

**Assess CI/CD Phase:**
```
@orchestrator Assess CI/CD maturity and recommend phase for [PROJECT_NAME]
```

**Setup Specific Phase:**
```
@orchestrator Setup CI/CD Phase [1/2/3] for [PROJECT_NAME]
```

**Upgrade CI/CD Phase:**
```
@orchestrator Upgrade from Phase [X] to Phase [Y]
```

**Check CI/CD Status:**
```
@orchestrator Show CI/CD pipeline status and health
```

**Troubleshoot Pipeline:**
```
@orchestrator Troubleshoot failing CI/CD pipeline
```

---

## Key CI/CD Principles

1. **Phased Evolution**: Start simple (Phase 1), evolve to complex (Phase 2/3) as project matures
2. **Quality Gates**: Enforce appropriate quality standards for project phase
3. **Automation First**: Automate testing before automating deployment
4. **Fast Feedback**: Keep CI pipeline under 10 minutes
5. **Rollback Ready**: Always have rollback capability before production deployment
6. **Monitoring Essential**: Can't improve what you don't measure
7. **Documentation**: Keep runbooks updated with every change
8. **Security Scanning**: Check dependencies and code for vulnerabilities
9. **Incremental Deployment**: Canary/blue-green for production safety
10. **Cost Awareness**: Balance automation sophistication with infrastructure cost

---

## Common Decision Gates

### Gate 1: Initial Phase Selection
- Consider: project maturity, team size, budget, deployment urgency
- Options: Bootstrap (fast, simple) vs Stabilization (production-ready) vs Optimization (enterprise)

### Gate 2: Deployment Strategy
- Consider: traffic volume, downtime tolerance, rollback requirements
- Options: Rolling (simple) vs Canary (gradual) vs Blue-Green (zero-downtime)

### Gate 3: Monitoring Level
- Consider: error budget, SLA requirements, team capacity
- Options: Basic health (logs) vs APM (metrics) vs Full observability (traces)

### Gate 4: Infrastructure Approach
- Consider: team DevOps skills, budget, scalability needs
- Options: Managed services (simple) vs Kubernetes (flexible) vs IaC (reproducible)

---

## Success Metrics

The Orchestrator tracks CI/CD health:

1. **Build Success Rate**: % of successful builds (target: >95%)
2. **Build Duration**: Time from commit to pipeline complete (target: <10 minutes)
3. **Deployment Frequency**: Deployments per day/week (target: increases over time)
4. **Deployment Success Rate**: % of successful deployments (target: >98%)
5. **Mean Time to Recovery (MTTR)**: Time to fix production issues (target: <30 minutes)
6. **Test Coverage**: % of code covered by tests (target: >80%)
7. **Security Vulnerability Response**: Time to patch critical vulnerabilities (target: <24 hours)
8. **Pipeline Cost**: Monthly infrastructure cost (track trends)

---

## Related Files

- **Orchestrator Agent**: [.github/agents/orchestrator.agent.md](/.github/agents/orchestrator.agent.md)
- **CI/CD Workflow**: [.github/workflows/cicd.workflows.yml](/.github/workflows/cicd.workflows.yml)
- **Architect Agent**: [.github/agents/architect.agent.md](/.github/agents/architect.agent.md)
- **Implementation Workflow**: [.github/workflows/05-implementation.workflows.yml](/.github/workflows/05-implementation.workflows.yml)
