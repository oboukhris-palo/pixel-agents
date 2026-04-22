# Assessment & Discovery Workflow - AI Transformation Readiness

**Workflow ID:** ASSESSMENT-001  
**Output Location:** `/docs/00-assessment/`  
**Input Location:** `/docs/00-assessment/inputs/` (client-provided materials)  
**Scope:** Universal discovery phase for greenfield and brownfield projects  
**Assessment Framework:** Multi-dimensional AI readiness evaluation  
**Output Documents:** Prerequisites report (YAML), AI Readiness report (Markdown), Handoff package  
**Templates:** `prerequisites-tmpl.yml`, `recommendation-plan-tmpl.md`  
**Handoff Target:** Phase-specific workflows (`01-requirements.workflows.md` → `02-architecture.workflows.md` → `03-testing.workflows.md` → `04-planning.workflows.md` → `05-implementation.workflows.md`)

---

## Referenced Artifacts

### Templates
- `.github/templates/prerequisites-tmpl.yml` — Prerequisites request schema
- `.github/templates/recommendation-plan-tmpl.md` — AI readiness recommendations
- `.github/templates/agent-log-tmpl.md` — Agent logging format
- `.github/templates/interview-synthesis-tmpl.md` — Interview transcript processing
- `.github/templates/documentation-synthesis-tmpl.md` — Client documentation conversion
- `.github/templates/input-conversion-metadata-tmpl.yml` — Raw→converted transformation tracking

### Quality Gates
- `.github/gates/gate-00-assessment.md` — Phase 0 validation (prerequisites ≥90% fulfilled, maturity tier classified, readiness report approved)

### Guides
- `.github/guides/gate-blocker-resolution.guide.md` — Blocker resolution strategies

### Instructions
- `.github/instructions/documentation.instructions.md` — Documentation standards
- `.github/instructions/framework-standards.instructions.md` — Naming conventions, phase numbering
- `.github/instructions/agent-logging.instructions.md` — Mandatory logging rules
- `.github/instructions/ai.analysis.guardrails.instructions.md` — No speculation, stick to content, acknowledge missing info

### Scripts
- `.github/scripts/update-decision-trail.mjs` — Decision trail automation (after gate execution)
- `.github/scripts/generate-dashboard.mjs` — Weekly decision dashboard

---

## Workflow Overview

The assessment workflow is the **critical discovery phase** that executes BEFORE documentation and implementation. It evaluates client readiness for AI transformation, identifies gaps, and establishes baseline metrics across multiple dimensions to ensure successful project outcomes.

### Workflow Purpose

**Primary Goals:**
1. **Discover client context** - Analyze all available inputs (codebase, documentation, data, interviews)
2. **Identify prerequisites** - Determine access requirements and procurement needs
3. **Assess AI readiness** - Evaluate organizational maturity across key dimensions
4. **Generate strategic recommendations** - Provide actionable transformation roadmap
5. **Prepare handoff artifacts** - Create foundation for documentation and implementation phases

**Applicable Scenarios:**
- ✅ **Greenfield projects** - New development with AI-first approach
- ✅ **Brownfield projects** - Legacy system modernization and AI integration
- ✅ **Migration projects** - Platform/technology transitions with AI augmentation
- ✅ **Optimization projects** - Performance, cost, and quality improvements using AI
- ✅ **Assessment-only engagements** - Strategic AI readiness evaluation

---

## Workflow Stages

**Stage 1: Client Context Discovery (Phases 1-2)**
- Inventory and analyze available inputs
- Generate prerequisites request for missing access
- Quick baseline assessment from available data

**Stage 2: Prerequisites Fulfillment (Phase 3)**
- Track access provisioning
- Validate system access and data availability
- Confirm compliance and security clearances

**Stage 3: Deep Assessment (Phases 4-5)**
- Multi-dimensional maturity analysis
- Stakeholder interviews and validation
- Gap analysis and opportunity identification

**Stage 4: Strategic Planning & Handoff (Phase 6)**
- Generate AI readiness report
- Develop transformation roadmap
- Prepare handoff package for documentation phase

### Phase Flow
```
STAGE 1 - DISCOVERY:
Phase 1: Input Inventory → Phase 2: Prerequisites Generation → Baseline Assessment

STAGE 2 - PROVISIONING:
Phase 3: Access Validation & Tracking → Prerequisites Fulfillment

STAGE 3 - ASSESSMENT:
Phase 4: Multi-Dimensional Analysis → Phase 5: Stakeholder Validation

STAGE 4 - PLANNING:
Phase 6: Readiness Report Generation → Handoff Preparation → Transfer to documents.workflows.md
```

---

## Phase 1: Client Context Discovery & Input Inventory

**Objective:** Catalog all available client inputs and establish initial understanding

**Duration:** 1-2 business days  
**Confidence Target:** 30-50% (initial baseline)

### 1.1 Input Inventory

Scan `/docs/00-assessment/inputs/` for all client-provided materials:

#### Code & Technical Assets
```
/docs/00-assessment/inputs/codebase/
├── repositories/           # Git repos, zip archives, source code
├── architecture/           # Architecture diagrams, ADRs, design docs
├── api-specs/              # OpenAPI, GraphQL schemas, gRPC definitions
├── databases/              # Schema diagrams, ERDs, data dictionaries
└── infrastructure/         # IaC code, deployment configs, cloud resources
```

**Analysis Tasks:**
- [ ] Count repositories and identify technologies (languages, frameworks, platforms)
- [ ] Document architecture patterns (monolith, microservices, serverless, etc.)
- [ ] Inventory APIs and integration points
- [ ] Identify data stores and schemas
- [ ] Catalog infrastructure components

**Output:** `inventory-technical.md` with technology stack summary

---

#### Documentation & Knowledge Base
```
/docs/00-assessment/inputs/documentation/
├── confluence-export/      # Exported Confluence spaces
├── sharepoint/             # SharePoint document exports
├── wiki/                   # Internal wiki content
├── runbooks/               # Operational procedures, playbooks
└── training-materials/     # Onboarding docs, training guides
```

