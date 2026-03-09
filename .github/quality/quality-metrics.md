# Quality Metrics Framework
## Automated Quality Measurement System for AI-Driven PDLC Orchestration

---

## 📊 Quality Scoring Overview

**Quality Score Calculation**: 0-100% based on weighted criteria
- **Document Quality**: Content Completeness (40%) + Specificity & Clarity (30%) + Traceability (20%) + Format Compliance (10%)
- **Code Quality**: Functionality (40%) + Test Coverage (25%) + Code Quality (25%) + Documentation (10%)

**Thresholds by Agent Criticality**:
- **Planning Agents** (PM, PO, BA, UX): 75-90% minimum (planning errors fixable)
- **Architecture Agents** (Architect, Dev-Lead): 95% minimum (architecture errors costly)
- **Implementation Agents** (TDD agents): 98% minimum (code errors customer-facing)

---

## 🧮 Document Quality Scoring (0-100%)

### 1. Content Completeness (40 points maximum)

**Template Adherence (15 points)**:
```yaml
measurement_method: "section_count_ratio"
calculation: "(present_sections / required_sections) * 15"
required_sections: "from validation-rules.yml per document type"
deductions:
  - missing_section: -3 points each
  - partial_section: -1.5 points each
```

**Required Fields (15 points)**:
```yaml
measurement_method: "placeholder_detection"
calculation: "(completed_fields / total_fields) * 15"
placeholder_patterns:
  - "TODO"
  - "TBD" 
  - "[PLACEHOLDER]"
  - "Coming soon"
  - "To be determined"
  - "<INSERT_X>"
deductions:
  - placeholder_found: -1 point each
  - empty_required_field: -2 points each
```

**Acceptance Criteria (10 points)**:
```yaml
measurement_method: "criteria_format_validation"
calculation: "(valid_criteria / total_criteria) * 10"
valid_format: "Given-When-Then structure"
requirements:
  - given_context_present: true
  - when_action_present: true  
  - then_outcome_measurable: true
deductions:
  - missing_given: -2 points
  - missing_when: -2 points
  - unmeasurable_then: -3 points
```

### 2. Specificity & Clarity (30 points maximum)

**Concrete Details (15 points)**:
```yaml
measurement_method: "specificity_analysis"
calculation: "(specific_statements / total_statements) * 15"
specific_indicators:
  - numbers: "42%", "$50K", "< 200ms"
  - dates: "2024-01-15", "Q2 2024", "within 30 days"
  - quantities: "5 users", "100 records", "3 retries"
vague_indicators:
  - "some", "many", "few", "several"
  - "better", "faster", "improved"
  - "soon", "later", "eventually"
deductions:
  - vague_statement: -0.5 points each
  - unsupported_claim: -1 point each
```

**Measurable Criteria (10 points)**:
```yaml
measurement_method: "quantification_detection" 
calculation: "(quantified_objectives / total_objectives) * 10"
quantification_patterns:
  - percentages: "85% uptime"
  - time_bounds: "< 3 seconds response"
  - volume_limits: "1000 concurrent users"
  - success_rates: "95% test pass rate"
deductions:
  - unquantified_objective: -2 points each
  - unmeasurable_success_criteria: -3 points each
```

**Clear Language (5 points)**:
```yaml
measurement_method: "readability_analysis"
calculation: "flesch_reading_score / 20" # Normalized to 5 points
target_reading_level: "college_level (60-70 Flesch score)"
clarity_factors:
  - sentence_length: "< 25 words average"
  - syllable_complexity: "< 2.0 average per word"
  - jargon_ratio: "< 10% technical terms without definition"
deductions:
  - overly_complex_sentences: -0.5 points per sentence >40 words
  - undefined_jargon: -0.5 points per term
```

### 3. Traceability (20 points maximum)

**Requirement Links (10 points)**:
```yaml
measurement_method: "reference_validation"
calculation: "(valid_references / expected_references) * 10"
reference_patterns:
  - requirement_ids: "REQ-001", "FR-15", "NFR-7"
  - document_sections: "requirements.md#functional"
  - user_story_refs: "US-042"
validation_rules:
  - link_resolves: true
  - target_exists: true  
  - context_appropriate: true
deductions:
  - broken_link: -2 points each
  - missing_expected_reference: -1 point each
```

