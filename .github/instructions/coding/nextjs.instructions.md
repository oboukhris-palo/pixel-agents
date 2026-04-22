---
applyTo: '**'
---


# Next.js Development Instructions

## Overview

This document provides systematic instructions for Next.js framework development best practices and patterns using the AI-first delivery methodology. These instructions follow established Next.js conventions and transform modern full-stack React requirements into comprehensive development standards that leverage Next.js capabilities, maintain performance optimization, and ensure scalable web application development.

## Process Overview

**Next.js Development Implementation** transforms full-stack web application requirements into structured Next.js implementations that deliver performance-optimized applications, effective server-side rendering, comprehensive testing strategies, and maintainable codebases through proper Next.js patterns, React integration, and established conventions for scalable modern web development.

## Implementation Process

## Project Structure
```
src/
├── app/                 # App router pages and layouts
├── components/         # React components
│   ├── ui/           # Reusable UI components
│   └── feature/      # Feature-specific components
├── lib/              # Core utilities and configurations
├── hooks/            # Custom React hooks
├── api/              # API routes and handlers
├── types/            # TypeScript type definitions
└── styles/           # Global styles and CSS modules
```

## Documentation Requirements

### Creation Timing
1. Documentation must be created before implementation
2. PRs will be blocked if documentation is not created/updated
3. Each feature/story/task must be documented before work begins

### Story Requirements
1. Must include:
   - Clear user story format ("As a user, I want to...")
   - All acceptance criteria
   - Technical constraints if any
   - Dependencies (other stories, setup, configuration)
2. Dependencies must be completed before story can start

### Task Organization
1. Must be organized by feature layers:
   - API
   - Components
   - Hooks
   - Utils
2. Each layer must include its test tasks
3. Additional task categories can be added when needed
4. Test coverage requirements must be specified

### Documentation Structure
1. Features live under `docs/feature/<feature_name>`
2. Each feature has:
   - index.md
   - story folder
3. Stories live under `feature/story/<story_name>.md`
4. Story name should not include parent folder suffix
5. Tasks are listed with status indicators:
   - ⬜ TODO
   - 🟨 IN PROGRESS
   - ✅ DONE

## Code Organization

### Feature Organization
1. Each feature should have:
   - Own directory under components/feature/
   - Grouped API routes in app/api/
   - Shared hooks in hooks/ directory
   - Types in types/ directory

### Naming Conventions
1. Files and Directories:
   - Use kebab-case for directories and files
   - Use PascalCase for components
   - Use camelCase for functions and variables
   - Add .server or .client suffix for server/client components
2. Group related components in feature-named directories

## Component Standards

### File Structure
1. One component per file
2. Separate files for:
   - Component
   - Styles (CSS modules)
   - Types (.types.ts)
3. Index file for feature exports

### Component Organization
```typescript
// Component structure
import styles from './ComponentName.module.css'
import type { ComponentNameProps } from './ComponentName.types'

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks first
  // state management
  // derived values
  // handlers
  // render
}
```

### Props Interface
1. Must be exported
2. Must use proper TypeScript types
3. Must document complex props
4. Must use proper React event types

## State Management

### Server State
1. Use React Query for server state
2. Define query keys by feature
3. Implement proper error handling
4. Add loading states

### Client State
1. Use Zustand for global state
2. Keep state minimal
3. Split stores by feature
4. Use proper TypeScript types

## API Implementation

### Route Organization
1. Group routes by feature
2. Use proper HTTP methods
3. Implement proper error handling
4. Add request validation
5. Add response types

### Route Structure
```typescript
// route.ts
import { z } from 'zod'
import { type NextRequest } from 'next/server'

const schema = z.object({
  // validation schema
})

export async function POST(request: NextRequest) {
  // validation
  // processing
  // response
}
```

## Testing Standards

### Component Tests
1. Use React Testing Library
2. Test:
   - User interactions
   - Loading states
   - Error states
3. Mock API calls

### API Tests
1. Test:
   - Validation
   - Error handling
   - Edge cases
2. Mock database calls

### E2E Tests
1. Use Playwright
2. Test:
   - Critical user flows
   - Responsive design
   - Accessibility

## Styling Guidelines

### CSS Modules
1. Use CSS Modules for component styles
2. Follow BEM-like naming
3. Use CSS variables for theming
4. Keep styles colocated with components

### Global Styles
1. Use Tailwind for utility classes
2. Define custom theme in tailwind.config.js
3. Keep global styles minimal
4. Use proper CSS reset

## Performance Requirements

### Image Optimization
1. Use Next.js Image component
2. Define proper sizes
3. Use proper formats
4. Implement lazy loading

### Code Splitting
1. Use dynamic imports when needed
2. Split large components
3. Implement proper loading states
4. Use proper suspense boundaries

## Security Standards

### Authentication
1. Implement proper auth middleware
2. Protect API routes
3. Handle session management
4. Implement proper CSRF protection

### Data Validation
1. Validate all inputs
2. Sanitize user content
3. Implement proper error messages
4. Use proper HTTP status codes

## Accessibility Standards

### Requirements
1. Use semantic HTML
2. Implement proper ARIA attributes
3. Test with screen readers
4. Follow WCAG guidelines

### Testing
1. Use axe-core for testing
2. Test:
   - Keyboard navigation
   - Color contrast
   - Screen reader compatibility 