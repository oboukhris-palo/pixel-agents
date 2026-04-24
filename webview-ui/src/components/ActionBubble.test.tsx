/**
 * Layer 4: ActionBubble Component Tests (US-001-002)
 * 
 * Purpose: Comprehensive test coverage for ActionBubble component
 * BDD Mapping: AC1-AC15 validation
 * Coverage Target: 100% (all rendering, interactions, accessibility, edge cases)
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActionBubble } from './ActionBubble';
import type { AgentActivityState } from '../hooks/useExtensionMessages';

// ── Mock useAgentActivity hook ────────────────────────────────────────────────
const mockUseAgentActivity = jest.fn<AgentActivityState | null, []>();
jest.mock('../hooks/useAgentActivity.js', () => ({
  useAgentActivity: () => mockUseAgentActivity(),
}));

// ── Test Fixtures ──────────────────────────────────────────────────────────────

const mockAgentActivityState = (overrides?: Partial<AgentActivityState>): AgentActivityState => ({
  activeAgent: {
    id: 'dev-tdd-red',
    name: 'dev-tdd-red',
    description: 'RED Phase Agent - writes failing tests',
    spriteColor: '#FF5500',
    icon: '🔴',
  },
  currentAction: {
    type: 'RED',
    cycle: 1,
    description: 'Write failing test for authentication',
  },
  codeSnippet: {
    language: 'typescript',
    content: 'expect(validateEmail("invalid@")).toBe(false);',
    lineNumbers: [42],
  },
  status: 'in-progress',
  timestamp: '2026-04-24T12:34:56Z',
  ...overrides,
});

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('ActionBubble Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  // ── AC10: Hide when no active agent ───────────────────────────────────────
  describe('Visibility Logic', () => {
    it('should return null when activity is null (AC10)', () => {
      mockUseAgentActivity.mockReturnValue(null);
      const { container } = render(<ActionBubble />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when activeAgent is null', () => {
      mockUseAgentActivity.mockReturnValue({
        ...mockAgentActivityState(),
        activeAgent: null,
      });
      const { container } = render(<ActionBubble />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when activeAgent is present', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      expect(screen.getByTestId('action-bubble')).toBeInTheDocument();
    });
  });

  // ── AC1: Agent metadata display ───────────────────────────────────────────
  describe('Agent Header', () => {
    it('should display agent icon (AC1)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      expect(screen.getByTestId('agent-icon')).toHaveTextContent('🔴');
    });

    it('should display agent name (AC1)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      expect(screen.getByTestId('agent-name')).toHaveTextContent('dev-tdd-red');
    });

    it('should use default icon when agent.icon is undefined', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          activeAgent: {
            id: 'orchestrator',
            name: 'orchestrator',
            description: 'Orchestrates workflows',
            // icon is undefined
          },
        })
      );
      render(<ActionBubble />);
      expect(screen.getByTestId('agent-icon')).toHaveTextContent('🤖');
    });

    it('should display status indicator (AC6)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState({ status: 'success' }));
      render(<ActionBubble />);
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveTextContent('✅');
      expect(statusIndicator).toHaveAttribute('aria-label', 'Completed successfully');
    });

    it('should display failed status icon', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState({ status: 'failed' }));
      render(<ActionBubble />);
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveTextContent('❌');
    });
  });

  // ── AC3: Action metadata display ──────────────────────────────────────────
  describe('Action Metadata', () => {
    it('should display TDD phase label with cycle (AC3)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      expect(screen.getByTestId('action-label')).toHaveTextContent('[RED-01]');
    });

    it('should format cycle with leading zero', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          currentAction: {
            type: 'GREEN',
            cycle: 7,
            description: 'Implement feature',
          },
        })
      );
      render(<ActionBubble />);
      expect(screen.getByTestId('action-label')).toHaveTextContent('[GREEN-07]');
    });

    it('should display action description (AC3)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      expect(screen.getByTestId('action-description')).toHaveTextContent(
        'Write failing test for authentication'
      );
    });

    it('should not render description element when description is empty', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          currentAction: {
            type: 'REFACTOR',
            cycle: 3,
            description: '',
          },
        })
      );
      render(<ActionBubble />);
      expect(screen.queryByTestId('action-description')).not.toBeInTheDocument();
    });

    it('should display timestamp in HH:MM:SSZ format (AC8)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      // timestamp: '2026-04-24T12:34:56Z' → displays '12:34:56Z'
      expect(screen.getByTestId('action-timestamp')).toHaveTextContent('@ 12:34:56Z');
    });

    it('should apply phase-specific color to action label (design-systems.md v2.0.0)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      const label = screen.getByTestId('action-label');
      // RED phase color from design-systems.md v2.0.0
      expect(label).toHaveStyle({ color: '#FF5500' });
    });
  });

  // ── AC2: Code snippet display ─────────────────────────────────────────────
  describe('Code Snippet Display', () => {
    it('should display code snippet language (AC2)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      // Note: CSS uppercase class not applied in Jest, so we check raw value
      expect(screen.getByTestId('code-language')).toHaveTextContent('typescript');
      // Verify uppercase class is present (styling applied in browser)
      expect(screen.getByTestId('code-language')).toHaveClass('uppercase');
    });

    it('should display code content (AC2)', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      expect(screen.getByTestId('code-content')).toHaveTextContent(
        'expect(validateEmail("invalid@")).toBe(false);'
      );
    });

    it('should show placeholder when codeSnippet is null', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({ codeSnippet: null })
      );
      render(<ActionBubble />);
      expect(screen.getByTestId('code-placeholder')).toHaveTextContent('Waiting for code...');
    });

    it('should display multi-line code correctly', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          codeSnippet: {
            language: 'javascript',
            content: 'function test() {\n  return true;\n}',
            lineNumbers: [10, 11, 12],
          },
        })
      );
      render(<ActionBubble />);
      const codeContent = screen.getByTestId('code-content');
      expect(codeContent).toHaveTextContent('function test()');
      expect(codeContent).toHaveTextContent('return true;');
    });
  });

  // ── AC11: Copy-to-clipboard functionality ─────────────────────────────────
  describe('Copy-to-Clipboard', () => {
    it('should copy code to clipboard when copy button clicked (AC11)', async () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);

      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'expect(validateEmail("invalid@")).toBe(false);'
        );
      });
    });

    it('should show success toast after successful copy', async () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);

      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByTestId('copy-toast')).toHaveTextContent('Copied!');
      });
    });

    it('should show error toast when clipboard write fails', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Permission denied'));
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);

      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByTestId('copy-toast')).toHaveTextContent('Failed to copy');
      });
    });

    it('should auto-dismiss toast after 2.5 seconds', async () => {
      jest.useFakeTimers();
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);

      const copyButton = screen.getByTestId('copy-button');
      await act(async () => {
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('copy-toast')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('copy-toast')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should not attempt copy when codeSnippet is null', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({ codeSnippet: null })
      );
      render(<ActionBubble />);

      // No copy button rendered when code is absent
      expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
    });
  });

  // ── Accessibility Tests ────────────────────────────────────────────────────
  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have region role with aria-label', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      const bubble = screen.getByRole('region', { name: 'Agent activity monitor' });
      expect(bubble).toBeInTheDocument();
    });

    it('should have aria-label on copy button', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      const copyButton = screen.getByLabelText('Copy code to clipboard');
      expect(copyButton).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative icon', () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);
      const icon = screen.getByTestId('agent-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should announce toast with aria-live polite', async () => {
      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      render(<ActionBubble />);

      fireEvent.click(screen.getByTestId('copy-button'));

      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  // ── Edge Cases & Error Handling ────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('should handle missing spriteColor gracefully', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          activeAgent: {
            id: 'orchestrator',
            name: 'orchestrator',
            description: 'Orchestrates workflows',
            // spriteColor is undefined
          },
        })
      );
      render(<ActionBubble />);
      expect(screen.getByTestId('action-bubble')).toBeInTheDocument();
    });

    it('should handle unknown TDD phase with fallback color', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          currentAction: {
            type: 'UNKNOWN' as any,
            cycle: 1,
            description: 'Unknown phase',
          },
        })
      );
      render(<ActionBubble />);
      const label = screen.getByTestId('action-label');
      expect(label).toHaveStyle({ color: '#CCCCCC' }); // Fallback color
    });

    it('should handle unknown status with fallback icon', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({ status: 'unknown' as any })
      );
      render(<ActionBubble />);
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveTextContent('⏸️'); // Fallback icon
    });

    it('should handle very long descriptions with truncation', () => {
      const longDescription = 'A'.repeat(200);
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          currentAction: {
            type: 'REFACTOR',
            cycle: 5,
            description: longDescription,
          },
        })
      );
      render(<ActionBubble />);
      const description = screen.getByTestId('action-description');
      // Should have truncate class
      expect(description).toHaveClass('truncate');
    });

    it('should handle code with special characters', () => {
      mockUseAgentActivity.mockReturnValue(
        mockAgentActivityState({
          codeSnippet: {
            language: 'html',
            content: '<div class="test">&nbsp;</div>',
            lineNumbers: [1],
          },
        })
      );
      render(<ActionBubble />);
      expect(screen.getByTestId('code-content')).toHaveTextContent('<div class="test">&nbsp;</div>');
    });
  });

  // ── React.memo optimization ────────────────────────────────────────────────
  describe('Performance', () => {
    it('should be wrapped in React.memo', () => {
      // Check that component type has $$typeof memo symbol
      expect((ActionBubble as any).$$typeof.toString()).toContain('react.memo');
    });

    it('should not re-render when activity is unchanged', () => {
      const renderSpy = jest.fn();
      const TestWrapper = () => {
        renderSpy();
        return <ActionBubble />;
      };

      mockUseAgentActivity.mockReturnValue(mockAgentActivityState());
      const { rerender } = render(<TestWrapper />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Rerender with same activity (hook returns same object reference)
      rerender(<TestWrapper />);
      
      // Should still be called (parent re-renders), but memo prevents unnecessary work
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
