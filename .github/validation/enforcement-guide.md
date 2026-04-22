# Workflow Enforcement Guide

## Quick Start
**New to the enforcement system? Start here for essential information.**

### What is Workflow Enforcement?
A smart validation system that ensures proper workflow usage in every project using the AI-first delivery template. It guides you through the correct sequence of workflows while allowing expert flexibility when needed.

### Key Benefits
- **Prevents Rework**: Catches workflow violations early before they become costly
- **Ensures Quality**: Enforces best practices automatically across all projects
- **Provides Guidance**: Offers clear next steps when you're unsure what to do
- **Maintains Flexibility**: Expert overrides available when justified

### How It Works
1. **Auto-Detection**: System detects when `.github/` template is used
2. **Smart Validation**: Checks workflow sequences and requirements in real-time
3. **Clear Guidance**: Shows options and next steps when violations are detected
4. **Override Support**: Allows bypassing rules with proper justification

---

## Understanding Enforcement Levels

### 🟢 GUIDANCE_ONLY Mode
**Best for**: New teams learning workflows, prototype projects, exploration work

**Behavior**:
- Provides suggestions and recommendations
- Shows available templates and shortcuts
- Logs workflow choices for learning
- **Never blocks progress** - all actions allowed
- Gentle nudges toward best practices

**Example**:
```
💡 SUGGESTION: Consider running assessment workflow
📋 TEMPLATE: Use assess-project-status.prompt.md
⏰ ESTIMATED TIME: 30-45 minutes
🚀 CONTINUE: You can proceed with current approach
```

### 🟡 BALANCED Mode (Recommended Default)
**Best for**: Most teams and projects, production systems, established processes

**Behavior**:
- **Blocks risky violations** but allows justified overrides
- Provides clear error messages with remediation steps
- Suggests templates and shortcuts
- Tracks compliance and generates reports
- **Expert override always available**

**Example**:
```
⚠️ WORKFLOW WARNING: Implementation without assessment detected

🔧 RECOMMENDED ACTIONS:
1. Run assessment: @orchestrator Assess project status
2. Use emergency override: Provide justification

⚡ OVERRIDE: Available with LOW risk approval
📋 TEMPLATE: assess-project-status.prompt.md
```

### 🔴 STRICT Mode  
**Best for**: High-compliance organizations, regulated industries, critical production systems

**Behavior**:
- **Blocks most violations** with limited override options
- Requires approvals for overrides
- Extensive audit trail and reporting
- **Quality gates are mandatory**
- Detailed compliance metrics

**Example**:
```
🚫 BLOCKED: Cannot proceed with implementation without completed assessment

✅ REQUIRED: Complete assessment workflow first
🔐 OVERRIDE: Requires architect approval + detailed justification
📊 COMPLIANCE: Organization requires STRICT mode for this project type
```

---

## Common Workflow Scenarios

### Scenario 1: Starting a New Project
**Situation**: Just copied `.github/` template to new project

**System Response**:
```
🎯 NEW PROJECT DETECTED

Choose your starting point:
1. 🔍 Full Assessment (@orchestrator Assess project status)
2. 📋 Existing Documentation (Review docs/01-requirements/ through docs/04-planning/)  
3. 🚀 Implementation Ready (docs/05-implementation/)
4. ⚡ Emergency Override (Skip workflows with justification)

💡 RECOMMENDATION: Start with assessment for best results
```

**Your Options**:
- **Option 1**: Follow guided workflow (recommended)
- **Option 2**: Jump to middle if you have existing docs
- **Option 3**: Go straight to implementation if ready
- **Option 4**: Override if you have special circumstances

### Scenario 2: Workflow Sequence Violation
**Situation**: Trying to implement without proper documentation

**System Response**:
```
⚠️ SEQUENCE VIOLATION: Implementation workflow requires completed documentation

MISSING PREREQUISITES:
- docs/01-requirements/user-stories.md (User stories with acceptance criteria)
- docs/02-architecture/architecture-design.md (System architecture)
- docs/05-implementation/user-stories.md (Implementation tracking)

🔧 FIX OPTIONS:
1. Complete documentation workflow first
2. Upload existing documentation to proper locations
3. Request override for experienced team/brownfield project

⏰ ESTIMATED TIME: 2-4 hours for documentation completion
```

