---
description: Standards for inline code comments and API documentation
applyTo: "src/**"
---

# Code Comments Standards

## Core Principle
**Comment the WHY, not the WHAT**. Code should be self-explanatory (what it does), but comments explain reasoning (why it exists, why this approach, what constraints/assumptions).

---

## When to Comment (✅ Required)

### 1. Business Logic & Domain Rules
Explain business rules that aren't obvious from code:
```typescript
// WHY: Premium users get 3x storage per PRODUCT-REQ-047
// Free tier: 1GB, Premium: 3GB, Enterprise: 10GB
const storageLimit = user.tier === 'premium' ? 3072 : 1024;
```

### 2. Non-Obvious Decisions
Document why you chose this approach over alternatives:
```typescript
// WHY: Using Set instead of Array for O(1) lookup performance
// Tested with 10K+ items: Set=2ms, Array=450ms
const activeUserIds = new Set<string>();
```

### 3. Complex Algorithms
Explain the logic flow for non-trivial algorithms:
```typescript
// WHY: Binary search requires sorted array for O(log n) performance
// Falls back to linear search if unsorted (detected by first pass)
function findUser(users: User[], email: string): User | null {
  // ... implementation
}
```

### 4. Security Constraints
Document security assumptions and validation rules:
```typescript
// SECURITY: Input validated against SQL injection (parameterized queries)
// SECURITY: Rate limited to 10 requests/minute per IP (AUTH-SEC-12)
async function loginUser(email: string, password: string) {
  // ... implementation
}
```

### 5. Performance Optimizations
Explain performance tradeoffs and benchmarks:
```typescript
// PERFORMANCE: Debounced 300ms to reduce API calls (measured 95% reduction)
// Tradeoff: Slight input lag acceptable for search use case
const debouncedSearch = debounce(searchAPI, 300);
```

### 6. Workarounds & Technical Debt
Document hacks, workarounds, and future improvements:
```typescript
// TODO(tech-debt): Replace with native Intl.Segmenter when Safari support reaches 90%
// Current workaround: Third-party library (grapheme-splitter) for emoji handling
// Reference: US-245
const graphemes = splitGraphemes(text);
```

### 7. External Dependencies & Contracts
Explain integration points and data contracts:
```typescript
// EXTERNAL: Stripe webhook expects idempotency key in header
// Contract: https://stripe.com/docs/api/idempotent_requests
// Retry policy: 3 attempts with exponential backoff
async function handleStripeWebhook(payload: StripeEvent) {
  // ... implementation
}
```

### 8. Edge Cases & Boundary Conditions
Document edge case handling:
```typescript
// EDGE CASE: Empty array returns 0 (not null) per API contract
// EDGE CASE: Single element returns itself (no comparison needed)
function findMax(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  // ... implementation
}
```

---

## When NOT to Comment (❌ Avoid)

### 1. Self-Explanatory Code
```typescript
// ❌ BAD: Redundant comment
// Get the user by ID
const user = getUserById(userId);

// ✅ GOOD: No comment needed (code is clear)
const user = getUserById(userId);
```

### 2. Describing WHAT Code Does
```typescript
// ❌ BAD: Describes WHAT
// Loop through users and filter active ones
const activeUsers = users.filter(u => u.status === 'active');

// ✅ GOOD: Explains WHY (if needed)
// WHY: Only active users can access premium features (PRODUCT-RULE-03)
const activeUsers = users.filter(u => u.status === 'active');
```

### 3. Commented-Out Code
```typescript
// ❌ BAD: Commented-out code (use version control instead)
// const oldImplementation = () => { ... };

// ✅ GOOD: Remove dead code (Git history preserves it)
```

---

## API Documentation Standards

### Public Functions (REQUIRED)
Use JSDoc for TypeScript/JavaScript, docstrings for Python:

```typescript
/**
 * Upgrades user subscription to specified tier.
 * 
 * WHY: Synchronizes both User.tier and Subscription.tier to prevent data inconsistency.
 * Critical for AUTH-003 BDD scenario compliance.
 * 
 * @param userId - UUID of user to upgrade
 * @param targetTier - Tier to upgrade to ('free' | 'premium' | 'enterprise')
 * @param paymentMethodId - Stripe payment method ID for billing
 * 
 * @returns Promise resolving to updated User object
 * @throws {PaymentError} If payment method is invalid or declined
 * @throws {TierError} If target tier is invalid or downgrade attempt
 * 
 * @example
 * const user = await upgradeSubscription('usr_123', 'premium', 'pm_456');
 * console.log(user.tier); // 'premium'
 */
async function upgradeSubscription(
  userId: string,
  targetTier: SubscriptionTier,
  paymentMethodId: string
): Promise<User> {
  // Implementation...
}
```

### Public Classes/Interfaces (REQUIRED)
```typescript
/**
 * Represents a user subscription with billing and tier information.
 * 
 * WHY: Separate from User model to support multi-subscription future state.
 * 
 * Lifecycle:
 * 1. Created on user registration (free tier)
 * 2. Updated on tier changes (preserves history)
 * 3. Canceled on user deletion (soft delete)
 * 
 * @see User model for user-specific data
 * @see docs/prd/architecture-design.md for data model design
 */
interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  // ...
}
```

---

## TODO Comment Format

```typescript
// TODO(<category>): <description> [optional: story-reference]
//   - <optional: subtask>
//   - <optional: subtask>

// TODO(bug): Handle null case when API returns empty response [US-123]

// TODO(performance): Optimize query with index on user_id + created_at [US-456]

// TODO(tech-debt): Refactor to use Strategy pattern when >3 payment providers
//   - Extract PaymentProvider interface
//   - Implement adapters for Stripe, PayPal, Square
//   - Reference: US-789
```

**Categories**: `bug`, `feature`, `tech-debt`, `performance`, `security`, `docs`, `test`

---

## Comment Quality Checklist

Before committing code, verify:
- [ ] Complex business logic has WHY comments
- [ ] All public functions have JSDoc/docstrings
- [ ] Security constraints are documented
- [ ] Performance optimizations explain tradeoffs
- [ ] TODO comments include category and story reference (if applicable)
- [ ] No redundant comments describing obvious code
- [ ] No commented-out code (removed)

---

## Applied To
- **dev-tdd-green**: Add inline comments during implementation
- **dev-tdd-refactor**: Improve comment quality and add API docs
- **dev-lead**: Add skeleton comments in method signatures

---

**Reference**: [coding.instructions.md](coding.instructions.md) for code quality standards
