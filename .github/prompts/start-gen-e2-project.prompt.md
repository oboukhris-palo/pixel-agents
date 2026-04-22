
## Objective
Initialize a new AI-first delivery project by gathering comprehensive requirements, creating structured project architecture, and establishing complete development framework with documentation, infrastructure, and deployment pipelines.

## Context
You are setting up a greenfield AI-first delivery project that requires complete project initialization including infrastructure setup, comprehensive documentation, development workflows, and CI/CD pipelines. This process involves stakeholder consultation and systematic project scaffolding following AI-first delivery methodology.

## Requirements

### Pre-Implementation Consultation
Conduct structured stakeholder interview to gather essential project information:

1. **Project Requirements & Features**:
   - What are the core project requirements and key features?
   - Are there specific compliance, security, or regulatory requirements?
   - What business problem does this project solve?
   - What are the success criteria and key performance indicators?

2. **Infrastructure & Architecture**:
   - Which cloud provider will be used (AWS/Azure/GCP/On-premises)?
   - What is the target architecture pattern (microservices/monolith/serverless)?
   - Infrastructure as Code preference (Terraform/CloudFormation/CDK)?
   - Scalability and performance requirements?

3. **Legacy System Considerations**:
   - Is this a legacy application replatforming project?
   - Are there existing systems requiring integration or data migration?
   - What migration constraints and timeline exist?

4. **Technical Stack Decisions**:
   - API-first or frontend-first development approach?
   - API architecture preference (RESTful/GraphQL/gRPC)?
   - Required programming languages and frameworks?
   - Database and data storage strategy?

### Project Architecture Foundation
Establish comprehensive project structure based on requirements:
## Deliverables

### 1. Comprehensive Project Structure
Create complete directory architecture based on requirements:

```
.
├── README.md                    # Project overview and setup guide
├── scripts/                    # Project management automation
│   ├── manage.sh              # Service management (start/stop/status)
│   ├── setup.sh               # Dependency installation
│   └── init_db.sh             # Database initialization
├── src/                        # Source code generation root
│   ├── backend/               # Backend application components
│   │   └── src/              # Backend source code (API, services, data)
│   └── frontend/              # Frontend application components  
│       └── src/              # Frontend source code (web, mobile)
├── docs/                       # Project documentation
│   ├── features/              # Feature specifications
│   ├── project-overview/      # Project context and goals
│   ├── meeting-transcripts/   # Meeting records
│   ├── index.md              # Documentation index
│   └── CONTRIBUTE.md         # Development guidelines
├── infra/                      # Infrastructure as Code
│   ├── modules/              # Reusable infrastructure modules
│   ├── tf-components/        # Terraform components
│   └── docs/                 # Infrastructure documentation
├── DevOps/                     # CI/CD and deployment
│   ├── pipeline/             # Pipeline configurations
│   └── docs/                 # DevOps documentation
└── services/                   # Serverless functions
    └── functions/             # Function implementations
```

### 2. Core Documentation Suite
- **README.md**: Project description, setup instructions, development workflow
- **docs/index.md**: Master documentation index with navigation
- **docs/CONTRIBUTE.md**: Development guidelines, coding standards, contribution process
- **docs/project-overview/**: Business context, requirements, success criteria
- **docs/features/**: Individual feature documentation (one file per feature)

### 3. Technical Specifications
- **API Documentation**: `src/backend/src/docs/apidoc.yaml` (OpenAPI/Swagger specification)
- **Infrastructure Architecture**: PlantUML diagrams in `infra/docs/`
- **Database Schema**: Data model documentation and migration scripts
- **Security Documentation**: Authentication, authorization, and security best practices

### 4. Development Environment Setup
- **Language-Specific Files**: Package.json, requirements.txt, or equivalent dependency files
- **Environment Configuration**: .env templates, configuration management
- **Version Control**: .gitignore, .gitattributes, initial Git repository setup
- **Code Quality Tools**: Linters, formatters, pre-commit hooks configuration

### 5. Infrastructure and Deployment
- **Infrastructure as Code**: Terraform/CloudFormation files in `infra/` directory
- **CI/CD Pipeline**: GitHub Actions/GitLab CI configurations in `DevOps/pipeline/`
- **Environment Management**: Staging and production environment configurations
- **Monitoring Setup**: Logging, metrics, and alerting infrastructure

### 6. Testing Framework
- **Testing Strategy**: Unit, integration, and E2E testing setup
- **Test Configuration**: Testing frameworks and initial test suites
- **Quality Gates**: Code coverage requirements and quality metrics
- **Automated Testing**: CI/CD integration for automated test execution

### 7. Project Management
- **TODO.md**: Structured task breakdown by domain with ownership assignments
- **Milestone Planning**: Development phases and delivery timelines
- **Risk Assessment**: Technical and business risk identification and mitigation

## Quality Standards

- ✅ All stakeholder questions answered comprehensively before project creation
- ✅ Project structure aligns perfectly with stated requirements and technical stack
- ✅ Infrastructure choices match cloud provider and architecture decisions
- ✅ Documentation follows AI-first delivery methodology standards and conventions
- ✅ Development environment setup is complete, tested, and documented
- ✅ Security best practices integrated throughout project structure
- ✅ CI/CD pipeline configured and ready for immediate use
- ✅ All generated files follow established naming conventions and standards
- ✅ Dependencies properly documented and version-controlled
- ✅ Testing framework operational with initial test coverage

## File Management

### Project Initialization Process
1. **Requirements Gathering**: Complete stakeholder consultation before any file creation
2. **Structure Generation**: Create directory structure based on specific requirements
3. **Documentation Creation**: Generate comprehensive documentation suite
4. **Technical Setup**: Configure development tools, testing, and CI/CD
5. **Infrastructure Provisioning**: Create and test infrastructure configurations
6. **Quality Validation**: Verify all components are properly configured

### Naming and Organization Standards
- **Consistent Naming**: Follow kebab-case for directories, appropriate conventions for files
- **Logical Grouping**: Organize related files in appropriate directory structures
- **Documentation Links**: Ensure all documentation cross-references correctly
- **Version Control**: Initialize Git repository with proper ignore files

### Project Validation Checklist
- Project structure matches requirements and technical decisions
- All configuration files are syntactically correct and tested
- Documentation is complete, accurate, and properly linked
- Development environment can be set up successfully by following instructions
- CI/CD pipeline passes initial validation tests
- Security configurations are properly implemented
- Infrastructure code validates and can be deployed successfully
