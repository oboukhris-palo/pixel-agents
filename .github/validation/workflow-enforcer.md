# Workflow Enforcement System

## Overview
**Smart validation system that ensures proper workflow usage whenever the `.github/` template is copied to new projects.**

**Enforcement Level**: `BALANCED` - Automatic validation with expert override capabilities
**Auto-Activation**: Triggers when `.github/` folder is copied/cloned to new projects
**Compliance Tracking**: Maintains audit trail of workflow adherence and overrides

---

## Core Enforcement Rules

### 🔒 Hard Rules (Cannot Override)
- **Single Active Workflow**: Only one workflow can be active per project at a time
- **Agent Authentication**: Agents must identify themselves properly (`@agent-name`)
- **Document Templates**: Must use provided templates for structured outputs
- **Git Commit Format**: Must follow conventional commit patterns per workflow

### ⚖️ Soft Rules (Can Override with Justification)
- **Workflow Sequencing**: Assessment → Documents → Implementation
- **Phase Dependencies**: Cannot skip required phases within workflows
- **Handoff Validation**: Must create proper handoff artifacts between agents
- **Quality Gates**: Must meet minimum quality thresholds before progression

---

## Validation States

### `COMPLIANT` ✅
- Following proper workflow sequence
- All required artifacts present
- No validation errors detected
- Proceeding normally

### `WARNING` ⚠️ 
- Minor deviations detected
- Missing non-critical artifacts
- Can continue with acknowledgment
- Logged for review

### `BLOCKED` 🚫
- Critical workflow violations
- Missing required dependencies  
- Must resolve or override to continue
- Requires justification for override

### `OVERRIDDEN` 🔓
- Expert override applied
- Justification recorded
- Audit trail maintained
- Monitoring for issues

---

## Auto-Detection Triggers

### Project Initialization Detection
```typescript
// Triggers when .github/ template is detected in new project
const enforcementTriggers = {
  newProject: {
    indicators: [
      '.github/copilot-instructions.md exists',
      'docs/ directory is empty or minimal',
      'No workflow status file present'
    ],
    action: 'INITIALIZE_ENFORCEMENT'
  },
  
  workflowStart: {
    indicators: [
      'Agent invocation detected',
      'Workflow keyword in prompt',
      '@orchestrator command used'
    ],
    action: 'VALIDATE_WORKFLOW_SEQUENCE'
  }
}
```

### Real-time Validation
- **Document Creation**: Validates against templates
- **Agent Handoffs**: Checks handoff artifact completeness
- **Phase Transitions**: Verifies prerequisites met
- **Quality Gates**: Monitors compliance thresholds

---

## Enforcement Actions

### Guidance Mode (Default)
- **Show workflow options** with recommendations
- **Highlight missing dependencies** with remediation steps
- **Suggest next actions** based on current state
- **Provide template shortcuts** for quick compliance

### Validation Mode (Active Workflow)
- **Block invalid sequences** with clear error messages
- **Require missing artifacts** before progression
- **Validate handoff completeness** between agents
- **Check quality gates** at phase boundaries

### Override Mode (Expert Users)
- **Capture justification** for non-compliance
- **Log override reason** in audit trail
- **Set monitoring flags** for potential issues
- **Allow progression** with enhanced tracking

---

## Validation Checks

### Assessment Workflow Validation
```yaml
assessment_workflow:
  phase_0_requirements:
    - client_inputs_folder_exists: docs/00-assessment/inputs/
    - prerequisites_template_used: docs/00-assessment/prerequisites-request.yml
    - ai_readiness_report_created: docs/00-assessment/ai-readiness-report.md
  
  handoff_validation:
    - assessment_complete_flag: docs/00-assessment/.assessment-complete
    - routing_decision_recorded: docs/00-assessment/routing-strategy.yml
    - handoff_package_created: docs/00-assessment/handoff-package/
```

### Documents Workflow Validation  
```yaml
documents_workflow:
  prerequisites:
    - assessment_complete: docs/00-assessment/.assessment-complete
    - routing_strategy_defined: docs/00-assessment/routing-strategy.yml
    - input_materials_cataloged: docs/00-assessment/inputs/inventory.yml
  
  phase_completion:
    - prd_documents_created: docs/01-requirements/, docs/02-architecture/, docs/03-testing/, docs/04-planning/ (phase-based docs)
    - user_stories_validated: docs/01-requirements/user-stories.md
    - bdd_scenarios_present: features/ or user-story BDD sections
```

