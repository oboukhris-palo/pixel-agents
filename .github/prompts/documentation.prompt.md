# Documentation Generation Prompt

## Parameters

| Parameter | Example |
|-----------|---------|
| {DOCUMENT_NAME} | Title |
| {DOC_TYPE} | technical/functional |
| {SCOPE} | application/feature/user-story |
| {AUDIENCE} | developer/architect/end-user |
| {PROJECT_CONTEXT} | Brief description |
| {REQUIREMENTS_REFERENCE} | Path to requirements |

## Template

```
Generate documentation:

Parameters:

Guidelines:

1. **Type**: technical=architecture/APIs/deployment, functional=workflows/requirements
2. **Structure**: Overview → Requirements → Design → Implementation → Testing
3. **Quality**: Clear, complete, examples, diagrams (Mermaid/PlantUML), testable requirements
4. **Format**: Markdown, hierarchical headings, code blocks, tables
```

2. SCOPE DEFINITION
   - If "application": Document the entire system at a high level
   - If "feature": Document one specific feature within the application
   - If "user-story": Document a single user story with acceptance criteria and BDD scenarios
   - If "installation-guide": Provide step-by-step setup and deployment instructions
   - If "developer-guide": Provide development workflow, architecture, and code patterns

3. AUDIENCE APPROPRIATENESS
   - If "end-user": Use simple non-technical language, step-by-step instructions, 
     common questions, practical examples relevant to users
   - If "developer": Include technical details, code examples, APIs, frameworks, 
     configuration, performance considerations
   - If "architect": Focus on high-level design patterns, scalability, reliability, 
     security, industry standards, future extensibility
   - If "devops": Focus on deployment procedures, infrastructure, automation, 
     monitoring, scaling, disaster recovery, operational runbooks
   - If "business-stakeholder": Use business language, explain business value, 
     timeline, resources, ROI, success metrics, business rules

4. DOCUMENT STRUCTURE

   For TECHNICAL documentation:
   - Project Overview (name, description, stakeholders)
   - Objectives (primary and secondary goals)
   - Scope (in-scope and out-of-scope)
   - Architecture (overview, components, interfaces, patterns)
   - Data Model (ER diagrams, entities, relationships)
   - APIs & Interfaces (endpoints, protocols, contracts)
   - Workflows (sequences, processes, interactions)
   - Requirements (functional and non-functional)
   - Integration (external systems, data exchange)
   - Testing (strategy, tools, coverage)
   - Deployment (environments, procedures, configurations)
   - Security (authentication, authorization, encryption, compliance)
   - Monitoring (metrics, alerting, health checks)
   - Troubleshooting & Support
   - Glossary & References

   For FUNCTIONAL documentation:
   - Project Overview (name, description, stakeholders)
   - Business Objectives
   - Scope (in-scope and out-of-scope)
   - User Roles (roles, permissions, responsibilities)
   - User Stories (ID, title, description, acceptance criteria)
   - Functional Requirements (ID, description, priority, dependencies)
   - Process Flows (overview, detailed steps, actors involved)
   - Data Requirements (inputs, outputs, sources, destinations)
   - Business Rules (validation, constraints, workflows)
   - Integration Points (external systems)
   - Non-Functional Requirements (performance, usability, reliability, compliance)
   - Constraints (technical, business, legal, operational)
   - Risk Analysis (risks and mitigation strategies)
   - Glossary & References

5. CONTENT QUALITY REQUIREMENTS

   CLARITY:
   - Use clear, precise language appropriate for the target audience
   - Define all acronyms and technical terms on first use
   - Provide context for all references
   - Avoid ambiguity—every statement should be specific and measurable

   COMPLETENESS:
   - Every section should have substantial content (not placeholders)
   - For features: Include at least 3 realistic examples
   - For technical docs: Include code examples, API samples, configuration samples
   - For user-facing docs: Include step-by-step procedures with expected outcomes
   - Include edge cases and error scenarios

   EXAMPLES:
   - Include 2-3 concrete examples per major concept
   - For technical: Code snippets, API calls, configuration files
   - For functional: User scenarios, workflows, data samples
   - Examples should be realistic and immediately usable

   STRUCTURE:
   - Use hierarchical headings (H1 → H2 → H3)
   - Group related information together
   - Use bullet lists for related items
   - Use tables for comparative information
   - Use diagrams (Mermai & plantUML) for complex concepts
   - Logical flow that guides reader from simple to complex

   VISUAL SUPPORT:
   - Include Mermaid and PlantUML diagrams for: architecture, data flows, workflows, processes
   - Choose diagram tool based on complexity:
     * Mermaid: Simple flows, ER diagrams, basic class diagrams, simple sequence diagrams
     * PlantUML: Complex class diagrams, detailed UML (component, deployment, state), detailed sequence diagrams
   - For implementation documentation: Prefer PlantUML for class diagrams (better UML notation)
   - For user-facing workflows: Prefer Mermaid (simpler, more readable)
   - Ensure diagrams are readable and clearly labeled
   - Reference diagrams in text
   - Include diagram source code in markdown code blocks

