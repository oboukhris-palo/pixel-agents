---
templateId: "incident-response"
templateVersion: "1.0"
documentType: "operational"
title: "{US-REF}: Incident Response Runbook"
description: "Step-by-step procedures for responding to incidents related to this feature"
author: "{Engineering Lead}"
date_created: "{YYYY-MM-DD}"
date_updated: "{YYYY-MM-DD}"
version: "1.0"
status: "draft"

user_story_ref: ""
related_documents:
  - type: "implementation_plan"
    reference: "docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md"
  - type: "monitoring_setup"
    reference: "docs/05-implementation/epics/EPIC-001/user-stories/US-001/monitoring-setup.md"

compliance_frameworks: []
security_level: "confidential"
tags: ["incident-response", "operational", "runbook"]
---

# Incident Response Runbook: {US-REF}

## Document Info
- **User Story**: {US-REF}
- **Feature**: {Feature Name}
- **Owner**: {Engineering Lead}
- **Last Updated**: {YYYY-MM-DD}
- **Status**: Draft

---

## Incident Response Framework

This runbook guides on-call engineers through incident response for {Feature Name} ({US-REF}). All procedures follow this lifecycle:

```
Detection → Triage → Mitigation → Resolution → Post-Mortem
```

---

## Quick Reference

| Severity | Detection | Triage | Mitigation | Target Resolution |
|----------|-----------|--------|------------|------------------|
| **Critical** | <5 min | <5 min | <15 min | <1 hour |
| **High** | <15 min | <10 min | <30 min | <4 hours |
| **Medium** | <1 hour | <30 min | <2 hours | <24 hours |
| **Low** | <4 hours | <1 hour | < next business day | <1 week |

---

## Incident Severity Classification

### Critical (P1)
- Feature completely unavailable (0% success rate)
- Impact: All users unable to complete core action
- Data loss or corruption occurring
- Security breach or compliance violation detected
- Revenue impact: >$10k/hour

**Response**: Page on-call immediately | Response: <5 min

### High (P2)
- Feature significantly degraded (success rate <70%)
- Impact: Most users experience failures
- Performance severely impacted (latency >5x normal)
- Error rate >5% for extended period (>5 min)
- Revenue impact: $1k-$10k/hour

**Response**: Notify engineering team immediately | Response: <15 min

### Medium (P3)
- Feature partially working (success rate 70-95%)
- Impact: Subset of users affected
- Performance moderately impacted (latency 2-5x normal)
- Error rate 1-5% but stable
- Revenue impact: <$1k/hour

**Response**: Notify team lead | Response: <1 hour

### Low (P4)
- Feature working but with minor issues
- Impact: Edge cases or specific scenarios
- Performance slightly impacted (latency <2x normal)
- Error rate <1%
- No revenue impact

**Response**: Add to backlog | Response: <1 week

---

## Incident #1: API Endpoint Returns 5xx Errors

### Detection
- Alert: `{US-REF}-api-down` triggered
- Monitoring: Health check failing
- User reports: Error popup when attempting {action}

### Triage Checklist (5 minutes)

```
☐ Severity classification: ____ (P1/P2/P3/P4)
☐ Affected endpoints: {endpoint1}, {endpoint2}
☐ Affected users: ~{X}% of user base
☐ Start time: {timestamp}
☐ Customer impact: {describe}
```

### Root Cause Investigation

**Step 1: Check deployment status (2 min)**
```bash
# Was there a recent deployment?
git log --oneline -n 10 prod-branch

# Check deployment status
kubectl get deployments -n {namespace} | grep {service}
kubectl describe deployment {service} -n {namespace}
```

**Step 2: Check error logs (3 min)**
```bash
# Tail error logs
tail -f /var/log/{service}.error.log | grep -A 5 "500"

# Or via log aggregation UI
https://{log-ui}/app/{US-REF}?severity=error&last=15m
```

**Step 3: Check dependency health (2 min)**
```bash
# Database connectivity
curl -s http://localhost:5432/ping || echo "Database unreachable"

# Cache connectivity
redis-cli ping

# External API health
curl -H "Authorization: Bearer {token}" {external-api}/health
```

### Mitigation Options

#### Option A: Rollback Deployment (Fastest)
**When**: Recent deployment likely introduced bug, no data corruption expected