**Analysis Tasks:**
- [ ] Extract Architecture Decision Records (ADRs)
- [ ] Identify API documentation and specifications
- [ ] Catalog process documentation (SDLC, deployment, incident response)
- [ ] Map knowledge gaps and undocumented areas

**Output:** `inventory-documentation.md` with coverage analysis

---

#### Project Management & Requirements
```
/docs/00-assessment/inputs/project-management/
├── jira-export/            # Jira issues, epics, stories
├── azure-devops/           # ADO work items, backlogs
├── github-issues/          # GitHub issues, discussions
├── roadmaps/               # Product roadmaps, strategic plans
└── requirements/           # PRDs, user stories, functional specs
```

**Analysis Tasks:**
- [ ] Map current initiatives and priorities
- [ ] Identify technical debt items
- [ ] Extract feature requests and backlog
- [ ] Understand sprint velocity and delivery cadence

**Output:** `inventory-requirements.md` with backlog analysis

---

#### Design & UX Assets
```
/docs/00-assessment/inputs/design/
├── figma-exports/          # Figma designs, prototypes
├── miro-boards/            # Miro architecture diagrams, user journeys
├── lucidchart/             # System diagrams, flowcharts
└── mockups/                # Design mockups, wireframes
```

**Analysis Tasks:**
- [ ] Catalog design systems and component libraries
- [ ] Extract user flows and journey maps
- [ ] Identify UX patterns and conventions

**Output:** `inventory-design.md` with design maturity assessment

---

#### Operational Data & Metrics
```
/docs/00-assessment/inputs/operations/
├── monitoring/             # Dashboards, alerts, SLOs
├── logs/                   # Application logs, error reports
├── metrics/                # Performance metrics, KPIs
├── incidents/              # Incident reports, postmortems
└── security/               # Vulnerability scans, audit reports
```

**Analysis Tasks:**
- [ ] Extract key performance indicators (KPIs)
- [ ] Analyze incident patterns and resolution times
- [ ] Document SLAs/SLOs and compliance status

**Output:** `inventory-operations.md` with operational maturity

---

#### Interview & Meeting Notes
```
/docs/00-assessment/inputs/interviews/
├── stakeholder-interviews/ # Interview transcripts, notes
├── meeting-minutes/        # Meeting notes, CRs
├── surveys/                # Developer surveys, feedback
└── retex/                  # Retrospectives, lessons learned
```

**Analysis Tasks:**
- [ ] Extract pain points and blockers
- [ ] Identify cultural and organizational challenges
- [ ] Document success criteria and expectations

**Output:** `inventory-stakeholder.md` with sentiment analysis

---

### 1.2 Rapid Assessment (Initial Baseline)

Based on available inputs, conduct quick assessment:

**Technology Landscape:**
- Programming languages and frameworks
- Cloud platforms and infrastructure
- Data persistence and messaging
- CI/CD and deployment tooling

**Team & Process:**
- Team size and structure
- SDLC methodology (Agile, Waterfall, hybrid)
- DevOps maturity
- Quality assurance approach

**Current Challenges:**
- Technical debt hotspots
- Performance bottlenecks
- Security vulnerabilities
- Scalability constraints

**Output:** `baseline-assessment.md` (preliminary findings with low confidence ratings)

---

## Phase 2: Prerequisites Request Generation

**Objective:** Identify missing access and generate formal prerequisites request

**Duration:** 1 business day  
**Template:** `prerequisites-tmpl.yml`

### 2.1 Gap Analysis

Compare available inputs against ideal assessment requirements:

**Documentation Systems:**
- [ ] Confluence/SharePoint access needed?
- [ ] Wiki or knowledge base missing?
- [ ] Architecture diagrams incomplete?

**Issue Tracking:**
- [ ] Jira/ADO API access required?
- [ ] GitHub/GitLab access needed?
- [ ] Backlog visibility gaps?

**Code Repositories:**
- [ ] Repository access missing?
- [ ] CI/CD pipeline access needed?
- [ ] Deployment logs unavailable?

**Architecture & Design:**
- [ ] Miro/Figma access required?
- [ ] System diagrams missing?
- [ ] Integration documentation incomplete?

**APIs & Integration:**
- [ ] OpenAPI specs missing?
- [ ] API registry access needed?
- [ ] Third-party integration docs unavailable?

**Operational Data:**
- [ ] Monitoring dashboards inaccessible?
- [ ] Log analysis tools access needed?
- [ ] Incident reports incomplete?

**Output:** Gap analysis matrix with priority levels

---

### 2.2 Generate Prerequisites Report

**Create:** `/docs/00-assessment/prerequisites-request.yml`

**Using:** `prerequisites-tmpl.yml`

**Required Sections:**
1. **Assessment Metadata** - Project name, org, assessment team, stakeholders
2. **Executive Summary** - Current readiness score, blockers, risks
3. **Prerequisites Configuration** - Detailed access requirements by category
4. **Security & Compliance Framework** - PAT management, data governance
5. **Tracking & Status** - Prerequisites checklist with readiness percentages
6. **Blockers & Escalation** - Critical blockers and escalation contacts
7. **Timeline** - Phased rollout plan for access provisioning
8. **Best Practices** - Discovery checklist, pro tips, project type examples

**Key Customizations:**
- Discovery checklist (Step 1) → Map to actual client systems
- System table (Step 2) → Prioritize by assessment impact
- Project type selection → Match to client scenario (SaaS, Enterprise, Microservices, Regulated)
- Timeline estimate → Based on client organization complexity

**Deliverable:** Professional YAML prerequisites request + Markdown export for stakeholder email

---

### 2.3 Stakeholder Communication

**Generate Email:** From YAML template (Format A: Professional Tone)

**Subject:** `[AI ASSESSMENT] Access Requirements for Transformation Readiness Evaluation`

**Recipients:**
- Primary stakeholder (from assessment metadata)
- IT/Security approver (if applicable)
- Project sponsor

**Attachments:**
- `prerequisites-request.yml`
- `prerequisites-request.md` (human-readable export)
- `baseline-assessment.md` (preliminary findings)

