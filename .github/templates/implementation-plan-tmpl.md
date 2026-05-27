# Implementation Plan: {USER-STORY-REF}

---
templateId: "implementation-plan"
templateVersion: "2.0"
documentType: "implementation-guide"
title: "{US_REF}: Implementation Plan"
author: "{AGENT_NAME}"
date_created: "{YYYY-MM-DD}"
version: "1.0"
status: "draft"

agent_context:
  phase: "implementation"
  epic_ref: "{EPIC_REF}"
  user_story_ref: "{US_REF}"
  tdd_cycle: "TDD-001"
  agent_name: "{AGENT_NAME}"
  model_name: "{MODEL_NAME}"
---

**Story ID**: {USER-STORY-REF}  
**Epic**: {EPIC-NAME}  
**Priority**: {High/Medium/Low}  
**Estimated Effort**: {X} story points

---

## Story Overview

### Description
{User story description from description.md}

### Business Value
{Why this story matters to users/business}

### Acceptance Criteria
[ ] {Copy checkbox acceptance criteria from description.md}
[ ] {Each acceptance criterion becomes a checkbox}
[ ] {Mark as [x] when all associated layer tasks complete}

---

## BDD Scenarios

**Location**: `./bdd-scenarios/`

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

## Layer Architecture Implementation

> **Checkbox Format (Mandatory)**: Every checkbox must use verbose format: `- [ ] **[Language/Framework]** \`full/path/File.ext\` — What to implement and why. BDD: \`feature-file.feature:LineN\``. Vague tasks like `- [ ] Add validation` are rejected. Each checkbox must be self-contained — a dev with zero context can read it and know exactly what to create, where, and which BDD scenario it enables.

### Layer 1: Database & Domain Model
**Purpose**: Data persistence and core domain entities

**Context**: {Describe what data this layer introduces — e.g., "Adds the `Subscription` entity with tier and billing fields. Migration depends on the existing `User` table."}

#### Database Tasks
- [ ] **[{Language}/{ORM}]** `migrations/{number}_create_{entity}_table.sql` — Create {Entity} table with required columns and constraints. BDD: `{feature-file}.feature:L{N}`
- [ ] **[{Language}/{ORM}]** `migrations/{number}_create_{entity}_table_down.sql` — Rollback migration (DROP TABLE + cleanup). BDD: `N/A — infrastructure`
- [ ] **[{Language}/{ORM}]** `migrations/{number}_create_{entity}_table.sql` — Add indexes on `{column}` for query performance. BDD: `N/A — infrastructure`
- [ ] **[{Language}/{ORM}]** `migrations/{number}_create_{entity}_table.sql` — Validate FK constraints to `{parent_table}`. BDD: `N/A — infrastructure`

#### Domain Model Tasks
- [ ] **[{Language}/{Framework}]** `src/models/{Entity}.{ext}` — Define `{Entity}` class with fields: `{field1}: {type}`, `{field2}: {type}`. Implements `I{Entity}` interface. BDD: `{feature-file}.feature:L{N}`
- [ ] **[{Language}/Zod|Joi|etc]** `src/models/{Entity}.{ext}` — Add validation rules: `{rule1}`, `{rule2}`. Export `{Entity}Dto` type. BDD: `{feature-file}.feature:L{N}`
- [ ] **[{Language}]** `src/models/{Entity}.{ext}` — Implement `isValid()` and `toDTO()` methods. BDD: `{feature-file}.feature:L{N}`
- [ ] **[{Language}/TypeScript]** `src/models/{Entity}.{ext}` — Add type annotations and schema exports. BDD: `N/A — type safety`

#### Test Tasks
- [ ] **[{Language}/{TestFramework}]** `tests/models/{Entity}.test.{ext}` — Unit test: model rejects invalid data (null email, short password, etc.). BDD: `{feature-file}.feature:L{N}`
- [ ] **[{Language}/{TestFramework}]** `tests/models/{Entity}.test.{ext}` — Unit test: model accepts valid data (happy path). BDD: `{feature-file}.feature:L{N}`
- [ ] **[{Language}/{TestFramework}]** `tests/db/migrations.test.{ext}` — Integration test: migration runs up/down without error. BDD: `N/A — infrastructure`

