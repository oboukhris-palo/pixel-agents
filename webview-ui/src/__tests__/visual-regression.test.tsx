/**
 * Visual Regression & Accessibility Tests (US-003-005 Layer 4 - RED phase)
 *
 * Covers:
 * - AC2–AC4: Design token accuracy (colors, typography, spacing)
 * - AC6: Accessibility audit with jest-axe (WCAG 2.1 AA)
 *
 * Note: Pixel-perfect screenshot comparison (AC1) requires a headless browser
 * with Penpot export files; that is tracked separately in manual QA.
 *
 * Design reference: design-systems.md v2.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend jest matchers
expect.extend(toHaveNoViolations);

// Mock vscodeApi to prevent "acquireVsCodeApi is not defined" at module load time
// ActionBubble imports useAgentActivity which imports vscodeApi
jest.mock('../vscodeApi', () => ({
  vscode: {
    postMessage: jest.fn(),
    getState: jest.fn().mockReturnValue(undefined),
    setState: jest.fn(),
  },
}));

// ── Helper: parse CSS custom properties from tokens.css ───────────────────────

function parseTokensFile(): Map<string, string> {
  const cssPath = path.resolve(__dirname, '../styles/tokens.css');
  const css = fs.readFileSync(cssPath, 'utf-8');
  const tokens = new Map<string, string>();

  // Match --property: value; patterns
  const re = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    tokens.set(`--${match[1].trim()}`, match[2].trim());
  }
  return tokens;
}

let tokens: Map<string, string>;

beforeAll(() => {
  tokens = parseTokensFile();
});

// ── AC2: Color accuracy (Palo IT brand colors) ─────────────────────────────────

describe('Design Token Accuracy – Palo IT Brand Colors (AC2)', () => {
  it('should define Palo IT green', () => {
    expect(tokens.get('--palo-green')).toBe('#00C853');
  });

  it('should define Palo IT yellow', () => {
    expect(tokens.get('--palo-yellow')).toBe('#FFD600');
  });

  it('should define Palo IT orange', () => {
    expect(tokens.get('--palo-orange')).toBe('#FF6D00');
  });

  it('should define Palo IT tech blue', () => {
    expect(tokens.get('--palo-tech-blue')).toBe('#0066CC');
  });

  it('should define Palo IT gene2 purple', () => {
    expect(tokens.get('--palo-gene2-purple')).toBe('#7B3FF2');
  });
});

// ── AC2: TDD phase colors ──────────────────────────────────────────────────────

describe('Design Token Accuracy – TDD Phase Colors (AC2)', () => {
  it('should define TDD red phase color', () => {
    expect(tokens.get('--tdd-red')).toBe('#FF5500');
  });

  it('should define TDD green phase color', () => {
    expect(tokens.get('--tdd-green')).toBe('#10B981');
  });

  it('should define TDD refactor phase color', () => {
    expect(tokens.get('--tdd-refactor')).toBe('#8B5CF6');
  });

  it('should define TDD document phase color', () => {
    expect(tokens.get('--tdd-document')).toBe('#06B6D4');
  });
});

// ── AC3: Typography scale ──────────────────────────────────────────────────────

describe('Design Token Accuracy – Typography Scale (AC3)', () => {
  it('should define h1 at 24px', () => {
    expect(tokens.get('--text-h1')).toBe('24px');
  });

  it('should define h2 at 18px', () => {
    expect(tokens.get('--text-h2')).toBe('18px');
  });

  it('should define h3 at 14px', () => {
    expect(tokens.get('--text-h3')).toBe('14px');
  });

  it('should define body text at 13px', () => {
    expect(tokens.get('--text-body')).toBe('13px');
  });

  it('should define small body text at 11px', () => {
    expect(tokens.get('--text-body-sm')).toBe('11px');
  });

  it('should define code text at 12px', () => {
    expect(tokens.get('--text-code')).toBe('12px');
  });

  it('should define caption text at 10px', () => {
    expect(tokens.get('--text-caption')).toBe('10px');
  });

  it('should define micro text at 9px', () => {
    expect(tokens.get('--text-micro')).toBe('9px');
  });

  it('should define mini text at 8px', () => {
    expect(tokens.get('--text-mini')).toBe('8px');
  });
});

// ── AC4: Spacing scale ─────────────────────────────────────────────────────────

describe('Design Token Accuracy – Spacing Scale (AC4)', () => {
  it('should define space-0 as 0px', () => {
    expect(tokens.get('--space-0')).toBe('0px');
  });

  it('should define space-1 as 4px', () => {
    expect(tokens.get('--space-1')).toBe('4px');
  });

  it('should define space-2 as 8px', () => {
    expect(tokens.get('--space-2')).toBe('8px');
  });

  it('should define space-3 as 12px', () => {
    expect(tokens.get('--space-3')).toBe('12px');
  });

  it('should define space-4 as 16px', () => {
    expect(tokens.get('--space-4')).toBe('16px');
  });

  it('should define space-8 as 32px', () => {
    expect(tokens.get('--space-8')).toBe('32px');
  });

  it('should define space-16 as 64px', () => {
    expect(tokens.get('--space-16')).toBe('64px');
  });
});

// ── Token completeness ─────────────────────────────────────────────────────────

describe('Design Token Completeness', () => {
  it('should have at least 50 defined design tokens', () => {
    expect(tokens.size).toBeGreaterThanOrEqual(50);
  });

  it('should define VS Code dark theme background', () => {
    expect(tokens.get('--vscode-bg')).toBe('#1E1E1E');
  });

  it('should define VS Code sidebar background', () => {
    expect(tokens.get('--vscode-sidebar-bg')).toBe('#252526');
  });

  it('should define semantic success color', () => {
    expect(tokens.get('--color-success')).toBe('#10B981');
  });

  it('should define semantic error color', () => {
    expect(tokens.get('--color-error')).toBe('#EF4444');
  });

  it('should define context window safe threshold', () => {
    expect(tokens.get('--context-safe')).toBe('#10B981');
  });

  it('should define context window critical threshold', () => {
    expect(tokens.get('--context-critical')).toBe('#EF4444');
  });

  it('should define all 12 agent colors', () => {
    const agentTokens = [...tokens.keys()].filter(k => k.startsWith('--agent-'));
    expect(agentTokens.length).toBeGreaterThanOrEqual(12);
  });
});

// ── AC6: Accessibility audit with jest-axe ────────────────────────────────────

describe('Accessibility Audit – WCAG 2.1 AA (AC6)', () => {
  it('should have no accessibility violations in CompletenessMeter', async () => {
    // Lazy import to avoid top-level hook issues
    const { CompletenessMeter } = await import('../components/CompletenessMeter');
    const { container } = render(
      React.createElement(CompletenessMeter)
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in ContextWindowBar', async () => {
    const { ContextWindowBar } = await import('../components/ContextWindowBar');
    const { container } = render(
      React.createElement(ContextWindowBar)
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in ActionBubble with text', async () => {
    const { ActionBubble } = await import('../components/ActionBubble');
    const { container } = render(
      React.createElement(ActionBubble, { code: 'const x = 1;', agentName: 'Dev TDD' })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in ZoomControls', async () => {
    const { ZoomControls } = await import('../components/ZoomControls');
    const { container } = render(
      React.createElement(ZoomControls, {
        zoom: 1,
        onZoomIn: jest.fn(),
        onZoomOut: jest.fn(),
        onReset: jest.fn(),
      })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
