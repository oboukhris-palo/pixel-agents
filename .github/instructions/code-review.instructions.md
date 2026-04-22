---
description: Code review standards and automated review report generation
applyTo: "src/**"
---

# Code Review Standards Instructions

## Overview

This document provides systematic instructions for code review standards and automated review report generation using the AI-first delivery methodology. These instructions follow industry best practices for code quality assessment and transform review processes into comprehensive quality gates that ensure consistent code standards, identify potential issues, and facilitate knowledge transfer across development teams through structured review protocols.

## Process Overview

**Code Review Standards Implementation** transforms quality assurance requirements into structured review processes that deliver consistent code quality through systematic evaluation criteria, automated analysis integration, constructive feedback protocols, and comprehensive quality gates ensuring code meets standards before integration while facilitating team knowledge sharing and continuous improvement.

## Implementation Process

## Review Purpose
Ensure code quality, maintainability, security, and compliance with project standards before merging.

---

## 13-Point Code Review Checklist

### 1. Requirements Compliance ✅
- [ ] Code implements all acceptance criteria from user story
- [ ] BDD scenarios pass (green tests)
- [ ] No scope creep (only implements story requirements)

### 2. SOLID Principles 🏗️
- [ ] **S**ingle Responsibility: Each class/function has one reason to change
- [ ] **O**pen/Closed: Extensible without modification (use interfaces/abstractions)
- [ ] **L**iskov Substitution: Subclasses work as base class replacements
- [ ] **I**nterface Segregation: No fat interfaces (clients use all methods)
- [ ] **D**ependency Inversion: Depend on abstractions, not concretions

### 3. No Code Duplication ♻️
- [ ] No copy-pasted code (extract to shared functions/classes)
- [ ] DRY principle: Logic exists in one place only
- [ ] Shared utilities properly abstracted

### 4. Clear Naming 📝
- [ ] Variables/functions/classes have descriptive names
- [ ] Naming reveals intent (no `temp`, `data`, `foo`)
- [ ] Boolean variables are questions (`isActive`, `hasPermission`)
- [ ] Functions are verbs (`getUserById`, `validateEmail`)

### 5. Test Coverage 🧪
- [ ] Tests cover happy paths (expected inputs → expected outputs)
- [ ] Tests cover edge cases (boundaries, empty, null)
- [ ] Tests cover error paths (exceptions, validation failures)
- [ ] Unit test coverage >80%, integration coverage >70%

### 6. Input Validation 🛡️
- [ ] All user inputs validated (type, format, length, range)
- [ ] Validation happens at API boundaries (not deep in business logic)
- [ ] Error messages are clear and actionable
- [ ] Validation rules documented in code comments

### 7. No Hardcoded Secrets 🔐  
- [ ] No API keys, passwords, tokens in code
- [ ] Secrets stored in environment variables or secret management system
- [ ] .env files in .gitignore
- [ ] Configuration separate from code

### 8. No Performance Issues ⚡
- [ ] No obvious O(n²) algorithms where O(n) or O(log n) possible
- [ ] Database queries optimized (indexes, pagination, no N+1)
- [ ] No unnecessary network calls in loops
- [ ] Caching used where appropriate

### 9. Self-Documenting Code 📖
- [ ] Code logic is clear without needing extensive comments
- [ ] WHY comments present for non-obvious decisions
- [ ] API documentation (JSDoc/docstrings) for public functions
- [ ] Complex algorithms explained

### 10. Appropriate Design Patterns 🎨
- [ ] Design patterns used correctly (not over-engineered)
- [ ] Patterns fit the problem (Repository, Factory, Strategy, etc.)
- [ ] No anti-patterns (God Object, Spaghetti Code, etc.)

### 11. Architecture Consistency 🏛️
- [ ] Follows project layering (Database → Backend → Config → Frontend)
- [ ] Respects boundaries (no direct DB access from frontend)
- [ ] Dependency injection used correctly
- [ ] Follows established patterns in codebase

### 12. No Dead Code 🧹
- [ ] No unused imports, variables, functions
- [ ] No commented-out code (use version control history)
- [ ] No unreachable code paths

### 13. No Magic Numbers/Strings 🔮
- [ ] Hard-coded values extracted to named constants
- [ ] Constants explained (e.g., `MAX_LOGIN_ATTEMPTS = 3 // Security policy`)
- [ ] Configuration values in config files (not scattered in code)

---

## Severity Classification

### 🔴 CRITICAL (Block merge)
- Security vulnerabilities (SQL injection, XSS, auth bypass)
- Data loss scenarios (unvalidated deletes, cascade issues)
- Breaking changes without migration path
- Failing tests or BDD scenarios
- Hardcoded secrets or credentials

**Action**: MUST fix before merge

### 🟠 HIGH (Should fix before merge)
- Performance issues (inefficient algorithms, N+1 queries)
- Missing error handling (unhandled exceptions)
- Incomplete test coverage (<70%)
- SOLID principle violations
- Missing input validation

