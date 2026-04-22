## Objective
Analyze the entire workspace and generate comprehensive GitHub Copilot configuration files and .github directory structure based on the project's technical stack and conventions.

## Context
You are analyzing a workspace to understand its architecture, patterns, and conventions, then creating AI-first delivery framework configuration files that will guide GitHub Copilot and other AI agents in understanding project standards and best practices.

## Requirements

### Workspace Analysis
Perform comprehensive analysis of:
- **Architecture Overview**: System design, component relationships, data flow
- **Technical Stack**: Languages, frameworks, libraries, databases, APIs
- **Coding Patterns**: Design patterns, architectural patterns, code organization
- **Naming Conventions**: File naming, variable naming, directory structure
- **Testing Approach**: Testing frameworks, strategies, coverage requirements
- **Configuration Standards**: Environment setup, deployment, CI/CD

### File Generation Requirements
1. **copilot-instructions.md**: Master instructions file for GitHub Copilot
2. **Complete .github directory structure**: All necessary configuration files
3. **Agent-specific instructions**: Tailored guidance for different development roles
4. **Template files**: Standard templates for common tasks
5. **Workflow definitions**: PDLC and implementation workflows

## Deliverables

### 1. GitHub Copilot Master Instructions
Generate `copilot-instructions.md` containing:
- Project overview and technical context
- Architecture patterns and design principles
- Coding standards and conventions
- Testing requirements and strategies
- Deployment and configuration guidelines
- Do's and Don'ts specific to the project

### 2. .github Directory Structure
Create complete directory with:
```
.github/
├── agents/                    # Agent-specific instructions
├── instructions/              # Coding and process instructions
├── templates/                 # Document and code templates
├── workflows/                 # PDLC workflow definitions
├── prompts/                   # Reusable prompt templates
└── copilot-instructions.md    # Master instructions
```

### 3. Agent Configuration Files
Generate role-specific instruction files:
- Architecture guidance for system design decisions
- Development patterns for implementation
- Testing strategies for quality assurance
- Documentation standards for deliverables

### 4. Template Library
Create templates for:
- User stories and implementation plans
- API documentation and specifications
- Code review checklists
- Meeting minutes and progress tracking

## Quality Standards

- ✅ Analysis reflects actual codebase patterns and conventions
- ✅ Instructions are specific to the identified technical stack
- ✅ All generated files follow AI-first delivery methodology
- ✅ Configuration enables consistent AI assistance across development lifecycle
- ✅ Templates align with discovered project patterns
- ✅ Naming conventions match existing workspace standards
- ✅ Testing approach reflects current framework usage

## File Management

### Analysis Process
1. Scan entire workspace for technical patterns
2. Identify key frameworks, libraries, and architectural decisions
3. Extract naming conventions and code organization patterns
4. Analyze existing testing setup and coverage approaches
5. Document configuration and deployment patterns

### Output Organization
- Generate files in appropriate .github subdirectories
- Maintain consistency with AI-first delivery framework structure
- Cross-reference related instructions and templates
- Ensure all paths and references are accurate