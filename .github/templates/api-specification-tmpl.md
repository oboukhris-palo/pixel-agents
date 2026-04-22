# API Specification Template (OpenAPI 3.1.0)

**Purpose**: This template guides the Architect agent through API design and OpenAPI documentation during PDLC Stage 4 (Tech Specs).

**Output File**: `/api/openapi.yaml`  
**Validation**: MUST pass `npm run validate:openapi` before code implementation

---

## When to Use This Template

### New Projects (Greenfield)
1. **PDLC Stage 3 (Architecture Design)**: Architect identifies all API categories
2. **PDLC Stage 4 (Tech Specs)**: Architect fills this template → generates `/api/openapi.yaml`
3. **Before Implementation**: Dev-Lead validates spec matches implementation-plan.md
4. **After Implementation**: Update spec if implementation deviates

### Existing Projects (Brownfield)
1. **Pre-Implementation Step**: Baseline existing API
   ```bash
   npm run baseline-api -- --scan-src
   # Outputs: api/openapi-baseline.yaml (reconstructed from code)
   ```
2. **Architect Review**: Validate baseline vs. actual implementation
3. **Spec Update**: Fill gaps or correct baseline
4. **Lockdown**: Freeze spec as source of truth before new development

---

## OpenAPI 3.1.0 Structure (Minimal)

```yaml
openapi: 3.1.0

info:
  title: {PROJECT_NAME} API
  version: 1.0.0
  description: |
    {Brief description of API purpose}
    
    ## Authentication
    - JWT Bearer token in Authorization header
    - Obtained via POST /api/auth/login
    
  contact:
    name: API Support
    email: api@example.com
  
  license:
    name: MIT

servers:
  - url: https://api.example.com/api/v1
    description: Production
  - url: https://staging-api.example.com/api/v1
    description: Staging
  - url: http://localhost:3000/api/v1
    description: Local Development

paths:
  # Authentication endpoints
  /auth/register:
    post:
      summary: User registration
      tags: [Authentication]
      description: Register a new user account
      
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                  description: User email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  minLength: 8
                  description: User password (min 8 characters)
              required: [email, password]
      
      responses:
        201:
          description: User registered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                  email:
                    type: string
                  createdAt:
                    type: string
                    format: date-time
        400:
          description: Invalid request (invalid email format, password too short)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        409:
          description: Email already registered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        500:
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # User endpoints
  /users/{userId}:
    get:
      summary: Get user profile
      tags: [Users]
      operationId: getUser
      security:
        - BearerAuth: []
      
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      
      responses:
        200:
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        401:
          description: Unauthorized (missing or invalid token)
        404:
          description: User not found
        500:
          description: Internal server error

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        tier:
          type: string
          enum: [free, pro, premium]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, email, tier, createdAt, updatedAt]
    
    Error:
      type: object
      properties:
        code:
          type: string
          description: Error code (for programmatic handling)
        message:
          type: string
          description: Human-readable error message
        details:
          type: object
          description: Additional error details
      required: [code, message]
```

---

## Template Sections

### 1. **Info Section** (Metadata)

```yaml
info:
  title: {PROJECT_NAME} API
  version: {VERSION}                    # Matches package.json version
  description: |
    Brief description of API
    
    ## Key Features
    - Feature 1
    - Feature 2
    
    ## Authentication
    - JWT Bearer token
    
    ## Rate Limits
    - 1000 requests/hour per IP
  
  contact:
    name: API Support
    email: api@example.com
  
  license:
    name: MIT
```

**Required Fields**:
- ✅ title
- ✅ version (auto-sync with package.json)
- ✅ description (include auth method and rate limits)

---

### 2. **Servers Section** (Environments)

```yaml
servers:
  - url: https://api.example.com/api/v1
    description: Production (real users)
  
  - url: https://staging-api.example.com/api/v1
    description: Staging (QA testing)
  
  - url: http://localhost:3000/api/v1
    description: Local Development (developers)
```

**Rule**: Include all deployment environments  
**Purpose**: Dev/staging/production have different URLs

---

### 3. **Paths Section** (Endpoints)

**Pattern for each endpoint**:

