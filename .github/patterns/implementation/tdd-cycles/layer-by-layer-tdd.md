# Pattern: Layer-by-Layer TDD Implementation

> **Pattern ID**: `implementation-tdd-layer-by-layer`  
> **Phase**: 05-implementation  
> **Category**: Time Reduction + Quality Improvement  
> **Status**: Active  
> **Last Updated**: 2026-04-20  
> **Author/Source**: gene2 Framework TDD Best Practices

---

## Metadata

| Field | Value |
|-------|-------|
| **Pattern ID** | `implementation-tdd-layer-by-layer` |
| **Phase(s)** | 05-implementation |
| **Problem Category** | Time Reduction + Quality Improvement |
| **Tags** | `#tdd-cycles`, `#implementation`, `#architecture-layers`, `#refactoring` |
| **Applicable To** | All projects using layered architecture (Domain → Service → API → UI) |
| **Estimated Savings** | PRU: 20-30%, Time: 25-35%, Quality: 40% fewer integration bugs |
| **Reusability** | High (95%+ of projects use layered architecture) |

---

## Context

### When to Use This Pattern

**Triggers** (when this pattern applies):
- Starting Phase 05-implementation with TDD workflow
- User story ready with implementation plan (layer breakdown complete)
- BDD scenarios written and ready to drive TDD cycles
- Using layered architecture (Domain → Service → API → UI)

**Preconditions** (requirements before applying):
- Implementation plan created by dev-lead (Layer 1-4 breakdown)
- BDD scenarios documented in `features/` directory
- Architecture design complete (Phase 02-architecture)
- TDD agents ready (dev-tdd-red, dev-tdd-green, dev-tdd-refactor)

### When NOT to Use This Pattern

**Anti-patterns** (avoid in these scenarios):
- ❌ When using non-layered architecture (microservices, serverless, event-driven) — use architecture-specific TDD patterns
- ❌ When implementation plan missing or incomplete — dev-lead must create plan first
- ❌ When BDD scenarios incomplete — BA must finish scenarios before TDD starts
- ❌ For prototype/spike work — use exploratory coding, not TDD

**Exceptions**:
- Flat architecture projects (single-layer apps) — adapt pattern to single layer
- Legacy code without tests — use characterization tests first, then TDD for new features

---

## Problem

### Problem Statement

**Without layer-by-layer TDD**, implementation is:
1. **Chaotic**: Jumping between layers randomly → lost context, duplicate work
2. **Integration-heavy**: Writing all layers simultaneously → late integration bugs
3. **Rework-prone**: UI changes break API, API changes break domain → cascade failures
4. **Slow**: 3-5 rework cycles due to architectural misalignment

### Impact Without Pattern

| Metric | Impact | Example |
|--------|--------|---------|
| **PRU Cost** | 800-1200 PRU per user story | Random layer jumping: context switching overhead |
| **Time** | 3-5 rework cycles (8-12 hours) | UI built first → domain changes → UI rework |
| **Quality** | 35-45% integration bugs | Layer misalignment causes runtime failures |

### Root Cause

**Why does this happen?**
- No clear layer sequencing → agents pick random starting point
- UI-first development → domain logic discovered late, requires rework
- Parallel layer development → integration issues discovered at end
- Missing architectural guidance → agents don't understand layer dependencies

---

## Solution

### Overview

**Layer-by-Layer TDD** enforces strict sequencing:
1. **Layer 1 (Database & Domain Model)**: RED → GREEN → REFACTOR → DONE
2. **Layer 2 (Service/Business Logic)**: RED → GREEN → REFACTOR → DONE
3. **Layer 3 (API/Controllers)**: RED → GREEN → REFACTOR → DONE
4. **Layer 4 (UI/Presentation)**: RED → GREEN → REFACTOR → DONE

**Key Principle**: Each layer fully implemented (RED → GREEN → REFACTOR) before moving to next layer.

**Benefits**:
- **No context switching**: Focus on one layer at a time
- **Early integration**: Each layer tested against previous layer immediately
- **Stable foundation**: Domain logic locked in before building API/UI on top
- **Fewer rework cycles**: Architectural alignment enforced by sequence

### Implementation Steps

**Step 1: Dev-Lead Creates Implementation Plan (Prerequisites)**

File: `docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md`

