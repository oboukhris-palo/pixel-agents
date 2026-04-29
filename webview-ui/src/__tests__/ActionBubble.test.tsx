/**
 * Layer 4: ActionBubble Component Tests (US-001-002)
 * 
 * BDD Mapping:
 *   - AC1: Agent name + role icon from metadata
 *   - AC2: Code snippet with syntax highlighting
 *   - AC3: Action type [RED-01] + description + timestamp
 *   - AC5: Fade-in animation over 300ms
 *   - AC6: Status indicator ✅/🔄/❌
 *   - AC7: Copy button with toast notification
 *   - AC8: Placeholder "Waiting for code..." when snippet null
 *   - AC9: React.memo prevents sibling re-renders
 *   - AC10: Graceful unmount when no active agent
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionBubble } from '../components/ActionBubble';
import type { AgentActivityState } from '../hooks/useExtensionMessages';

// ── Mock useAgentActivity ─────────────────────────────────────────────────────
jest.mock('../hooks/useAgentActivity', () => ({
  useAgentActivity: jest.fn(),
}));

import { useAgentActivity } from '../hooks/useAgentActivity';
const mockUseAgentActivity = useAgentActivity as jest.MockedFunction<typeof useAgentActivity>;

// ── Mock clipboard ────────────────────────────────────────────────────────────
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: jest.fn().mockResolvedValue(undefined) },
  writable: true,
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockActivity: AgentActivityState = {
  activeAgent: {
    id: 'dev-tdd-red',
    name: 'TDD RED Phase Agent',
    description: 'Writes failing tests',
    spriteColor: '#FF5500', // RED phase color (design-systems.md v2.0.0)
    icon: '🔴',
  },
  currentAction: {
    type: 'RED',
    cycle: 1,
    description: 'Write failing test for email validation',
  },
  codeSnippet: {
    language: 'typescript',
    content: 'const validate = (email: string) => /^[^@]+@[^@]+$/.test(email);',
  },
  status: 'in-progress',
  timestamp: '2026-04-23T09:45:33Z',
};

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('ActionBubble Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAgentActivity.mockReturnValue({ activity: mockActivity, fileOperations: [] });
  });

  // ── AC10: Unmount when no active agent ───────────────────────────────────────

  describe('AC10: No active agent', () => {
    it('renders null when activity is null', () => {
      mockUseAgentActivity.mockReturnValue({ activity: null, fileOperations: [] });
      const { container } = render(<ActionBubble />);
      expect(container.firstChild).toBeNull();
    });

    it('renders null when activeAgent is null', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, activeAgent: null }, fileOperations: [] });
      const { container } = render(<ActionBubble />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Basic rendering ───────────────────────────────────────────────────────────

  describe('Basic rendering', () => {
    it('renders the action bubble container when agent is active', () => {
      render(<ActionBubble />);
      expect(screen.getByRole('region', { name: /agent activity/i })).toBeInTheDocument();
    });

    it('has data-testid for the main container', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('action-bubble')).toBeInTheDocument();
    });
  });

  // ── AC1: Agent name + role icon ───────────────────────────────────────────────

  describe('AC1: Agent metadata display', () => {
    it('displays agent icon', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('agent-icon')).toHaveTextContent('🔴');
    });

    it('displays agent id/name', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('agent-name')).toHaveTextContent('dev-tdd-red');
    });

    it('shows fallback icon when icon is missing', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, activeAgent: { ...mockActivity.activeAgent!, icon: undefined } }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('agent-icon')).toBeInTheDocument();
    });
  });

  // ── AC3: Action type + timestamp ──────────────────────────────────────────────

  describe('AC3: Action metadata', () => {
    it('displays formatted action [RED-01]', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('action-label')).toHaveTextContent('[RED-01]');
    });

    it('displays action description', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('action-description')).toHaveTextContent('Write failing test for email validation');
    });

    it('displays formatted timestamp', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('action-timestamp')).toHaveTextContent('09:45:33Z');
    });

    it('omits description when empty', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, currentAction: { ...mockActivity.currentAction, description: '' } }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('action-label')).toHaveTextContent('[RED-01]');
      expect(screen.queryByTestId('action-description')).not.toBeInTheDocument();
    });
  });

  // ── AC6: Status indicators ────────────────────────────────────────────────────

  describe('AC6: Status indicator', () => {
    it('displays 🔄 spinner for in-progress', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('🔄');
    });

    it('displays ✅ for success status', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, status: 'success' }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('✅');
    });

    it('displays ❌ for failed status', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, status: 'failed' }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('❌');
    });

    it('displays ⏸️ for idle status', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, status: 'idle' }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('⏸️');
    });

    it('updates status when new message arrives', () => {
      const { rerender } = render(<ActionBubble />);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('🔄');

      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, status: 'success' }, fileOperations: [] });
      rerender(<ActionBubble key="updated" />);
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('✅');
    });
  });

  // ── AC2: Code snippet display ─────────────────────────────────────────────────

  describe('AC2: Code snippet', () => {
    it('renders code block when snippet is present', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('code-snippet-display')).toBeInTheDocument();
    });

    it('displays the code content', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('code-content')).toHaveTextContent(
        'const validate = (email: string) => /^[^@]+@[^@]+$/.test(email);',
      );
    });

    it('shows language label', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('code-language')).toHaveTextContent('typescript');
    });
  });

  // ── AC8: Placeholder when no snippet ─────────────────────────────────────────

  describe('AC8: Placeholder text', () => {
    it('shows "Waiting for code..." when codeSnippet is null', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, codeSnippet: null }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('code-placeholder')).toHaveTextContent('Waiting for code...');
    });

    it('does not show code display when snippet is null', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, codeSnippet: null }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.queryByTestId('code-snippet-display')).not.toBeInTheDocument();
    });
  });

  // ── AC7: Copy to clipboard ────────────────────────────────────────────────────

  describe('AC7: Copy to clipboard', () => {
    it('renders copy button', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    });

    it('copies code to clipboard on click', async () => {
      render(<ActionBubble />);
      fireEvent.click(screen.getByTestId('copy-button'));
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'const validate = (email: string) => /^[^@]+@[^@]+$/.test(email);',
        );
      });
    });

    it('shows "Copied!" toast after copy', async () => {
      render(<ActionBubble />);
      fireEvent.click(screen.getByTestId('copy-button'));
      await waitFor(() => {
        expect(screen.getByTestId('copy-toast')).toHaveTextContent('Copied!');
      });
    });

    it('toast disappears after 2.5 seconds', async () => {
      jest.useFakeTimers();
      render(<ActionBubble />);
      fireEvent.click(screen.getByTestId('copy-button'));
      await waitFor(() => expect(screen.getByTestId('copy-toast')).toBeInTheDocument());
      act(() => jest.advanceTimersByTime(3000));
      expect(screen.queryByTestId('copy-toast')).not.toBeInTheDocument();
      jest.useRealTimers();
    });

    it('does not render copy button when snippet is null', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, codeSnippet: null }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
    });

    it('shows error toast on clipboard failure', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('clipboard denied'));
      render(<ActionBubble />);
      fireEvent.click(screen.getByTestId('copy-button'));
      await waitFor(() => {
        expect(screen.getByTestId('copy-toast')).toHaveTextContent('Failed to copy');
      });
    });
  });

  // ── AC5: Animation class ──────────────────────────────────────────────────────

  describe('AC5: Fade-in animation', () => {
    it('applies fade-in CSS class to code block', () => {
      render(<ActionBubble />);
      const snippet = screen.getByTestId('code-snippet-display');
      expect(snippet.className).toMatch(/fade-in/);
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────────

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('has region landmark with accessible label', () => {
      render(<ActionBubble />);
      expect(screen.getByRole('region', { name: /agent activity monitor/i })).toBeInTheDocument();
    });

    it('copy button has accessible label', () => {
      render(<ActionBubble />);
      const btn = screen.getByTestId('copy-button');
      expect(btn).toHaveAttribute('aria-label');
    });

    it('code block has code role or pre element', () => {
      render(<ActionBubble />);
      const codeEl = screen.getByTestId('code-content');
      expect(codeEl.tagName.toLowerCase()).toMatch(/code|pre/);
    });

    it('status indicator has aria-label', () => {
      render(<ActionBubble />);
      expect(screen.getByTestId('status-indicator')).toHaveAttribute('aria-label');
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('renders with minimal activity data (no icon, no snippet)', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, activeAgent: { id: 'dev-lead', name: 'Dev Lead', description: '', icon: undefined }, codeSnippet: null }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('action-bubble')).toBeInTheDocument();
    });

    it('handles DOCUMENTATION phase action type', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, currentAction: { type: 'DOCUMENTATION', cycle: 1, description: 'Writing docs' } }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('action-label')).toHaveTextContent('[DOCUMENTATION-01]');
    });

    it('handles cycle number > 9 (double digit)', () => {
      mockUseAgentActivity.mockReturnValue({ activity: { ...mockActivity, currentAction: { type: 'GREEN', cycle: 10, description: '' } }, fileOperations: [] });
      render(<ActionBubble />);
      expect(screen.getByTestId('action-label')).toHaveTextContent('[GREEN-10]');
    });
  });
});