**User Story Links (10 points)**:
```yaml
measurement_method: "story_reference_validation"
calculation: "(valid_story_refs / expected_story_refs) * 10"
expected_references:
  - personas_to_stories: "Each persona referenced in ≥2 stories"
  - features_to_epics: "Each feature maps to epic"
  - acceptance_criteria_to_requirements: "Each AC traces to requirement"
deductions:
  - orphaned_persona: -2 points
  - unmapped_feature: -3 points
  - untraceable_acceptance_criteria: -2 points
```

### 4. Format Compliance (10 points maximum)

**Markdown Structure (5 points)**:
```yaml
measurement_method: "markdown_validation"
calculation: "(correct_elements / total_elements) * 5"
required_elements:
  - proper_headers: "# ## ### hierarchy"
  - formatted_lists: "- or 1. with consistent indentation"
  - tables: "proper | syntax | alignment"
  - code_blocks: "```language syntax```"
deductions:
  - malformed_header: -0.5 points
  - broken_list_formatting: -0.5 points
  - invalid_table_syntax: -1 point
```

**Diagrams Present (5 points)**:
```yaml
measurement_method: "diagram_requirement_check"
calculation: "(present_diagrams / required_diagrams) * 5"
required_diagrams_by_type:
  architecture_design: ["system_overview", "component_diagram", "data_flow"]  
  user_stories: ["user_journey", "story_map"]
  tech_spec: ["api_diagram", "database_schema"]
supported_formats:
  - mermaid: "```mermaid ... ```"
  - plantuml: "```plantuml ... ```"  
  - embedded_images: "![alt](path/to/diagram.png)"
deductions:
  - missing_required_diagram: -2 points each
  - diagram_not_rendered: -1 point each
```

---

## 💻 Code Quality Scoring (0-100%)

### 1. Functionality (40 points maximum)

**BDD Tests Pass (25 points)**:
```yaml
measurement_method: "bdd_test_execution"
calculation: "(passing_scenarios / total_scenarios) * 25"
test_execution:
  - run_cucumber_tests: true
  - collect_scenario_results: true
  - weight_by_story_points: true
scoring_rules:
  - passing_scenario: +1 point (normalized)
  - failing_scenario: 0 points
  - pending_scenario: 0 points
  - undefined_step: -0.5 points (needs implementation)
```

**Acceptance Criteria Met (15 points)**:
```yaml
measurement_method: "manual_acceptance_verification"
calculation: "(met_criteria / total_criteria) * 15"
verification_process:
  - check_each_given_when_then: true
  - validate_edge_cases: true
  - confirm_user_experience: true
scoring_rules:
  - fully_met_criterion: +1 point (normalized)
  - partially_met_criterion: +0.5 points (normalized) 
  - unmet_criterion: 0 points
```

### 2. Test Coverage (25 points maximum)

**Unit Coverage >80% (15 points)**:
```yaml
measurement_method: "coverage_tool_analysis"
calculation: "min(coverage_percentage / 80, 1.0) * 15"
coverage_tools:
  - javascript: "nyc", "jest"
  - python: "coverage.py", "pytest-cov"
  - java: "jacoco", "cobertura"  
  - csharp: "coverlet", "dotcover"
measurement_levels:
  - line_coverage: "40% weight"
  - branch_coverage: "35% weight" 
  - function_coverage: "25% weight"
```

**Integration Coverage >70% (10 points)**:
```yaml
measurement_method: "integration_test_analysis"  
calculation: "min(integration_coverage / 70, 1.0) * 10"
integration_scope:
  - api_endpoint_coverage: "All REST endpoints tested"
  - service_interaction_coverage: "Service-to-service calls tested"
  - database_operation_coverage: "CRUD operations tested"
measurement_approach:
  - endpoint_hit_ratio: "tested_endpoints / total_endpoints"
  - service_call_ratio: "tested_calls / total_calls"
  - crud_operation_ratio: "tested_operations / total_operations"
```