```bash
# 1. Verify previous version
git log --oneline -n 2 prod-branch

# 2. Revert to previous commit
git revert HEAD --no-edit
git push origin prod-branch

# 3. Monitor error rate
# Should see drop within 2 minutes

# 4. Alert team
# @oncall Fixed issue via rollback. Monitoring for 15 min.
```

**Expected outcome**: Errors drop to <0.1% within 2 min  
**If not fixed**: Proceed to Option B

#### Option B: Restart Service (Gradual)
**When**: Rollback not suitable, temporary issue (connection leak, memory issue)

```bash
# 1. Confirm it's safe to restart
# - Verify no in-flight transactions that would be lost
# - Check for ongoing deployments

# 2. Perform graceful restart
kubectl delete pod {pod-name} -n {namespace}
# OR
systemctl restart {service}

# 3. Monitor pod startup (wait until Ready)
kubectl get pods -n {namespace} -w

# 4. Monitor error rate
# Should improve within 30 seconds

# 5. If multiple pods, do rolling restart
# (k8s does this automatically for deployments)
```

**Expected outcome**: Service recovers within 2 min  
**If not fixed**: Proceed to Option C

#### Option C: Scale Up Capacity (For Overload)
**When**: Error spike due to traffic surge, not code issue

```bash
# 1. Check current replica count
kubectl get deployment {service} -n {namespace}

# 2. Scale up temporarily
kubectl scale deployment {service} \
  --replicas=15 -n {namespace}

# 3. Monitor error rate
# Should improve within 1 minute as new pods start

# 4. Investigate root cause of traffic spike
# (May be legitimate or DDoS)

# 5. Scale back down once stable
kubectl scale deployment {service} \
  --replicas={original-count} -n {namespace}
```

**Expected outcome**: Error rate drops as capacity increases  
**If not fixed**: Proceed to Option D

#### Option D: Isolate and Investigate (Detailed)
**When**: None of the above work; deeper investigation needed

```bash
# 1. Get request IDs from error logs
tail -50 /var/log/{service}.error.log | grep "requestId"

# 2. Trace specific request
curl -X GET https://{service}/api/debug/request?id={request-id} \
  -H "Authorization: Bearer {debug-token}"

# 3. Check external service status
# - Database: EXPLAIN on slow queries
# - Cache: Redis memory usage, evictions
# - External API: Rate limit, availability status

# 4. Check recent config changes
git log --oneline -p config/ | head -50

# 5. If still unclear, enable debug logging
# (Contact Engineering Lead for access)
```

### Resolution Steps

1. **Identify fix** (Option A/B/C/D above)
2. **Implement fix**
3. **Verify error rate** drops to <0.1%
4. **Monitor for 15 minutes** ensure stability
5. **Notify stakeholders** incident resolved

### Recovery Timeline
- Detection: <5 min (monitoring alert)
- Triage: <5 min (root cause identified)
- Mitigation: <15 min (issue resolved)
- **Total: <25 min target for P1**

---

## Incident #2: High Latency (API Responses Slow)

### Detection
- Alert: `{US-REF}-high-latency` triggered (p95 >2000ms)
- Monitoring: Dashboard shows spike in response times
- User reports: Slow/timeout experiences

### Triage Checklist (10 minutes)

```
☐ Current latency (p95): {X}ms (normal: {Y}ms)
☐ Request volume: {X} req/s (normal: {Y} req/s)
☐ Affected endpoint: {endpoint}
☐ Affected users: ~{X}%
☐ Start time: {timestamp}
```

### Root Cause Investigation

**Step 1: Check request volume (2 min)**
```bash
# Is there a traffic spike?
# Graph in monitoring: Requests/sec over last 30 min

# If yes, check for:
# - Legitimate traffic spike (marketing campaign, event)
# - Bot/crawler spike (check User-Agent in logs)
# - DDoS attack (check IP distribution)
```

**Step 2: Check database query performance (3 min)**
```bash
# Get slow queries
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Check for missing indexes
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan = 0;

# Check for table locks
SELECT * FROM pg_locks WHERE NOT granted;
```

**Step 3: Check cache performance (2 min)**
```bash
# Redis memory usage
redis-cli info memory

# Cache hit rate
redis-cli info stats | grep hits

# Check for cache stampede (many clients requesting same key)
redis-cli monitor | head -100
```

**Step 4: Check external service latency (2 min)**
```bash
# Measure roundtrip to dependent services
time curl -X GET {external-api}/endpoint

# Check if external service has ongoing incident
curl {external-api}/status
```

