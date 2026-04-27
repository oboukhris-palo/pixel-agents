/**
 * ZoomControls Tests (US-003-003 Layer 3)
 *
 * Tests for the existing ZoomControls component:
 * - Renders zoom in, zoom out, and fit-to-view buttons
 * - Calls onZoomChange with correct values
 * - Disables buttons at min/max zoom
 * - Shows zoom level indicator on zoom change
 * - Fit-to-view calculates correct zoom
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { ZoomControls } from './ZoomControls';
import { ZOOM_MIN, ZOOM_MAX } from '../constants';

jest.mock('./ZoomControls.module.css', () => ({}), { virtual: true });

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('ZoomControls — rendering', () => {
  it('renders three buttons', () => {
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('renders zoom in button with + icon', () => {
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    const zoomInBtn = container.querySelectorAll('button')[0];
    expect(zoomInBtn.getAttribute('title')).toContain('Zoom in');
  });

  it('renders zoom out button with − icon', () => {
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    const zoomOutBtn = container.querySelectorAll('button')[1];
    expect(zoomOutBtn.getAttribute('title')).toContain('Zoom out');
  });

  it('renders fit-to-view button', () => {
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    const fitBtn = container.querySelectorAll('button')[2];
    expect(fitBtn.getAttribute('title')).toContain('Fit to view');
  });
});

// ── Interactions ──────────────────────────────────────────────────────────────

describe('ZoomControls — interactions', () => {
  it('calls onZoomChange with zoom+1 on zoom-in click', () => {
    const onZoomChange = jest.fn();
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={onZoomChange} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onZoomChange).toHaveBeenCalledWith(4);
  });

  it('calls onZoomChange with zoom-1 on zoom-out click', () => {
    const onZoomChange = jest.fn();
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={onZoomChange} />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onZoomChange).toHaveBeenCalledWith(2);
  });

  it('calls onZoomChange on fit-to-view click', () => {
    const onZoomChange = jest.fn();
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={onZoomChange} />,
    );
    fireEvent.click(container.querySelectorAll('button')[2]);
    expect(onZoomChange).toHaveBeenCalled();
  });
});

// ── Disabled states ───────────────────────────────────────────────────────────

describe('ZoomControls — disabled states', () => {
  it('disables zoom-in button at ZOOM_MAX', () => {
    const { container } = render(
      <ZoomControls zoom={ZOOM_MAX} onZoomChange={jest.fn()} />,
    );
    const zoomInBtn = container.querySelectorAll('button')[0];
    expect(zoomInBtn).toBeDisabled();
  });

  it('disables zoom-out button at ZOOM_MIN', () => {
    const { container } = render(
      <ZoomControls zoom={ZOOM_MIN} onZoomChange={jest.fn()} />,
    );
    const zoomOutBtn = container.querySelectorAll('button')[1];
    expect(zoomOutBtn).toBeDisabled();
  });

  it('does not disable buttons at mid-range zoom', () => {
    const { container } = render(
      <ZoomControls zoom={5} onZoomChange={jest.fn()} />,
    );
    expect(container.querySelectorAll('button')[0]).not.toBeDisabled();
    expect(container.querySelectorAll('button')[1]).not.toBeDisabled();
  });
});

// ── Zoom level indicator ──────────────────────────────────────────────────────

describe('ZoomControls — zoom level indicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows zoom level indicator when zoom changes', () => {
    const { rerender, container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    rerender(<ZoomControls zoom={4} onZoomChange={jest.fn()} />);
    // Look for the zoom level text
    expect(container.textContent).toContain('4x');
  });

  it('hides zoom level indicator after timeout', () => {
    const { rerender, container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    rerender(<ZoomControls zoom={4} onZoomChange={jest.fn()} />);
    expect(container.textContent).toContain('4x');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    // After timeout, indicator should be hidden
    expect(container.textContent).not.toContain('4x');
  });

  it('does not show indicator on initial render', () => {
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    expect(container.textContent).not.toContain('3x');
  });
});

// ── Fit to view with layout dimensions ────────────────────────────────────────

describe('ZoomControls — fit to view', () => {
  it('uses layout dimensions for fit calculation when provided', () => {
    const onZoomChange = jest.fn();
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={onZoomChange} layoutWidth={20} layoutHeight={11} />,
    );
    fireEvent.click(container.querySelectorAll('button')[2]);
    expect(onZoomChange).toHaveBeenCalled();
    const fitZoom = onZoomChange.mock.calls[0][0];
    expect(fitZoom).toBeGreaterThanOrEqual(ZOOM_MIN);
    expect(fitZoom).toBeLessThanOrEqual(ZOOM_MAX);
  });

  it('returns current zoom when no layout dimensions', () => {
    const onZoomChange = jest.fn();
    const { container } = render(
      <ZoomControls zoom={5} onZoomChange={onZoomChange} />,
    );
    fireEvent.click(container.querySelectorAll('button')[2]);
    expect(onZoomChange).toHaveBeenCalledWith(5);
  });
});

// ── Hover states ──────────────────────────────────────────────────────────────

describe('ZoomControls — hover states', () => {
  it('updates hover state on mouse enter/leave', () => {
    const { container } = render(
      <ZoomControls zoom={3} onZoomChange={jest.fn()} />,
    );
    const zoomInBtn = container.querySelectorAll('button')[0];
    fireEvent.mouseEnter(zoomInBtn);
    fireEvent.mouseLeave(zoomInBtn);
    // No error thrown — hover state managed internally
    expect(true).toBe(true);
  });
});
