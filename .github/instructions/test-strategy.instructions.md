---
description: Test strategy design patterns and edge case identification framework
applyTo: "src/**/*.test.ts,src/**/*.spec.ts,features/**"
---

# Test Strategy Standards

## Core Principle
**Tests verify behavior, not implementation**. Tests should describe WHAT the system does (outcomes), not HOW it works (internal mechanics).

---

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
  // BDD MAPPING: AUTH-003 - User can upgrade subscription tier
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
- BDD scenarios in `/docs/prd/user-stories.md` for E2E test requirements
