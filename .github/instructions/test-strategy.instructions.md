---
description: Test strategy design patterns and edge case identification framework
applyTo: "src/**/*.test.ts,src/**/*.spec.ts,features/**"
---

# Test Strategy Design Instructions

## Overview

This document provides systematic instructions for test strategy design and edge case identification using the AI-first delivery methodology. These instructions follow comprehensive testing principles and transform quality requirements into structured test implementations that deliver reliable software through comprehensive coverage, appropriate test pyramid distribution, and systematic edge case identification across all application layers.

## Process Overview

**Test Strategy Design Implementation** transforms quality requirements into comprehensive testing frameworks that provide reliable verification through structured test pyramid implementation, behavior-driven development scenarios, appropriate test distribution across unit/integration/E2E layers, and systematic edge case identification ensuring robust software delivery with confidence in system reliability.

## Implementation Process

### 1. Test Pyramid Implementation
**Objective**: Establish appropriate test distribution across unit, integration, and E2E layers

**Activities**:
- Implement 70% unit tests for isolated function/class verification with mocked dependencies
- Create 20% integration tests for component interaction with real databases and services
- Design 10% E2E tests for critical user workflows and BDD scenario validation
- Apply test-first development (TDD) principles: RED → GREEN → REFACTOR cycle

**Quality Standards**:
- Unit tests execute quickly (<1ms per test) with complete isolation
- Integration tests verify component interactions with real dependencies
- E2E tests validate complete user journeys and acceptance criteria
- All tests are readable, maintainable, and focused on behavior verification

### 2. Test Design Patterns by Layer
**Objective**: Apply appropriate testing patterns for each architectural layer

**Activities**:
- Design database layer integration tests with transaction rollback for data consistency
- Implement service layer unit tests with mocked dependencies and business logic verification
- Create API layer integration tests with request/response validation and error handling
- Develop UI layer component tests with user interaction simulation and state verification

**Quality Standards**:
- Each layer has appropriate test coverage matching its responsibility
- Test patterns align with architectural boundaries and concerns
- Mocking strategies prevent external dependencies in unit tests
- Integration tests verify actual component communication

### 3. Edge Case and Error Scenario Testing
**Objective**: Systematically identify and test edge cases, error conditions, and boundary scenarios

**Activities**:
- Execute boundary value analysis for input validation and limits
- Design error path testing for exception handling and recovery scenarios
- Implement negative testing for invalid inputs and malicious data
- Create performance testing for load conditions and resource constraints

**Quality Standards**:
- Edge cases are systematically identified through boundary analysis
- Error scenarios include both expected business errors and unexpected system failures
- Test coverage includes happy path, sad path, and edge case scenarios
- Performance testing validates acceptable response times under expected load

### 4. Behavior-Driven Development (BDD) Integration
**Objective**: Align tests with business requirements through BDD scenarios and acceptance criteria

**Activities**:
- Transform user stories into Gherkin scenarios (Given/When/Then format)
- Implement step definitions that map BDD scenarios to executable tests
- Create feature files that document business behavior in natural language
- Ensure BDD scenarios drive both development and acceptance testing

**Quality Standards**:
- All user stories have corresponding BDD scenarios in feature files
- BDD scenarios are written in business language, not technical implementation details
- Step definitions provide traceability from business requirements to test execution
- Acceptance criteria are fully covered by BDD scenario execution

## File Location Standards

**Output Location**: Organize test files following established patterns for maintainability and discoverability

**Source Materials**:
- **Unit Tests**: Co-located with source files (`*.test.ts`, `*.spec.ts`) or in dedicated `tests/unit/` directories
- **Integration Tests**: `tests/integration/` directory organized by feature or component
- **E2E Tests**: `tests/e2e/` or `features/` directory with BDD feature files and step definitions
- **Test Utilities**: `tests/helpers/` or `tests/utils/` for shared test fixtures and utilities

## Quality Assurance Process

### Pre-Implementation Validation
- ✅ Test strategy aligned with project architecture and technology stack
- ✅ Testing framework and tools configured (Jest, Playwright, Cucumber, etc.)
- ✅ Code coverage targets established and tooling configured
- ✅ BDD scenarios written and reviewed for user story completeness

### Post-Implementation Review
- ✅ Test pyramid distribution approximates 70/20/10 split across layers
- ✅ All tests pass consistently and execute within acceptable timeframes
- ✅ Code coverage meets minimum thresholds for critical business logic
- ✅ BDD scenarios provide complete acceptance criteria coverage
- ✅ Test maintenance burden remains manageable and sustainable