**Follow-up Actions:**
- Schedule access provisioning check-in (weekly)
- Track prerequisites fulfillment in YAML status fields
- Escalate blockers per escalation matrix

---

## Phase 3: Access Validation & Prerequisites Tracking

**Objective:** Monitor access provisioning and validate system availability

**Duration:** 5-15 business days (varies by organization)  
**Confidence Target:** 60-70% (with validated access)

### 3.1 Prerequisites Tracking

**Update:** `/docs/00-assessment/prerequisites-request.yml` (tracking section)

**Weekly Check-ins:**
- Review prerequisites status (REQUESTED → GRANTED)
- Update readiness percentage
- Document blockers and escalations

**Validation Tasks:**
- [ ] Test Confluence/SharePoint access → Extract sample ADRs
- [ ] Validate Jira/ADO API → Query sample issues
- [ ] Confirm code repository access → Clone repos and analyze
- [ ] Verify Miro/Figma access → Export diagrams
- [ ] Check API registry access → Download OpenAPI specs
- [ ] Test monitoring dashboards → Extract metrics

**Output:** Updated YAML with real-time status + `access-validation-report.md`

---

### 3.2 Compliance & Security Review

**Security Validation:**
- [ ] PAT (Personal Access Token) rotation schedule documented
- [ ] Token storage security confirmed (vault, secrets manager)
- [ ] Minimum scope principle applied to all access
- [ ] Data governance acknowledgment signed