### 3. Code Quality (25 points maximum)

**Complexity <10 (10 points)**:
```yaml
measurement_method: "cyclomatic_complexity_analysis"
calculation: "max(0, (10 - average_complexity) / 10) * 10"
complexity_tools:
  - javascript: "eslint-plugin-complexity"  
  - python: "radon", "mccabe"
  - java: "pmd", "checkstyle"
  - csharp: "ndepend", "sonarqube"
measurement_scope:
  - function_level: "individual function complexity"
  - class_level: "weighted average of class methods"
  - module_level: "weighted average of module functions"
penalty_structure:
  - complexity_10_15: "-2 points"
  - complexity_15_20: "-5 points" 
  - complexity_20_plus: "-10 points"
```

**SOLID Compliance (10 points)**:
```yaml
measurement_method: "architectural_pattern_analysis"
calculation: "(compliant_patterns / total_patterns) * 10"
solid_principles:
  single_responsibility:
    measurement: "classes with single clear purpose"
    indicators: "class name clarity", "method coherence"
  open_closed:
    measurement: "extension without modification"
    indicators: "interface usage", "inheritance patterns"
  liskov_substitution:
    measurement: "derived class substitutability"  
    indicators: "contract preservation", "behavior consistency"
  interface_segregation:
    measurement: "focused interface design"
    indicators: "interface size", "client-specific contracts"
  dependency_inversion:
    measurement: "abstraction dependency"
    indicators: "DI container usage", "concrete dependency absence"
```

**No Duplication (5 points)**:
```yaml
measurement_method: "code_duplication_detection"
calculation: "max(0, (100 - duplication_percentage) / 100) * 5"
duplication_tools:
  - multi_language: "sonarqube", "codeclimate"
  - javascript: "jscpd"
  - python: "duplicate-code-detection-tool"  
  - java: "pmd copypastedetector"
duplication_thresholds:
  - minor_duplication: "5-15% (-1 point)"
  - moderate_duplication: "15-25% (-2 points)"
  - severe_duplication: "25%+ (-5 points)"
```

### 4. Documentation (10 points maximum)

**API Documentation (5 points)**:
```yaml
measurement_method: "api_documentation_completeness"
calculation: "(documented_endpoints / total_endpoints) * 5"
documentation_requirements:
  - endpoint_description: "clear purpose statement"
  - parameter_documentation: "type, required/optional, examples"
  - response_schema: "success/error response formats"
  - example_requests: "working curl/postman examples"
documentation_formats:
  - openapi_swagger: "swagger.yml or swagger.json"
  - inline_comments: "JSDoc, docstrings, XML comments"
  - dedicated_api_docs: "separate API documentation files"
```

**Code Comments (5 points)**:
```yaml
measurement_method: "comment_quality_analysis"
calculation: "(quality_comments / complex_functions) * 5"
comment_requirements:
  - complex_logic_explanation: "functions >5 complexity documented"
  - business_rule_documentation: "domain logic clearly explained"
  - edge_case_handling: "unusual conditions documented"
  - performance_considerations: "optimization decisions explained"
quality_indicators:
  - explains_why_not_what: true
  - provides_context: true  
  - includes_examples: true
  - up_to_date: true
```

---

## ⚙️ Quality Measurement Implementation

### Automated Quality Scoring Engine

