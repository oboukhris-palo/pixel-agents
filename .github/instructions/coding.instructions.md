# Coding Standards & Best Practices

**Standards**: Clean Code | SOLID | YAGNI | Patterns | Testing | Security | Refactoring

---

## Clean Code

### Naming
**Rules**: Classes=nouns, Functions=verbs, Variables=specific, Constants=UPPER, Booleans=is/has/can
❌ Bad: a, x1, tmp, data | ✅ Good: totalPrice, calculateRevenue, isActive

## SOLID
SRP | OCP | LSP | ISP | DIP

## YAGNI
Build only required features. No future-proofing, no premature optimization.

## Patterns
**Creational**: Singleton, Factory, Builder  
**Structural**: Adapter, Decorator, Facade  
**Behavioral**: Strategy, Observer, Command  
**Anti-pattern**: Using patterns when simple code suffices

## Testing
**Pyramid**: 70% unit, 20% integration, 10% E2E  
**TDD**: RED → GREEN → REFACTOR  
**Characteristics**: Isolated, repeatable, fast, readable

## Documentation
Code=WHAT, Comments=WHY. README, API docs, ADRs.

## Errors
Fail fast, fail explicitly, handle specifically, log before re-throw

## Security
Validate input, encrypt data, authenticate/authorize, log securely (no secrets)

## Performance
Measure first, optimize Big O, cache, paginate, index

## Refactoring
**When**: Hard to understand, duplication, too large  
**Techniques**: Extract method/class, rename, simplify, remove duplication

## Code Review Checklist
- [ ] Implements requirements
- [ ] SOLID principles
- [ ] No duplication
- [ ] Clear naming
- [ ] Tests cover happy/edge/error paths
- [ ] Input validated
- [ ] No hardcoded secrets
- [ ] No obvious performance issues
- [ ] Code is self-documenting

**Goal**: Write code you'd maintain in 5 years.
````

**Example - Easy to Read**:
```
function calculateActiveAccountBonus(accounts) {
  const activeAccountsWithBalance = accounts.filter(account => 
    account.status === 'active' && account.balance > 100
  );
  
  if (activeAccountsWithBalance.length === 0) {
    return 0;
  }
  
  const firstEligibleAccount = activeAccountsWithBalance[0];
  const bonusRate = 0.9;
  
  return firstEligibleAccount.balance * bonusRate;
}
```

### 4. Complexity Management

**Keep Code Simple**:
- **Avoid Deep Nesting**: Max 2-3 levels
- **Limit Conditionals**: Use guard clauses to reduce nesting
- **Extract Complex Logic**: Create helper functions for clarity
- **Break Large Functions**: Decompose into smaller, focused functions
- **Use Composition**: Combine simple behaviors into complex ones

---

## SOLID
**SRP**: One class, one reason to change
**OCP**: Open for extension, closed for modification (interfaces/plugins)
**LSP**: Subtypes substitutable for base types
**ISP**: Small focused interfaces, not fat ones
**DIP**: Depend on abstractions, not concretions (DI)

## YAGNI

### 1. You Aren't Gonna Need It (YAGNI)

**Principle**: Don't implement features you don't currently need.

**Rules**:
- **Add Only Required Features**: Build what's specified, nothing more
- **Future-Proof Code ≠ Speculative Code**: Architecture can be extended later
- **Avoid Premature Optimization**: Optimize when there's a real problem
- **Simplicity First**: Start simple, refactor when needed
- **Proof Over Assumption**: Wait for evidence before adding complexity

**Bad Thinking**:
```
"We might need multi-language support someday, so let's build it now"
"Performance might be an issue later, let's add caching everywhere"
"We could scale to millions, so let's use the most complex architecture"
```

**Good Thinking**:
```
"Build what's needed today"
"Optimize when profiling shows a bottleneck"
"Scale the architecture when you actually have the load"
"Refactor to support expansion when requirements demand it"
```

### 2. Simplicity Guidelines

**Seek Simplicity**:
- Delete unnecessary code
- Prefer standard solutions over custom ones
- One obvious way vs multiple approaches
- Reduce conceptual complexity before reducing lines
- Code that's easy to delete is better than code that's hard to modify

**Complexity vs Simplicity**:

| Necessary Complexity | Unnecessary Complexity |
|---------------------|----------------------|
| Addresses real requirements | Anticipates future needs |
| Solves identified problems | Solves imagined problems |
| Enables critical features | Enables unused features |
| Required for safety/security | Over-engineered for "what-if" |

---

## Patterns
**Creational**: Singleton (one instance), Factory (complex creation), Builder (many params)
**Structural**: Adapter (incompatible interfaces), Decorator (add behavior), Facade (simplify complex)
**Behavioral**: Strategy (switchable algorithms), Observer (notify changes), Command (queue operations)
**Anti-pattern**: Using patterns when simple code suffices. Don't force patterns.

**Anti-Pattern Checklist**:
- ❌ Using patterns when simple code would suffice
- ❌ Forcing patterns to fit problems they don't solve
- ❌ Overengineering for potential future needs
- ❌ Using patterns just because they're popular
- ❌ Creating patterns when direct code is clearer

**Rule**: Patterns solve real problems. If you don't have the problem, don't add the pattern.

---

## Organization
**Modular**: High cohesion, low coupling, clear boundaries
**Layered**: Presentation → Business Logic → Data Access → Infrastructure
**By Feature**: Group related code (users/, products/) not by type (controllers/, services/)

## Testing

### 1. Test Levels (Testing Pyramid)

```
              Acceptance Tests (10%)
           Integration Tests (20%)
        Unit Tests (70%)
```

**Unit Tests**:
- Test single function/method in isolation
- Fast execution (milliseconds)
- No external dependencies
- 70% of test suite

**Integration Tests**:
- Test interaction between components
- Include real databases, APIs
- Moderate execution time (seconds)
- 20% of test suite

**Acceptance/E2E Tests**:
- Test complete user workflows
- Slow execution (minutes)
- Minimal count - only critical paths
- 10% of test suite

### 2. Test Characteristics

**Good Tests**:
- **Isolated**: Run independently, no dependencies on other tests
- **Repeatable**: Same result every run
- **Readable**: Clear what's being tested
- **Fast**: Execute quickly
- **Comprehensive**: Cover happy path, edge cases, errors

**Bad Tests**:
```
❌ Depend on execution order
❌ Fail intermittently (flaky)
❌ Require manual setup
❌ Take minutes to run
❌ Only test happy path
```

### 3. Test-First Development

**TDD Cycle** (RED → GREEN → REFACTOR):
1. **RED**: Write failing test
2. **GREEN**: Write minimal code to pass test
3. **REFACTOR**: Improve code while keeping tests green

**Benefits**:
- Better design (thinking about usage first)
- Comprehensive test coverage
- Confidence in refactoring
- Clear specifications in code

---

## Documentation
**Rule**: Code explains WHAT. Comments explain WHY.
❌ Bad: `i = i + 1 // increment i`
✅ Good: Explain surprising behavior, workarounds, gotchas, public API
**Docs**: README (build/run), API docs, architecture docs, ADRs (decisions)

## Errors

### 1. Error Handling Principles

**Rules**:
- **Fail Fast**: Detect errors as early as possible
- **Fail Explicitly**: Clear error messages, not silent failures
- **Handle Specifically**: Catch specific exceptions, not generic ones
- **Don't Ignore**: Always handle errors appropriately
- **Don't Swallow**: Log before re-throwing or handling

**Bad Error Handling**:
```
try {
  riskyOperation()
} catch (Exception e) {
  // Say nothing, do nothing
}
```

**Good Error Handling**:
```
try {
  riskyOperation()
} catch (ValidationException e) {
  log.warn("User input validation failed", e)
  return errorResponse("Invalid input: " + e.getMessage())
} catch (DatabaseException e) {
  log.error("Database operation failed", e)
  return errorResponse("System error, try again later")
} catch (Exception e) {
  log.error("Unexpected error", e)
  throw new ApplicationException("Unexpected error", e)
}
```

### 2. Error Communication

**Clear Error Messages**:
- What went wrong
- Where it went wrong
- How to fix it
- Who to contact if unsure

**Bad Message**: "Error"  
**Good Message**: "User account locked. Contact support@company.com to unlock"

---

## Performance
**Rules**: Measure first, optimize what matters, readability > micro-optimization
**Focus**: Algorithm efficiency (Big O), data structures, DB queries, caching, lazy loading
**Scale**: Stateless services, caching, pagination, indexes, connection pooling

