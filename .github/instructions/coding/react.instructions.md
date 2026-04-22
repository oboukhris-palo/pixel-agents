---
description: React framework best practices, patterns, and conventions
applyTo: "**/*.tsx,**/*.jsx"
---

# React Development Instructions

## Overview

This document provides systematic instructions for React framework development best practices and patterns using the AI-first delivery methodology. These instructions follow established React conventions and transform modern frontend requirements into comprehensive development standards that leverage React's capabilities, maintain component reusability, and ensure scalable user interface development.

## Process Overview

**React Development Implementation** transforms frontend application requirements into structured React implementations that deliver reusable components, effective state management, comprehensive testing strategies, and maintainable user interfaces through proper component architecture, React patterns, and established conventions for scalable React applications.

## Implementation Process & Framework Guidelines

This document establishes coding standards and best practices for React development. All frontend team members must follow these guidelines to maintain consistency, quality, and maintainability across React projects.

---

## 1. Project Setup & React CLI

### Initial Setup
```bash
# Create new React project (using Vite for better performance)
npm create vite@latest <project-name> -- --template react

# Create new React project (using Create React App)
npx create-react-app <project-name>

# Install dependencies
npm install

# Start development server
npm run dev    # Vite
npm start      # CRA

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Version Requirements
- **React**: 18.x or higher
- **Node.js**: 18.x or higher
- **TypeScript**: 5.2.x or higher
- **npm**: 9.x or higher

### Project Configuration
Keep `vite.config.ts` or `react-scripts` optimized:
- Enable source maps for development
- Configure bundle analysis tools
- Set up code splitting strategies
- Configure CSS preprocessor if needed

---

## 2. Component Architecture & Best Practices

### 2.1 Component Declaration
Use **functional components with hooks** (modern standard):
```typescript
// ✅ GOOD: Functional component with TypeScript
import { FC, ReactNode, useState, useCallback } from 'react';

interface ComponentProps {
  title: string;
  items: Item[];
  onSelect: (item: Item) => void;
  children?: ReactNode;
}

export const MyComponent: FC<ComponentProps> = ({ 
  title, 
  items, 
  onSelect,
  children 
}) => {
  const [selected, setSelected] = useState<Item | null>(null);

  const handleSelect = useCallback((item: Item) => {
    setSelected(item);
    onSelect(item);
  }, [onSelect]);

  return (
    <div>
      <h1>{title}</h1>
      {children}
      {/* Component JSX */}
    </div>
  );
};
```

### 2.2 Component File Structure
```
src/
├── pages/                          # Page-level components (routed)
│   ├── [feature-name]/
│   │   ├── [feature-name].tsx
│   │   ├── [feature-name].module.css
│   │   └── [feature-name].types.ts
│   └── ...
├── components/                     # Reusable components
│   ├── ui/                         # Presentational components
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Badge/
│   ├── features/                   # Feature-specific components
│   │   ├── [feature-name]/
│   │   └── [feature-name]/index.ts
│   └── index.ts
├── hooks/                          # Custom hooks
│   ├── useAsync.ts
│   ├── useFetch.ts
│   └── index.ts
├── services/                       # Business logic services
│   ├── api.service.ts
│   ├── auth.service.ts
│   └── index.ts
├── types/                          # TypeScript type definitions
│   ├── common.types.ts
│   ├── api.types.ts
│   └── index.ts
├── utils/                          # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── index.ts
├── styles/                         # Global styles
│   ├── variables.css
│   ├── global.css
│   └── index.css
├── App.tsx
└── main.tsx
```

**Naming Conventions**:
- Components: `ComponentName.tsx` (PascalCase)
- Custom hooks: `useHookName.ts` (camelCase with 'use' prefix)
- Utilities: `utilityName.ts` (camelCase)
- Types: `*.types.ts` or `index.ts` in component folders
- Styles: `ComponentName.module.css` (CSS Modules)
- Test files: `ComponentName.test.tsx` or `ComponentName.spec.tsx`

### 2.3 Hooks Patterns
```typescript
// ✅ DO: Use hooks at top level
const MyComponent: FC = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Side effect logic
  }, []);

  return <div>{count}</div>;
};

// ❌ DON'T: Conditional hooks (breaks rules of hooks)
const BadComponent: FC = ({ condition }) => {
  if (condition) {
    const [state, setState] = useState(0); // ❌ NEVER
  }
  return <div />;
};

