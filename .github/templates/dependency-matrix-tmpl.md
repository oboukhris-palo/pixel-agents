---
templateId: "dependency-matrix"
templateVersion: "1.0"
documentType: "reference"
title: "{Project Name}: Service & Dependency Matrix"
description: "Visualization of service interactions, dependencies, and deployment ordering"
author: "{Architecture Lead}"
date_created: "{YYYY-MM-DD}"
date_updated: "{YYYY-MM-DD}"
version: "1.0"
status: "draft"

project_name: ""
related_documents:
  - type: "architecture"
    reference: "docs/02-architecture/architecture-design.md"
  - type: "tech_spec"
    reference: "docs/02-architecture/tech-spec.md"

compliance_frameworks: []
security_level: "internal"
tags: ["architecture", "deployment", "dependencies"]
---

# Service & Dependency Matrix: {Project Name}

## Document Info
- **Project**: {Project Name}
- **Owner**: {Architecture Lead}
- **Last Updated**: {YYYY-MM-DD}
- **Status**: Draft

---

## Purpose

This matrix visualizes:
- **Service interactions** (which services call which)
- **Data flow** (synchronous vs. asynchronous)
- **Dependency ordering** (deployment sequence)
- **Failure impact** (cascade effects)
- **Performance criticality** (latency SLAs by path)

This enables:
- Correct deployment ordering
- Risk assessment of changes
- Optimization opportunities
- Incident impact analysis

---

## Services Overview

| Service Name | Type | Owner | Language | Port | Status |
|--------------|------|-------|----------|------|--------|
| {Service 1} | API | {Team} | {Lang} | {Port} | Active |
| {Service 2} | Database | {Team} | SQL | {Port} | Active |
| {Service 3} | Cache | {Team} | Redis | {Port} | Active |
| {Service 4} | Worker | {Team} | {Lang} | N/A | Active |
| {Service 5} | External | {Vendor} | - | HTTPS | Active |

---

## Dependency Matrix

### Format: Service Calls (Synchronous - HTTP/gRPC)

```
        ↓ CALLER / DEPENDS ON →
        API  DB  Cache  Worker  Ext
API     -    ✓    ✓      ✓      ✓
DB      -    -    -      -      -
Cache   -    -    -      -      -
Worker  -    ✓    -      -      ✓
Ext     -    -    -      -      -

Legend:
✓ = Direct dependency
- = No dependency
```

### Detailed Dependencies

#### Service 1: {Service Name}
**Type**: REST API  
**Owner**: {Team}  
**Runtime**: {Runtime}

**Direct Dependencies**:
- Database: {DB Name} (read/write)
- Cache: {Cache Name} (read/write, TTL: {X}s)
- External API: {API Name} (read-only, timeout: {X}s)
- Background Job: {Queue Name} (async publish)

**Dependents** (services that call this):
- {Service A} (HTTP GET /api/{endpoint})
- {Service B} (HTTP POST /api/{endpoint})
- {Frontend} (HTTP calls from browser)

**Criticality**: {Low/Medium/High/Critical}  
**SLA**: {Uptime %}, {Latency p95 ms}

---

#### Service 2: {Service Name}
**Type**: Database  
**Owner**: {Team}  
**Runtime**: PostgreSQL {Version}

**Direct Dependencies**:
- None (read/write workloads)

**Dependents** (services that read/write):
- {Service A}
- {Service B}
- {Service C}

**Criticality**: Critical  
**SLA**: 99.95% uptime, backup every 6 hours

**Tables & Schemas**:
| Table | Owner | Row Count | Size | Access Pattern |
|-------|-------|-----------|------|-----------------|
| users | {Service} | {X}M | {Size} | Frequent reads, occasional writes |
| transactions | {Service} | {X}M | {Size} | Heavy read/write, time-series |
| {Table 3} | {Service} | {X}M | {Size} | {Pattern} |

---

#### Service 3: {Service Name}
**Type**: Cache Layer  
**Owner**: {Team}  
**Runtime**: Redis {Version}

**Direct Dependencies**:
- None (cached data sourced from DB/API)

**Dependents**:
- {Service A} (get user:{id})
- {Service B} (get session:{token})

**Criticality**: High (performance impact if down)  
**SLA**: 99.9% uptime, auto-failover

**Cache Keys & TTL**:
| Key Pattern | TTL | Size | Refresh Strategy |
|-------------|-----|------|------------------|
| user:{id} | 1h | {X}KB | On-demand + background |
| session:{token} | 24h | {X}KB | On-demand + expiry |
| leaderboard:{period} | 1h | {X}MB | Scheduled compute |

---

#### Service 4: {Service Name}
**Type**: Background Worker  
**Owner**: {Team}  
**Runtime**: {Runtime}