### Scenario 3: Quality Gate Failure
**Situation**: Trying to progress without meeting quality standards

**System Response**:
```
📊 QUALITY GATE FAILED: Implementation standards not met

ISSUES FOUND:
- BDD coverage: 65% (minimum 80% required)
- Missing API documentation  
- Code review pending approval

REMEDIATION:
1. ✅ Add BDD scenarios for uncovered user stories
2. ✅ Generate API docs using openapi-spec-generator
3. ✅ Complete code review process

🔓 OVERRIDE: Available with senior developer approval
⚡ EMERGENCY: Available for production hotfixes
```

### Scenario 4: Implementation Plan Approval Validation
**Situation**: TDD execution attempted without approved implementation plan

**System Response**:
```
⚠️ APPROVAL REQUIRED: TDD execution blocked for US-001

MISSING APPROVAL:
- docs/05-implementation/epics/EPIC-001/user-stories/US-001/plan-approval.yaml
  Status: changes-requested (expected: approved)

📋 REQUIRED:
- Human review and approval of implementation-plan.md
- Set status: approved in plan-approval.yaml

🚀 QUICK FIX: Request dev-lead review? (Y/N)
⏰ ESTIMATED TIME: 15-30 minutes for plan review
```

---

## Working with the System

### Interpreting Validation Messages

#### 🟢 Info Messages
**Purpose**: Helpful suggestions and optimizations
**Action**: Optional - consider but not required
**Example**: "Template suggestion available for faster completion"

#### 🟡 Warning Messages  
**Purpose**: Process deviations detected
**Action**: Consider remediation or acknowledge risk
**Example**: "Minor workflow step skipped - template available"

#### 🔴 Error Messages
**Purpose**: Significant workflow violations
**Action**: Must resolve or request override
**Example**: "Missing required artifacts - cannot proceed"

#### 🚫 Critical Messages
**Purpose**: Serious process or quality violations
**Action**: Must resolve - override requires approval
**Example**: "Security review required before production deployment"

### Using Templates & Shortcuts

#### Template Auto-Suggestions
```
💡 TEMPLATE AVAILABLE

Context: Creating implementation plan for US-001
Suggested: implementation-plan-tmpl.md
Benefit: Pre-filled structure saves 15-20 minutes

🚀 USE TEMPLATE: Auto-populate with current context
📝 MANUAL: Create from scratch
⏭️ SKIP: Proceed without template
```

#### Quick Actions
```
⚡ QUICK ACTIONS AVAILABLE

Based on your current state, you can:
1. 🔄 Request implementation plan approval (15-30 minutes)
2. 📋 Complete documentation from existing code (5 minutes)  
3. 🎯 Create BDD scenarios from acceptance criteria (10 minutes)
4. 📊 Run quality check and generate report (3 minutes)

Which would be most helpful?
```

### Override Workflow Integration

#### Override Request in Context
```
⚡ OVERRIDE REQUEST

Current Block: Cannot start implementation without assessment
Your Request: Skip assessment for brownfield project

Risk Assessment: LOW ✅
- Experienced team (>90% compliance)  
- Existing documentation available
- Limited scope changes

Approval: AUTO-APPROVED ✅
Monitoring: Standard development practices
Duration: Until implementation complete

Proceed with override? (Y/N)
```

#### Override Monitoring
```
🔍 OVERRIDE ACTIVE

Override: Skip assessment workflow
Duration: 2 days remaining
Status: ON TRACK ✅

Monitoring Checkpoints:
- Daily: Team coordination check ✅
- Mid-point: Quality metrics review (Tomorrow)
- Completion: Retrospective and lessons learned

Any issues to report? (N/A for none)
```

---

## Integration with Daily Workflow

### Git Integration

