---
description: TypeScript programming language best practices, patterns, and conventions
applyTo: "**/*.ts"
---

# TypeScript Development Instructions

## Overview

This document provides systematic instructions for TypeScript programming language best practices and conventions using the AI-first delivery methodology. These instructions follow established TypeScript development patterns and transform type-safe development requirements into comprehensive coding standards that leverage TypeScript's type system, enhance code reliability, and maintain consistency across TypeScript projects.

## Process Overview

**TypeScript Development Implementation** transforms type-safe programming requirements into structured TypeScript implementations that deliver robust type checking, enhanced developer experience, comprehensive error prevention, and maintainable codebases through proper type definitions, advanced TypeScript features, and established patterns for scalable TypeScript applications.

## Implementation Process & Development Guidelines

This document establishes coding standards and best practices for TypeScript development. All team members must follow these guidelines to maintain consistency, quality, and maintainability across TypeScript projects.

---

## 1. Project Setup & Configuration

### Initial Setup
```bash
# Initialize TypeScript project
npm init -y
npm install --save-dev typescript

# Generate tsconfig.json
npx tsc --init

# Compile TypeScript
tsc

# Compile and watch
tsc --watch

# Run with ts-node
npx ts-node src/index.ts
```

### Version Requirements
- **TypeScript**: 5.x or higher
- **Node.js**: 18.x or higher

### tsconfig.json Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Project Structure
```
project-name/
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── models.ts
│   ├── services/
│   │   ├── index.ts
│   │   └── user.service.ts
│   ├── utils/
│   │   ├── index.ts
│   │   └── helpers.ts
│   └── handlers/
│       ├── index.ts
│       └── user.handler.ts
├── tests/
│   └── unit/
├── dist/
├── tsconfig.json
└── package.json
```

---

## 2. Type Definitions & Interfaces

### 2.1 Interface vs Type
```typescript
// ✅ DO: Use interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ DO: Use type for union, intersection, or primitives
type UserStatus = 'active' | 'inactive' | 'banned';
type AdminUser = User & { role: 'admin' };
type ID = string | number;

// ✅ DO: Use interface for contracts/classes
interface Repository {
  find(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// ✅ DO: Use type for complex utility types
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// ✅ DO: Use interface for extending
interface ExtendedUser extends User {
  createdAt: Date;
}

// ✅ DO: Use type for complex shapes
type Response<T> = {
  status: 'success' | 'error';
  data: T;
  error?: string;
};
```

### 2.2 Strict Type Checking
```typescript
// ✅ DO: Enable strict mode (include in tsconfig.json)
"strict": true,
"noImplicitAny": true,
"noUnusedLocals": true,
"noUnusedParameters": true,

// ✅ DO: Always type function parameters and returns
function fetchUser(id: string): Promise<User> {
  return userService.findById(id);
}

// ✅ DO: Avoid 'any' - use proper types
// ❌ DON'T
function processData(data: any): any {
  return data;
}

// ✅ DO
function processData<T>(data: T): T {
  return data;
}

// ✅ DO: Use unknown for truly unknown types
function handleResponse(response: unknown): void {
  if (typeof response === 'string') {
    console.log(response);
  }
}
```

---

## 3. Classes & Objects

### 3.1 Class Definition
```typescript
// ✅ DO: Use access modifiers
class User {
  private id: string;
  protected email: string;
  public name: string;

  constructor(id: string, email: string, name: string) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  public getId(): string {
    return this.id;
  }

  protected validateEmail(): boolean {
    return this.email.includes('@');
  }
}

// ✅ DO: Use parameter properties
class User {
  constructor(
    private id: string,
    public name: string,
    protected email: string
  ) {}
}

// ✅ DO: Use abstract classes for base types
abstract class Entity {
  abstract validate(): boolean;

  protected log(message: string): void {
    console.log(message);
  }
}

class User extends Entity {
  validate(): boolean {
    return true;
  }
}

// ✅ DO: Use static members
class Constants {
  static readonly MAX_RETRIES = 3;
  static readonly DEFAULT_TIMEOUT = 5000;
}
```

---

## 4. Functions & Generics

