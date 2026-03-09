# Implementation Plan: {USER-STORY-REF}

**User Story**: {USER-STORY-TITLE}  
**Epic**: {EPIC-NAME}  
**Priority**: {High/Medium/Low}  
**Estimated Effort**: {X} story points

---

## Story Overview

### Description
{User story description from /docs/prd/user-stories.md}

### Business Value
{Why this story matters to users/business}

### Acceptance Criteria
{Copy from user story - what must be true for this story to be accepted}

---

## BDD Scenarios

**Location**: `/docs/user-stories/{USER-STORY-REF}/bdd-scenarios/`

### Failing BDD Tests Summary
{List which BDD scenarios are failing and which assertions need implementation}

**Example**:
```gherkin
Feature: Subscription Tier Upgrade
  Scenario: User upgrades from free to premium tier
    Given a free tier user with active subscription
    When the user upgrades to premium tier with valid payment
    Then both User.tier and Subscription.tier are set to "premium"  ❌ FAILING
    And the user receives premium storage limit (3GB)  ❌ FAILING
    And payment is processed successfully  ❌ FAILING
```

---

## Layer 1 - Database

### Schema Changes
**Tables to create/modify**:
```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  current_period_end TIMESTAMP
);
```

### Migrations
- **Migration**: `migrations/003_add_tier_sync.sql`
  - Add `tier` column to `users` table
  - Backfill from existing `subscriptions` table
- **Rollback**: `migrations/003_add_tier_sync_down.sql`

### Indexes
```sql
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### Model Classes
- **File**: `src/models/User.ts`
  - Properties: `id`, `email`, `tier`, `createdAt`
  - Validations: Email format, tier enum values
- **File**: `src/models/Subscription.ts`
  - Properties: `id`, `userId`, `tier`, `status`, `currentPeriodEnd`
  - Validations: Tier/status enum, period dates

### Files to Create
- `src/models/User.ts` (model class with validation)
- `src/models/Subscription.ts` (model class with validation)
- `src/migrations/003_add_tier_sync.sql` (up migration)
- `src/migrations/003_add_tier_sync_down.sql` (down migration)

### BDD Test Coverage
After Layer 1 complete, these BDD assertions will pass:
- ✅ User/Subscription models exist with tier fields
- ❌ Tier synchronization (requires Layer 2 service logic)
- ❌ Payment processing (requires Layer 2 payment integration)

### TDD Approach
- **Integration tests only** (Layer 1 has no unit tests)
- Test migration up/down with real database
- Test model validation rules (valid/invalid tier values)
- Test constraints (unique email, foreign key cascade)

### Architectural Constraints
- Follow [architecture-design.md](../../docs/prd/architecture-design.md) data model
- Use UUID for all primary keys (distributed system future-proof)
- Soft deletes NOT implemented (out of scope for this story)

### Estimated Complexity
- **Story Points**: 3
- **Hours**: 4-6 hours (includes migration testing)

### Test Strategy
- **Edge Cases**: 
  - Invalid tier value \u2192 expect validation errorEmpty/null fields \u2192 expect constraint error
  - Migration rollback with existing data
- **Mock Strategy**: Use real database (no mocks for Layer 1)
- **Test Types**: Integration tests with test database
- **Expected Coverage**: 100% of migration paths

---

## Layer 2 - Backend Logic

### API Endpoints
```
POST /api/users/:userId/subscriptions/upgrade
Request:
{
  "targetTier": "premium",
  "paymentMethodId": "pm_1234567890"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { "id": "...", "tier": "premium" },
    "subscription": { "id": "...", "tier": "premium", "status": "active" }
  }
}

Response 400 (Invalid Tier):
{
  "success": false,
  "error": {
    "code": "INVALID_TIER",
    "message": "Target tier 'invalid' not allowed"
  }
}

Response 402 (Payment Failed):
{
  "success": false,
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment method declined"
  }
}
```

### Service Classes
- **File**: `src/services/SubscriptionService.ts`
  - Method: `async upgradeSubscription(userId, targetTier, paymentMethodId): Promise<User>`
  - Business Logic:
    1. Validate target tier (enum check)
    2. Process payment via payment gateway
    3. **CRITICAL**: Update BOTH `users.tier` AND `subscriptions.tier` in transaction
    4. Handle payment failures (rollback transaction)
    5. Return updated user object

### Validation Rules
- Target tier must be one of: 'free', 'premium', 'enterprise'
- Payment method ID must match regex: `^pm_[a-zA-Z0-9]{10,}$`
- User must exist (404 if not found)
- Cannot "upgrade" to lower tier (409 Conflict)

### Error Handling
```typescript
class TierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TierError';
  }
}

class PaymentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PaymentError';
  }
}
```

### Integration Points
- **Payment Gateway**: Stripe API (`stripe.paymentMethods.charge()`)
- **Database**: UserRepository, SubscriptionRepository
- **Logging**: Log tier changes for audit trail

### Files to Create
- `src/services/SubscriptionService.ts` (business logic)
- `src/controllers/SubscriptionController.ts` (HTTP handling)
- `src/validators/SubscriptionValidator.ts` (input validation)
- `src/errors/TierError.ts` (custom error)
- `src/errors/PaymentError.ts` (custom error)

### BDD Test Coverage
After Layer 2 complete, these BDD assertions will pass:
- ✅ User.tier and Subscription.tier synchronized
- ✅ Payment processed successfully
- ✅ Tier validation enforced
- ❌ API endpoint accessible (requires Layer 3 routing)
- ❌ Frontend shows updated tier (requires Layer 4)

### TDD Approach
- **Unit Tests**: Business logic with mocked repositories
  - Mock `UserRepository.update()`
  - Mock `SubscriptionRepository.update()`
  - Mock `PaymentGateway.charge()`
- **Integration Tests**: Real database + real services
  - Test transaction rollback on payment failure
  - Test both tables updated atomically

### Architectural Constraints
- Follow [architecture-design.md](../../docs/prd/architecture-design.md) service layer patterns
- Use dependency injection for repositories and payment gateway
- Implement idempotency for payment operations (idempotency key header)
- Transaction scope: Single database transaction for dual-write

### Estimated Complexity
- **Story Points**: 5
- **Hours**: 8-10 hours (includes payment integration)

### Test Strategy
- **Edge Cases**:
  - Invalid tier value
  - Payment method declined
  - Concurrent upgrade requests (race condition)
  - Transaction rollback verification
- **Mock Strategy**: Mock PaymentGateway for unit tests, real gateway for E2E
- **Test Types**: Unit (mocked), Integration (real DB + services)
- **Expected Coverage**: >90% for service layer

---

## Layer 3 - Configuration

### Route Registration
```typescript
// src/routes/subscriptions.routes.ts
router.post(
  '/users/:userId/subscriptions/upgrade',
  authenticate,        // JWT validation middleware
  rateLimit(10, 60),  // 10 requests per minute
  SubscriptionController.upgrade
);
```

### Dependency Injection
```typescript
// src/config/di.config.ts
container.register('SubscriptionService', {
  useClass: SubscriptionService,
  lifecycle: Lifecycle.Singleton
});