### Implementation Workflow Validation
```yaml
implementation_workflow:
  prerequisites:
    - documents_complete: docs/.documents-complete
    - user_stories_ready: docs/05-implementation/user-stories.md
    - github_integration: .github-integration-configured
  
  tdd_validation:
    - single_story_active: Only one story in "IN_PROGRESS" state
    - sequential_phases: No parallel RED/GREEN/REFACTOR cycles
    - handoff_artifacts: Proper cycle handoff files created
```

---

## Override Mechanisms

### Override Request Format
```yaml
# docs/.workflow-override.yml
override_request:
  timestamp: "2026-03-17T14:30:00Z"
  requested_by: "@dev-lead"
  workflow: "implementation"
  rule_violated: "skip_assessment_phase"
  justification: "Emergency hotfix deployment - assessment completed verbally with client"
  risk_assessment: "LOW - isolated bug fix, no architectural changes"
  monitoring_requirements:
    - "Extra code review required"
    - "Manual BDD validation"
    - "Post-deployment assessment recommended"
  approval_status: "PENDING" # APPROVED | REJECTED | EXPIRED
```

### Automatic Override Conditions
- **Emergency Deployments**: Critical bug fixes (LOW risk assessment required)
- **Experienced Teams**: Teams with >90% workflow compliance history
- **Brownfield Projects**: Existing codebases with established patterns
- **Research/Prototyping**: Experimental work flagged as non-production

### Override Approval Workflow
1. **Override Request**: Create override file with justification
2. **Risk Assessment**: Automatic risk scoring based on violation type
3. **Approval Gate**: Auto-approve LOW risk, require review for MEDIUM/HIGH
4. **Implementation**: Apply override with enhanced monitoring
5. **Post-Override Review**: Validate assumptions, recommend process improvements

---

## Compliance Monitoring

### Audit Trail
```yaml
# docs/.workflow-audit.yml
audit_entries:
  - timestamp: "2026-03-17T09:15:00Z"
    event: "WORKFLOW_START"
    agent: "@orchestrator"
    workflow: "assessment"
    status: "COMPLIANT"
    
  - timestamp: "2026-03-17T10:30:00Z" 
    event: "PHASE_SKIP_DETECTED"
    agent: "@dev-lead"
    violation: "Attempted implementation without completed assessment"
    action: "BLOCKED"
    resolution: "Override request submitted"
    
  - timestamp: "2026-03-17T11:00:00Z"
    event: "OVERRIDE_APPROVED"
    justification: "Client verbal approval received"
    approver: "@architect"
    monitoring: "Enhanced review required"
```

### Compliance Metrics
- **Workflow Compliance Rate**: % of projects following proper sequences
- **Override Frequency**: How often overrides are requested/approved
- **Quality Impact**: Correlation between compliance and project outcomes
- **Time to Completion**: Impact of proper workflows on delivery speed

### Reporting Dashboard
- **Project Status**: Current compliance state and active workflows
- **Violation Patterns**: Common workflow deviations and their impact
- **Override Analysis**: Most common override reasons and outcomes
- **Team Performance**: Compliance rates by team/individual

---

## Integration Points

### Orchestrator Integration
```typescript
// Before any workflow action
const orchestratorValidation = {
  validateWorkflowSequence: (currentState, requestedAction) => {
    const validation = WorkflowEnforcer.validate(currentState, requestedAction);
    if (validation.status === 'BLOCKED') {
      return {
        blocked: true,
        message: validation.errorMessage,
        remediation: validation.suggestedActions,
        overrideOption: validation.overrideAvailable
      };
    }
    return { proceed: true };
  }
}
```

### Agent Integration
```typescript
// Agent action validation
const agentActionValidation = {
  beforeHandoff: (fromAgent, toAgent, artifact) => {
    return WorkflowEnforcer.validateHandoff(fromAgent, toAgent, artifact);
  },
  
  beforePhaseTransition: (currentPhase, nextPhase) => {
    return WorkflowEnforcer.validatePhaseRequirements(currentPhase, nextPhase);
  }
}
```