**File**: `.github/quality/quality-scoring-engine.js`
```javascript
// Quality scoring engine implementation
class QualityScorer {
  
  constructor(validationRules) {
    this.rules = validationRules;
    this.weights = validationRules.scoring_weights;
  }
  
  // Main scoring method
  async calculateQualityScore(output, outputType, agent) {
    const agentRules = this.rules.quality_gates[outputType][agent];
    
    if (outputType === 'documents') {
      return this.scoreDocument(output, agentRules);
    } else if (outputType === 'code') {
      return this.scoreCode(output, agentRules);
    }
    
    throw new Error(`Unknown output type: ${outputType}`);
  }
  
  // Document scoring implementation
  async scoreDocument(document, rules) {
    const scores = {
      contentCompleteness: await this.scoreContentCompleteness(document, rules),
      specificityClarity: await this.scoreSpecificityClarity(document, rules), 
      traceability: await this.scoreTraceability(document, rules),
      formatCompliance: await this.scoreFormatCompliance(document, rules)
    };
    
    // Calculate weighted total
    const totalScore = 
      (scores.contentCompleteness * this.weights.documents.content_completeness / 100) +
      (scores.specificityClarity * this.weights.documents.specificity_clarity / 100) +
      (scores.traceability * this.weights.documents.traceability / 100) +
      (scores.formatCompliance * this.weights.documents.format_compliance / 100);
      
    return {
      totalScore: Math.round(totalScore),
      breakdown: scores,
      qualityGaps: this.identifyQualityGaps(scores, rules)
    };
  }
  
  // Code scoring implementation  
  async scoreCode(codeFiles, rules) {
    const scores = {
      functionality: await this.scoreFunctionality(codeFiles, rules),
      testCoverage: await this.scoreTestCoverage(codeFiles, rules),
      codeQuality: await this.scoreCodeQuality(codeFiles, rules), 
      documentation: await this.scoreDocumentation(codeFiles, rules)
    };
    
    // Calculate weighted total
    const totalScore = 
      (scores.functionality * this.weights.code.functionality / 100) +
      (scores.testCoverage * this.weights.code.test_coverage / 100) +
      (scores.codeQuality * this.weights.code.code_quality / 100) +
      (scores.documentation * this.weights.code.documentation / 100);
      
    return {
      totalScore: Math.round(totalScore), 
      breakdown: scores,
      qualityGaps: this.identifyQualityGaps(scores, rules)
    };
  }
}
```

### Quality Gap Identification

**File**: `.github/quality/gap-analyzer.js`
```javascript
// Quality gap analyzer for improvement recommendations
class QualityGapAnalyzer {
  
  identifyDocumentGaps(scores, rules) {
    const gaps = [];
    
    // Content completeness gaps
    if (scores.contentCompleteness < 35) {
      gaps.push({
        category: 'content_completeness',
        severity: 'high',
        description: 'Missing required sections or placeholder text',
        recommendations: [
          'Add missing template sections',
          'Replace placeholder text with actual content',  
          'Complete all acceptance criteria in Given-When-Then format'
        ]
      });
    }
    
    // Specificity gaps
    if (scores.specificityClarity < 25) {
      gaps.push({
        category: 'specificity_clarity', 
        severity: 'medium',
        description: 'Vague language or unmeasurable criteria',
        recommendations: [
          'Add specific numbers, dates, and quantities',
          'Replace vague terms (some, many, better) with concrete details',
          'Quantify all objectives and success criteria'
        ]
      });
    }
    
    // Traceability gaps
    if (scores.traceability < 16) {
      gaps.push({
        category: 'traceability',
        severity: 'medium', 
        description: 'Missing references to requirements or user stories',
        recommendations: [
          'Add links to relevant requirements.md sections',
          'Reference specific user story IDs',
          'Ensure all acceptance criteria trace to requirements'
        ]
      });
    }
    
    // Format compliance gaps
    if (scores.formatCompliance < 8) {
      gaps.push({
        category: 'format_compliance',
        severity: 'low',
        description: 'Formatting issues or missing diagrams',
        recommendations: [
          'Fix markdown structure (headers, lists, tables)',
          'Add required diagrams (Mermaid or PlantUML)',
          'Ensure proper code block formatting'
        ]
      });
    }
    
    return gaps;
  }
  
  identifyCodeGaps(scores, rules) {
    const gaps = [];
    
    // Functionality gaps
    if (scores.functionality < 35) {
      gaps.push({
        category: 'functionality',
        severity: 'high', 
        description: 'BDD tests failing or acceptance criteria not met',
        recommendations: [
          'Fix failing BDD scenarios', 
          'Implement missing functionality for acceptance criteria',
          'Add edge case handling'
        ]
      });
    }
    
    // Test coverage gaps  
    if (scores.testCoverage < 20) {
      gaps.push({
        category: 'test_coverage',
        severity: 'high',
        description: 'Insufficient unit or integration test coverage',
        recommendations: [
          'Add unit tests for uncovered functions',
          'Create integration tests for API endpoints',
          'Test error handling and edge cases'
        ]
      });
    }
    
    // Code quality gaps
    if (scores.codeQuality < 20) {
      gaps.push({
        category: 'code_quality',
        severity: 'medium',
        description: 'High complexity, SOLID violations, or code duplication', 
        recommendations: [
          'Refactor complex functions (complexity >10)',
          'Apply SOLID principles (extract interfaces, reduce dependencies)',
          'Eliminate code duplication through extraction'
        ]
      });
    }
    
    // Documentation gaps
    if (scores.documentation < 8) {
      gaps.push({
        category: 'documentation',
        severity: 'low',
        description: 'Missing API documentation or code comments',
        recommendations: [
          'Add OpenAPI/Swagger documentation for APIs',
          'Document complex business logic with comments',
          'Provide examples in API documentation'
        ]
      });
    }
    
    return gaps;
  }
}
```

