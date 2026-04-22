# Coding Standards & Best Practices Instructions

## Overview

This document provides systematic instructions for implementing coding standards and best practices using the AI-first delivery methodology. These instructions follow established software engineering principles and transform development practices into comprehensive, production-ready code that enhances maintainability, security, and performance while reducing technical debt.

## Process Overview

**Coding Standards Implementation** transforms development practices into structured, high-quality software implementations that deliver maintainable, secure, and well-tested code following industry best practices including Clean Code, SOLID principles, YAGNI methodology, design patterns, comprehensive testing strategies, security protocols, and systematic refactoring processes.

## Implementation Process

### 1. Clean Code Foundation
**Objective**: Establish readable, maintainable code as the foundation for all development work

**Activities**:
- Apply semantic naming conventions (Classes=nouns, Functions=verbs, Variables=specific)
- Implement consistent formatting and style guidelines across codebase
- Maintain maximum 2-3 levels of nesting to reduce complexity
- Extract complex logic into focused helper functions and methods

**Quality Standards**:
- All identifiers are self-documenting and context-appropriate
- Code complexity remains manageable (cyclomatic complexity <10)
- Functions and methods maintain single responsibility
- Code is readable without requiring extensive comments

### 2. SOLID Principles Implementation
**Objective**: Apply fundamental design principles for maintainable object-oriented architecture

**Activities**:
- Single Responsibility Principle: Each class/module has one reason to change
- Open/Closed Principle: Design for extension without modification through interfaces
- Liskov Substitution Principle: Ensure subtypes are substitutable for base types
- Interface Segregation Principle: Create focused interfaces rather than monolithic ones

**Quality Standards**:
- Each component has clearly defined, single responsibility
- Extension points are available without modifying existing code
- Interface contracts are respected by all implementations
- Dependencies flow toward abstractions, not concrete implementations

### 3. Testing Strategy Execution
**Objective**: Implement comprehensive testing following the testing pyramid (70% unit, 20% integration, 10% E2E)

**Activities**:
- Implement Test-Driven Development (TDD) cycle: RED → GREEN → REFACTOR
- Create isolated, repeatable, fast, and readable test cases
- Cover happy path, edge cases, and error scenarios comprehensively
- Design integration tests for component interaction verification

**Quality Standards**:
- Test coverage maintains >80% for critical business logic
- Tests execute quickly (unit tests in milliseconds)
- All tests are independent and can run in any order
- Test failure messages provide clear diagnostic information

### 4. Security Implementation
**Objective**: Apply security best practices throughout development lifecycle

**Activities**:
- Validate and sanitize all user input using allowlists
- Implement proper authentication and authorization mechanisms
- Apply principle of least privilege for user and service access
- Encrypt sensitive data in transit and at rest

**Quality Standards**:
- No hardcoded secrets or credentials in codebase
- Input validation prevents injection attacks
- Error messages don't leak sensitive information
- Security logging captures events without exposing secrets

### 5. Performance Optimization
**Objective**: Ensure code performance meets requirements without premature optimization

**Activities**:
- Measure performance baseline before optimization attempts
- Focus on algorithm efficiency and appropriate data structures
- Implement caching strategies where appropriate
- Design for scalability with stateless services and proper indexing

**Quality Standards**:
- Performance bottlenecks are identified through profiling
- Big O complexity is appropriate for expected data volumes
- Caching strategies don't introduce consistency issues
- Resource usage (memory, CPU) remains within acceptable bounds

## File Location Standards

**Output Location**: Store coding standards implementations across project structure following language-specific conventions

**Source Materials**:
- **Code Files**: `src/`, `lib/`, `app/` following project architecture
- **Test Files**: `tests/`, `__tests__/`, `*.test.*`, `*.spec.*` co-located with source
- **Documentation**: `README.md`, `docs/api/`, Architecture Decision Records (ADRs)
- **Configuration**: `.eslintrc`, `.prettierrc`, `tsconfig.json`, language-specific linting configs

## Quality Assurance Process

### Pre-Implementation Validation
- ✅ Development environment configured with linting and formatting tools
- ✅ Code review checklist established and accessible to team
- ✅ Testing framework and coverage tools properly configured
- ✅ Security scanning tools integrated into development workflow