### Confidence Validation Requirements
- **Comprehensive Coverage**: Tests verify behavior across happy path, edge cases, and error scenarios
- **Performance Validation**: Test execution time remains acceptable for development workflow
- **Business Alignment**: BDD scenarios accurately reflect business requirements and acceptance criteria
- **Maintainability**: Tests are readable, focused, and easy to modify as requirements evolve

## Integration with Overall Assessment

Test Strategy serves as foundational input for:
- **Quality Assurance Framework**: Testing standards ensure consistent quality gates across development lifecycle
- **Continuous Integration**: Test automation enables reliable deployment pipelines and regression detection
- **Requirements Traceability**: BDD scenarios provide clear mapping from business requirements to test verification
- **Technical Risk Mitigation**: Comprehensive testing reduces production defects and system reliability issues

---

**Related Resources**:
- [Coding Standards Instructions](../coding.instructions.md)
- [Code Review Instructions](../code-review.instructions.md)
- [API Design Instructions](../api-design.instructions.md)
- [BDD Testing Framework Documentation](../../docs/testing/bdd-framework.md)

---

**Document Status**: Active Framework | **Version**: 1.0 | **Last Updated**: March 31, 2026  
**Scope**: AI-first delivery Test Strategy Standards  
**Usage**: Test strategy implementation for AI-first delivery methodology

## Test Pyramid

```
       /\
      /E2E\      10% - End-to-End (Playwright)
     /______\
    /        \
   /Integration\ 20% - Integration (Real DB, API)
  /____________\
 /              \
/      Unit      \ 70% - Unit (Isolated, Mocked)
/________________\
```

### Unit Tests (70%)
- **Scope**: Single function/class in isolation
- **Dependencies**: Mocked (no real DB, API, file system)
- **Speed**: Fast (<1ms per test)
- **Purpose**: Verify business logic correctness

### Integration Tests (20%)
- **Scope**: Multiple components working together
- **Dependencies**: Real (actual DB, services)
- **Speed**: Moderate (10-100ms per test)
- **Purpose**: Verify component interactions

### E2E Tests (10%)
- **Scope**: Full user workflows through UI
- **Dependencies**: All real (DB, API, browser)
- **Speed**: Slow (1-10 seconds per test)
- **Purpose**: Verify user journeys (BDD scenarios)

---

## Test Design Patterns by Layer

### Layer 1 (Database) - Integration Tests

**Focus**: Data persistence, integrity, query performance

```typescript
// Test migration reversibility
describe('UserSubscription Migration 003', () => {
  it('should migrate up and preserve existing data', async () => {
    // GIVEN: Database with existing users
    // WHEN: Migration applied
    // THEN: All user data preserved, new columns added with defaults
  });

  it('should rollback migration without data loss', async () => {
    // GIVEN: Database after migration
    // WHEN: Migration rolled back
    // THEN: Returns to previous state with data intact
  });
});

// Test query performance with indexes
describe('getUsersBySubscriptionTier', () => {
  it('should complete query in <50ms with 10K users', async () => {
    // GIVEN: Database with 10,000 users across all tiers
    // WHEN: Query for premium users
    // THEN: Results returned in <50ms (index on tier column)
  });
});
```

**NO unit tests for Layer 1** (database operations require real DB)

---

### Layer 2 (Backend) - Unit + Integration Tests

**Unit Tests**: Business logic with mocked dependencies

```typescript
// Unit test: Business logic isolated
describe('SubscriptionService.upgradeUser', () => {
  it('should sync User.tier and Subscription.tier when upgrading', async () => {
    // GIVEN: Mock user repository, mock subscription repository
    const mockUserRepo = createMockUserRepo();
    const mockSubRepo = createMockSubscriptionRepo();
    const service = new SubscriptionService(mockUserRepo, mockSubRepo);

    // WHEN: User upgraded from free to premium
    await service.upgradeUser('user_123', 'premium');

    // THEN: Both repositories called with tier='premium'
    expect(mockUserRepo.update).toHaveBeenCalledWith('user_123', { tier: 'premium' });
    expect(mockSubRepo.update).toHaveBeenCalledWith(expect.anything(), { tier: 'premium' });
  });

  it('should throw TierError for invalid tier', async () => {
    // GIVEN: Valid service setup
    // WHEN: Invalid tier provided
    // THEN: TierError thrown with descriptive message
    await expect(service.upgradeUser('user_123', 'invalid'))
      .rejects.toThrow(TierError);
  });
});
```

**Integration Tests**: Real DB + services