### Mitigation Options

#### Option A: Clear Cache (If Cache Outdated)
```bash
# Clear specific key
redis-cli DEL {cache-key}

# Or clear entire user cache
redis-cli DEL "user:{user_id}:*"

# Monitor: latency should improve within 10 seconds
```

#### Option B: Add Query Optimization (If DB Slow)
```bash
# Add missing index (if identified in investigation)
CREATE INDEX idx_{table}_{column} ON {table}({column});

# Or add caching for slow query:
# 1. Check if result is cacheable
# 2. Add redis call before DB query
# 3. Test latency improvement
```

#### Option C: Enable Request Prioritization
```bash
# Deprioritize low-priority requests during peak load
# - Analytics queries
# - Reporting generation
# - Bulk operations

# Implementation: Check request priority header, queue accordingly
```

#### Option D: Scale Up Capacity (If CPU/Memory Bound)
```bash
# Check resource utilization
kubectl top pod {pod-name} -n {namespace}

# If CPU >80% or Memory >85%, scale up
kubectl scale deployment {service} --replicas=15 -n {namespace}
```

### Resolution Steps

1. **Identify root cause** (Step 1-4 investigation)
2. **Apply mitigation** (Option A/B/C/D above)
3. **Monitor latency** drops to <500ms at p95
4. **Verify stability** for 10 minutes
5. **Schedule deeper fix** (DB optimization, caching strategy, capacity planning)

### Recovery Timeline
- Detection: <15 min (monitoring alert)
- Triage: <10 min (root cause identified)
- Mitigation: <30 min (latency restored)
- **Total: <55 min target for P2**

---

## Incident #3: Error Rate Spike

### Detection
- Alert: `{US-REF}-error-rate-spike` triggered (>5x increase)
- Monitoring: Error log volume spike
- User reports: Feature failures, validation errors

### Triage Checklist (5 minutes)

```
☐ Current error rate: {X}% (baseline: {Y}%)
☐ Error type: {type} (e.g., validation, timeout, database)
☐ Affected users: {X}%
☐ First error detected: {timestamp}
```

### Root Cause Investigation

**Step 1: Categorize errors (3 min)**
```bash
# Get top errors by frequency
tail -100 /var/log/{service}.error.log | \
  grep -E "(Exception|Error|ERROR)" | \
  awk -F: '{print $NF}' | sort | uniq -c | sort -rn | head -10
```

**Step 2: Check for specific error patterns (3 min)**

**If "ValidationError"**:
```bash
# Did validation rules change?
git log --oneline -p src/validation/ | head -20

# Are clients sending wrong format?
# Check logs for specific validation failures
```

**If "TimeoutError"**:
```bash
# Is external service slow or down?
time curl -X GET {external-api}/endpoint

# Are we hitting rate limits?
grep -i "rate.limit" /var/log/{service}.error.log | wc -l
```

**If "DatabaseError"**:
```bash
# Is database connection pool exhausted?
SELECT count(*) as idle_connections FROM pg_stat_activity WHERE state = 'idle';

# Is there a slow query blocking connections?
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;
```

### Mitigation Options

#### Option A: Disable New Feature (If Bug)
```bash
# Use feature flag to disable problematic feature
# In config: set {feature-flag} = false

# Restart service
systemctl restart {service}

# Monitor: errors should drop within 1 minute
```

#### Option B: Retry with Exponential Backoff
```bash
# If errors are transient:
# Implement retry logic (if not already present)

// Pseudocode
for attempt in 1..3:
    try:
        result = call_external_service()
        return result
    catch error:
        if attempt < 3:
            wait(2^attempt seconds)  # Exponential backoff
        else:
            raise error
```

#### Option C: Circuit Breaker (If External Service Failing)
```bash
# If external service is degraded:
# Open circuit breaker to shed load

// Pseudocode
if circuit_breaker.state == "open":
    # Service is unavailable, fail fast
    return error("Service unavailable")
else:
    try:
        result = call_external_service()
        circuit_breaker.record_success()
    catch error:
        circuit_breaker.record_failure()
        if circuit_breaker.failure_rate > 50%:
            circuit_breaker.state = "open"
```

### Resolution Steps