### Post-Implementation Review
- ✅ All code passes automated linting and formatting checks
- ✅ Test coverage meets minimum thresholds (>80% for critical paths)
- ✅ Security scanning shows no high/critical vulnerabilities
- ✅ Performance benchmarks validate acceptable response times
- ✅ Code review checklist completed for all changes

### Confidence Validation Requirements
- **Functionality Verification**: All requirements implemented and acceptance criteria met
- **Design Quality Assessment**: SOLID principles applied, no unnecessary complexity
- **Test Coverage Analysis**: Comprehensive coverage of happy path, edge cases, and error scenarios
- **Security Validation**: Input validation, authentication, and authorization properly implemented

## Integration with Overall Assessment

Coding Standards serve as foundational inputs for:
- **Code Review Processes**: Automated and manual review standards ensure consistency
- **Quality Gates**: Continuous integration pipelines enforce standards before deployment
- **Technical Debt Management**: Refactoring guidelines prevent accumulation of maintenance burden
- **Security Compliance**: Security practices integrate with overall application security strategy

## Core Standards Reference

### Clean Code Principles
- **Naming**: Classes=nouns, Functions=verbs, Variables=specific, Constants=UPPER, Booleans=is/has/can
- **Functions**: Single responsibility, minimal parameters, clear return values
- **Complexity**: Maximum 2-3 levels of nesting, extract complex logic to helper methods
- **Comments**: Explain WHY, not WHAT - code should be self-documenting

### SOLID Principles
- **SRP (Single Responsibility)**: One class, one reason to change
- **OCP (Open/Closed)**: Open for extension, closed for modification
- **LSP (Liskov Substitution)**: Subtypes substitutable for base types
- **ISP (Interface Segregation)**: Small focused interfaces, not monolithic
- **DIP (Dependency Inversion)**: Depend on abstractions, not concretions

### Testing Standards
- **Test Pyramid**: 70% unit tests, 20% integration tests, 10% E2E tests
- **TDD Cycle**: RED (failing test) → GREEN (minimal implementation) → REFACTOR (improve quality)
- **Test Characteristics**: Isolated, repeatable, fast, readable, comprehensive

### Security Requirements
- **Input Validation**: Validate data type, format, length, range
- **Authentication**: Verify identity using proven frameworks
- **Authorization**: Verify permissions for specific actions
- **Data Protection**: Encrypt sensitive data, secure API keys, minimal retention

### Performance Guidelines
- **Measurement First**: Profile before optimizing
- **Algorithm Focus**: Optimize Big O complexity for expected data volumes
- **Caching Strategy**: Implement where appropriate without consistency issues
- **Scalability Design**: Stateless services, proper indexing, connection pooling

### Code Review Checklist
- [ ] Implements specified requirements and acceptance criteria
- [ ] Follows SOLID principles and avoids unnecessary complexity
- [ ] Uses clear, meaningful naming throughout
- [ ] Includes comprehensive test coverage (happy path, edge cases, errors)
- [ ] Validates input and handles errors appropriately
- [ ] Contains no hardcoded secrets or credentials
- [ ] Performance is acceptable for expected load
- [ ] Code is self-documenting and maintainable

---

**Related Resources**:
- [Test Strategy Instructions](test-strategy.instructions.md)
- [Code Review Instructions](code-review.instructions.md) 
- [API Design Instructions](api-design.instructions.md)
- [Security Guidelines](../security/security-requirements.md)

---

**Document Status**: Active Framework | **Version**: 1.0 | **Last Updated**: March 31, 2026  
**Scope**: AI-first delivery Software Development Standards  
**Usage**: Coding standards implementation for AI-first delivery methodology
- [ ] Sensitive data protected
- [ ] No SQL injection/XSS vulnerabilities

### Performance
- [ ] No obvious performance issues
- [ ] Algorithms efficient
- [ ] No resource leaks
- [ ] Appropriate caching used
- [ ] Database queries optimized

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic explained
- [ ] Public API documented
- [ ] README updated if needed
- [ ] Comments explain WHY, not WHAT

---

## Continuous Improvement
Update this document based on lessons learned. Track changes with dates.

## Summary
1. Clean Code: Easy to read/understand/modify
2. SOLID Design: Flexible, maintainable
3. YAGNI: Avoid over-engineering
4. Comprehensive Tests: Confidence in changes
5. Security First: Protect data
6. Optimize What Matters: Measure before optimizing
7. Clear Communication: Code explains itself

**Goal**: Write code you'd be proud to maintain in 5 years.