### Template Integration
- **Auto-initialization**: Templates include validation markers
- **Smart guidance**: Templates suggest next steps based on current state  
- **Compliance checking**: Templates validate against current project state
- **Override integration**: Templates include override mechanisms when appropriate

---

## Configuration

### Project-Level Configuration
```yaml
# .github/enforcement-config.yml
enforcement_settings:
  level: "BALANCED"  # STRICT | BALANCED | GUIDANCE_ONLY
  auto_activate: true
  override_permissions:
    - role: "architect"
      low_risk: true
      medium_risk: true
      high_risk: false
    - role: "dev-lead" 
      low_risk: true
      medium_risk: false
      high_risk: false
  
  workflow_requirements:
    assessment_mandatory: true
    documentation_mandatory: true
    implementation_validation: true
  
  quality_gates:
    bdd_coverage_minimum: 80
    test_coverage_minimum: 80
    code_review_required: true
```

### Global Configuration Override
```yaml
# For expert teams or special circumstances
global_overrides:
  experienced_team_mode:
    enabled: false
    criteria: ">95% historical compliance"
    relaxed_rules: ["phase_dependencies", "handoff_validation"]
  
  emergency_mode:
    enabled: false  
    duration: "24_hours"
    auto_expire: true
    enhanced_monitoring: true
```

---

## Error Messages & Guidance

### Common Violations

**Skipped Assessment Phase**:
```
❌ WORKFLOW VIOLATION: Implementation attempted without assessment

🔧 REQUIRED ACTIONS:
1. Run assessment workflow: @orchestrator Assess project status
2. Complete client input analysis 
3. Generate prerequisites report
4. Create routing strategy

⚡ EMERGENCY OVERRIDE: Available with justification
📋 TEMPLATE: Use assess-project-status.prompt.md
```

**Invalid Agent Sequence**:
```
⚠️ WORKFLOW WARNING: Agent sequence violation detected

Expected: @orchestrator → @pm → @po → @ba
Actual: @orchestrator → @dev-lead (skipped PM/PO/BA)

🎯 IMPACT: Missing requirements analysis and acceptance criteria
🔧 FIX: Complete missing handoffs or justify skip with override
```

**Missing Handoff Artifacts**:
```
🚫 BLOCKED: Incomplete handoff detected

Agent: @dev-lead → @dev-tdd
Missing: Implementation plan handoff file
Expected: docs/05-implementation/epics/EPIC-001/user-stories/US-001/plan-approval.yaml (status: approved)

📋 TEMPLATE: Use implementation-plan-tmpl.md
⏰ ESTIMATED TIME: 15-30 minutes to complete
```

**Quality Gate Failure**:
```
📊 QUALITY GATE FAILED: Implementation standards not met

Issues:
- BDD coverage: 65% (minimum 80% required) 
- Missing test documentation
- Code review not completed

🚫 CANNOT PROCEED without:
1. Additional BDD tests
2. Test documentation update  
3. Code review approval

🔓 OVERRIDE: Available with architecture approval
```

---

## Benefits & Impact

### For Teams
- **Reduced Rework**: Catch workflow violations early
- **Consistent Quality**: Enforce best practices automatically 
- **Faster Onboarding**: Clear guidance for new team members
- **Expert Flexibility**: Override mechanisms for experienced users

### For Projects  
- **Higher Success Rate**: Proper workflow adherence improves outcomes
- **Better Documentation**: Enforced templates ensure completeness
- **Quality Assurance**: Automated quality gates catch issues early
- **Audit Compliance**: Complete trail of decisions and overrides

### For Organizations
- **Process Standardization**: Consistent workflows across all projects
- **Knowledge Transfer**: Embedded best practices in every project
- **Risk Management**: Override tracking and risk assessment
- **Continuous Improvement**: Metrics-driven workflow optimization

---

## Implementation Status

✅ **Phase 1**: Core validation rules and enforcement logic  
🔄 **Phase 2**: Integration with existing workflows and templates  
⏳ **Phase 3**: Override mechanisms and approval workflows  
⏳ **Phase 4**: Compliance monitoring and reporting dashboard  
⏳ **Phase 5**: Advanced features (ML-based risk assessment, predictive guidance)

---

**Version**: 1.0  
**Last Updated**: 2026-03-17  
**Next Review**: After 30-day pilot implementation