```typescript
// Integration test: Real database interactions
describe('SubscriptionService Integration', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await seedTestData();
  });

  it('should update both User and Subscription tables atomically', async () => {
    // GIVEN: Real user and subscription in database
    const userId = 'real_user_123';
    
    // WHEN: Upgrade fails midway (simulate error)
    await expect(service.upgradeUser(userId, 'invalid'))
      .rejects.toThrow();

    // THEN: Transaction rolled back, neither table updated
    const user = await getUserById(userId);
    const subscription = await getSubscriptionByUserId(userId);
    expect(user.tier).toBe('free'); // Original value
    expect(subscription.tier).toBe('free'); // Original value
  });
});
```

---

### Layer 3 (Config) - Configuration Tests

**Focus**: Dependency injection, route registration, middleware

```typescript
// Test DI container configuration
describe('Dependency Injection Container', () => {
  it('should register all services as singletons', () => {
    // GIVEN: Fresh DI container
    const container = createContainer();

    // WHEN: Resolve service twice
    const service1 = container.resolve<SubscriptionService>('SubscriptionService');
    const service2 = container.resolve<SubscriptionService>('SubscriptionService');

    // THEN: Same instance returned (singleton)
    expect(service1).toBe(service2);
  });
});

// Test route security
describe('API Route Authentication', () => {
  it('should reject requests without valid JWT', async () => {
    // GIVEN: Unauthenticated request
    // WHEN: POST /api/subscriptions/upgrade
    const response = await request(app)
      .post('/api/subscriptions/upgrade')
      .send({ tier: 'premium' });

    // THEN: Returns 401 Unauthorized
    expect(response.status).toBe(401);
  });
});
```

---

### Layer 4 (Frontend) - Component + E2E Tests

**Component Tests**: React Testing Library

```typescript
// Test component behavior
describe('SubscriptionUpgradeButton', () => {
  it('should disable button and show spinner during upgrade', async () => {
    // GIVEN: Component rendered with user context
    render(<SubscriptionUpgradeButton userId="user_123" />);

    // WHEN: Button clicked
    const button = screen.getByRole('button', { name: /upgrade/i });
    fireEvent.click(button);

    // THEN: Button disabled and spinner visible
    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  it('should show success message after upgrade completes', async () => {
    // GIVEN: Mock API success response
    mockAPI.upgradeSubscription.mockResolvedValue({ tier: 'premium' });

    // WHEN: Upgrade triggered and completes
    render(<SubscriptionUpgradeButton userId="user_123" />);
    fireEvent.click(screen.getByRole('button', { name: /upgrade/i }));
    await waitFor(() => screen.getByText(/upgraded successfully/i));

    // THEN: Success message displayed
    expect(screen.getByText(/upgraded successfully/i)).toBeInTheDocument();
  });
});
```

**E2E Tests**: Playwright (BDD scenarios)

```typescript
// E2E test: Full user journey
test('User can upgrade subscription tier', async ({ page }) => {
  // GIVEN: User logged in as free tier
  await page.goto('/dashboard');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // WHEN: User clicks upgrade to premium
  await page.click('text=Upgrade to Premium');
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.click('button:has-text("Confirm")');

  // THEN: Dashboard shows premium badge
  await expect(page.locator('.tier-badge')).toHaveText('Premium');
  await expect(page.locator('.storage-limit')).toHaveText('3 GB');
});
```

---

## Edge Case Identification Framework

For every function/feature, systematically test:

### 1. Golden Path (Happy Path)
✅ **Normal inputs → Expected outputs**

```typescript
// Golden path: Valid upgrade
it('should upgrade free user to premium', async () => {
  const result = await upgradeUser('user_123', 'premium');
  expect(result.tier).toBe('premium');
});
```

### 2. Boundary Conditions
✅ **Min/max values, thresholds**

```typescript
// Boundary: Maximum tier (enterprise)
it('should not allow upgrade beyond enterprise tier', async () => {
  await expect(upgradeUser('user_123', 'super-enterprise'))
    .rejects.toThrow(TierError);
});

// Boundary: Empty storage (0 bytes)
it('should handle users with zero storage used', async () => {
  const user = await createUser({ storageUsed: 0 });
  expect(user.storageLimit).toBe(1024); // Default free tier
});
```

### 3. Error Scenarios
✅ **Invalid inputs, failures, exceptions**

```typescript
// Error: Network failure during payment
it('should rollback tier change if payment fails', async () => {
  mockPaymentGateway.charge.mockRejectedValue(new PaymentError('Card declined'));
  
  await expect(upgradeUser('user_123', 'premium'))
    .rejects.toThrow(PaymentError);
  
  const user = await getUserById('user_123');
  expect(user.tier).toBe('free'); // Unchanged
});
```