// ✅ DO: Extract custom hooks for reusable logic
const useFetchData = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [url]);

  return { data, loading, error };
};
```

### 2.4 Component Communication Patterns
```typescript
// Parent → Child: Props
interface ChildProps {
  label: string;
  onAction: (value: string) => void;
}

const Parent: FC = () => {
  const handleAction = (value: string) => {
    console.log('Action triggered:', value);
  };

  return <Child label="Click me" onAction={handleAction} />;
};

// Child → Parent: Callbacks via props
const Child: FC<ChildProps> = ({ label, onAction }) => {
  return <button onClick={() => onAction('data')}>{label}</button>;
};

// Component State: Context API for deeply nested components
import { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const value: ThemeContextType = {
    isDark,
    toggleTheme: () => setIsDark(!isDark),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 2.5 Memoization & Performance
```typescript
// ✅ DO: Memoize components when props don't change frequently
const ExpensiveComponent: FC<Props> = memo(({ data }) => {
  return <div>{/* Complex render logic */}</div>;
});

// ✅ DO: Use useCallback for callback stability
const Parent: FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const handleAdd = useCallback((item: Item) => {
    setItems(prev => [...prev, item]);
  }, []);

  return <Child onAdd={handleAdd} />;
};

// ✅ DO: Use useMemo for expensive computations
const Component: FC<Props> = ({ data }) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return <div>{sortedData}</div>;
};
```

---

## 3. State Management

### 3.1 Local Component State
```typescript
// ✅ DO: Use useState for local component state
const [count, setCount] = useState(0);
const [formData, setFormData] = useState({ name: '', email: '' });

// ✅ DO: Use functional setState for complex updates
setFormData(prev => ({
  ...prev,
  name: 'New Name'
}));
```

### 3.2 Global State (Context vs Libraries)
```typescript
// ✅ DO: Use Context API for simple global state
const UserContext = createContext<User | null>(null);

// ✅ DO: Consider Zustand, Redux, or Jotai for complex state
// Zustand example:
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### 3.3 Asynchronous State Management
```typescript
// ✅ DO: Use React Query (TanStack Query) for server state
import { useQuery } from '@tanstack/react-query';

const useGetUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      return res.json();
    },
  });
};

// ✅ DO: Use useMutation for mutations
import { useMutation } from '@tanstack/react-query';

const useCreateUser = () => {
  return useMutation({
    mutationFn: async (userData: UserData) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return res.json();
    },
  });
};
```

---

## 4. Side Effects & Lifecycle

### 4.1 Effect Patterns
```typescript
// ✅ DO: Clean up side effects
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);

  // Cleanup function
  return () => window.removeEventListener('resize', handler);
}, []);

// ✅ DO: Specify dependencies correctly
useEffect(() => {
  // This runs when 'userId' changes
  fetchUser(userId);
}, [userId]); // ✅ Include all used variables

// ❌ DON'T: Missing dependencies (causes stale closures)
useEffect(() => {
  fetchUser(userId); // userId is used but not in dependency array
}, []); // ❌ Missing userId
```

### 4.2 Async Operations in Effects
```typescript
// ✅ DO: Handle async operations properly
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const result = await fetch('/api/data');
    const data = await result.json();
    
    if (isMounted) {
      setData(data);
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Prevent state update on unmount
  };
}, []);

// ✅ DO: Use AbortController for cancellation
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data', { signal: controller.signal });
      const data = await res.json();
      setData(data);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    }
  };

  fetchData();

  return () => controller.abort();
}, []);
```

---

## 5. Event Handling & Forms

### 5.1 Event Handling
```typescript
// ✅ DO: Type event handlers properly
const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
  event.preventDefault();
  // Handle click
};

const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
  const value = event.target.value;
  setValue(value);
};

// ✅ DO: Use useCallback for event handlers passed to child components
const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((event) => {
  event.preventDefault();
  // Handle form submission
}, []);
```

### 5.2 Form Management
```typescript
// ✅ DO: Use controlled components
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const handleInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
  const { name, value } = e.currentTarget;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

return (
  <form>
    <input
      name="name"
      value={formData.name}
      onChange={handleInputChange}
    />
    <textarea
      name="message"
      value={formData.message}
      onChange={handleInputChange}
    />
  </form>
);

// ✅ DO: Consider react-hook-form for complex forms
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { name: '', email: '' }
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return <form onSubmit={onSubmit}>{/* Fields */}</form>;
};
```

---

## 6. Styling Guidelines

### 6.1 CSS Modules
```typescript
// ✅ DO: Use CSS Modules for component styles
import styles from './Button.module.css';