**Direct Dependencies**:
- Database: {DB Name} (read/write)
- Message Queue: {Queue Name} (consume messages)
- External API: {Service Name} (send data)

**Dependents**:
- {Service A} (publishes jobs to queue)
- {Service B} (publishes jobs to queue)

**Criticality**: Medium (non-blocking, async)  
**SLA**: Jobs processed within {X} minutes

**Job Types**:
| Job Type | Frequency | Timeout | Retry | Criticality |
|----------|-----------|---------|-------|-------------|
| email-send | 1000s/day | 30s | 3x exponential | Medium |
| report-generate | 10/hour | 5 min | 2x | Medium |
| cache-refresh | Every 1h | 5 min | 1x | Low |

---

#### Service 5: {Service Name}
**Type**: External Service (Third-party)  
**Owner**: {Vendor}  
**Access**: HTTPS API

**Integration Points**:
- {Service A} calls {Endpoint} (GET, update frequency: hourly)
- {Service B} calls {Endpoint} (POST, on-demand)

**Criticality**: Medium (fallback available)  
**SLA**: 99.5% uptime (per vendor SLA)

**Rate Limits**:
- Calls/second: {X}
- Calls/day: {Y}
- Current usage: {Z}% of limit

**Timeout**: {X} seconds  
**Retry Strategy**: 3x exponential backoff

---

## Data Flow Diagram

### Synchronous (Request-Response)

```
┌────────────────────────────────────────────────────────┐
│ Client (Browser/Mobile)                                │
└───────────┬──────────────────────────────────────────┘
            │ HTTP/REST
            ▼
┌────────────────────────────────────────────────────────┐
│ API Service (Load Balanced)                            │
│ - {Service 1}:5000                                     │
│ - Handles requests, validates, orchestrates            │
└──────┬─────────┬──────────┬──────────────────────────┘
       │         │          │
   SQL │     Cache│    HTTP  │ ({Latency} ms SLA)
       │         │          │
       ▼         ▼          ▼
┌─────────────┐ ┌─────────┐ ┌────────────────┐
│  Database   │ │ Cache   │ │ External API   │
│  PostgreSQL │ │ Redis   │ │ {Service Name} │
└─────────────┘ └─────────┘ └────────────────┘
```

**Synchronous Path SLA**:
- API → Database: <100ms (p95)
- API → Cache: <10ms (p95)
- API → External Service: <500ms (p95)
- **Total (worst case)**: <610ms (p95) ✓ Passes 1000ms SLA

---

### Asynchronous (Event-Driven)

```
┌─────────────────────────────────────┐
│ API Service                         │
│ (Publishes events to queue)         │
└──────────────┬──────────────────────┘
               │ Async publish
               ▼
        ┌─────────────┐
        │ Message     │
        │ Queue       │
        │ (RabbitMQ)  │
        └──────┬──────┘
               │ Async consume
               ▼
    ┌────────────────────────┐
    │ Background Worker      │
    │ (Process emails, jobs) │
    │ 10 parallel workers    │
    └────────┬───────────────┘
             │ Write results
             ▼
        ┌─────────────┐
        │ Database    │
        │ Results tbl │
        └─────────────┘
```

**Asynchronous Path SLA**:
- Job enqueue: <50ms
- Job processing: <5 min (p95)
- **Total**: 5 minutes (async, non-blocking)

---

## Deployment Ordering

### Order 1: Foundation Services (Deploy First)

```
1. Database
   ├─ PostgreSQL cluster
   ├─ Initial schema + fixtures
   └─ Backups configured
   
2. Cache
   ├─ Redis cluster
   └─ Connection pooling tested
   
3. Message Queue
   ├─ RabbitMQ cluster
   └─ Topic definitions created
```

**Timeline**: ~15 minutes  
**Validation**: Health checks pass for each service

---

### Order 2: Core Services (Deploy Second)

```
4. API Service
   ├─ Service version {X.Y}
   ├─ Environment variables configured
   └─ Database migrations applied
   
5. Background Worker
   ├─ Worker processes started
   └─ Job processing verified
```

**Timeline**: ~10 minutes  
**Validation**: Health checks pass, sample requests succeed

---

### Order 3: Integrations (Deploy Third)

```  
6. External Service Integration
   ├─ API keys configured
   ├─ Timeout/retry logic tested
   └─ Fallback behavior verified
```

**Timeline**: ~5 minutes

---

### Order 4: Clients (Deploy Last)

```
7. Frontend Application
   ├─ API endpoints updated (or use feature flags)
   └─ SDKs regenerated
```

**Timeline**: ~5 minutes

---

## Risk & Impact Analysis

### Dependency Risk Matrix

