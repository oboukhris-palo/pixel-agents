# **Gen-e2 Prompt Template**

## Prompt Content Section

The actual prompt text with clear, actionable instructions including:

- **Objective**: What needs to be accomplished
- **Context**: Background information and constraints
- **Requirements**: Specific technical or methodological requirements
- **Deliverables**: Expected outputs and formats
- **Quality Standards**: Validation criteria and success metrics
- **File Management**: Directory structure and documentation requirements

---

## Instructions for generating the prompt content

**NOTE**: The following sections (Instructions, Examples, Variables, Template Quality Standards, and Template Status) are for template generation purposes only and should NOT be included in the final prompt file. Only the "Prompt Content Section" above should be used in the actual prompt.

Step-by-step guidance for template usage and customization:

1. **Replace Metadata Variables**: Update all bracketed placeholders with specific assessment context
2. **Customize Prompt Content**: Adapt instructions to specific assessment needs and project context
3. **Validate Context**: Ensure prompt aligns with Gen-e2 methodology stage and objectives
4. **Test Prompt**: Verify prompt generates expected outputs with appropriate quality

### Examples

#### Sample Prompt Content

```
Based on the interview transcript and Gen-e2 assessment context, create comprehensive meeting minutes following the interview-minutes-core-tmpl.md template.

## Context
You are conducting a Gen-e2 assessment interview to evaluate AI-native software delivery maturity.

## Requirements
The meeting minutes should capture:
- Key discussion points and insights
- Gen-e2 maturity assessment observations across all 7 dimensions
- Stakeholder perspectives and concerns
- Action items and follow-up requirements
- Confidence assessment and evidence sources

## Deliverables
- Complete CR document following template structure
- Scored evaluation with confidence percentages
- Evidence documentation and source validation
- Professional formatting per repository style guide

## Quality Standards
Ensure the minutes follow established template structure and maintain professional documentation standards as defined in the Gen-e2 methodology.
```

### Variables

Documentation of all placeholder elements and replacement instructions:

- **[description]**: Brief summary of prompt objective and scope
- **[stage]**: Gen-e2 assessment methodology stage (Planning & Analysis, Data Collection, Assessment & Analysis, Implementation Strategy)
- **[subcategory]**: Specific area within the stage (e.g., stakeholder-interviews, technical-assessment, gap-analysis)
- **[rule_name]**: Unique kebab-case identifier for the prompt
- **[rule_version]**: Version control identifier (latest, v1.0.0, etc.)

### Template Quality Standards

Template compliance requirements and validation criteria:

#### Metadata Standards
- ✅ All metadata fields present and properly formatted
- ✅ Stage alignment with Gen-e2 methodology framework
- ✅ Unique and descriptive rule_name following naming conventions
- ✅ Appropriate version identifier

#### Content Standards
- ✅ Clear, actionable instructions with specific deliverables
- ✅ Alignment with Gen-e2 assessment objectives and methodology
- ✅ Reference to relevant templates and documentation standards
- ✅ Quality criteria and validation requirements included
- ✅ File management and documentation requirements specified

#### Integration Standards
- ✅ Compatibility with AI agent workflows and context management
- ✅ Consistency with repository conventions and linking standards
- ✅ Cross-reference to related templates and assessment materials
- ✅ Evidence-based approach with confidence assessment considerations

---

**Template Status**: Active Framework | **Version**: 1.0 | **Last Updated**: November 2, 2025  
**Scope**: Gen-e2 [Assessment Focus]  
**Usage**: Prompt creation for AI-assisted Gen-e2 assessment activities