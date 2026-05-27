/**
 * Layer 4: DocumentWatcherIndicator Component Tests (US-001-003-C)
 *
 * Purpose: Validate DocumentWatcherIndicator component rendering, accessibility,
 *          and integration with DocumentWatcherState.
 *
 * BDD Mapping:
 *   - AC1: Indicator shows watcher is active
 *   - AC6: Error state shown if watcher encounters permission denied
 *   - AC10: Non-breaking addition (returns null when state unavailable)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DocumentWatcherIndicator } from '../components/DocumentWatcherIndicator';
import type { DocumentWatcherState } from '../hooks/useExtensionMessages';

describe('DocumentWatcherIndicator', () => {
  describe('null safety (AC10)', () => {
    it('returns null when watcherState is null', () => {
      const { container } = render(<DocumentWatcherIndicator watcherState={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('active watcher (AC1)', () => {
    it('renders indicator when watcher is active', () => {
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 10, epicsCount: 2, completionPercent: 50, lastUpdated: '2026-04-23' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const indicator = screen.getByTestId('document-watcher-indicator');
      expect(indicator).toBeInTheDocument();
    });

    it('shows green status dot when watcher is active', () => {
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const dot = screen.getByTestId('watcher-status-dot');
      expect(dot).toHaveStyle({ backgroundColor: '#10b981' }); // Green (active)
    });

    it('shows "Watching" label when active but no updates yet', () => {
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const label = screen.getByTestId('watcher-label');
      expect(label).toHaveTextContent('Watching');
    });

    it('shows formatted timestamp when lastUpdateTime is set', () => {
      const testTime = new Date('2026-04-23T15:30:45').getTime();
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: testTime,
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const label = screen.getByTestId('watcher-label');
      // Format depends on locale, but should contain time parts
      expect(label.textContent).toMatch(/Updated/);
    });
  });

  describe('inactive watcher', () => {
    it('shows gray status dot when watcher is inactive', () => {
      const inactiveState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: false,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={inactiveState} />);

      const dot = screen.getByTestId('watcher-status-dot');
      expect(dot).toHaveStyle({ backgroundColor: '#6b7280' }); // Gray (inactive)
    });

    it('shows "Paused" label when inactive', () => {
      const inactiveState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: false,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={inactiveState} />);

      const label = screen.getByTestId('watcher-label');
      expect(label).toHaveTextContent('Paused');
    });
  });

  describe('error state (AC6)', () => {
    it('shows red status dot when error is present', () => {
      const errorState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: false,
        error: 'Permission denied',
      };

      render(<DocumentWatcherIndicator watcherState={errorState} />);

      const dot = screen.getByTestId('watcher-status-dot');
      expect(dot).toHaveStyle({ backgroundColor: '#ef4444' }); // Red (error)
    });

    it('shows "Error" label when error is present', () => {
      const errorState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: false,
        error: 'EACCES: permission denied',
      };

      render(<DocumentWatcherIndicator watcherState={errorState} />);

      const label = screen.getByTestId('watcher-label');
      expect(label).toHaveTextContent('Error');
    });

    it('includes error details in tooltip', () => {
      const errorState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: false,
        error: 'File system access denied',
      };

      render(<DocumentWatcherIndicator watcherState={errorState} />);

      const indicator = screen.getByTestId('document-watcher-indicator');
      expect(indicator).toHaveAttribute('title');
      expect(indicator.getAttribute('title')).toContain('File system access denied');
    });
  });

  describe('completion percent badge', () => {
    it('shows completion percent when metrics are available', () => {
      const stateWithMetrics: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 10, epicsCount: 2, completionPercent: 75, lastUpdated: '2026-04-23' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={stateWithMetrics} />);

      const badge = screen.getByTestId('completion-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('75%');
    });

    it('hides completion badge when percent is zero', () => {
      const stateWithZeroCompletion: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={stateWithZeroCompletion} />);

      const badge = screen.queryByTestId('completion-badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('shows correct aria-label for completion badge', () => {
      const stateWithMetrics: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 10, epicsCount: 2, completionPercent: 85, lastUpdated: '2026-04-23' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={stateWithMetrics} />);

      const badge = screen.getByTestId('completion-badge');
      expect(badge).toHaveAttribute('aria-label', 'Project 85% complete');
    });
  });

  describe('accessibility (WCAG 2.1 AA)', () => {
    it('has role="status" attribute', () => {
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });

    it('has descriptive aria-label', () => {
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', 'Document watcher active');
    });

    it('has title tooltip with full status information', () => {
      const activeState: DocumentWatcherState = {
        changes: [{ path: '/docs/file.md', changeType: 'modified', timestamp: Date.now(), isMarkdown: true, isYaml: false, isFeature: false }],
        metrics: { storyCount: 5, epicsCount: 1, completionPercent: 60, lastUpdated: '2026-04-23' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const indicator = screen.getByTestId('document-watcher-indicator');
      const title = indicator.getAttribute('title');
      expect(title).toBeTruthy();
      expect(title).toContain('Document watcher active');
      expect(title).toContain('Last update');
      expect(title).toContain('1 file changed');
    });

    it('marks status dot as aria-hidden (decorative)', () => {
      const activeState: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: 0,
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={activeState} />);

      const dot = screen.getByTestId('watcher-status-dot');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('changes count display', () => {
    it('shows singular "file changed" for one change', () => {
      const stateWithOneChange: DocumentWatcherState = {
        changes: [{ path: '/docs/file.md', changeType: 'modified', timestamp: Date.now(), isMarkdown: true, isYaml: false, isFeature: false }],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={stateWithOneChange} />);

      const indicator = screen.getByTestId('document-watcher-indicator');
      expect(indicator.getAttribute('title')).toContain('1 file changed');
    });

    it('shows plural "files changed" for multiple changes', () => {
      const stateWithMultipleChanges: DocumentWatcherState = {
        changes: [
          { path: '/docs/file1.md', changeType: 'modified', timestamp: Date.now(), isMarkdown: true, isYaml: false, isFeature: false },
          { path: '/docs/file2.md', changeType: 'added', timestamp: Date.now(), isMarkdown: true, isYaml: false, isFeature: false },
          { path: '/docs/file3.yml', changeType: 'deleted', timestamp: Date.now(), isMarkdown: false, isYaml: true, isFeature: false },
        ],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={stateWithMultipleChanges} />);

      const indicator = screen.getByTestId('document-watcher-indicator');
      expect(indicator.getAttribute('title')).toContain('3 files changed');
    });

    it('omits changes count when no changes present', () => {
      const stateWithNoChanges: DocumentWatcherState = {
        changes: [],
        metrics: { storyCount: 0, epicsCount: 0, completionPercent: 0, lastUpdated: '' },
        lastUpdateTime: Date.now(),
        isWatching: true,
        error: undefined,
      };

      render(<DocumentWatcherIndicator watcherState={stateWithNoChanges} />);

      const indicator = screen.getByTestId('document-watcher-indicator');
      const title = indicator.getAttribute('title');
      expect(title).not.toContain('changed');
    });
  });
});