| Service | Failure Impact | Mitigation | Recovery Time |
|---------|----------------|-----------|------------------|
| Database | **CRITICAL** - All APIs fail | Multi-region failover, read replicas | <1 min |
| Cache | **HIGH** - Performance degrades 10x | Graceful degradation (direct DB), failover | <30 sec |
| API | **CRITICAL** - Users blocked | Load balancer routes to healthy instances | <10 sec |
| Worker | **MEDIUM** - Jobs delayed | Auto-scaling, dead letter queue | <5 min |
| External API | **LOW** - Feature degraded | Circuit breaker, fallback data | <1 min |

---

### Cascade Failure Scenarios

#### Scenario 1: Database Down
```
Impact Chain:
  Database ↓
  ├─ API cannot read/write → 5xx errors
  ├─ Existing cache helps briefly (hits only)
  └─ System unavailable for writes

Mitigation:
  - Failover to read replica (30 seconds)
  - Or restore from backup (5+ minutes)
  
Outcome: RTO <1 minute
```

#### Scenario 2: Cache Down
```
Impact Chain:
  Cache ↓
  ├─ Database load increases 10x
  ├─ API latency spikes (p95: 100ms → 1000ms)
  └─ May trigger cascading timeouts

Mitigation:
  - Restart cache layer (30 seconds)
  - Or bypass cache temporarily (graceful degradation)
  
Outcome: Performance hit, but continued operation
```

#### Scenario 3: External API Down
```
Impact Chain:
  External API ↓
  ├─ {Service A} hitting timeout (5 seconds)
  ├─ Circuit breaker opens after 3 failures
  └─ Fallback behavior kicks in
  
Mitigation:
  - Circuit breaker prevents cascading
  - Fallback to cached/default data
  
Outcome: Graceful degradation, no outage
```

---

## Change Impact Assessment

### Assess risks before deploying changes:

**Question 1**: Does this change affect a dependency or dependent?
- If YES: Assess cascade risk using matrix above
- If NO: Standard deployment process

**Question 2**: What services must pass health checks before deployment?
- Core service changes: All dependents must be running
- Database changes: Backward compatible or blue-green deployment
- External API changes: Integration tested first

**Question 3**: What validation/rollback is needed?
- High-risk: Automated smoke tests + manual verification
- Medium-risk: Automated smoke tests + monitoring
- Low-risk: Standard deployment

---

## Performance Criticality

### Critical Paths (Highest SLA)

| Path | Services | SLA | Current P95 | Status |
|------|----------|-----|-----------|--------|
| {User Login} | API → Database | <200ms | 95ms | ✓ Green |
| {Data Fetch} | API → Cache → DB | <500ms | 312ms | ✓ Green |
| {Payment} | API → External → DB | <1000ms | 498ms | ✓ Green |

### Non-Critical Paths (Lower SLA)

| Path | Services | SLA | Current P95 | Status |
|------|----------|-----|-----------|--------|
| {Report Generation} | Worker → DB | <5 min | 2.3 min | ✓ Green |
| {Email Send} | Worker → External | <30 min | 8 min | ✓ Green |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | {YYYY-MM-DD} | Initial dependency matrix | {Name} |
| 1.1 | {YYYY-MM-DD} | Added SLAs and risk analysis | {Name} |

**Last Review**: {YYYY-MM-DD}  
**Next Review**: {YYYY-MM-DD} (monthly)

---

## Appendix: Service Communication Protocols

### HTTP/REST (Synchronous)

```bash
# Service A calls Service B
curl -X GET http://service-b:5000/api/endpoint \
  -H "Authorization: Bearer {token}" \
  -H "X-Request-ID: {id}" \
  --connect-timeout 5s \
  --max-time 30s
```

**Timeout**: 30 seconds (adjust for path SLA)  
**Retry**: 3x exponential backoff (1s, 2s, 4s)  
**Circuit Breaker**: After 5 consecutive failures, open for 30 seconds

---

### Message Queue (Asynchronous)

```json
{
  "event_type": "user.signup",
  "timestamp": "2026-03-16T10:30:00Z",
  "data": {
    "user_id": "usr_123",
    "email": "user@example.com"
  },
  "metadata": {
    "source": "api-service",
    "version": "1.0"
  }
}
```

**Publishing**: Non-blocking, <50ms guarantee  
**Consuming**: Pull from queue, 10 parallel workers  
**Dead Letter**: Unprocessed after 3 retries  
**Retention**: 7 days

---

## Key Contacts

| Component | Owner | Escalation |
|-----------|-------|-----------|
| Database | {DBA Name} | {Manager} |
| Cache | {Infra Lead} | {Manager} |
| API | {Backend Lead} | {Manager} |
| Worker | {Backend Lead} | {Manager} |
| External Integrations | {Integration Lead} | {Manager} |