1. **Identify error type** (Step 1-2 investigation)
2. **Apply mitigation** (Option A/B/C above)
3. **Monitor error rate** drops to <0.5%
4. **Root cause analysis** (after incident)
5. **Implement permanent fix** (if needed)

### Recovery Timeline
- Detection: <5 min (alert triggered)
- Triage: <10 min (root cause identified)
- Mitigation: <15 min (errors reduced)
- **Total: <30 min target for P2**

---

## Incident #4: Database Connection Pool Exhaustion

### Detection
- Alert: `{US-REF}-db-connection-pool` triggered
- Error logs: "Connection pool exhausted" or "Max connections exceeded"
- Service symptoms: Requests timeout or queue indefinitely

### Mitigation (Immediate)

```bash
# 1. Check current pool status
psql -h {db-host} -U {user} -d {database} -c \
  "SELECT count(*) as active FROM pg_stat_activity WHERE state = 'active';"

# 2. Identify long-running queries
SELECT pid, usename, query, query_start
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start ASC;

# 3. Kill slow/blocking queries (if safe)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query_start < now() - interval '10 minutes'
AND state = 'active';

# 4. Scale down application connections temporarily
# Reduce {service} replicas: kubectl scale deployment {service} --replicas=1

# 5. Monitor connection recovery
# Should return to normal within 30 seconds
```

### Resolution Steps

1. **Investigate what caused pool exhaustion**
   - New connection leak in code?
   - Traffic spike?
   - Database slowness?

2. **Apply permanent fix**
   - Fix connection leak
   - Increase pool size
   - Add connection timeout
   - Implement better pooling strategy

---

## Incident #5: Data Loss or Corruption

### Detection
- User reports missing data
- Audit logs show unexpected changes
- Data integrity check fails

### IMMEDIATE (Within 1 minute)

```
☐ STOP all writes to affected data
☐ Page on-call DBA immediately
☐ Page Engineering Lead immediately
☐ Do NOT run any DELETE/UPDATE commands
☐ Preserve current state (screenshots, logs)
```

### Investigation (Critical)

```bash
# 1. Get transaction history
SELECT * FROM audit_log 
WHERE table_name = '{affected_table}'
ORDER BY timestamp DESC 
LIMIT 100;

# 2. Identify when corruption started
# (First transaction that looks wrong)

# 3. Check backups
# Are backups available for point-in-time recovery?

# 4. Determine scope
# How much data is affected?
```

### Recovery (With DBA)

- Point-in-time recovery from backup
- Or selective restore of affected rows
- Verify data integrity after recovery

**Do not attempt without DBA unless explicitly trained.**

---

## Communication During Incidents

### During Active Incident

**Channels**:
- Immediate: `#incidents` Slack channel
- Tech team: `#engineering` channel
- Stakeholders: Email or scheduled Slack updates

**Update frequency**:
- P1: Every 5 minutes
- P2: Every 15 minutes
- P3: Every hour

**Message format**:
```
🔴 INCIDENT: {Incident Name} ({US-REF})
Status: {Active/Investigating/Resolved}
Severity: {P1/P2/P3/P4}
Impacted: {Users/Systems}
ETA: {Estimated time to resolution}
Owner: {On-call Engineer}
```

### Post-Incident (Within 24 hours)

- Schedule post-mortem
- Document root cause
- Create action items to prevent recurrence
- Share post-mortem summary with team

---

## Escalation Chain

| Level | Trigger | Action | Contact |
|-------|---------|--------|---------|
| L1 | Incident detected | Acknowledge alert, begin triage | On-call engineer |
| L2 | No progress in 15 min | Notify Engineering Lead | {Engineering Lead} |
| L3 | No resolution in 30 min (P1) | Page CTO/VP Engineering | {VP Engineering} |
| L4 | No resolution in 1 hour (P1) | Activate war room, all hands | War room bridge |

---

## Training & Practice

### Monthly Drill

- Run incident simulation
- Test runbook accuracy
- Practice communication
- Verify alert response

### Quarterly Review

- Update runbook with new learnings
- Adjust severity classifications
- Validate alert thresholds
- Practice escalation procedures

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | {YYYY-MM-DD} | Initial runbook | {Name} |

**Last Review**: {YYYY-MM-DD}  
**Next Review**: {YYYY-MM-DD} (quarterly)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | {} | {} | ☐ Approved |
| On-Call Rotation Lead | {} | {} | ☐ Approved |
| VP Engineering | {} | {} | ☐ Approved |