6. REQUIREMENTS & ACCEPTANCE CRITERIA

   All requirements must be:
   - SPECIFIC: Clear what is being required
   - MEASURABLE: How to verify it was done
   - TESTABLE: Can be validated/automated
   
   Format each requirement as:
   - Requirement ID (e.g., REQ-001)
   - Clear statement of what is required
   - Acceptance criteria that can be tested
   - Example: "REQ-LOGIN-001: Users shall authenticate with email and password
     Acceptance: (1) Valid email + correct password → login succeeds
               (2) Valid email + wrong password → error message shown
               (3) Invalid email → validation error before submission"

7. REFERENCES & INTEGRATION
   - Reference related documents from: {EXISTING_DOCUMENTATION}
   - Link to architecture decisions and design patterns
   - Connect to requirements from: {REQUIREMENTS_REFERENCE}
   - Maintain consistency with design systems and coding standards

8. QUALITY GATES - DOCUMENT MUST MEET ALL:
   ✓ All sections populated with substantive content (no placeholders)
   ✓ Language and detail level appropriate for {AUDIENCE}
   ✓ All acronyms and terms defined
   ✓ All major concepts have supporting examples
   ✓ Logical structure, easy to navigate
   ✓ Technically accurate and requirement-aligned
   ✓ References verified and working
   ✓ Requirements are clear and measurable
   ✓ Ready for immediate use without further edits
   ✓ Self-contained (can be understood without external context)

=== OUTPUT REQUIREMENTS ===