---

## 📈 Quality Metrics Dashboard

### Real-Time Quality Monitoring

**Current System Health**: Calculated as weighted average of last 24 hours
```yaml
calculation: |
  system_health = (
    (agent_avg_scores.pm * pm_output_count) +
    (agent_avg_scores.po * po_output_count) +
    (agent_avg_scores.ba * ba_output_count) +
    (agent_avg_scores.ux * ux_output_count) +
    (agent_avg_scores.architect * architect_output_count) +
    (agent_avg_scores.dev_lead * dev_lead_output_count) +
    (agent_avg_scores.tdd * tdd_output_count)
  ) / total_output_count
  
health_status:
  - good: ">85%"
  - warning: "70-85%" 
  - critical: "<70%"
```

### Quality Trend Analysis

**Weekly Quality Trends**: Rolling 7-day average quality scores
```yaml
trend_calculation: |
  For each day D in last 7 days:
    daily_avg[D] = sum(quality_scores[D]) / count(outputs[D])
  
  weekly_trend = (daily_avg[today] - daily_avg[7_days_ago]) / daily_avg[7_days_ago] * 100
  
trend_status:
  - improving: ">+2% weekly change"
  - stable: "-2% to +2% weekly change"
  - declining: "<-2% weekly change"
```

### Quality Alert System

**Automatic Quality Alerts**: Real-time monitoring with escalation
```yaml
alert_triggers:
  immediate:
    - system_health_drops_below_70_percent
    - agent_fails_quality_3_consecutive_times
    - workflow_blocked_over_4_hours
    
  warning: 
    - system_health_drops_below_85_percent
    - retry_rate_exceeds_25_percent
    - average_quality_declining_3_days
    
  info:
    - new_quality_improvement_achieved
    - quality_milestone_reached
    - system_health_recovering
```

---

## 🔧 Implementation Checklist

### Phase 1: Quality Scoring Engine ✅
- [x] Quality metrics framework defined
- [x] Document quality scoring algorithm (40/30/20/10 weights)
- [x] Code quality scoring algorithm (40/25/25/10 weights)  
- [x] Quality gap identification logic
- [x] Automated scoring engine architecture

### Phase 2: Integration with Orchestrator ✅  
- [x] Orchestrator Prompt 6: Quality Validation & Enforcement
- [x] Workflow blocking on quality failures
- [x] Automatic retry with improvement guidance
- [x] Escalation triggers and human review

### Phase 3: Quality Dashboard (Next)
- [ ] Real-time quality metrics display
- [ ] Quality trend analysis and alerts
- [ ] Agent-specific quality tracking
- [ ] Quality improvement workflow monitoring

### Phase 4: Testing & Optimization (Next)
- [ ] End-to-end quality enforcement testing  
- [ ] Performance optimization for real-time validation
- [ ] False positive/negative rate monitoring
- [ ] User satisfaction feedback integration

---

**Quality Framework Status**: ✅ **IMPLEMENTED**  
**Next Phase**: Integration testing and dashboard implementation