```yaml
paths:
  /resource/{id}:
    # HTTP Method
    get:
      summary: {One-line description}
      description: |
        Detailed description of what this endpoint does.
        Include business logic and constraints.
      
      operationId: {getResource}         # Unique identifier (generates SDK method name)
      tags: [ResourceTag]                # Group related endpoints
      
      # Authentication requirement
      security:
        - BearerAuth: []                 # Requires JWT token
        # - OR leave empty [] if no auth required
      
      # Path/query parameters
      parameters:
        - name: id
          in: path
          required: true
          description: Resource ID
          schema:
            type: string
            format: uuid
        
        - name: limit
          in: query
          required: false
          description: Max results to return (default 20)
          schema:
            type: integer
            minimum: 1
            maximum: 100
      
      # Request body (POST/PUT/PATCH only)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  minLength: 1
                  maxLength: 255
              required: [name]
      
      # Responses by status code
      responses:
        200:
          description: Success (for GET)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        
        201:
          description: Created (for POST)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Resource'
        
        400:
          description: Bad Request (validation error)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        
        401:
          description: Unauthorized (missing/invalid token)
        
        403:
          description: Forbidden (user lacks permission)
        
        404:
          description: Not Found
        
        409:
          description: Conflict (duplicate resource, etc.)
        
        429:
          description: Too Many Requests (rate limited)
        
        500:
          description: Internal Server Error
```

**Checklist for Each Endpoint**:
- ✅ summary (1 line)
- ✅ description (detailed)
- ✅ operationId (unique ID)
- ✅ tags (group)
- ✅ security (auth required?)
- ✅ parameters (path + query)
- ✅ requestBody (if POST/PUT/PATCH)
- ✅ responses (all possible outcomes: 200, 400, 401, 404, 500+)
- ✅ response schemas (reference components)

---

### 4. **Components Section** (Reusable Schemas & Security)

#### Security Schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from POST /auth/login
    
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for machine-to-machine authentication
```

**Common Auth Methods**:
- ✅ **BearerAuth** (JWT for user endpoints)
- ✅ **ApiKeyAuth** (service-to-service or public endpoints)
- ✅ Basic Auth (username:password, base64 encoded)

#### Data Schemas

```yaml
components:
  schemas:
    User:
      type: object
      description: User account profile
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
        
        email:
          type: string
          format: email
          description: User email address
        
        tier:
          type: string
          enum: [free, pro, premium]
          description: Subscription tier level
        
        createdAt:
          type: string
          format: date-time
          description: ISO 8601 creation timestamp
        
        updatedAt:
          type: string
          format: date-time
          description: ISO 8601 last update timestamp
      
      required: [id, email, tier, createdAt, updatedAt]
    
    Error:
      type: object
      description: Error response object
      properties:
        code:
          type: string
          description: |
            Error code for programmatic handling
            Examples: INVALID_EMAIL, DUPLICATE_USER, RATE_LIMIT_EXCEEDED
        
        message:
          type: string
          description: Human-readable error message
        
        details:
          type: object
          description: Optional additional details (e.g., which fields failed validation)
      
      required: [code, message]
      
      example:
        code: INVALID_EMAIL
        message: Email format is invalid
        details:
          field: email
          reason: Missing @ symbol
```

**Schema Best Practices**:
- ✅ Use `$ref` to reference common schemas (DRY)
- ✅ Mark required fields explicitly
- ✅ Include meaningful descriptions
- ✅ Provide examples for clarity
- ✅ Use proper JSON types (string, integer, boolean, object, array)
- ✅ Use `format` for specific types (uuid, email, date-time, password)

---

## Checklist: Before Code Implementation

**Architect completes this checklist before handing to Dev-Lead**:

```yaml
API Specification Validation Checklist:

□ Info Section
  □ Title and version match project
  □ Description includes authentication method
  □ Description includes rate limits (if applicable)
  □ Contact information provided

□ Servers Section
  □ Production URL included
  □ Staging URL included (if applicable)
  □ Local development URL included

□ Paths Section
  □ All endpoints from architecture-design.md documented
  □ No orphan endpoints (code-only endpoints not in spec)
  □ Each endpoint has:
    □ summary (1 line)
    □ description (detailed)
    □ operationId (unique)
    □ tags (grouped)
    □ security (required or empty)
    □ parameters (path, query)
    □ requestBody (if POST/PUT/PATCH)
    □ responses (200, 400, 401, 404, 500)
    □ response schemas (using $ref)

□ Components Section
  □ Security schemes defined
  □ All data schemas defined
  □ Schemas used in responses (via $ref)
  □ Required fields marked
  □ Descriptions provided for all properties

□ Overall Quality
  □ No duplicate definitions
  □ All $ref paths resolve correctly
  □ Consistent naming (camelCase for properties)
  □ Consistent response structure (all errors use Error schema)
  □ Validation rules clear (minLength, maxLength, enum, etc.)

□ Testing
  □ npm run validate:openapi passes ✅
  □ Swagger UI renders without errors
  □ All endpoint descriptions clear for frontend developers