container.register('PaymentGateway', {
  useClass: StripeGateway,
  lifecycle: Lifecycle.Singleton
});
```

### Feature Flags
```typescript
// src/config/features.config.ts
export const features = {
  TIER_UPGRADES_ENABLED: process.env.FEATURE_TIER_UPGRADES === 'true',
  STRIPE_INTEGRATION: process.env.STRIPE_API_KEY ? true : false
};
```

### Middleware Setup
- **Authentication**: JWT validation (`authenticate` middleware)
- **Rate Limiting**: 10 requests/minute per user (`rateLimit` middleware)
- **Error Handling**: Global error handler for custom errors
- **CORS**: Allow frontend domain (`cors` middleware)

### Files to Create
- `src/routes/subscriptions.routes.ts` (route definitions)
- `src/config/di.config.ts` (DI container setup)
- `src/config/features.config.ts` (feature flag management)
- `src/middleware/authenticate.ts` (JWT validation)
- `src/middleware/rateLimit.ts` (rate limiting)

### BDD Test Coverage
After Layer 3 complete, these BDD assertions will pass:
- ✅ API endpoint accessible and routed correctly
- ✅ Authentication required (401 if no token)
- ✅ Rate limiting enforced
- ❌ Frontend integration (requires Layer 4)

### TDD Approach
- **Configuration Tests**: DI container validation
  - Test service registration (singleton lifecycle)
  - Test dependency resolution
- **Route Tests**: Request/response validation
  - Test authentication middleware (valid/invalid tokens)
  - Test rate limiting (exceed limit → 429 status)

### Architectural Constraints
- Follow [architecture-design.md](../../docs/prd/architecture-design.md) configuration patterns
- Environment-based feature flags (not database-driven)
- Middleware order: CORS → Authentication → Rate Limit → Routes

### Estimated Complexity
- **Story Points**: 2
- **Hours**: 3-4 hours

### Test Strategy
- **Edge Cases**:
  - Missing JWT token
  - Expired JWT token
  - Rate limit exceeded
  - Feature flag disabled
- **Mock Strategy**: No mocks (test real middleware stack)
- **Test Types**: Integration tests (HTTP requests)
- **Expected Coverage**: >80% for config layer

---

## Layer 4 - Frontend

### Components to Create

**Component Hierarchy**:
```
SubscriptionSettings/
├── SubscriptionCard (displays current tier)
├── UpgradeButton (triggers upgrade flow)
├── UpgradeModal (payment form)
│   ├── TierSelector (choose target tier)
│   ├── PaymentForm (Stripe Elements)
│   └── ConfirmButton (submit upgrade)
└── TierBadge (visual tier indicator)
```

### Component Details

**SubscriptionSettings.tsx**:
- Fetches current user subscription on mount
- Displays tier badge and benefits
- Conditionally shows upgrade button (if not enterprise)

**UpgradeModal.tsx**:
- Controlled component (open/close state)
- Integrates Stripe Elements for payment
- Calls `/api/users/:userId/subscriptions/upgrade` on submit
- Handles success/error states (loading spinner, error messages)

**TierBadge.tsx**:
- Visual indicator of tier (color-coded)
- Free: Gray, Premium: Blue, Enterprise: Gold

### State Management

**Redux Actions**:
```typescript
// actions/subscription.actions.ts
export const upgradeSubscription = (userId, targetTier, paymentMethodId) => async (dispatch) => {
  dispatch({ type: 'UPGRADE_SUBSCRIPTION_REQUEST' });
  try {
    const result = await api.post(`/users/${userId}/subscriptions/upgrade`, {
      targetTier,
      paymentMethodId
    });
    dispatch({ type: 'UPGRADE_SUBSCRIPTION_SUCCESS', payload: result.data });
  } catch (error) {
    dispatch({ type: 'UPGRADE_SUBSCRIPTION_FAILURE', payload: error.message });
  }
};
```

**Redux Reducer**:
```typescript
// reducers/subscription.reducer.ts
const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPGRADE_SUBSCRIPTION_SUCCESS':
      return { ...state, tier: action.payload.user.tier, loading: false };
    // ... other cases
  }
};
```

### API Client Integration
```typescript
// services/api.client.ts
export const upgradeSubscription = (userId: string, data: UpgradeRequest) => {
  return axios.post(`/api/users/${userId}/subscriptions/upgrade`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};
```

### Styling Requirements

**Design Tokens** (from [design-systems.md](../../docs/design/design-systems.md)):
```scss
$tier-free-color: #6B7280;
$tier-premium-color: #3B82F6;
$tier-enterprise-color: #F59E0B;

$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;

$font-size-body: 16px;
$font-size-heading: 24px;
```

**Component Styles**:
- Tier badge: 80px width, 28px height, rounded corners (4px radius)
- Upgrade button: Primary blue (#3B82F6), hover state (#2563EB)
- Modal: Centered overlay, 600px max-width, white background, shadow

### Files to Create
- `src/components/SubscriptionSettings/index.tsx`
- `src/components/SubscriptionSettings/UpgradeModal.tsx`
- `src/components/SubscriptionSettings/TierBadge.tsx`
- `src/components/SubscriptionSettings/styles.scss`
- `src/redux/actions/subscription.actions.ts`
- `src/redux/reducers/subscription.reducer.ts`
- `src/services/api.client.ts` (extend existing)

### BDD Test Coverage
After Layer 4 complete, ALL BDD assertions will pass:
- ✅ Frontend displays current tier badge
- ✅ Upgrade button triggers modal
- ✅ Payment form accepts Stripe payment method
- ✅ Success message shows after upgrade
- ✅ Tier badge updates to reflect new tier

### TDD Approach
- **Component Tests** (React Testing Library):
  - Render component with mock state
  - Test user interactions (button clicks, form inputs)
  - Test conditional rendering (upgrade button visibility)
- **E2E Tests** (Playwright):
  - Full upgrade workflow (login → settings → upgrade → success)
  - Test error scenarios (payment declined)

### Architectural Constraints
- Follow [architecture-design.md](../../docs/prd/architecture-design.md) frontend patterns
- Use [design-systems.md](../../docs/design/design-systems.md) tokens (no hardcoded colors)
- Redux for global state, local state for modal open/close
- Stripe Elements integration (PCI compliance)

### Estimated Complexity
- **Story Points**: 5
- **Hours**: 8-10 hours (includes Stripe integration)

### Design Specifications
- **Wireframes**: See [journey-maps.md](../../docs/design/journey-maps.md) Section 3.2
- **Tokens**: [design-systems.md](../../docs/design/design-systems.md) Color/Spacing/Typography
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Test Strategy
- **Edge Cases**:
  - Loading state (spinner during API call)
  - Error state (payment declined, network error)
  - Empty state (no subscription found)
  - Accessibility (keyboard navigation, screen reader)
- **Mock Strategy**: Mock API client for component tests, real API for E2E
- **Test Types**: Component tests (RTL), E2E tests (Playwright)
- **Expected Coverage**: >85% for components

---

## Implementation Sequence

### Dependency Order
1. **Layer 1 (Database)** → MUST complete first (data foundation)
2. **Layer 2 (Backend)** → Depends on Layer 1 models
3. **Layer 3 (Config)** → Depends on Layer 2 services/controllers
4. **Layer 4 (Frontend)** → Depends on Layer 3 API routes

### Parallel Work Opportunities
- Layer 2 unit tests can start while Layer 1 integration tests run
- Layer 4 component mockups can be built while Layer 2-3 are in progress (mock API)

### Risk Areas
- **Payment integration complexity**: Stripe API changes, webhook handling
- **Transaction management**: Dual-write atomicity (User + Subscription)
- **Race conditions**: Concurrent upgrade requests for same user

### Mitigation Strategies
- **Payment risk**: Use Stripe test mode throughout development, add idempotency keys
- **Transaction risk**: Database transaction with rollback tests
- **Concurrency risk**: Add optimistic locking or row-level locks

---

## Definition of Done

### Functional Requirements
- [ ] All BDD scenarios in `/docs/user-stories/{USER-STORY-REF}/bdd-scenarios/` passing
- [ ] User.tier and Subscription.tier synchronized (verified in BDD tests)
- [ ] Payment processed successfully via Stripe (test mode)
- [ ] Frontend displays updated tier badge immediately after upgrade

### Quality Requirements
- [ ] Test coverage > 80% (unit + integration)
- [ ] Code review approved by dev-lead
- [ ] All 13-point checklist items passed (see [coding.instructions.md](../.github/instructions/coding.instructions.md))
- [ ] No hardcoded secrets (Stripe API key in environment variables)
- [ ] No obvious performance issues (query time <50ms, API response <200ms)

### Technical Specifications Met
- [ ] Architecture patterns followed (per [architecture-design.md](../../docs/prd/architecture-design.md))
- [ ] Design tokens used (per [design-systems.md](../../docs/design/design-systems.md))
- [ ] Tech stack requirements met (per [tech-spec.md](../../docs/prd/tech-spec.md))
- [ ] Security requirements met (authentication, input validation, payment security)

### Documentation Requirements
- [ ] Inline comments present for complex business logic
- [ ] API documentation (JSDoc/docstrings) for public functions
- [ ] README.md updated (if new setup steps required)
- [ ] Security annotations for auth/validation rules

---

## Notes for TDD Execution

### Dev-Lead Skeleton Classes
Skeleton classes with method signatures and test data comments are created by dev-lead during Phase 2.5. These guide RED agent test creation:

**Example Skeleton**:
```typescript
// src/services/SubscriptionService.ts (created by dev-lead)

// TEST DATA for RED agent:
// Valid upgrade: userId='usr_123', tier='premium', paymentMethodId='pm_valid'
// Invalid tier: userId='usr_123', tier='invalid_tier' → expect TierError
// Payment failure: userId='usr_123', tier='premium', paymentMethodId='pm_declined' → expect PaymentError

export class SubscriptionService {
  constructor(
    private userRepo: IUserRepository,
    private subscriptionRepo: ISubscriptionRepository,
    private paymentGateway: IPaymentGateway
  ) {}

  /**
   * Upgrades user subscription to target tier.
   * CRITICAL: Must synchronize User.tier AND Subscription.tier.
   * 
   * @param userId - User ID (UUID)
   * @param targetTier - Target tier ('free' | 'premium' | 'enterprise')
   * @param paymentMethodId - Stripe payment method ID
   * @returns Updated user object
   * @throws {TierError} If target tier is invalid
   * @throws {PaymentError} If payment fails
   */
  async upgradeSubscription(
    userId: string,
    targetTier: SubscriptionTier,
    paymentMethodId: string
  ): Promise<User> {
    throw new Error('Not implemented - waiting for TDD GREEN phase');
  }
}
```

### Hand-off to TDD Chain
After implementation plan and skeleton classes are complete:

1. **Dev-Lead → Dev-TDD-Orchestrator**: "Implement Layer 1 following implementation plan. Make failing BDD tests pass."
2. **Dev-TDD-Orchestrator → Dev-TDD-RED**: "Create test class for UserRepository using skeleton classes and test data comments."
3. **Dev-TDD-RED → Dev-TDD-GREEN**: "Fill in skeleton class methods to make tests pass."
4. **Dev-TDD-GREEN → Dev-TDD-REFACTOR**: "Improve code quality, add documentation, generate review report."
5. **Dev-TDD-REFACTOR → Dev-Lead**: "Layer 1 complete with review report. Approve or reject?"

---

**Template Version**: 1.0  
**Last Updated**: 2026-02-03