const Button: FC<ButtonProps> = ({ children }) => (
  <button className={styles.button}>
    {children}
  </button>
);

// ✅ DO: Handle dynamic className
import classnames from 'classnames';

const Button: FC<ButtonProps> = ({ variant, disabled }) => (
  <button className={classnames(
    styles.button,
    {
      [styles.primary]: variant === 'primary',
      [styles.disabled]: disabled
    }
  )}>
    {/* Content */}
  </button>
);
```

### 6.2 Tailwind CSS
```typescript
// ✅ DO: Use Tailwind for utility styles
const Button: FC = () => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
);

// ✅ DO: Use clsx or classnames to manage conditional classes
import { clsx } from 'clsx';

const Button: FC<ButtonProps> = ({ variant, size, disabled }) => (
  <button className={clsx(
    'px-4 py-2 rounded font-semibold transition-colors',
    {
      'bg-blue-500 hover:bg-blue-600': variant === 'primary',
      'bg-gray-500 hover:bg-gray-600': variant === 'secondary',
      'text-sm': size === 'sm',
      'text-lg': size === 'lg',
      'opacity-50 cursor-not-allowed': disabled
    }
  )}>
    {/* Content */}
  </button>
);
```

### 6.3 Styled Components / Emotion
```typescript
// ✅ DO: Use CSS-in-JS when needed
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button: FC<ButtonProps> = ({ children, ...props }) => (
  <StyledButton {...props}>{children}</StyledButton>
);
```

---

## 7. Testing

### 7.1 Unit Tests (Vitest / Jest)
```typescript
// ✅ DO: Test component rendering
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### 7.2 Integration Tests
```typescript
// ✅ DO: Test user interactions
import { render, screen, userEvent } from '@testing-library/react';
import { MyForm } from './MyForm';

describe('MyForm', () => {
  it('submits form data correctly', async () => {
    const handleSubmit = vi.fn();
    render(<MyForm onSubmit={handleSubmit} />);
    
    const input = screen.getByRole('textbox', { name: /name/i });
    await userEvent.type(input, 'John Doe');
    
    screen.getByRole('button', { name: /submit/i }).click();
    
    expect(handleSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
  });
});
```

### 7.3 E2E Tests
```typescript
// ✅ DO: Test critical user flows with Playwright
import { test, expect } from '@playwright/test';

test('user can create an account', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button:has-text("Sign up")');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 8. Performance Optimization

### 8.1 Code Splitting
```typescript
// ✅ DO: Use React.lazy for route-based code splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

export const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Suspense>
);
```

### 8.2 Image Optimization
```typescript
// ✅ DO: Use next/image equivalent or optimize images
import { useState } from 'react';

const ResponsiveImage: FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
  />
);

// ✅ DO: Consider using webp format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="description" />
</picture>
```

### 8.3 Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Or use source-map-explorer
npx source-map-explorer 'build/static/js/*.js'
```

---

## 9. Security Best Practices

### 9.1 XSS Prevention
```typescript
// ✅ DO: React escapes content by default
const Component = ({ userInput }: Props) => (
  <div>{userInput}</div> // ✅ Safe - automatically escaped
);

// ❌ DON'T: Use dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌ Dangerous

// ✅ DO: Sanitize HTML if necessary
import DOMPurify from 'dompurify';

const SafeHtml = ({ html }: Props) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);
```

### 9.2 Input Validation
```typescript
// ✅ DO: Validate all user inputs
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleSubmit = (email: string) => {
  if (!validateEmail(email)) {
    setError('Invalid email address');
    return;
  }
  // Process valid email
};
```

### 9.3 Environment Variables
```typescript
// ✅ DO: Keep secrets in environment variables
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

// ✅ DO: Validate environment variables at startup
if (!API_URL || !API_KEY) {
  throw new Error('Missing required environment variables');
}
```

---

## 10. Common Patterns & Anti-Patterns

### ✅ DO's
- Use functional components with hooks
- Keep components small and focused
- Lift state only when necessary
- Use TypeScript for type safety
- Memoize expensive computations and callbacks
- Write tests for components and hooks
- Use error boundaries for error handling
- Implement proper loading and error states

### ❌ DON'Ts
- Call hooks conditionally
- Use index as key in lists
- Create new objects/functions in render
- Mutate state directly
- Use 'any' type excessively
- Forget to clean up effects
- Create deeply nested components
- Block user interactions with synchronous operations

---

## Resources

- [React Documentation](https://react.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