**Action**: Fix before merge OR create follow-up story with justification

### 🟡 MEDIUM (Consider fixing)
- Code duplication (small sections)
- Minor code smells (long functions, deep nesting)
- Missing inline comments for complex logic
- Inconsistent naming conventions
- Opportunities for refactoring

**Action**: Fix if time permits OR add TODO comment

### 🟢 LOW (Optional improvements)
- Style preferences (not covered by linter)
- Micro-optimizations without measured benefit
- Alternative patterns (both are acceptable)
- Documentation enhancements

**Action**: Optional; discuss with team

---

## Review Report Format

```markdown
# Code Review Report: [USER-STORY-REF]

**Reviewer**: [Agent Name]  
**Date**: [YYYY-MM-DD]  
**Commit/Branch**: [Commit SHA or branch name]

---

## Summary
[1-2 sentence overview of changes reviewed]

---

## Strengths
- ✅ [Positive observation 1]
- ✅ [Positive observation 2]
- ✅ [Positive observation 3]

---

## Issues Found

### 🔴 CRITICAL (Must fix before merge)
- [ ] **[File:Line]**: [Issue description]
  - **Why**: [Explanation of impact]
  - **Fix**: [Concrete suggestion]

### 🟠 HIGH (Should fix before merge)
- [ ] **[File:Line]**: [Issue description]
  - **Why**: [Explanation of impact]
  - **Fix**: [Concrete suggestion]

### 🟡 MEDIUM (Consider fixing)
- [ ] **[File:Line]**: [Issue description]
  - **Suggestion**: [Improvement idea]

### 🟢 LOW (Optional improvements)
- [ ] **[File:Line]**: [Issue description]
  - **Suggestion**: [Enhancement idea]

---

## Recommendations
[Architectural or pattern suggestions for future improvement]

---

## 13-Point Checklist
- [ ] 1. Code implements requirements
- [ ] 2. SOLID principles followed
- [ ] 3. No duplication
- [ ] 4. Clear naming
- [ ] 5. Tests cover happy/edge/error paths
- [ ] 6. Input validated
- [ ] 7. No hardcoded secrets
- [ ] 8. No obvious performance issues
- [ ] 9. Code is self-documenting
- [ ] 10. Appropriate design patterns
- [ ] 11. Consistent with codebase architecture
- [ ] 12. No dead code
- [ ] 13. No magic numbers/strings

---

## Approval Status
- [ ] ✅ **APPROVED** - Ready to merge
- [ ] ❌ **REJECTED** - See critical/high issues above
- [ ] ⚠️ **APPROVED WITH COMMENTS** - Can merge but create follow-up stories for high issues

**Next Steps**: [Instructions for developer]
```

---

## Review Focus by Layer

### Layer 1 (Database) 🗄️
- **Migration Safety**: Reversible migrations, data preservation, no destructive changes
- **Index Performance**: Indexes on foreign keys and query columns
- **Data Integrity**: Foreign key constraints, cascades, uniqueness
- **Schema Design**: Normalization, appropriate data types, default values

### Layer 2 (Backend) 🔧
- **Business Logic Correctness**: Implements domain rules accurately
- **Error Handling**: Try-catch blocks, meaningful errors, logging
- **Transaction Management**: ACID properties, rollback on failure
- **Service Layer**: Clean separation from controllers/routes

### Layer 3 (Config) ⚙️
- **DI Correctness**: Dependencies properly injected, lifecycle management
- **Feature Flag Safety**: Default states, gradual rollout, kill switches
- **Route Security**: Auth middleware, rate limiting, CORS
- **Environment Config**: No hardcoded values, env-specific settings

### Layer 4 (Frontend) 🎨
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **State Management**: Redux/Context correctness, no prop drilling
- **Component Structure**: Reusable components, proper composition
- **User Experience**: Loading states, error messages, responsive design

---

## Automated Review Thresholds

### Auto-Approve Conditions
- ✅ All tests passing
- ✅ 0 critical issues
- ✅ 0 high issues
- ✅ Coverage >80%
- ✅ Complexity <10 per function

### Auto-Reject Conditions
- ❌ Any critical issue found
- ❌ >2 high issues found
- ❌ Coverage <70%
- ❌ Any failing tests

### Manual Review Required
- ⚠️ 1-2 high issues (needs justification)
- ⚠️ >5 medium issues (code quality concern)
- ⚠️ Architectural changes (requires architect approval)

---

## Applied To
- **dev-tdd-refactor**: Generates self-review report during refactor phase
- **dev-lead**: Reviews and approves/rejects before merge

---

**Reference**: 
- [coding.instructions.md](coding.instructions.md) for code quality standards
- [code-comments.instructions.md](code-comments.instructions.md) for documentation requirements
