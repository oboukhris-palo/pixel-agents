---
description: API design standards and OpenAPI specification generation
applyTo: "api/**,src/controllers/**,src/routes/**"
---

# API Design Standards

## Core Principle
**APIs are contracts**. Design for consumers first (external developers, frontend teams), not internal convenience.

---

## RESTful API Conventions

### Resource-Based URLs (Nouns, Not Verbs)
✅ **GOOD**:
```
GET    /api/users               # List users
GET    /api/users/123           # Get user by ID
POST   /api/users               # Create user
PUT    /api/users/123           # Update user (full replacement)
PATCH  /api/users/123           # Update user (partial)
DELETE /api/users/123           # Delete user
```

❌ **BAD**:
```
GET    /api/getUsers            # Verb in URL
POST   /api/createUser          # Verb in URL
POST   /api/users/delete/123    # Wrong HTTP method
```

### Nested Resources (Max 2 Levels)
✅ **GOOD**:
```
GET    /api/users/123/subscriptions           # User's subscriptions
POST   /api/users/123/subscriptions           # Create subscription for user
GET    /api/users/123/subscriptions/456       # Specific subscription
```

❌ **BAD** (Too deep):
```
GET /api/users/123/subscriptions/456/payments/789/invoices/012
```

**Solution** for deep nesting: Use query parameters or separate endpoints
```
GET /api/invoices?subscriptionId=456&paymentId=789
```

---

## HTTP Methods & Status Codes

### HTTP Methods
| Method | Purpose | Idempotent? | Response Codes |
|--------|---------|------------|----------------|
| **GET** | Retrieve resource(s) | ✅ Yes | 200 (OK), 404 (Not Found) |
| **POST** | Create new resource | ❌ No | 201 (Created), 400 (Bad Request), 409 (Conflict) |
| **PUT** | Replace entire resource | ✅ Yes | 200 (OK), 404 (Not Found) |
| **PATCH** | Update part of resource | ❌ No | 200 (OK), 404 (Not Found) |
| **DELETE** | Remove resource | ✅ Yes | 204 (No Content), 404 (Not Found) |

### Status Codes (Standard Usage)
```yaml
2xx Success:
  200: OK - Request succeeded (GET, PUT, PATCH)
  201: Created - New resource created (POST)
  204: No Content - Success with no response body (DELETE)

4xx Client Errors:
  400: Bad Request - Invalid input (validation failure)
  401: Unauthorized - Authentication required
  403: Forbidden - Authenticated but not authorized
  404: Not Found - Resource doesn't exist
  409: Conflict - Resource state conflict (duplicate, version mismatch)
  422: Unprocessable Entity - Semantic errors (business rule violation)
  429: Too Many Requests - Rate limit exceeded

5xx Server Errors:
  500: Internal Server Error - Unexpected server failure
  502: Bad Gateway - Upstream service failure
  503: Service Unavailable - Temporary unavailability (maintenance, overload)
```

---

## Request/Response Format

### Request Body (JSON)
```json
POST /api/users/123/subscriptions/upgrade
{
  "targetTier": "premium",
  "paymentMethodId": "pm_1234567890",
  "billingCycle": "monthly"
}
```

### Success Response
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_9876543210",
      "userId": "usr_123",
      "tier": "premium",
      "status": "active",
      "currentPeriodEnd": "2026-02-03T00:00:00Z"
    }
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-01-03T10:30:00Z"
  }
}
```

### Error Response (Consistent Format)
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "INVALID_TIER",
    "message": "Target tier 'super-premium' is not valid. Allowed values: free, premium, enterprise.",
    "details": {
      "field": "targetTier",
      "value": "super-premium",
      "allowedValues": ["free", "premium", "enterprise"]
    }
  },
  "meta": {
    "requestId": "req_def456",
    "timestamp": "2026-01-03T10:32:00Z"
  }
}
```

**Error Code Conventions**:
- `INVALID_*`: Invalid input (validation failure)
- `MISSING_*`: Required field missing
- `UNAUTHORIZED_*`: Authentication/authorization failure
- `CONFLICT_*`: Resource state conflict
- `NOT_FOUND_*`: Resource doesn't exist
- `RATE_LIMIT_*`: Rate limit exceeded

---

## OpenAPI 3.0 Specification