## Security

### 1. Security Principles

**Rules**:
- **Principle of Least Privilege**: Users/services get minimum access needed
- **Defense in Depth**: Multiple security layers
- **Never Trust Input**: Always validate and sanitize
- **Fail Securely**: Security failures default to deny
- **Secure by Default**: Safe configuration out of the box

### 2. Common Security Practices

**Input Validation**:
- Validate data type, format, length, range
- Sanitize before storing/displaying
- Use allowlists, not blocklists

**Authentication & Authorization**:
- Authenticate (verify who you are)
- Authorize (verify what you can do)
- Use proven frameworks, don't build custom

**Data Protection**:
- Encrypt sensitive data in transit and at rest
- Hash passwords with strong algorithms
- Secure API keys and secrets
- Minimal data retention

**Logging & Monitoring**:
- Log security events
- Monitor for suspicious activity
- Never log sensitive data (passwords, tokens)
- Regular security audits

---

## Refactoring
**When**: Hard to understand, duplication, too large, hard to test, better solution found
**Don't**: When code won't change, time pressure, no tests, unclear requirements
**Safe**: Tests pass before → Small changes → Test after each → Commit on success
**Techniques**: Extract method/class, rename, simplify conditionals, remove duplication

## Anti-Patterns

### 1. Code Smells

| Smell | Problem | Solution |
|-------|---------|----------|
| **Long Method** | Too much logic in one function | Extract smaller methods |
| **Large Class** | Too many responsibilities | Split into focused classes |
| **Duplicate Code** | Copy-paste code | Extract to shared function/class |
| **Long Parameter List** | Function signature too complex | Group into object |
| **Global Variables** | Hidden dependencies, hard to test | Pass as parameters |
| **Magic Numbers** | Unexplained constants | Extract named constants |
| **Dead Code** | Unused code clutters codebase | Delete it |
| **Feature Envy** | Method uses more of another class | Move method |

### 2. Common Anti-Patterns

**God Object**: One class doing everything
- Solution: Split by responsibility (SRP)

**Tight Coupling**: Classes depend heavily on each other
- Solution: Use dependency injection, interfaces

**Primitive Obsession**: Using primitives for everything
- Solution: Create meaningful objects

**Data Clumps**: Same data passed together everywhere
- Solution: Create object to hold related data

**Switch Statements**: Long conditionals for different types
- Solution: Use polymorphism/strategy pattern

**Speculative Generality**: Over-engineering for future needs
- Solution: Follow YAGNI, refactor later if needed

---

## Code Review Checklist

### Functionality
- [ ] Code implements specified requirements
- [ ] All acceptance criteria met
- [ ] Edge cases handled
- [ ] Error conditions handled
- [ ] Tests verify behavior

### Design & Architecture
- [ ] Code follows SOLID principles
- [ ] No duplication of logic
- [ ] Appropriate design patterns used
- [ ] Consistent with codebase architecture
- [ ] No unnecessary complexity

### Code Quality
- [ ] Naming is clear and meaningful
- [ ] Functions are single-responsibility
- [ ] No dead code
- [ ] No magic numbers/strings
- [ ] Readable without comments

### Testing
- [ ] Unit tests provide good coverage
- [ ] Tests are focused and isolated
- [ ] Happy path tested
- [ ] Edge cases tested
- [ ] Error paths tested

### Security
- [ ] Input properly validated
- [ ] No hardcoded secrets
- [ ] Authentication/authorization correct
- [ ] Sensitive data protected
- [ ] No SQL injection/XSS vulnerabilities

### Performance
- [ ] No obvious performance issues
- [ ] Algorithms efficient
- [ ] No resource leaks
- [ ] Appropriate caching used
- [ ] Database queries optimized

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic explained
- [ ] Public API documented
- [ ] README updated if needed
- [ ] Comments explain WHY, not WHAT

---

## Continuous Improvement
Update this document based on lessons learned. Track changes with dates.

## Summary
1. Clean Code: Easy to read/understand/modify
2. SOLID Design: Flexible, maintainable
3. YAGNI: Avoid over-engineering
4. Comprehensive Tests: Confidence in changes
5. Security First: Protect data
6. Optimize What Matters: Measure before optimizing
7. Clear Communication: Code explains itself

**Goal**: Write code you'd be proud to maintain in 5 years.