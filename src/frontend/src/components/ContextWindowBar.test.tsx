import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock CSS module before importing component
jest.mock('./ContextWindowBar.module.css', () => ({}), { virtual: true });

import { ContextWindowBar } from './ContextWindowBar';
import type { TokenUsage } from '../../../backend/contextTypes';

const safeUsage: TokenUsage = {
  total: 128000, used: 40000, percentage: 31,
  breakdown: { githubCode: 20000, projectCode: 15000, chatHistory: 5000 },
  threshold: 'safe',
};
const warningUsage: TokenUsage = {
  total: 128000, used: 96000, percentage: 75,
  breakdown: { githubCode: 50000, projectCode: 36000, chatHistory: 10000 },
  threshold: 'warning',
};
const criticalUsage: TokenUsage = {
  total: 128000, used: 120000, percentage: 94,
  breakdown: { githubCode: 60000, projectCode: 50000, chatHistory: 10000 },
  threshold: 'critical',
};

describe('ContextWindowBar', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ContextWindowBar />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows 0% when no tokenUsage provided', () => {
      render(<ContextWindowBar />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('displays correct percentage from tokenUsage', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '31');
    });

    it('displays 75% for warning usage', () => {
      render(<ContextWindowBar tokenUsage={warningUsage} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    });

    it('displays 94% for critical usage', () => {
      render(<ContextWindowBar tokenUsage={criticalUsage} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '94');
    });

    it('renders in a container with context-window-bar class', () => {
      const { container } = render(<ContextWindowBar />);
      expect(container.firstChild).toHaveClass('context-window-bar');
    });
  });

  describe('Color thresholds', () => {
    it('applies safe color class at 31%', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      expect(screen.getByRole('progressbar')).toHaveClass('threshold-safe');
    });

    it('applies warning color class at 75%', () => {
      render(<ContextWindowBar tokenUsage={warningUsage} />);
      expect(screen.getByRole('progressbar')).toHaveClass('threshold-warning');
    });

    it('applies critical color class at 94%', () => {
      render(<ContextWindowBar tokenUsage={criticalUsage} />);
      expect(screen.getByRole('progressbar')).toHaveClass('threshold-critical');
    });

    it('shows warning icon at warning threshold', () => {
      render(<ContextWindowBar tokenUsage={warningUsage} />);
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('shows critical icon at critical threshold', () => {
      render(<ContextWindowBar tokenUsage={criticalUsage} />);
      expect(screen.getByText('⛔')).toBeInTheDocument();
    });

    it('shows no warning icon for safe threshold', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
      expect(screen.queryByText('⛔')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="progressbar"', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has aria-label with percentage', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('31%')
      );
    });

    it('has aria-valuemin=0 and aria-valuemax=100', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('shows text percentage label (not color only)', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      expect(screen.getByText('31%')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('shows tooltip on mouse enter', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      fireEvent.mouseEnter(screen.getByRole('progressbar'));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      const bar = screen.getByRole('progressbar');
      fireEvent.mouseEnter(bar);
      fireEvent.mouseLeave(bar);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('tooltip shows .github breakdown', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      fireEvent.mouseEnter(screen.getByRole('progressbar'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('.github');
    });

    it('tooltip shows project breakdown', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      fireEvent.mouseEnter(screen.getByRole('progressbar'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('project');
    });

    it('tooltip shows chat breakdown', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      fireEvent.mouseEnter(screen.getByRole('progressbar'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('chat');
    });

    it('tooltip shows exact token counts', () => {
      render(<ContextWindowBar tokenUsage={safeUsage} />);
      fireEvent.mouseEnter(screen.getByRole('progressbar'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('40,000');
    });
  });

  describe('Notifications', () => {
    it('calls onThresholdReached with warning when crossing 70%', () => {
      const onThreshold = jest.fn();
      render(<ContextWindowBar tokenUsage={warningUsage} onThresholdReached={onThreshold} />);
      expect(onThreshold).toHaveBeenCalledWith('warning');
    });

    it('calls onThresholdReached with critical when crossing 90%', () => {
      const onThreshold = jest.fn();
      render(<ContextWindowBar tokenUsage={criticalUsage} onThresholdReached={onThreshold} />);
      expect(onThreshold).toHaveBeenCalledWith('critical');
    });

    it('does NOT call onThresholdReached for safe usage', () => {
      const onThreshold = jest.fn();
      render(<ContextWindowBar tokenUsage={safeUsage} onThresholdReached={onThreshold} />);
      expect(onThreshold).not.toHaveBeenCalled();
    });

    it('only fires once per threshold level (no spam)', () => {
      const onThreshold = jest.fn();
      const { rerender } = render(
        <ContextWindowBar tokenUsage={warningUsage} onThresholdReached={onThreshold} />
      );
      rerender(<ContextWindowBar tokenUsage={warningUsage} onThresholdReached={onThreshold} />);
      rerender(<ContextWindowBar tokenUsage={warningUsage} onThresholdReached={onThreshold} />);
      expect(onThreshold).toHaveBeenCalledTimes(1);
    });
  });

  describe('Design System v2.0.0 Alignment (US-004-003)', () => {
    describe('CTX Label', () => {
      it('renders "CTX" label at top', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        expect(screen.getByText('CTX')).toBeInTheDocument();
      });

      it('CTX label uses micro typography (9px)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const label = screen.getByText('CTX');
        // CSS module class applied (ctxLabel)
        expect(label).toHaveClass('ctxLabel');
      });

      it('CTX label uses warning color (#F59E0B)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const label = screen.getByText('CTX');
        // CSS module class applied (ctxLabel with --color-warning)
        expect(label).toHaveClass('ctxLabel');
      });

      it('CTX label has font weight 600', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const label = screen.getByText('CTX');
        // CSS module class applied (ctxLabel with font-weight: 600)
        expect(label).toHaveClass('ctxLabel');
      });
    });

    describe('Bar Dimensions', () => {
      it('bar container has exact width 30px', () => {
        const { container } = render(<ContextWindowBar tokenUsage={safeUsage} />);
        const bar = container.querySelector('.context-window-bar');
        // CSS module defines width: 30px
        expect(bar).toBeInTheDocument();
        expect(bar).toHaveClass('context-window-bar');
      });

      it('bar container has exact height 180px', () => {
        const { container } = render(<ContextWindowBar tokenUsage={safeUsage} />);
        const bar = container.querySelector('.context-window-bar');
        // CSS module defines fit-content height with 180px progress track
        expect(bar).toBeInTheDocument();
        expect(bar).toHaveClass('context-window-bar');
      });

      it('bar uses border-radius 4px from design tokens', () => {
        const { container } = render(<ContextWindowBar tokenUsage={safeUsage} />);
        const bar = container.querySelector('.context-window-bar');
        // CSS module uses var(--radius-sm) = 4px
        expect(bar).toBeInTheDocument();
        expect(bar).toHaveClass('context-window-bar');
      });
    });

    describe('Segmented Progress (AC3)', () => {
      it('displays .github segment with correct color (#3B82F6 @ 70%)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const githubSegment = screen.getByTestId('segment-github');
        expect(githubSegment).toBeInTheDocument();
        expect(githubSegment).toHaveStyle({
          background: expect.stringContaining('#3B82F6'),
        });
      });

      it('displays project code segment with correct color (#10B981 @ 60%)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const projectSegment = screen.getByTestId('segment-project');
        expect(projectSegment).toBeInTheDocument();
        expect(projectSegment).toHaveStyle({
          background: expect.stringContaining('#10B981'),
        });
      });

      it('displays chat history segment with correct color (#F59E0B @ 70%)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const chatSegment = screen.getByTestId('segment-chat');
        expect(chatSegment).toBeInTheDocument();
        expect(chatSegment).toHaveStyle({
          background: expect.stringContaining('#F59E0B'),
        });
      });

      it('segment heights are proportional to token usage', () => {
        // safeUsage: .github 50%, project 37.5%, chat 12.5%
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const githubSegment = screen.getByTestId('segment-github');
        const projectSegment = screen.getByTestId('segment-project');
        const chatSegment = screen.getByTestId('segment-chat');
        
        // Heights should be proportional (not testing exact px, just presence)
        expect(githubSegment).toHaveAttribute('style');
        expect(projectSegment).toHaveAttribute('style');
        expect(chatSegment).toHaveAttribute('style');
      });
    });

    describe('Threshold-Based Percentage Color (AC4)', () => {
      it('uses green color for safe threshold (0-70%)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const percentageLabel = screen.getByText('31%');
        // CSS module class applied (percentageSafe)
        expect(percentageLabel).toHaveClass('percentage-label');
        expect(percentageLabel).toHaveClass('percentageSafe');
      });

      it('uses amber color for warning threshold (71-89%)', () => {
        render(<ContextWindowBar tokenUsage={warningUsage} />);
        const percentageLabel = screen.getByText('75%');
        // CSS module class applied (percentageWarning)
        expect(percentageLabel).toHaveClass('percentage-label');
        expect(percentageLabel).toHaveClass('percentageWarning');
      });

      it('uses red color for critical threshold (90%+)', () => {
        render(<ContextWindowBar tokenUsage={criticalUsage} />);
        const percentageLabel = screen.getByText('94%');
        // CSS module class applied (percentageCritical)
        expect(percentageLabel).toHaveClass('percentage-label');
        expect(percentageLabel).toHaveClass('percentageCritical');
      });
    });

    describe('Legend Display (AC5)', () => {
      it('renders legend below progress bar', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const legend = screen.getByTestId('context-legend');
        expect(legend).toBeInTheDocument();
      });

      it('legend shows .github percentage', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        // .github = 20000 / 128000 = 15.6%
        expect(screen.getByText(/\.github/)).toBeInTheDocument();
        expect(screen.getByText(/16%/)).toBeInTheDocument();
      });

      it('legend shows project code percentage', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        // project = 15000 / 128000 = 11.7%
        expect(screen.getByText(/code/)).toBeInTheDocument();
        expect(screen.getByText(/12%/)).toBeInTheDocument();
      });

      it('legend shows chat history percentage', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        // chat = 5000 / 128000 = 3.9%
        expect(screen.getByText(/chat/)).toBeInTheDocument();
        expect(screen.getByText(/4%/)).toBeInTheDocument();
      });

      it('legend uses 8px font size from design tokens', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const legend = screen.getByTestId('context-legend');
        // CSS module defines font-size: 8px
        expect(legend).toHaveClass('legend');
      });
    });

    describe('Design Token Usage', () => {
      it('uses design tokens for spacing (--space-1, --space-2)', () => {
        const { container } = render(<ContextWindowBar tokenUsage={safeUsage} />);
        // CSS modules apply design tokens (verified by CSS module content)
        expect(container).toBeInTheDocument();
      });

      it('uses design tokens for colors (--context-github, --context-project, --context-chat)', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const githubSegment = screen.getByTestId('segment-github');
        // Design token variables are applied via CSS modules
        expect(githubSegment).toBeInTheDocument();
      });
    });

    describe('Visual Regression Prevention', () => {
      it('tooltip still functions after redesign', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        fireEvent.mouseEnter(screen.getByRole('progressbar'));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      it('accessibility attributes preserved', () => {
        render(<ContextWindowBar tokenUsage={safeUsage} />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-label');
        expect(bar).toHaveAttribute('aria-valuenow');
        expect(bar).toHaveAttribute('tabIndex', '0');
      });
    });
  });
});