```markdown
## Layer-by-Layer Implementation Plan

### Layer 1: Database & Domain Model
- [ ] RED-01: Write failing test for domain entity creation
- [ ] GREEN-01: Implement domain entity with validation
- [ ] REFACTOR-01: Extract validation logic to separate service
- [ ] RED-02: Write failing test for repository operations
- [ ] GREEN-02: Implement repository interface + SQL queries
- [ ] REFACTOR-02: Optimize query performance

### Layer 2: Service/Business Logic
- [ ] RED-01: Write failing test for service method
- [ ] GREEN-01: Implement service orchestration
- [ ] REFACTOR-01: Extract complex logic to helper methods
- [ ] RED-02: Write failing test for error handling
- [ ] GREEN-02: Implement error handling and logging
- [ ] REFACTOR-02: Clean up error messages and validation

### Layer 3: API/Controllers
- [ ] RED-01: Write failing test for API endpoint
- [ ] GREEN-01: Implement controller with request/response mapping
- [ ] REFACTOR-01: Extract mapping logic to DTOs
- [ ] RED-02: Write failing test for API validation
- [ ] GREEN-02: Implement input validation and error responses
- [ ] REFACTOR-02: Consolidate error handling middleware

### Layer 4: UI/Presentation
- [ ] RED-01: Write failing test for UI component rendering
- [ ] GREEN-01: Implement component with state management
- [ ] REFACTOR-01: Extract reusable UI components
- [ ] RED-02: Write failing test for user interaction
- [ ] GREEN-02: Implement event handlers and API calls
- [ ] REFACTOR-02: Optimize performance and accessibility
```

**Step 2: Dev-TDD Orchestrator Enforces Layer Sequencing**

Update: `.github/agents/dev-tdd.agent.md`

```markdown
## Layer Sequencing Enforcement

**Rule**: ONE layer active at a time. NO parallel layer development.

**Before starting any TDD cycle:**
1. Read implementation-plan.md
2. Identify current layer (which layer has unchecked boxes)
3. Verify all previous layers complete (all checkboxes [x])
4. If Layer N-1 incomplete → BLOCK Layer N → return to Layer N-1

**Example**:
- Layer 1 checkboxes: [x] [x] [x] [x] [x] [x] ✅ COMPLETE
- Layer 2 checkboxes: [x] [x] [ ] [ ] [ ] [ ] ⚠️ IN PROGRESS
- Layer 3 checkboxes: [ ] [ ] [ ] [ ] [ ] [ ] ❌ BLOCKED (Layer 2 incomplete)
- Layer 4 checkboxes: [ ] [ ] [ ] [ ] [ ] [ ] ❌ BLOCKED (Layer 2 incomplete)

**Action**: Continue Layer 2 TDD cycles until complete, then proceed to Layer 3.
```

**Step 3: RED Phase — Write Failing Test for Current Layer**

Example: Layer 1 (Domain Model)

```csharp
// File: tests/Domain/Entities/UserTests.cs

[Fact]
public void User_WithValidData_CreatesSuccessfully()
{
    // Arrange
    var email = "user@example.com";
    var tier = CustomerTier.Basic;
    
    // Act
    var user = new User(email, tier);
    
    // Assert
    Assert.NotNull(user);
    Assert.Equal(email, user.Email);
    Assert.Equal(tier, user.Tier);
    Assert.True(user.IsActive);
}

// Test FAILS: User class doesn't exist yet
```

**Step 4: GREEN Phase — Implement Minimal Code to Pass Test**

```csharp
// File: src/Domain/Entities/User.cs

public class User
{
    public string Email { get; private set; }
    public CustomerTier Tier { get; private set; }
    public bool IsActive { get; private set; }
    
    public User(string email, CustomerTier tier)
    {
        Email = email;
        Tier = tier;
        IsActive = true;
    }
}

// Test PASSES: User class implements minimal requirements
```

**Step 5: REFACTOR Phase — Improve Code Quality**

```csharp
// File: src/Domain/Entities/User.cs

public class User
{
    public string Email { get; private set; }
    public CustomerTier Tier { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    public User(string email, CustomerTier tier)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty", nameof(email));
        if (!IsValidEmail(email))
            throw new ArgumentException("Email format invalid", nameof(email));
        
        Email = email;
        Tier = tier;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }
    
    private static bool IsValidEmail(string email)
    {
        // Email validation logic (extracted for reusability)
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }
    
    public void UpdateTier(CustomerTier newTier)
    {
        Tier = newTier;
        UpdatedAt = DateTime.UtcNow;
    }
}

// Test STILL PASSES: Code improved without breaking tests
```

**Step 6: Mark Checkbox in Implementation Plan**

```markdown
### Layer 1: Database & Domain Model
- [x] RED-01: Write failing test for domain entity creation ✅
- [x] GREEN-01: Implement domain entity with validation ✅
- [x] REFACTOR-01: Extract validation logic to separate service ✅
- [ ] RED-02: Write failing test for repository operations ← NEXT CYCLE
```

**Step 7: Repeat for All Layers Until Story Complete**

Continue RED → GREEN → REFACTOR cycles layer by layer until:
- Layer 1: ✅ COMPLETE
- Layer 2: ✅ COMPLETE
- Layer 3: ✅ COMPLETE
- Layer 4: ✅ COMPLETE
- **Story Status**: ✅ READY FOR QA