#### Smart Commit Validation
```bash
git commit -m "TDD-US-001-GREEN-03: Implement user authentication"

# System validates:
✅ Conventional commit format correct
✅ TDD phase sequence valid (RED → GREEN)  
✅ User story US-001 is active
⚠️ Phase 03 unusual - verify cycle count

Commit allowed? Override cycle validation? (Y/N)
```

#### Branch Naming Validation
```bash
git checkout -b feature/US-001-user-authentication

# System validates:
✅ Branch follows naming convention
✅ US-001 exists in user stories  
✅ Story status allows new development
⚠️ Story already has active branch: feature/US-001-login

Create second branch or switch to existing? (create/switch)
```

### Agent Integration

#### Agent Handoff Validation
```
🤖 AGENT HANDOFF: @dev-lead → @dev-tdd

Validating handoff requirements:
✅ Implementation plan complete
✅ User story ready for development  
✅ BDD scenarios defined
⚠️ GitHub issue not linked

Auto-link issue or proceed? (link/proceed)
```

#### Agent Authentication
```
🔐 AGENT AUTHENTICATION: @dev-tdd-green

Validating agent permissions:
✅ Agent identity confirmed
✅ TDD GREEN phase permissions granted
✅ User story US-001 accessible
⚠️ Parallel cycle detected - only one active allowed

Terminate parallel cycle or queue this work? (terminate/queue)
```

### Template Integration

#### Context-Aware Templates
```
📋 TEMPLATE SUGGESTION

Creating: docs/05-implementation/epics/<EPIC-REF>/user-stories/US-001/implementation-plan.md
Context Available:
- User story: US-001 User Authentication
- Architecture: Node.js + Express + PostgreSQL  
- BDD scenarios: 5 scenarios defined

🚀 AUTO-POPULATE: Fill template with available context
📝 BLANK TEMPLATE: Start with empty template
⏭️ SKIP TEMPLATE: Create manually

Recommendation: AUTO-POPULATE saves ~20 minutes
```

#### Template Validation
```
✅ TEMPLATE VALIDATION: implementation-plan.md

Checking template compliance:
✅ All required sections present
✅ Layer-by-layer breakdown included
✅ BDD scenario references complete
⚠️ Estimated effort missing from Layer 3

Auto-add effort estimates? (Y/N)
```

---

## Troubleshooting Common Issues

### Issue 1: System Not Recognizing Project State

**Problem**: Enforcement system not detecting project setup
**Symptoms**: No validation messages, no guidance provided
**Solution**: 
```bash
# Force enforcement activation
touch .github/.enforcement-active

# Or add to any file in .github/
echo "# Enforcement active" >> .github/copilot-instructions.md
```

### Issue 2: False Positive Workflow Violations

**Problem**: System blocking valid actions
**Symptoms**: Incorrectly detected violations, confusing error messages
**Solution**: 
```bash
# Check project state file
cat docs/.project-state.yml

# Reset if corrupted
rm docs/.project-state.yml
# System will rebuild on next action
```

### Issue 3: Override Not Working

**Problem**: Override request not processed
**Symptoms**: Override file created but still blocked
**Solution**:
```bash
# Check override file format
cat docs/.workflow-override.yml

# Verify required fields present:
# - justification (required)
# - risk_assessment (required)  
# - duration (required)
# - approval_status (auto-set)
```

### Issue 4: Templates Not Auto-Suggesting

**Problem**: System not offering relevant templates
**Symptoms**: Manual template selection required
**Solution**:
```bash
# Verify template detection
ls .github/templates/*-tmpl.md

# Check if context file exists
cat docs/.project-context.yml

# Force template refresh
touch .github/templates/.template-refresh
```

### Issue 5: Plan Approval Not Validating

**Problem**: TDD execution proceeding without approved implementation plan
**Symptoms**: Missing approval gate validation during TDD session start
**Solution**:
```bash
# Check agent integration settings
grep "agent_validation" .github/validation/workflow-compliance.yml

# Verify enforcement level allows validation
# GUIDANCE_ONLY may not block unapproved plans from TDD execution
```

---

## Advanced Usage

### Custom Configuration Per Project