### 4. Null/Empty/Missing Values
✅ **null, undefined, empty strings, empty arrays**

```typescript
// Null: User ID is null
it('should throw error if userId is null', async () => {
  await expect(upgradeUser(null, 'premium'))
    .rejects.toThrow('userId is required');
});

// Empty: No payment method provided
it('should throw error if payment method missing', async () => {
  await expect(upgradeUser('user_123', 'premium', ''))
    .rejects.toThrow('Payment method required');
});
```

### 5. Concurrency & Race Conditions
✅ **Simultaneous operations, conflicts**

```typescript
// Concurrency: Simultaneous tier upgrades
it('should handle concurrent upgrade requests gracefully', async () => {
  // GIVEN: Two simultaneous upgrade requests for same user
  const upgrade1 = upgradeUser('user_123', 'premium');
  const upgrade2 = upgradeUser('user_123', 'enterprise');

  // WHEN: Both execute
  const results = await Promise.allSettled([upgrade1, upgrade2]);

  // THEN: One succeeds, one fails with conflict error
  const succeeded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  expect(succeeded).toHaveLength(1);
  expect(failed).toHaveLength(1);
});
```

---

## Mock Strategy Decision Tree

```
Is this a unit test?
├─ YES → Mock all external dependencies
│   ├─ Database → Mock repository
│   ├─ External API → Mock HTTP client
│   ├─ File system → Mock file operations
│   └─ Time → Mock Date.now() or clock
│
└─ NO (Integration/E2E test) → Use real dependencies
    ├─ Database → Real DB (test database)
    ├─ External API → Real API OR test doubles (WireMock)
    └─ File system → Real files (temp directory)
```

### When to Mock
- **Unit tests**: Always mock external dependencies
- **Slow operations**: Database, network, file I/O
- **Non-deterministic**: Random, time, external APIs
- **Third-party services**: Payment gateways, email providers

### When to Use Real Dependencies
- **Integration tests**: Test actual interactions
- **Critical paths**: Database transactions, payment flows
- **Configuration**: DI container, route registration

---

## Test Naming Convention

```typescript
describe('[ComponentName/FunctionName]', () => {
  it('should [expected behavior] when [condition]', () => {
    // Test implementation
  });
});
```

**Examples**:
```typescript
describe('SubscriptionService', () => {
  it('should sync User.tier and Subscription.tier when upgrading', () => {});
  it('should throw TierError when target tier is invalid', () => {});
  it('should rollback transaction when payment fails', () => {});
});
```

---

## Test Documentation Format

```typescript
describe('Feature: Subscription Tier Upgrade', () => {
  // BDD MAPPING: US-XXX - User can upgrade subscription tier
  // Test Strategy: Unit tests for business logic, integration for DB sync
  // Edge Cases: Invalid tier, payment failure, concurrent upgrades
  // Mocks: PaymentGateway (unit), Real DB (integration)

  it('should update both User.tier and Subscription.tier when upgrading', () => {
    // GIVEN: Free user with active subscription
    // WHEN: User upgrades to premium
    // THEN: Both tier fields synchronized
  });
});
```

---

## Performance Test Requirements

### When Performance Tests Are Required
- Database queries returning >1000 rows
- API endpoints with >100 requests/second traffic
- Complex algorithms (sorting, searching large datasets)
- File processing (uploads, exports)

```typescript
describe('Performance: getUsersByTier', () => {
  it('should complete query in <50ms with 10K users', async () => {
    // GIVEN: Database with 10,000 users
    await seedUsers(10000);

    // WHEN: Query all premium users
    const start = Date.now();
    const users = await getUsersByTier('premium');
    const duration = Date.now() - start;

    // THEN: Completes in <50ms
    expect(duration).toBeLessThan(50);
  });
});
```

---

## Test Quality Checklist

Before committing tests:
- [ ] Tests describe behavior (not implementation details)
- [ ] Test names follow convention: "should [behavior] when [condition]"
- [ ] Golden path covered
- [ ] Boundary conditions tested
- [ ] Error scenarios handled
- [ ] Null/empty values tested
- [ ] BDD scenario mapping documented (for E2E tests)
- [ ] Mocked dependencies appropriate (unit vs integration)
- [ ] Tests are fast (<1s unit, <5s integration, <30s E2E)
- [ ] Tests are deterministic (no flakiness)

---

## Applied To
- **dev-lead**: Designs test strategy in implementation plan
- **dev-tdd-red**: Implements tests following strategy

---

**Reference**:
- [coding.instructions.md](coding.instructions.md) for TDD discipline
- BDD scenarios in `/docs/01-requirements/user-stories.md` for E2E test requirements