**Compliance Validation:**
- [ ] Applicable frameworks identified (GDPR, SOC2, HIPAA, ISO 27001)
- [ ] Data classification understood (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
- [ ] Retention policies documented
- [ ] Audit trail requirements confirmed

**Output:** `compliance-clearance.md` with sign-off status

---

### 3.3 Context Enrichment

With validated access, enrich initial baseline:

**Re-scan with full access:**
- Re-run Phase 1 inventory with complete access
- Extract metrics from monitoring dashboards
- Analyze backlog from Jira/ADO API
- Review incident history from operational logs
- Cross-reference documentation with code

**Confidence Boost:**
- Update baseline assessment confidence from 30-50% → 60-70%
- Replace assumptions with verified data
- Document evidence sources for each finding

**Output:** `enriched-baseline.md` (updated with validated data)

---

## Phase 4: Multi-Dimensional Assessment

**Objective:** Deep analysis across 8 assessment dimensions

**Duration:** 5-10 business days  
**Confidence Target:** 80-90% (comprehensive analysis)

### 4.1 Assessment Framework

Evaluate client maturity across **8 core dimensions**:

1. **Documentation Quality & Coverage**
2. **Governance & Compliance**
3. **Architecture & Technical Design**
4. **Ways of Working (SDLC, DevOps, Team Practices)**
5. **Compliance & Security Posture**
6. **Tooling, Observability & Testing**
7. **Product Management & Performance**
8. **AI Context & AI-First Readiness**

**Scoring System:**
- **0.0 - 1.0:** Critical gaps, foundational work required
- **1.0 - 2.0:** Developing capabilities, improvement opportunities
- **2.0 - 3.0:** Strong maturity, optimization and scaling potential

**Confidence Rating (⭐ 1-5):**
- ⭐⭐⭐⭐⭐ (90-100%): Direct observation, verified data
- ⭐⭐⭐⭐ (70-89%): Strong evidence, minor assumptions
- ⭐⭐⭐ (50-69%): Partial evidence, reasonable inferences
- ⭐⭐ (30-49%): Limited evidence, significant assumptions
- ⭐ (<30%): Speculation, requires validation

---

### 4.2 Dimension 1: Documentation Quality & Coverage

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **Architecture Documentation** | ADRs, C4 models, diagrams completeness | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **API Documentation** | OpenAPI specs, integration guides, examples | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Process Documentation** | Runbooks, playbooks, deployment guides | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Code Documentation** | Inline comments, README quality, docstrings | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **Onboarding Materials** | Developer guides, training content | 0.0-3.0 | ⭐⭐⭐ |

**Evidence Collection:**
- [ ] Inventory ADRs and assess decision traceability
- [ ] Review API documentation against actual endpoints
- [ ] Validate runbooks against deployment processes
- [ ] Analyze code comment density and quality
- [ ] Test onboarding materials with new developer scenario

**Key Questions:**
- Is architecture well-documented and up-to-date?
- Can new developers onboard without tribal knowledge?
- Are APIs self-documenting or require expert explanation?
- Do runbooks reflect actual operational practices?

**Output:** Documentation maturity score (0.0-3.0) + confidence + evidence table

---

### 4.3 Dimension 2: Governance & Compliance

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **Version Control Practices** | Branching strategy, commit quality, PR reviews | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **Access Control** | RBAC, least privilege, audit trails | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Regulatory Compliance** | GDPR, HIPAA, SOC2, ISO 27001 adherence | 0.0-3.0 | ⭐⭐⭐ |
| **Data Governance** | Classification, retention, privacy controls | 0.0-3.0 | ⭐⭐⭐ |
| **Change Management** | Approval workflows, release gates | 0.0-3.0 | ⭐⭐⭐⭐ |

**Evidence Collection:**
- [ ] Analyze Git history for commit patterns and quality
- [ ] Review RBAC configurations and access logs
- [ ] Validate compliance certifications and audit reports
- [ ] Assess data classification policies and enforcement
- [ ] Document change approval workflows

**Key Questions:**
- Is source control discipline enforced?
- Are access controls auditable and least-privileged?
- Is regulatory compliance verified and maintained?
- Are data privacy requirements met?

**Output:** Governance maturity score (0.0-3.0) + compliance gap analysis

---

### 4.4 Dimension 3: Architecture & Technical Design

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **System Architecture** | Modularity, scalability, resilience patterns | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Integration Patterns** | API design, event-driven, message queues | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Data Architecture** | Schema design, data modeling, consistency | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Cloud-Native Readiness** | Containerization, orchestration, cloud services | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **Technical Debt** | Debt tracking, refactoring discipline | 0.0-3.0 | ⭐⭐⭐⭐ |

**Evidence Collection:**
- [ ] Diagram system architecture and identify patterns
- [ ] Analyze API design quality (REST, GraphQL, gRPC)
- [ ] Review database schemas and normalization
- [ ] Assess containerization and cloud adoption
- [ ] Track technical debt items in backlog

**Key Questions:**
- Is architecture scalable and maintainable?
- Are integration points well-designed and documented?
- Is data modeling consistent and normalized?
- Is the system cloud-ready or cloud-native?

**Output:** Architecture maturity score (0.0-3.0) + technical debt inventory

---

### 4.5 Dimension 4: Ways of Working

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **SDLC Methodology** | Agile maturity, sprint discipline, retrospectives | 0.0-3.0 | ⭐⭐⭐⭐ |
| **DevOps Practices** | CI/CD automation, IaC, deployment frequency | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **Collaboration Tools** | Slack, Teams, async communication patterns | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Code Review Culture** | PR quality, review thoroughness, feedback loops | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **Knowledge Sharing** | Documentation culture, pair programming, demos | 0.0-3.0 | ⭐⭐⭐ |

**Evidence Collection:**
- [ ] Review sprint boards and velocity metrics
- [ ] Analyze CI/CD pipeline effectiveness (build times, failure rates)
- [ ] Assess collaboration tool usage patterns
- [ ] Evaluate PR review thoroughness and turnaround times
- [ ] Document knowledge sharing practices

**Key Questions:**
- Is the team Agile-native or Agile-compliant?
- Is CI/CD fully automated or manual steps remain?
- Do code reviews add value or just gatekeep?
- Is knowledge distributed or siloed?

**Output:** Ways of working maturity score (0.0-3.0) + process optimization opportunities

---

### 4.6 Dimension 5: Compliance & Security Posture

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **Security Scanning** | SAST, DAST, dependency scanning automation | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Vulnerability Management** | CVE tracking, patch cadence, remediation SLAs | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Secrets Management** | Vault usage, rotation policies, leak prevention | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Authentication & Authorization** | OAuth/OIDC, RBAC, MFA enforcement | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Incident Response** | Security playbooks, breach detection, recovery plans | 0.0-3.0 | ⭐⭐⭐ |

**Evidence Collection:**
- [ ] Review security scan reports and remediation rates
- [ ] Track CVE response times and patch compliance
- [ ] Validate secrets management practices
- [ ] Assess auth/authz implementation quality
- [ ] Test incident response readiness

**Key Questions:**
- Are security scans automated and enforced?
- Is vulnerability remediation timely and tracked?
- Are secrets never committed to repos?
- Is authentication modern and MFA-enforced?

**Output:** Security maturity score (0.0-3.0) + vulnerability inventory

---

### 4.7 Dimension 6: Tooling, Observability & Testing

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **Testing Strategy** | Unit, integration, E2E coverage and quality | 0.0-3.0 | ⭐⭐⭐⭐⭐ |
| **Observability** | Metrics, logs, traces, dashboards, alerts | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Monitoring & Alerting** | SLO tracking, proactive alerts, on-call runbooks | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Developer Experience** | Local dev setup, debugging tools, IDE quality | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Performance Testing** | Load testing, profiling, optimization cadence | 0.0-3.0 | ⭐⭐⭐ |

**Evidence Collection:**
- [ ] Analyze test coverage metrics (unit, integration, E2E)
- [ ] Review observability stack (Prometheus, Grafana, ELK, etc.)
- [ ] Validate alert quality (signal vs noise ratio)
- [ ] Test developer onboarding experience
- [ ] Assess performance testing practices

**Key Questions:**
- Is test coverage comprehensive and maintained?
- Are systems observable with metrics, logs, and traces?
- Do alerts fire before users notice issues?
- Can developers debug production issues efficiently?

**Output:** Tooling maturity score (0.0-3.0) + observability gap analysis

---

### 4.8 Dimension 7: Product Management & Performance

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **Roadmap Clarity** | Strategic vision, prioritization, stakeholder alignment | 0.0-3.0 | ⭐⭐⭐ |
| **User Story Quality** | Acceptance criteria, testability, value clarity | 0.0-3.0 | ⭐⭐⭐⭐ |
| **Velocity & Predictability** | Sprint completion rates, estimation accuracy | 0.0-3.0 | ⭐⭐⭐⭐ |
| **KPI Tracking** | Business metrics, SLAs, user satisfaction | 0.0-3.0 | ⭐⭐⭐ |
| **Feedback Loops** | User research, A/B testing, data-driven decisions | 0.0-3.0 | ⭐⭐⭐ |

**Evidence Collection:**
- [ ] Review product roadmap and strategic initiatives
- [ ] Analyze user story quality in backlog
- [ ] Calculate sprint velocity and predictability
- [ ] Document tracked KPIs and dashboards
- [ ] Assess feedback loop mechanisms

**Key Questions:**
- Is the roadmap aligned with business strategy?
- Are user stories well-crafted and testable?
- Is velocity predictable and improving?
- Are success metrics defined and tracked?

**Output:** Product management maturity score (0.0-3.0) + KPI dashboard

---

### 4.9 Dimension 8: AI Context & AI-First Readiness

**Assessment Criteria:**

| Aspect | Evaluation | Score | Confidence |
|--------|------------|-------|------------|
| **AI Awareness** | Team understanding of AI capabilities and limitations | 0.0-3.0 | ⭐⭐⭐ |
| **Prompt Engineering** | Quality of prompts, context design, output validation | 0.0-3.0 | ⭐⭐⭐ |
| **AI Tooling Adoption** | GitHub Copilot, AI code review, automated testing | 0.0-3.0 | ⭐⭐⭐⭐ |
| **AI Context Quality** | Documentation, code clarity, semantic search readiness | 0.0-3.0 | ⭐⭐⭐⭐ |
| **AI Safety & Governance** | Bias detection, output validation, human-in-loop | 0.0-3.0 | ⭐⭐ |

**Evidence Collection:**
- [ ] Survey team on AI tool usage and understanding
- [ ] Assess code quality for AI comprehension (clarity, naming, documentation)
- [ ] Review AI tool adoption rates (Copilot, AI assistants)
- [ ] Evaluate context quality for RAG and semantic search
- [ ] Document AI safety practices and governance

**Key Questions:**
- Does the team leverage AI assistants effectively?
- Is code written to be AI-readable and contextual?
- Are AI outputs validated and not blindly trusted?
- Is there governance around AI tool usage?

**Output:** AI readiness score (0.0-3.0) + transformation opportunity matrix

---

### 4.10 Consolidate Multi-Dimensional Scores

**Create:** `/docs/00-assessment/multi-dimensional-assessment.md`

**Assessment Summary Table:**

| Dimension | Score (0-3.0) | Confidence | Key Strengths | Critical Gaps | Priority |
|-----------|---------------|------------|---------------|---------------|----------|
| Documentation | {{ X.X }} | ⭐⭐⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| Governance | {{ X.X }} | ⭐⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| Architecture | {{ X.X }} | ⭐⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| Ways of Working | {{ X.X }} | ⭐⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| Security | {{ X.X }} | ⭐⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| Tooling/Testing | {{ X.X }} | ⭐⭐⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| Product Mgmt | {{ X.X }} | ⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| AI Readiness | {{ X.X }} | ⭐⭐⭐ | {{ Strengths }} | {{ Gaps }} | {{ HIGH/MEDIUM/LOW }} |
| **Overall** | **{{ X.X }}** | **⭐⭐⭐⭐** | {{ Top 3 }} | {{ Top 3 }} | **{{ STRATEGY }}** |

**Output:** Comprehensive multi-dimensional assessment with prioritized transformation opportunities

---

## Phase 5: Stakeholder Validation & Alignment

**Objective:** Validate findings with stakeholders and align on strategic priorities

**Duration:** 2-3 business days  
**Confidence Target:** 90-95% (stakeholder-validated)

### 5.1 Stakeholder Interview Sessions

**Interview Targets:**
- **Executive Sponsor** - Strategic vision, budget, success criteria
- **Engineering Leadership** - Technical challenges, team constraints, priorities
- **Product Leadership** - Roadmap, user needs, business metrics
- **Security/Compliance Officer** - Risk tolerance, compliance requirements
- **DevOps/Platform Team** - Infrastructure constraints, tooling gaps
- **Developer Representatives** - Pain points, tooling needs, process friction

**Interview Template:**

**Opening:**
- Share preliminary assessment findings
- Set expectation for collaborative validation

**Validation Questions:**
- Do these findings align with your experience?
- Are there critical aspects we missed?
- What are your top 3 pain points?
- What would success look like in 6 months?

**Prioritization Exercise:**
- Rank transformation opportunities by impact vs effort
- Identify quick wins (high impact, low effort)
- Document dependencies and constraints

**Closing:**
- Confirm strategic priorities
- Align on success metrics
- Set expectations for recommendations

**Output:** `/docs/00-assessment/interviews/` folder with stakeholder validation notes

---

### 5.2 Findings Validation Workshop

**Format:** 2-hour collaborative session

**Agenda:**
1. **Assessment Overview** (15 min) - Present 8-dimension scores
2. **Strengths Validation** (20 min) - Confirm top capabilities
3. **Gaps Prioritization** (30 min) - Collaborative ranking of critical gaps
4. **Opportunity Scoring** (30 min) - Impact vs Effort matrix exercise
5. **Success Metrics Alignment** (15 min) - Define measurable outcomes
6. **Next Steps** (10 min) - Timeline for recommendations and handoff

**Deliverables:**
- Validated assessment scores (confidence → 90-95%)
- Prioritized transformation roadmap (draft)
- Agreed-upon success metrics

**Output:** `validation-workshop-summary.md` with consensus findings

---

## Phase 6: AI Readiness Report Generation & Handoff

**Objective:** Generate comprehensive AI readiness report and prepare handoff to documentation phase

**Duration:** 3-5 business days  
**Template:** `recommendation-plan-tmpl.md`

### 6.1 Generate AI Readiness Report

**Create:** `/docs/00-assessment/ai-readiness-report.md`

**Using:** `recommendation-plan-tmpl.md` structure

**Required Sections:**

#### Executive Summary
- **Global Assessment Maturity:** {{ X.X }}/3.0 ({{ Maturity Level }}) | Confidence: {{ XX }}%
- **Assessment Period:** {{ Start Date }} - {{ End Date }}
- **Assessment Team:** {{ Team members and roles }}
- **Strategic Recommendation:** {{ Recommended transformation approach }}
- **Key Investment Priorities:**
  - Phase 1 (0-6 months): {{ Investment level in priority areas }}
  - Phase 2 (6-12 months): {{ Investment level in priority areas }}
  - Phase 3 (12-18+ months): {{ Investment level in priority areas }}
- **Business Impact Projection:**
  - Productivity Gains: {{ XX% }} through {{ enablers }}
  - Quality Improvements: {{ XX% }} through {{ enablers }}
  - Risk Mitigation: {{ XX% }} through {{ enablers }}
  - Innovation Capacity: {{ XX% }} through {{ enablers }}
- **Major Assumptions:** {{ 6 key assumptions with dependencies and validation requirements }}

---

#### Current Situation Synthesis

**Global Maturity Overview:**

| Dimension | Current Maturity | Key Strengths | Critical Gaps | Strategic Priority |
|-----------|------------------|---------------|---------------|-------------------|
| Documentation | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| Governance | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| Architecture | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| Ways of Working | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| Security | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| Tooling/Testing | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| Product Mgmt | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| AI Readiness | {{ X.X }}/3.0 | {{ Top 3 strengths }} | {{ Top 2 gaps }} | {{ Priority level + focus }} |
| **Average** | **{{ X.X }}/3.0** | {{ Common strengths }} | {{ Common gaps }} | **{{ Overall approach }}** |

**8-Dimension Comparative Analysis:**

| Dimension | Score | Icon | Analysis |
|-----------|-------|------|----------|
| Documentation | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| Governance | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| Architecture | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| Ways of Working | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| Security | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| Tooling/Testing | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| Product Mgmt | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |
| AI Readiness | {{ X.X }} | {{ 🟢/🟡/🔴 }} | {{ Key insight }} |

**Legend:** 🟢 Strong (2.0+) | 🟡 Developing (1.5-1.9) | 🔴 Critical Gap (<1.5)

**Cross-Dimension Patterns & Dependencies:**
- Common Strengths: {{ Top 4 strengths across dimensions }}
- Critical Gaps: {{ Top 4 gaps across dimensions }}
- Strategic Dependencies: {{ Key dependencies between dimensions }}

---

#### Transformation Roadmap

**Phase 1: Foundation (0-6 months)**

| Initiative | Dimension | Impact | Effort | Timeline | Success Metrics |
|------------|-----------|--------|--------|----------|-----------------|
| {{ Initiative 1 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |
| {{ Initiative 2 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |
| {{ Initiative 3 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |

**Expected Outcomes:**
- {{ Outcome 1 with metric }}
- {{ Outcome 2 with metric }}
- {{ Outcome 3 with metric }}

**Phase 2: Scaling (6-12 months)**

| Initiative | Dimension | Impact | Effort | Timeline | Success Metrics |
|------------|-----------|--------|--------|----------|-----------------|
| {{ Initiative 1 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |
| {{ Initiative 2 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |

**Expected Outcomes:**
- {{ Outcome 1 with metric }}
- {{ Outcome 2 with metric }}

**Phase 3: Optimization (12-18+ months)**

| Initiative | Dimension | Impact | Effort | Timeline | Success Metrics |
|------------|-----------|--------|--------|----------|-----------------|
| {{ Initiative 1 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |
| {{ Initiative 2 }} | {{ Dimension }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Weeks }} | {{ KPIs }} |

**Expected Outcomes:**
- {{ Outcome 1 with metric }}
- {{ Outcome 2 with metric }}

---

#### Strategic Recommendations

**Immediate Actions (Next 30 days):**
1. {{ Action 1 }} - Owner: {{ Name }}, Target: {{ Date }}
2. {{ Action 2 }} - Owner: {{ Name }}, Target: {{ Date }}
3. {{ Action 3 }} - Owner: {{ Name }}, Target: {{ Date }}

**Short-Term Priorities (3-6 months):**
1. {{ Priority 1 with rationale }}
2. {{ Priority 2 with rationale }}
3. {{ Priority 3 with rationale }}

**Long-Term Vision (12-18 months):**
{{ Strategic vision statement for AI transformation outcomes }}

---

#### Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy | Owner |
|------|------------|--------|---------------------|-------|
| {{ Risk 1 }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Strategy }} | {{ Owner }} |
| {{ Risk 2 }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Strategy }} | {{ Owner }} |
| {{ Risk 3 }} | {{ HIGH/MEDIUM/LOW }} | {{ HIGH/MEDIUM/LOW }} | {{ Strategy }} | {{ Owner }} |

---

#### Success Metrics & KPIs

**North Star Metrics:**
- {{ Metric 1 }}: Baseline {{ X }}, Target {{ Y }}, Timeframe {{ Z months }}
- {{ Metric 2 }}: Baseline {{ X }}, Target {{ Y }}, Timeframe {{ Z months }}
- {{ Metric 3 }}: Baseline {{ X }}, Target {{ Y }}, Timeframe {{ Z months }}

**Leading Indicators:**
- {{ Indicator 1 with measurement approach }}
- {{ Indicator 2 with measurement approach }}
- {{ Indicator 3 with measurement approach }}

**Lagging Indicators:**
- {{ Indicator 1 with measurement approach }}
- {{ Indicator 2 with measurement approach }}

---

#### Appendices

**Appendix A: Detailed Dimension Analysis**
- Per-dimension deep-dive with evidence tables

**Appendix B: Stakeholder Interview Summary**
- Key insights from validation sessions

**Appendix C: Prerequisites Fulfillment Status**
- Final status of access requests and blockers

**Appendix D: Technology Inventory**
- Complete stack with versions and dependencies

**Appendix E: Reference Materials**
- Links to source documents and data sources

---

**Deliverable:** Comprehensive AI readiness report (~100-150 pages) with executive summary, detailed analysis, and actionable roadmap

---

### 6.2 Prepare Handoff Package

**Create:** `/docs/00-assessment/handoff-package/`

**Included Artifacts:**

#### 1. Assessment Summary
```
/docs/00-assessment/handoff-package/
├── ai-readiness-report.md              # Full assessment report
├── executive-summary.md                # 2-page executive brief
├── prerequisites-fulfillment.yml       # Final access status
└── multi-dimensional-assessment.md     # 8-dimension scores
```

#### 2. Documentation Foundation
```
/docs/00-assessment/handoff-package/
├── technology-inventory.md         # Complete tech stack
├── architecture-overview.md        # System architecture summary
├── integration-map.md              # API and integration points
└── team-structure.md               # Org chart and roles
```

#### 3. Strategic Artifacts
```
/docs/00-assessment/handoff-package/
├── transformation-roadmap.md       # Phased implementation plan
├── success-metrics.md              # KPIs and measurement approach
├── risk-register.md                # Risks and mitigation strategies
└── assumptions-log.md              # Key assumptions and dependencies
```

#### 4. Raw Data & Evidence
```
/docs/00-assessment/handoff-package/raw-data/
├── inventory/                      # All inventory reports
├── interviews/                     # Stakeholder validation notes
├── metrics/                        # Extracted KPIs and dashboards
└── validation/                     # Evidence sources and references
```

#### 5. Handoff Checklist
```markdown
# Assessment → Documentation Phase Handoff

## Prerequisites Verification
- [x] All critical access granted
- [x] Stakeholder validation complete
- [x] Success metrics agreed upon
- [x] Strategic priorities aligned

## Deliverables Confirmation
- [x] AI Readiness Report finalized
- [x] Technology inventory complete
- [x] Architecture documented
- [x] Roadmap approved by sponsor

## Documentation Phase Readiness
- [ ] PRD scope defined
- [ ] User stories backlog prioritized
- [ ] Technical constraints documented
- [ ] Success criteria established

## Handoff Meeting Scheduled
- **Date:** {{ Date }}
- **Attendees:** {{ Assessment team + Documentation team }}
- **Agenda:** Transfer context, review findings, align on next steps
```

---

### 6.3 Handoff to Documentation Phase

**Handoff Meeting (2 hours):**

**Agenda:**
1. **Assessment Overview** (15 min) - Present key findings and maturity scores
2. **Strategic Priorities** (20 min) - Review transformation roadmap and phases
3. **Technology Context** (20 min) - Deep-dive on tech stack and architecture
4. **User Stories Seed** (30 min) - Identify initial epics and user stories for PRD
5. **Success Criteria** (15 min) - Align on KPIs and measurement approach
6. **Q&A & Context Transfer** (20 min) - Address questions and knowledge gaps

**Documentation Phase Inputs:**
- AI Readiness Report → Informs PRD strategic vision
- Transformation Roadmap → Seeds epic and user story backlog
- Technology Inventory → Defines technical constraints and architecture
- Success Metrics → Establishes acceptance criteria and KPIs
- Stakeholder Interviews → Captures user needs and pain points

**Handoff Artifact:** `assessment-to-documentation-handoff.md`

**Next Steps:**
1. Documentation team accepts handoff and reviews artifacts
2. PRD workflow initiated per phase-specific workflows (01-requirements → 02-architecture → 03-testing → 04-planning)
3. Assessment team remains available for clarification during PRD phase
4. After PRD completion, handoff to implementation phase per `05-implementation.workflows.md`

---

## Key Outputs Summary

| Output | Template | Location | Purpose |
|--------|----------|----------|---------|
| **Prerequisites Request** | `prerequisites-tmpl.yml` | `/docs/00-assessment/prerequisites-request.yml` | Formal access request to client |
| **Baseline Assessment** | Custom | `/docs/00-assessment/baseline-assessment.md` | Initial findings from available inputs |
| **Multi-Dimensional Assessment** | Custom | `/docs/00-assessment/multi-dimensional-assessment.md` | 8-dimension maturity scores |
| **AI Readiness Report** | `recommendation-plan-tmpl.md` | `/docs/00-assessment/ai-readiness-report.md` | Comprehensive transformation strategy |
| **Handoff Package** | Custom | `/docs/00-assessment/handoff-package/` | Complete context for documentation phase |
| **Stakeholder Validation** | Custom | `/docs/00-assessment/interviews/` | Validation notes and workshop summaries |

---

## 📋 Agent Logging Requirements (MANDATORY)

**⚠️ UNBREAKABLE RULE: ALL agent interactions during assessment phase MUST be logged.**

### Logging Locations for Assessment Phase

**All agents working in assessment phase log to**: `/logs/00-assessment/agent-{name}-YYYYMMDD.md`

### Agents Required to Log

| Agent | Primary Activities | Log Path |
|-------|-------------------|----------|
| **orchestrator** | Workflow coordination, decision gates | `/logs/00-assessment/agent-orchestrator-YYYYMMDD.md` |
| **ba** | Input analysis, maturity assessment | `/logs/00-assessment/agent-ba-YYYYMMDD.md` |
| **architect** | Technical inventory, architecture analysis | `/logs/00-assessment/agent-architect-YYYYMMDD.md` |
| **ai-engineering** | AI capability assessment, model recommendations | `/logs/00-assessment/agent-ai-engineering-YYYYMMDD.md` |
| **pm** | Prerequisites tracking, timeline planning | `/logs/00-assessment/agent-pm-YYYYMMDD.md` |

### Mandatory Logging Points

**Phase 1-2: Context Discovery**
- Log input inventory results
- Log prerequisites generation
- Log baseline assessment findings

**Phase 3: Prerequisites Fulfillment**
- Log access request tracking
- Log fulfillment status updates
- Log blockers and escalations

**Phase 4-5: Deep Assessment**
- Log multi-dimensional scoring
- Log stakeholder interview findings
- Log confidence ratings and evidence

**Phase 6: Strategic Planning**
- Log readiness report generation
- Log roadmap creation
- Log handoff artifact preparation

### Log Entry Template

```markdown
## {TIMESTAMP} | Action: {DESCRIPTION} | Status: {success|failure|partial|blocked}

### Context
- **Phase**: ASSESSMENT
- **Stage**: {1|2|3|4}
- **Dimension**: {dimension_name} (if applicable)

### Action Details
- **Action Type**: {read|write|analyze|coordinate}
- **Files Touched**: [{files}]
- **Tools Used**: [{tools}]
- **PRU Consumed**: ~{estimate}

### Outcome
- **Status**: {status}
- **Changes Made**: {description}
- **Confidence**: {percentage}%
- **Evidence**: {artifact_paths}
- **Blockers**: {None | description}
- **Rationale**: {why}

### Handoff
- **Next Step**: {awaiting|handoff_to_agent|continue|complete}
- **Next Agent**: {agent_name}
- **Handoff Artifact**: {path}
- **Instructions**: {guidance}

---
```

### Validation Enforcement

**Orchestrator validates logs before**:
- Each phase transition (1→2, 2→3, etc.)
- Prerequisites fulfillment sign-off
- Readiness report approval
- Handoff to documents workflow

**Missing logs = assessment incomplete** (cannot proceed to next phase)

**Full Documentation**: See `.github/instructions/agent-logging.instructions.md` for comprehensive standards.

---

## Post-Assessment Routing Framework

After assessment completion, the orchestrator selects the optimal documentation workflow based on client maturity tier and available inputs.

### Client Maturity Tier Classification

| Tier | Profile | Documentation Quality | Best Workflow | Timeline |
|------|---------|----------------------|---------------|----------|
| **🟢 Tier 1** | Documentation-rich client | Comprehensive PRD, clear stories, recent architecture | **Traditional** (Phases 1-7 sequential) | 15-25 days |
| **🟡 Tier 2** | Partial documentation client | Some docs exist, mixed quality epics, partial architecture | **Hybrid** (use available + targeted extraction) | 20-35 days |
| **🔴 Tier 3** | Sparse documentation client | Minimal docs, project tool epics only, tribal knowledge | **Extraction-heavy** (epic mining + interviews) | 25-40 days |
| **⚫ Tier 4** | Legacy/discovery client | No formal docs, basic epics, legacy codebase only | **Reverse engineering** (code analysis + interviews) | 30-50 days |

### Routing Decision Matrix

Based on assessment findings:

**Route A: Traditional PDLC (Tier 1)**
- ✅ Comprehensive requirements documentation
- ✅ Clear user stories with acceptance criteria
- ✅ Recent architecture diagrams and technical specifications
- **Next Workflow**: `.github/workflows/01-requirements.workflows.md` (validation focus)

**Route B: Functional Extraction (Tier 2-3)**
- ✅ Jira/ADO epics and user stories available
- ✅ Mixed documentation quality with gaps
- ⚠️ Lacks comprehensive PRD structure
- **Next Workflow**: `.github/workflows/01-requirements.workflows.md` (Route B extraction approach)

**Route C: Interview-Driven (Tier 3-4)**
- ⚠️ Minimal documentation, tribal knowledge
- ⚠️ Sparse epics in project management tools
- ⚠️ Requires comprehensive stakeholder discovery
- **Next Workflow**: `.github/workflows/01-requirements.workflows.md` (Route C interview-driven approach)

**Route D: Hybrid Assembly (Mixed Scenarios)**
- ⚠️ Mixed input quality across different areas
- ✅ Some strong documentation, significant gaps
- ⚠️ Requires adaptive multi-source approach
- **Next Workflow**: `.github/workflows/01-requirements.workflows.md` (Route D hybrid strategies)

### Decision Tree

```
Assessment Complete with Maturity Tier?
├─ Tier 1 (80-100% documentation quality)
│  └─ Route A: Traditional → 01-requirements.workflows.md (validation focus)
│
├─ Tier 2 (60-79% documentation quality)
│  └─ Route B: Functional Extraction → 01-requirements.workflows.md (extract epics/stories)
│
├─ Tier 3 (40-59% documentation quality)
│  └─ Route C: Interview-Driven → 01-requirements.workflows.md (stakeholder discovery)
│
└─ Tier 4 (<40% documentation quality OR mixed inputs)
   └─ Route D: Hybrid Assembly → 01-requirements.workflows.md (adaptive approach)
```

### Orchestrator Routing Action

**After assessment approval**, orchestrator:
1. **Classifies** client maturity tier (1-4) based on assessment findings
2. **Selects** optimal route (A/B/C/D) using decision matrix
3. **Documents** routing rationale in `.github/checkpoint.yaml`
4. **Activates** `.github/workflows/01-requirements.workflows.md` with route-specific instructions
5. **Hands off** assessment artifacts to PO/BA for requirements phase

**Checkpoint Update Example:**
```yaml
project_state:
  current_phase: "01-requirements"
  route_selected: "B"  # Functional Extraction
  maturity_tier: 2
  routing_rationale: "Client has 67 Jira epics with good descriptions but lacks comprehensive PRD. Route B extracts and organizes by functional themes."
  last_gate_passed: "gate-00-assessment"
```

**Note**: All routes converge through the same phase-specific workflows (01→02→03→04→05). The route determines the **approach and emphasis** within each phase, not separate workflow files.

---

## Success Criteria

Assessment workflow is complete when:

✅ **Prerequisites Fulfilled:**
- 90%+ of critical access requests granted
- Compliance and security clearances obtained
- PAT rotation policies documented

✅ **Assessment Complete:**
- All 8 dimensions evaluated with 80%+ confidence
- Stakeholder validation completed
- Findings aligned with team experience

✅ **Strategic Clarity:**
- Transformation roadmap prioritized and approved
- Success metrics defined and measurable
- Risk mitigation strategies documented

✅ **Handoff Ready:**
- AI Readiness Report finalized and approved
- Handoff package complete with all artifacts
- Documentation team briefed and ready to proceed

---

## Workflow Anti-Patterns

❌ **DON'T:**
- Start assessment without prerequisites request (blind spots guaranteed)
- Skip stakeholder validation (assumptions will be wrong)
- Generate report without confidence ratings (uncertainty hidden)
- Handoff without success metrics (no accountability)
- Proceed to documentation phase with <60% readiness score (setup for failure)

✅ **DO:**
- Request access early and track fulfillment proactively
- Validate findings with stakeholders throughout
- Document confidence levels and evidence sources
- Define measurable success criteria upfront
- Ensure readiness before advancing to next phase

---

## Timeline Estimates by Project Type

| Project Type | Prerequisites | Assessment | Stakeholder Validation | Report Generation | Total Duration |
|--------------|---------------|------------|------------------------|-------------------|----------------|
| **Greenfield (Small)** | 5-7 days | 5-7 days | 2-3 days | 3-5 days | **15-22 days** |
| **Brownfield (Medium)** | 7-10 days | 7-10 days | 3-5 days | 3-5 days | **20-30 days** |
| **Enterprise (Large)** | 10-15 days | 10-15 days | 5-7 days | 5-7 days | **30-44 days** |
| **Regulated Industry** | 15-20 days | 10-15 days | 5-7 days | 5-7 days | **35-49 days** |

**Variables affecting timeline:**
- Organization size and complexity
- Number of systems requiring access
- Compliance approval layers
- Stakeholder availability
- Codebase size and maturity

---

## Continuous Improvement

After each assessment engagement:

**Retrospective (1 hour):**
- What went well?
- What surprised us?
- What would we do differently?
- What templates or processes need updates?

**Template Updates:**
- Refine assessment criteria based on findings
- Update confidence scoring guidance
- Enhance stakeholder validation questions
- Add new project type examples

**Knowledge Capture:**
- Document lessons learned
- Update best practices guide
- Contribute to framework improvement

---

**Status:** Assessment Workflow v1.0 | **Last Updated:** March 16, 2026 | **Owner:** AI Engineering Team