### 4.1 Function Typing
```typescript
// ✅ DO: Type all function parameters and returns
function calculateTotal(items: Item[], taxRate: number): number {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
}

// ✅ DO: Use function type syntax
type Callback = (data: string) => Promise<void>;

const processData: Callback = async (data: string) => {
  console.log(data);
};

// ✅ DO: Use optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}!`;
}

// ✅ DO: Use rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// ✅ DO: Use function overloading
function format(date: Date): string;
function format(date: string): Date;
function format(date: Date | string): Date | string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return new Date(date);
}
```

### 4.2 Generics
```typescript
// ✅ DO: Use generics for flexible, reusable code
interface Response<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

async function fetchUser<T = User>(id: string): Promise<Response<T>> {
  try {
    const data = await api.get<T>(`/users/${id}`);
    return { status: 'success', data };
  } catch (error) {
    return { status: 'error', error: String(error) };
  }
}

// ✅ DO: Use generic constraints
interface WithId {
  id: string;
}

function getId<T extends WithId>(obj: T): string {
  return obj.id;
}

// ✅ DO: Use multiple type parameters
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// ✅ DO: Use default type parameters
type Page<T = unknown> = {
  data: T[];
  total: number;
};
```

---

## 5. Enums & Literal Types

### 5.1 Enums
```typescript
// ✅ DO: Use enums for fixed sets of values
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// ✅ DO: Use numeric enums when appropriate
enum Status {
  Pending = 0,
  Active = 1,
  Inactive = 2,
}

// ✅ DO: Use const enums for better performance
const enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}
```

### 5.2 Literal Types
```typescript
// ✅ DO: Use literal types instead of enums for simple cases
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface Request {
  method: HttpMethod;
  url: string;
}

// ✅ DO: Use literal types with discriminated unions
type Circle = {
  kind: 'circle';
  radius: number;
};

type Square = {
  kind: 'square';
  side: number;
};

type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
  }
}
```

---

## 6. Error Handling

### 6.1 Custom Errors
```typescript
// ✅ DO: Create custom error classes
class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ✅ DO: Use proper error typing
function validateEmail(email: string): void {
  if (!email.includes('@')) {
    throw new ValidationError('email', 'Invalid email format');
  }
}

// ✅ DO: Handle errors with type guards
try {
  validateEmail(userInput);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed on field: ${error.field}`);
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  }
}
```

---

## 7. Async Programming

### 7.1 Promises & Async/Await
```typescript
// ✅ DO: Use async/await with proper typing
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}

// ✅ DO: Chain promises properly
Promise.resolve(1)
  .then(num => num * 2)
  .then(num => num + 1)
  .catch(error => console.error(error));

// ✅ DO: Use Promise.all for parallel operations
async function getAllUserData(ids: string[]): Promise<User[]> {
  const promises = ids.map(id => fetchUser(id));
  return Promise.all(promises);
}

// ✅ DO: Use Promise utilities
Promise.allSettled([
  fetchUser('1'),
  fetchUser('2'),
]).then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log(result.value);
    } else {
      console.error(result.reason);
    }
  });
});
```

---

## 8. Testing

### 8.1 Unit Tests (Jest/Vitest)
```typescript
// ✅ DO: Write typed tests
import { describe, it, expect } from 'vitest';

describe('UserService', () => {
  it('should create a user', () => {
    const service = new UserService();
    const user = service.create('John', 'john@example.com');

    expect(user.name).toBe('John');
    expect(user.email).toBe('john@example.com');
  });

  it('should throw on invalid email', () => {
    const service = new UserService();
    
    expect(() => {
      service.create('John', 'invalid-email');
    }).toThrow(ValidationError);
  });
});
```

---

## 9. Common Patterns & Anti-Patterns

### ✅ DO's
- Use strict mode always
- Type everything (avoid `any`)
- Use interfaces for contracts
- Use enums/literal types for fixed values
- Use generics for reusable code
- Handle errors with specific error types
- Use async/await over raw promises
- Write descriptive type names

### ❌ DON'Ts
- Use `any` type
- Skip type annotations
- Create overly complex types
- Ignore compiler warnings
- Use `never` incorrectly
- Create circular dependencies
- Mutate types across files

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