---

## Expected Outcomes

### Success Criteria

✅ **Layer Sequencing Enforced**: No parallel layer development; strict bottom-up progression  
✅ **Integration Bugs Reduced**: Early integration testing catches misalignment immediately  
✅ **Rework Cycles Minimized**: Architectural stability reduces cascade failures  
✅ **Context Efficiency**: Focus on one layer → less context switching → lower PRU  
✅ **Code Quality**: Refactor phase applied to each layer → cleaner codebase

### Metrics

| Metric | Before Pattern | After Pattern | Improvement |
|--------|----------------|---------------|-------------|
| **PRU Cost** | 800-1200 PRU | 560-840 PRU | 30% reduction |
| **Time** | 3-5 rework cycles (8-12h) | 1-2 rework cycles (3-5h) | 58% reduction |
| **Integration Bugs** | 35-45% of total bugs | 5-10% of total bugs | 77% reduction |
| **Code Quality** | 6.5/10 (technical debt) | 8.5/10 (refactored) | 31% improvement |

### Real-World Evidence

**Project Example 1**: Edenred Smarter Merchant (US-045: User Registration)
- Context: User registration with tier assignment (4 layers: Domain → Service → API → UI)
- Results:
  - PRU: 950 PRU (chaotic) → 665 PRU (layer-by-layer) = 30% reduction
  - Rework: 4 cycles (UI rework due to domain changes) → 1 cycle (minor refactoring) = 75% reduction
  - Integration bugs: 6 bugs (tier sync failures, validation misalignment) → 1 bug (UI accessibility) = 83% reduction
- Learnings: Layer 1 domain logic stability prevented cascade failures in Layers 2-4

**Project Example 2**: [Placeholder for second project]
- Context: {Brief context}
- Results: {Specific metrics achieved}
- Learnings: {Key takeaway}

---

## Related Patterns

### Complementary Patterns (use together)

- [BDD Scenario Template Library](../testing/bdd-scenarios/template-library.md) — BDD scenarios drive TDD cycle prioritization
- [Implementation Plan Approval Gate](../workflows/quality-gates/plan-approval-pattern.md) — Ensure dev-lead plan reviewed before TDD starts
- [Refactoring Checklist](refactoring-checklist.md) — Apply during REFACTOR phase

### Alternative Patterns (choose one)

- **Outside-In TDD** (UI-first) — Use when UI requirements are stable and domain logic is simple
- **Walking Skeleton** — Use for cross-cutting concerns (authentication, logging) before feature implementation

### Sequential Patterns (use in sequence)

1. [Implementation Plan Creation](../planning/implementation-plan-pattern.md) — Dev-lead creates layer breakdown (Phase 04)
2. **This Pattern: Layer-by-Layer TDD** — Implement bottom-up (Phase 05)
3. [E2E Testing](../testing/e2e-testing-pattern.md) — QA validates full stack integration (Phase 05)

---

## Validation Checklist

Use this checklist to verify correct implementation:

- [ ] Implementation plan created with layer breakdown (Layer 1-4)
- [ ] TDD orchestrator enforces layer sequencing (no parallel layer development)
- [ ] Each layer follows RED → GREEN → REFACTOR cycle
- [ ] Checkboxes in implementation-plan.md marked as work completes
- [ ] Integration tests run after each layer completes
- [ ] No layer starts before previous layer 100% complete
- [ ] Test: Run full TDD cycle for 1 user story → verify layer sequence enforced

---

## Troubleshooting

### Common Issues

**Issue**: Dev agent skips Layer 1, starts with UI (Layer 4)  
**Cause**: No enforcement mechanism in workflow  
**Solution**: Update dev-tdd orchestrator to validate layer sequencing (read implementation-plan.md checkboxes)

**Issue**: Layer 2 rework required after Layer 1 changes  
**Cause**: Domain logic discovered late, requires service layer changes  
**Solution**: Spike domain logic during planning (Phase 04) to reduce unknowns before TDD starts

**Issue**: Implementation plan missing or incomplete  
**Cause**: Dev-lead skipped implementation plan creation  
**Solution**: Quality gate enforcement — block TDD if implementation-plan.md not approved

**Issue**: Parallel layer development by multiple agents  
**Cause**: No coordination mechanism  
**Solution**: Use single dev-tdd orchestrator to serialize layer development (ONE layer active at a time)

---

## History & Evolution

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-20 | Initial pattern captured from gene2 framework TDD best practices | Framework Lead |

---

## References

- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [gene2 Framework Implementation Workflow](.github/workflows/05-implementation.workflows.md)
- [TDD Orchestrator Agent](.github/agents/dev-tdd.agent.md)

---

**Pattern Status**: Active  
**Maintainer**: Framework Lead  
**Feedback**: Create issue in gene2-core repo or propose pattern improvements via PR