```

**Run Validation**:
```bash
npm run validate:openapi
# Should output: ✅ OpenAPI spec is valid
```

---

## File Updates During Implementation

**Timeline**:

| Phase | File Status | Action |
|-------|------------|--------|
| **Architecture (Stage 3)** | Not created yet | Architect identifies endpoint categories |
| **Tech Specs (Stage 4)** | `/api/openapi.yaml` created | Architect writes complete spec |
| **Pre-Development** | Frozen | Dev-Lead validates against implementation-plan.md |
| **During Dev** | Ref only | TDD agents reference for request/response schemas |
| **Code Review** | Update if needed | API changes documented in spec |
| **Post-Release** | Source of truth | Clients use spec for integration |

**Rule**: Spec is the source of truth. If code deviates, update spec during code review.

---

## Brownfield (Existing Project) Workflow

### Step 1: Baseline Existing API

```bash
cd /api
npm run baseline-api -- --scan-src

# Outputs:
# - api/openapi-baseline.yaml (reconstructed from code)
# - api/baseline-report.json (coverage metrics)
```

**What it scans**:
- ✅ All files in `src/routes/` or `src/controllers/`
- ✅ HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ✅ Route paths and parameters
- ✅ JSDoc comments (converted to descriptions)

### Step 2: Architect Review Baseline

```bash
# Review reconstructed spec
cat api/openapi-baseline.yaml

# Check coverage
cat api/baseline-report.json
# Example output:
# {
#   "endpoints_found": 23,
#   "documented_endpoints": 18,
#   "coverage_percentage": 78,
#   "missing_endpoints": [
#     "POST /api/webhooks/subscription",
#     "DELETE /api/cache"
#   ]
# }
```

### Step 3: Fill Gaps & Correct Spec

```yaml
# api/openapi.yaml (reviewed baseline + corrections)

# Add missing endpoints
paths:
  /webhooks/subscription:
    post:
      summary: Subscription webhook receiver
      # ... (fill in details)

# Update incorrect descriptions
paths:
  /users/{userId}:
    get:
      summary: Get user profile (CORRECTED - was "Retrieve user")
      # ...
```

### Step 4: Validate & Commit

```bash
npm run validate:openapi
# ✅ If passing: commit as source of truth
git add api/openapi.yaml
git commit -m "API: Baseline and correct OpenAPI spec for existing endpoints"
```

---

## Validation Rules (npm run validate:openapi)

The validation script checks:

```typescript
// Validation rules
✅ openapi.yaml is valid OpenAPI 3.1.0
✅ All paths are documented
✅ All parameters are properly typed
✅ All request bodies have schemas
✅ All responses have schemas
✅ All $ref paths resolve to actual schemas
✅ No orphan schemas (unused definitions)
✅ No duplicate operationId values
✅ Security scheme used in at least one endpoint
✅ No undocumented HTTP methods in code (compares code to spec)
✅ Response codes match HTTP best practices (201 for POST, 204 for DELETE, etc.)
```

**Output Examples**:
```bash
# Success
✅ OpenAPI spec is valid
✅ All 45 endpoints documented
✅ 12 code endpoints match spec
✅ Coverage: 100%

# Failure
❌ Missing endpoint: POST /api/auth/logout
❌ Orphan schema: PaymentIntentResponse (defined but not used)
❌ Invalid response code: GET should not return 201 (should be 200)
```

---

## Integration with Implementation Plan

**Architect → Dev-Lead Handoff**:

```markdown
### Implementation Plan: Layer 2 (Backend)

**API Contract** (from openapi.yaml):
- POST /api/auth/register
  - Request: {email, password}
  - Response: {id, email, createdAt, token}
  - Status codes: 201, 400, 409

- GET /api/users/{userId}
  - Parameters: userId (path)
  - Response: User object
  - Auth: BearerAuth (required)
  - Status codes: 200, 401, 404

[Dev-Lead uses spec to guide implementation]
```

**Dev-Lead validates**:
- ✅ Implementation matches openapi.yaml schemas
- ✅ Request/response match spec exactly
- ✅ HTTP status codes align with spec

---

## Summary

| Step | Owner | Artifact | Timing |
|------|-------|----------|--------|
| **Identify APIs** | Architect | architecture-design.md | Stage 3 |
| **Write OpenAPI Spec** | Architect | `/api/openapi.yaml` | Stage 4 |
| **Validate Spec** | Architect | `npm run validate:openapi` | Stage 4 |
| **Reference in Planning** | Dev-Lead | implementation-plan.md | Phase 2 |
| **Implement per Spec** | TDD Agents | Source code | Phase 4 |
| **Test & Review** | Dev-Lead | Code review checklist | Phase 6 |
| **Lock as Truth** | Architect | Commit to main | Release |

**Rule**: OpenAPI spec is the source of truth. Code must match spec. Never the reverse.
