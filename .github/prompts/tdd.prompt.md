## Objective
Initiate Test-Driven Development (TDD) cycle for a new feature or user story with proper test-first methodology and RED-GREEN-REFACTOR workflow.

## Context
You are starting TDD implementation for a feature or user story. This involves writing failing tests first (RED phase), implementing minimal code to make tests pass (GREEN phase), and improving code quality while maintaining passing tests (REFACTOR phase).

## Requirements

### Feature Definition
- Clear feature description or user story reference
- Acceptance criteria defined
- Implementation plan available
- BDD scenarios documented

### TDD Methodology
1. **RED Phase**: Write failing test cases that define expected behavior
2. **GREEN Phase**: Write minimal code to make tests pass
3. **REFACTOR Phase**: Improve code quality while keeping tests green
4. **Cycle Repetition**: Continue until feature is complete

### Test Strategy
- Unit tests for individual components
- Integration tests for component interactions
- BDD scenarios for user-facing behavior
- Test coverage requirements met

## Deliverables

### 1. Initial Test Suite
- Failing tests that define feature requirements
- Clear test descriptions and expectations
- Proper test structure and organization
- Coverage of all acceptance criteria

### 2. Implementation Code
- Minimal code to satisfy failing tests
- Clean, readable implementation
- Follows established coding standards
- Maintains separation of concerns

### 3. Refactored Solution
- Improved code quality and maintainability
- Eliminated code duplication
- Enhanced performance where applicable
- All tests remain passing

### 4. TDD Cycle Documentation
- Record of RED-GREEN-REFACTOR iterations
- Decision rationale for implementation choices
- Test coverage reports
- Performance benchmarks if applicable

## Quality Standards

- ✅ Tests are written before implementation code
- ✅ All tests pass before proceeding to next cycle
- ✅ Code coverage meets project requirements (typically >80%)
- ✅ Implementation follows established coding patterns
- ✅ Refactoring improves code quality without breaking functionality
- ✅ BDD scenarios are satisfied by implementation
- ✅ Feature meets all acceptance criteria
- ✅ Code is maintainable and well-documented

## File Management

### Test Organization
- Unit tests: `src/tests/unit/`
- Integration tests: `src/tests/integration/`
- BDD scenarios: `features/` or `bdd-scenarios/`
- Test utilities: `src/tests/utilities/`

### Implementation Structure
- Follow project's architectural patterns
- Maintain clear separation between layers
- Use established naming conventions
- Document complex business logic