#### BDD Validation
- [ ] Scenario: "{BDD scenario name}" — domain model stores and retrieves data correctly
- [ ] Scenario: "{BDD scenario name}" — validation rules prevent invalid data

---

### Layer 2: Backend Services & Business Logic
**Purpose**: Business logic, service orchestration, and cross-cutting concerns

**Context**: {Describe the business rules this layer encodes — e.g., "Implements tier upgrade logic: validates eligibility, calculates new expiry, emits upgrade event."}

#### Service Layer Tasks
- [ ] Create service class with constructor injection → `src/services/{Entity}Service.{ext}`
- [ ] Implement core business logic method(s): `{methodName}()` → `src/services/{Entity}Service.{ext}`
- [ ] Add structured error handling (typed errors, not generic throws) → `src/services/{Entity}Service.{ext}`
- [ ] Integrate with repository/data-access layer → `src/repositories/{Entity}Repository.{ext}`
- [ ] Add logging at entry/exit points of critical methods → `src/services/{Entity}Service.{ext}`

#### Test Tasks
- [ ] Write unit test: happy path for `{methodName}()` → `tests/services/{Entity}Service.test.{ext}`
- [ ] Write unit test: error path (invalid input) → `tests/services/{Entity}Service.test.{ext}`
- [ ] Write unit test: boundary/edge case (`{specific condition}`) → `tests/services/{Entity}Service.test.{ext}`
- [ ] Write integration test: service + repository round-trip → `tests/integration/{Entity}Service.integration.test.{ext}`

#### BDD Validation
- [ ] Scenario: "{BDD scenario name}" — business rule executes correctly
- [ ] Scenario: "{BDD scenario name}" — error case handled and surfaced correctly

---

### Layer 3: API Layer
**Purpose**: HTTP interface — controllers, routing, request/response contracts

**Context**: {Describe what endpoints are added — e.g., "Exposes `POST /api/v1/subscriptions/upgrade` with JWT auth. Validated by Zod schema. Returns 200 with updated subscription or 422 with error details."}

#### API Tasks
- [ ] Create controller with route handler(s) → `src/controllers/{Entity}Controller.{ext}`
- [ ] Define route and bind to controller → `src/routes/{entity}.routes.{ext}`
- [ ] Add request validation schema (Zod / Joi / class-validator) → `src/validators/{entity}.schema.{ext}`
- [ ] Add authentication/authorization guard → `src/middleware/auth.{ext}`
- [ ] Update OpenAPI spec with new endpoint → `api/openapi.yaml`

#### Test Tasks
- [ ] Write unit test: controller returns 200 for valid request → `tests/controllers/{Entity}Controller.test.{ext}`
- [ ] Write unit test: controller returns 422 for invalid payload → `tests/controllers/{Entity}Controller.test.{ext}`
- [ ] Write unit test: controller returns 401 for unauthenticated request → `tests/controllers/{Entity}Controller.test.{ext}`
- [ ] Write integration test: full request → DB round-trip → `tests/integration/{entity}.api.test.{ext}`

#### BDD Validation
- [ ] Scenario: "{BDD scenario name}" — API returns correct response for happy path
- [ ] Scenario: "{BDD scenario name}" — API rejects invalid or unauthorized requests

---

### Layer 4: Frontend & UI Components
**Purpose**: User interface, client state, and API integration

**Context**: {Describe the UI this layer adds — e.g., "Adds `SubscriptionUpgradeModal` component. Uses `useSubscription` hook for API calls. Shows loading state during upgrade and error banner on failure."}

#### UI Component Tasks
- [ ] Create primary component with props interface → `src/components/{Feature}/{Component}.{ext}`
- [ ] Implement user interaction handlers (click, submit, etc.) → `src/components/{Feature}/{Component}.{ext}`
- [ ] Add form validation and inline error display → `src/components/{Feature}/{Component}.{ext}`
- [ ] Add loading state and error boundary → `src/components/{Feature}/{Component}.{ext}`
- [ ] Connect to API via custom hook → `src/hooks/use{Feature}.{ext}`

#### State & API Integration Tasks
- [ ] Create API client method → `src/services/api/{entity}Api.{ext}`
- [ ] Create/update custom hook for data fetching and mutation → `src/hooks/use{Feature}.{ext}`
- [ ] Add TypeScript types for props and API responses → `src/types/{feature}Types.{ext}`