### Full Specification Template
```yaml
openapi: 3.0.3
info:
  title: Subscription Management API
  version: 1.0.0
  description: API for managing user subscriptions and tier upgrades
  contact:
    name: API Support
    email: api-support@example.com

servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server

paths:
  /users/{userId}/subscriptions/upgrade:
    post:
      summary: Upgrade user subscription tier
      description: |
        Upgrades a user's subscription to the specified tier. This operation:
        - Synchronizes User.tier and Subscription.tier (critical for AUTH-003)
        - Charges payment method
        - Activates new tier immediately
        
        **Rate Limit**: 10 requests per minute per user
      operationId: upgradeSubscription
      tags: [Subscriptions]
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            format: uuid
          description: User ID (UUID format)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpgradeRequest'
      responses:
        '200':
          description: Subscription upgraded successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UpgradeResponse'
        '400':
          description: Invalid request (validation failure)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized (missing or invalid token)
        '403':
          description: Forbidden (user not allowed to upgrade this account)
        '404':
          description: User not found
        '409':
          description: Conflict (already at target tier)
        '429':
          description: Rate limit exceeded
      security:
        - bearerAuth: []

components:
  schemas:
    UpgradeRequest:
      type: object
      required:
        - targetTier
        - paymentMethodId
      properties:
        targetTier:
          type: string
          enum: [free, premium, enterprise]
          description: Target subscription tier
        paymentMethodId:
          type: string
          pattern: '^pm_[a-zA-Z0-9]{10,}$'
          description: Stripe payment method ID
        billingCycle:
          type: string
          enum: [monthly, annual]
          default: monthly
          description: Billing cycle for subscription

    UpgradeResponse:
      type: object
      required:
        - success
        - data
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
          properties:
            subscription:
              $ref: '#/components/schemas/Subscription'
        meta:
          $ref: '#/components/schemas/ResponseMeta'

    Subscription:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: Subscription ID
        userId:
          type: string
          format: uuid
          description: User ID
        tier:
          type: string
          enum: [free, premium, enterprise]
          description: Current subscription tier
        status:
          type: string
          enum: [active, canceled, past_due]
          description: Subscription status
        currentPeriodEnd:
          type: string
          format: date-time
          description: ISO 8601 timestamp when current period ends

    Error:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              description: Machine-readable error code
              example: INVALID_TIER
            message:
              type: string
              description: Human-readable error message
              example: Target tier 'super-premium' is not valid
            details:
              type: object
              additionalProperties: true
              description: Additional error context
        meta:
          $ref: '#/components/schemas/ResponseMeta'

    ResponseMeta:
      type: object
      properties:
        requestId:
          type: string
          description: Unique request ID for tracing
          example: req_abc123
        timestamp:
          type: string
          format: date-time
          description: ISO 8601 response timestamp

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login endpoint

  parameters:
    PageLimit:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: Number of items per page
    PageOffset:
      name: offset
      in: query
      schema:
        type: integer
        minimum: 0
        default: 0
      description: Number of items to skip

tags:
  - name: Subscriptions
    description: Subscription management operations
  - name: Users
    description: User management operations
```

---

## Validation Rules

### Request Validation
```typescript
// Schema validation (Zod, Joi, etc.)
const upgradeSchema = z.object({
  targetTier: z.enum(['free', 'premium', 'enterprise']),
  paymentMethodId: z.string().regex(/^pm_[a-zA-Z0-9]{10,}$/),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly')
});

// Validate at API boundary (controller, not service layer)
export async function upgradeSubscription(req: Request, res: Response) {
  const validation = upgradeSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: validation.error.errors
      }
    });
  }
  
  // Proceed with validated data
  const result = await subscriptionService.upgrade(req.params.userId, validation.data);
  res.json({ success: true, data: result });
}
```

---

## Security Specifications

### Authentication (JWT Bearer Token)
```yaml
security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

**Example Request**:
```http
POST /api/users/123/subscriptions/upgrade HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Authorization (Role-Based)
Document permission requirements in operation:
```yaml
security:
  - bearerAuth: []
    scopes: [subscriptions:write, payments:write]
```

### Rate Limiting
```yaml
paths:
  /users/{userId}/subscriptions/upgrade:
    post:
      description: |
        **Rate Limit**: 10 requests per minute per user
        
        Rate limit headers in response:
        - X-RateLimit-Limit: 10
        - X-RateLimit-Remaining: 7
        - X-RateLimit-Reset: 1704275400 (Unix timestamp)
```

### Idempotency Keys (For Critical Operations)
```yaml
parameters:
  - name: Idempotency-Key
    in: header
    schema:
      type: string
      format: uuid
    description: Unique key to prevent duplicate operations (POST requests)
```

**Usage**:
```http
POST /api/subscriptions HTTP/1.1
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

---

## Versioning Strategy

### URL Versioning (Recommended)
```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

**Pros**: Clear, easy to test, cacheable  
**Cons**: URL changes on version bump

### Header Versioning (Alternative)
```http
GET /api/users HTTP/1.1
Accept: application/vnd.example.v1+json
```

**Pros**: Clean URLs  
**Cons**: Less visible, harder to test

**Recommendation**: Use URL versioning for public APIs

---

## Pagination & Filtering

### Pagination (Offset-Based)
```
GET /api/users?limit=20&offset=40
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [ /* 20 users */ ],
    "pagination": {
      "limit": 20,
      "offset": 40,
      "total": 1543,
      "hasMore": true
    }
  }
}
```

### Filtering
```
GET /api/users?tier=premium&status=active&sort=createdAt:desc
```

### Search
```
GET /api/users/search?q=john+doe&fields=email,name
```

---

## API Design Checklist

Before finalizing API design:
- [ ] URLs are resource-based (nouns, not verbs)
- [ ] HTTP methods used correctly (GET=read, POST=create, etc.)
- [ ] Status codes follow standards (2xx success, 4xx client error, 5xx server error)
- [ ] Request/response format consistent (JSON with `success`, `data`, `error`, `meta`)
- [ ] Error responses include code, message, and details
- [ ] OpenAPI specification complete (paths, schemas, security, examples)
- [ ] Validation rules documented and enforced at API boundary
- [ ] Authentication/authorization requirements specified
- [ ] Rate limiting documented
- [ ] Idempotency keys for critical operations (payments, writes)
- [ ] Versioning strategy chosen and consistent
- [ ] Pagination, filtering, and search patterns standardized

---

## Applied To
- **architect**: Generates OpenAPI specification during Stage 3 (architecture design)
- **dev-lead**: References API contracts when creating implementation plan
- **dev-tdd-green**: Implements endpoints following OpenAPI spec

---

**Reference**:
- [architecture-design.md]( ../../docs/prd/architecture-design.md) for system architecture
- [tech-spec.md](../../docs/prd/tech-spec.md) for technology stack decisions
- OpenAPI Generator: https://openapi-generator.tech for client SDK generation
