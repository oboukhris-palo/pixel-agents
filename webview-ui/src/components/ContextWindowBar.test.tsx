import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContextWindowBar } from './ContextWindowBar';
import type { TokenUsage } from '../../../src/contextTypes';

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
});