1. Use Markdown format
2. Include clear title and metadata at top:
   - Title: {DOCUMENT_NAME}
   - Type: {DOC_TYPE}
   - Scope: {SCOPE}
   - Audience: {AUDIENCE}
   - Version: 1.0.0
   - Date: [today's date]
   - Status: Complete/Ready for Review

3. Use proper Markdown formatting:
   - Headings properly hierarchical
   - Code blocks with language specified (```java, ```json, etc)
   - Tables for structured data
   - Lists (bullet and numbered) for related items
   - Mermaid diagrams for flows and simple visualizations (```mermaid)
   - PlantUML diagrams for detailed UML and class diagrams (```plantuml)
   - Choose diagram type based on audience and complexity

4. Include a Table of Contents for documents > 1000 words

5. Keep document focused:
   - User-story: 800-1200 words
   - Feature: 1500-2500 words
   - Application: 3000-5000 words
   - Installation Guide: 2000-3500 words
   - API Specification: 2000-4000 words

6. Make it ready for production use:
   - No placeholder sections
   - Complete examples throughout
   - Clear navigation and structure
   - Professional formatting

=== SPECIAL INSTRUCTIONS FOR YOUR SCOPE ===

If SCOPE is "user-story":
  → Include the complete user story: "As a {role}, I want {goal} so that {benefit}"
  → Include 3-5 testable acceptance criteria
  → Include BDD scenarios in Gherkin format (Given/When/Then)
  → Document implementation requirements (backend, frontend, database, config)
  → List all edge cases and error scenarios
  → Provide examples of success and failure states
  → Include testing strategy and test cases

If SCOPE is "feature":
  → Explain business value and user benefits
  → Document complete user workflow through feature
  → List all UI components or API endpoints involved
  → Show dependencies and integration points
  → Include design references and patterns to follow
  → Provide testing and validation approach
  → Include performance and security considerations

If SCOPE is "installation-guide":
  → Provide complete system requirements
  → List prerequisites with installation commands for each OS
  → Provide step-by-step installation procedures
  → Include expected output/results for each step
  → Provide troubleshooting for common issues
  → Include verification steps after each major step
  → Describe first-run setup and validation
  → Include post-installation configuration and optimization

If SCOPE is "developer-guide":
  → Explain project architecture and design decisions
  → Provide complete project structure overview
  → Document all build/run commands for each component
  → Explain development workflow (branching, commits, PRs, code review)
  → Document coding standards and style guidelines
  → Provide examples of common development tasks
  → Include debugging procedures and tools
  → Explain testing approach (unit, integration, e2e)
  → Provide troubleshooting for common development issues

If SCOPE is "application":
  → Provide high-level system overview
  → Document all major components and their interactions
  → Define API contracts and data models
  → Explain deployment and infrastructure architecture
  → Describe monitoring, logging, and support strategy
  → Include system-wide security and performance considerations
  → Document scalability and reliability approach

=== START GENERATING THE DOCUMENTATION ===

Create a complete, production-ready documentation document that:
1. Meets all quality gates listed above
2. Is appropriate for {AUDIENCE}
3. Covers all aspects of {SCOPE}
4. Includes practical examples throughout
5. Is ready for immediate use

Begin now:
```

---

## Quick Start Examples

### Example 1: API Documentation

```
Document Name: User Authentication REST API
Document Type: technical
Documentation Scope: feature
Primary Audience: developer
Project Context: Spring Boot microservice handling user authentication with JWT tokens. Part of larger e-commerce platform.
Requirements Reference: /docs/prd/user-stories.md#authentication
Existing Documentation: /docs/prd/architecture-design.md, /docs/prd/tech-spec.md
```

### Example 2: Feature Documentation

```
Document Name: Shopping Cart Feature
Document Type: functional
Documentation Scope: feature
Primary Audience: developer
Project Context: E-commerce platform requiring shopping cart management with add/remove items, quantity updates, checkout.
Requirements Reference: /docs/prd/user-stories.md#shopping-cart
Existing Documentation: /docs/prd/design-systems.md, /docs/prd/architecture-design.md
```

### Example 3: User Story

```
Document Name: User Login with Email Verification
Document Type: functional
Documentation Scope: user-story
Primary Audience: developer
Project Context: Web application requiring secure user authentication before account activation.
Requirements Reference: /docs/prd/user-stories.md#login-flow
Existing Documentation: /docs/prd/design-systems.md, /docs/prd/tech-spec.md
```

---

## How to Refine This Prompt

When documentation output needs improvement:

1. **Identify the issue**: What was missing or unclear?
2. **Update the prompt**: Add specific guidance in the relevant section
3. **Re-generate**: Use updated prompt with the same parameters
4. **Compare quality**: Does the new version address the issue?
5. **Document**: Note what change improved output

### Common Refinements

| Issue | Solution |
|-------|----------|
| Too technical for end-users | Add: "Use everyday language. Avoid terms like API, database, microservices without explaining" |
| Missing examples | Add: "Include at least 5 realistic examples with actual values" |
| Vague requirements | Add: "All requirements must have numbered acceptance criteria" |
| Poor organization | Add: "Reorder sections: Overview → Requirements → Implementation → Testing" |
| No diagrams | Add: "Include Mermaid/PlantUML diagram for every workflow/architecture section" |

---

## Integration Points

This prompt is used in:
- [documents.workflows.md](../workflows/documents.workflows.md) - PDLC stages requiring documentation
- [implementation.workflows.md](../workflows/implementation.workflows.md) - Development execution documentation
- All project stages requiring specification documents

---

## Templates Reference

This prompt aligns with:
- [tech-doc.template.yml](../templates/tech-doc.template.yml) - Technical documentation structure
- [func-doc.template.yml](../templates/func-doc.template.yml) - Functional documentation structure
- [user-story.template.yml](../templates/user-story.template.yml) - User story format

---

## Next Steps

1. Fill in the parameters above
2. Copy the Complete Prompt
3. Replace all {PLACEHOLDERS} with your values
4. Invoke with AI agent
5. Evaluate against quality gates
6. Refine if needed and re-generate
7. Use documentation in your project