#### Adjusting Enforcement Level
```yaml
# .github/workflow-enforcement.yml
project_info:
  enforcement_level: "BALANCED"  # Change to STRICT or GUIDANCE_ONLY
  
# Restart any active agent sessions to pick up changes
```

#### Team-Specific Rules
```yaml
# Custom rules for experienced teams
team_configuration:
  experienced_team_relaxation: true
  criteria: ">90% workflow compliance history"
  relaxed_rules:
    - "phase_dependencies"
    - "handoff_timing"  
  maintains_quality_gates: true
```

#### Project-Specific Overrides  
```yaml
# One-time project configuration
project_overrides:
  skip_assessment_allowed: true
  reason: "Brownfield project with existing comprehensive documentation"
  applies_to: ["assessment_workflow"]
  expires: "2026-04-17"
```

### Bulk Operations & Batch Processing

#### Multiple Story Development
```yaml
# Configure for parallel story development
parallel_development:
  enabled: true
  max_concurrent_stories: 3
  isolation_required: true
  enhanced_monitoring: true
```

#### Bulk Template Application
```bash
# Apply templates to multiple user stories
for story in US-001 US-002 US-003; do
  echo "Generating implementation plan for $story"
  cp .github/templates/implementation-plan-tmpl.md "docs/05-implementation/epics/$epic/user-stories/$story/implementation-plan.md"
done
```

### Integration with External Tools

#### CI/CD Integration
```yaml
# .github/workflows/enforcement-check.yml
name: Workflow Enforcement Check
on: [push, pull_request]

jobs:
  enforcement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate Workflow Compliance
        run: |
          node .github/validation/enforcement-checker.js
          # Fails if critical violations detected
```

#### Project Management Integration
```yaml
# Link with Jira/ADO/GitHub Issues
external_integration:
  github_issues:
    auto_create: true
    link_user_stories: true
    update_status: true
  
  compliance_reporting:
    slack_notifications: true
    weekly_reports: true
    dashboard_updates: true
```

---

## Best Practices

### For Individual Developers
1. **Check Status First**: Run `@orchestrator Assess project status` when joining new project
2. **Follow Suggestions**: System suggestions are usually faster than manual work
3. **Override Thoughtfully**: Only override when there's genuine business need
4. **Document Decisions**: Capture rationale in override justifications
5. **Complete Commitments**: Follow through on post-override promises

### For Team Leads
1. **Configure Appropriately**: Set enforcement level based on team experience
2. **Monitor Override Patterns**: Look for recurring override reasons (process improvements)
3. **Review Regularly**: Weekly review of compliance and override usage
4. **Train Team**: Ensure everyone understands how to work with the system
5. **Provide Feedback**: Report issues and suggest improvements to template maintainers

### For Organizations
1. **Establish Standards**: Define organization-wide compliance requirements
2. **Regular Reviews**: Monthly analysis of workflow effectiveness
3. **Process Evolution**: Update workflows based on real usage patterns
4. **Knowledge Sharing**: Share successful override patterns across teams
5. **Continuous Improvement**: Use metrics to optimize workflows and templates

---

## Support & Resources

### Getting Help
- **Quick Questions**: Check this guide and FAQ section
- **Template Issues**: Review template documentation in `.github/templates/`
- **Override Problems**: See override mechanisms guide
- **System Issues**: Check troubleshooting section above

### Additional Resources
- **Workflow Documentation**: `.github/workflows/*.workflows.md`
- **Agent Guidelines**: `.github/agents/*.agent.md`  
- **Template Reference**: `.github/templates/`
- **Configuration Options**: `.github/validation/workflow-compliance.yml`

### Feedback & Improvements
- **Process Feedback**: Document override patterns and workflow pain points
- **Template Suggestions**: Propose new templates or improvements to existing ones
- **System Issues**: Report bugs or false positive validations
- **Success Stories**: Share what worked well for future process improvements

---

**Guide Version**: 1.0  
**Last Updated**: 2026-03-17  
**Compatible With**: Workflow Enforcer v1.0+  
**Next Review**: After 30-day pilot feedback period