#### Test Tasks
- [ ] Write component test: renders correctly (snapshot or DOM assertions) → `tests/components/{Component}.test.{ext}`
- [ ] Write component test: user interaction triggers correct handler → `tests/components/{Component}.test.{ext}`
- [ ] Write component test: shows loading state during API call → `tests/components/{Component}.test.{ext}`
- [ ] Write component test: shows error state on API failure → `tests/components/{Component}.test.{ext}`

#### BDD Validation
- [ ] Scenario: "{BDD scenario name}" — UI renders and responds correctly for happy path
- [ ] Scenario: "{BDD scenario name}" — UI handles error and loading states gracefully

---

## BDD Mapping Matrix

| BDD Scenario | Layer | Checkpoint | Files Affected | Test Assertion |
|--------------|-------|------------|----------------|----------------|
| {Scenario name} | Layer 1 | [ ] {Database task} | `{file list}` | {What gets verified} |
| {Scenario name} | Layer 2 | [ ] {API endpoint} | `{file list}` | {What gets verified} |
| {Scenario name} | Layer 3 | [ ] {Configuration} | `{file list}` | {What gets verified} |
| {Scenario name} | Layer 4 | [ ] {UI component} | `{file list}` | {What gets verified} |

**Example**:
| BDD Scenario | Layer | Checkpoint | Files Affected | Test Assertion |
|--------------|-------|------------|----------------|----------------|
| User upgrades to premium | Layer 1 | [x] User.tier field created | `models/User.ts`, `migrations/003_add_tier.sql` | User.tier accepts "premium" value |
| User upgrades to premium | Layer 2 | [ ] Upgrade API endpoint | `services/SubscriptionService.ts`, `controllers/SubscriptionController.ts` | POST /api/users/:id/upgrade returns 200 |
| User upgrades to premium | Layer 3 | [ ] Payment integration | `config/stripe.json`, `middleware/paymentAuth.ts` | Payment processes successfully |
| User upgrades to premium | Layer 4 | [ ] Upgrade button | `components/SubscriptionUpgrade.tsx` | Button triggers upgrade flow |

---

## Definition of Done

### Technical Requirements
- [ ] All layer checkboxes marked as [x] completed
- [ ] All BDD scenarios pass (green)
- [ ] Unit test coverage ≥ 80% for new code
- [ ] Integration tests pass in testing environment
- [ ] Code review completed and approved
- [ ] API documentation updated (if applicable)

### Quality Gates
- [ ] No critical security vulnerabilities
- [ ] Performance requirements met
- [ ] Accessibility standards followed (if UI changes)
- [ ] Cross-browser compatibility verified (if UI changes)
- [ ] Mobile responsiveness tested (if UI changes)

### Documentation & Handoff
- [ ] Implementation plan checkboxes all marked [x]
- [ ] BDD mapping matrix validated
- [ ] Any breaking changes documented
- [ ] Deployment notes created (if needed)
- [ ] Knowledge transfer completed

---

**Framework**: Gen‑e2 Compliance v2.0.0  
**Template**: Implementation Plan with Layer Checkboxes  
**Usage**: TDD agents execute against these checkboxes as SSOT
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
- Follow [architecture-design.md](../../docs/02-architecture/architecture-design.md) data model
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
- Follow [architecture-design.md](../../docs/02-architecture/architecture-design.md) service layer patterns
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
- Follow [architecture-design.md](../../docs/02-architecture/architecture-design.md) configuration patterns
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
- Follow [architecture-design.md](../../docs/02-architecture/architecture-design.md) frontend patterns
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
- [ ] All BDD scenarios in `/docs/05-implementation/epics/{EPIC-REF}/user-stories/{USER-STORY-REF}/bdd-scenarios/` passing
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
- [ ] Architecture patterns followed (per [architecture-design.md](../../docs/02-architecture/architecture-design.md))
- [ ] Design tokens used (per [design-systems.md](../../docs/02-architecture/design-systems.md))
- [ ] Tech stack requirements met (per [tech-spec.md](../../docs/02-architecture/tech-spec.md))
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
