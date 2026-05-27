/**
 * OfficeCanvas Component Tests — Layer 4 (TDD cycle for US-003-001)
 *
 * Tests for the React component integrating CanvasRenderer, GameLoop, and LayoutLoader.
 * All heavy dependencies (CanvasRenderer, startGameLoop, loadDefaultLayout) are mocked
 * so tests run entirely in JSDOM without a real canvas context.
 *
 * Coverage:
 * - Renders canvas element with correct aria-label and role
 * - Applies custom width/height props
 * - Initialises renderer and game loop on mount
 * - Stops game loop on unmount (cleanup)
 * - Calls autoFit() on renderer after construction
 * - Wheel event triggers setZoom (scroll-in and scroll-out)
 * - Mouse drag triggers setPan
 * - loadDefaultLayout is called once on mount
 * - Error resilience: console.error logged when loadDefaultLayout throws
 */

import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';

// ─── Mock declarations (must come before any imports of the module under test)

jest.mock('./engine/canvasRenderer');
jest.mock('./engine/gameLoop');
jest.mock('./layout/layoutLoader');
jest.mock('./OfficeCanvas.module.css', () => ({
  canvasContainer: 'canvasContainer',
  canvas: 'canvas',
}), { virtual: true });

// ─── Imports (after jest.mock hoisting)

import { OfficeCanvas } from './OfficeCanvas';
import { CanvasRenderer } from './engine/canvasRenderer';
import { startGameLoop } from './engine/gameLoop';
import { loadDefaultLayout } from './layout/layoutLoader';

// ─── Typed mock references

const MockCanvasRenderer = CanvasRenderer as jest.MockedClass<typeof CanvasRenderer>;
const mockStartGameLoop = startGameLoop as jest.MockedFunction<typeof startGameLoop>;
const mockLoadDefaultLayout = loadDefaultLayout as jest.MockedFunction<typeof loadDefaultLayout>;

// ─── Default mock implementations (reset in beforeEach)

const DEFAULT_LAYOUT = { gridSize: 32, cols: 30, rows: 15, furniture: [], zones: [] };

function makeMockRendererInstance() {
  const mockEngine = {
    addSprite: jest.fn(),
    removeSprite: jest.fn(),
    getSprite: jest.fn(),
    getSprites: jest.fn().mockReturnValue([]),
    getSpriteCount: jest.fn().mockReturnValue(0),
    startMove: jest.fn(),
    startIdle: jest.fn(),
    startTyping: jest.fn(),
    startCelebration: jest.fn(),
    stopAnimation: jest.fn(),
    update: jest.fn(),
    reset: jest.fn(),
    applyAgentStatus: jest.fn(),
  };
  return {
    autoFit: jest.fn(),
    setZoom: jest.fn(),
    setPan: jest.fn(),
    render: jest.fn(),
    getViewport: jest.fn().mockReturnValue({ x: 0, y: 0, zoom: 1 }),
    getAnimationEngine: jest.fn().mockReturnValue(mockEngine),
    __mockEngine: mockEngine,
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  MockCanvasRenderer.mockImplementation(() => makeMockRendererInstance() as unknown as CanvasRenderer);
  mockStartGameLoop.mockReturnValue(jest.fn());
  mockLoadDefaultLayout.mockReturnValue(DEFAULT_LAYOUT as ReturnType<typeof loadDefaultLayout>);
});

afterEach(() => {
  cleanup();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the renderer instance created during the last render() call. */
function getRendererInstance() {
  return MockCanvasRenderer.mock.results[0]?.value;
}

/** Returns the stop function returned by startGameLoop. */
function getStopFn() {
  return mockStartGameLoop.mock.results[0]?.value as jest.Mock;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('OfficeCanvas — rendering', () => {
  it('renders a canvas element', () => {
    const { container } = render(<OfficeCanvas />);
    expect(container.querySelector('canvas')).not.toBeNull();
  });

  it('renders with role="img" on the canvas', () => {
    const { container } = render(<OfficeCanvas />);
    expect(container.querySelector('canvas')?.getAttribute('role')).toBe('img');
  });

  it('renders with correct aria-label', () => {
    const { getByRole } = render(<OfficeCanvas />);
    expect(getByRole('img', { name: 'Office visualization with agent sprites and furniture' })).toBeTruthy();
  });

  it('applies default width=960 to canvas', () => {
    const { container } = render(<OfficeCanvas />);
    expect(container.querySelector('canvas')?.getAttribute('width')).toBe('960');
  });

  it('applies default height=246 to canvas', () => {
    const { container } = render(<OfficeCanvas />);
    expect(container.querySelector('canvas')?.getAttribute('height')).toBe('246');
  });

  it('applies custom width and height props', () => {
    const { container } = render(<OfficeCanvas width={480} height={120} />);
    const canvas = container.querySelector('canvas')!;
    expect(canvas.getAttribute('width')).toBe('480');
    expect(canvas.getAttribute('height')).toBe('120');
  });

  it('renders a wrapper div', () => {
    const { container } = render(<OfficeCanvas />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });
});

// ─── Mount lifecycle ──────────────────────────────────────────────────────────

describe('OfficeCanvas — mount', () => {
  it('calls loadDefaultLayout on mount', () => {
    render(<OfficeCanvas />);
    expect(mockLoadDefaultLayout).toHaveBeenCalledTimes(1);
  });

  it('instantiates CanvasRenderer with the canvas element', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas');
    expect(MockCanvasRenderer).toHaveBeenCalledWith(canvas, expect.any(Object));
  });

  it('calls autoFit() after renderer construction', () => {
    render(<OfficeCanvas />);
    expect(getRendererInstance().autoFit).toHaveBeenCalledTimes(1);
  });

  it('calls startGameLoop to start the render loop', () => {
    render(<OfficeCanvas />);
    expect(mockStartGameLoop).toHaveBeenCalledTimes(1);
  });

  it('passes the canvas element to startGameLoop', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas');
    expect(mockStartGameLoop).toHaveBeenCalledWith(canvas, expect.any(Object));
  });

  it('startGameLoop receives update and render callback functions', () => {
    render(<OfficeCanvas />);
    const [, callbacks] = mockStartGameLoop.mock.calls[0];
    expect(typeof callbacks.update).toBe('function');
    expect(typeof callbacks.render).toBe('function');
  });

  it('render callback invokes renderer.render()', () => {
    render(<OfficeCanvas />);
    const [, callbacks] = mockStartGameLoop.mock.calls[0];
    callbacks.render({});
    expect(getRendererInstance().render).toHaveBeenCalledTimes(1);
  });
});

// ─── Unmount lifecycle ────────────────────────────────────────────────────────

describe('OfficeCanvas — unmount', () => {
  it('calls the stop function returned by startGameLoop on unmount', () => {
    const { unmount } = render(<OfficeCanvas />);
    const stop = getStopFn();
    expect(stop).not.toHaveBeenCalled();
    unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });
});

// ─── Wheel zoom ───────────────────────────────────────────────────────────────

describe('OfficeCanvas — wheel zoom', () => {
  it('calls setZoom with factor 0.9 on scroll-down (zoom out)', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas')!;
    fireEvent.wheel(canvas, { deltaY: 100 });
    expect(getRendererInstance().setZoom).toHaveBeenCalledWith(0.9);
  });

  it('calls setZoom with factor 1.1 on scroll-up (zoom in)', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas')!;
    fireEvent.wheel(canvas, { deltaY: -100 });
    expect(getRendererInstance().setZoom).toHaveBeenCalledWith(1.1);
  });
});

// ─── Mouse pan ────────────────────────────────────────────────────────────────

describe('OfficeCanvas — mouse pan', () => {
  it('calls setPan with correct deltas after mousedown + mousemove', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas')!;

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 50 });
    fireEvent.mouseMove(document, { clientX: 120, clientY: 70 });

    expect(getRendererInstance().setPan).toHaveBeenCalledWith(20, 20);
  });

  it('accumulates pan from multiple move events', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas')!;

    fireEvent.mouseDown(canvas, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 10, clientY: 5 });
    fireEvent.mouseMove(document, { clientX: 30, clientY: 15 });

    const setPan = getRendererInstance().setPan;
    expect(setPan).toHaveBeenCalledTimes(2);
    expect(setPan).toHaveBeenNthCalledWith(1, 10, 5);
    expect(setPan).toHaveBeenNthCalledWith(2, 20, 10);
  });

  it('stops panning after mouseup', () => {
    const { container } = render(<OfficeCanvas />);
    const canvas = container.querySelector('canvas')!;

    fireEvent.mouseDown(canvas, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(document);

    const setPan = getRendererInstance().setPan;
    jest.clearAllMocks();

    // Subsequent moves should NOT trigger setPan
    fireEvent.mouseMove(document, { clientX: 50, clientY: 50 });
    expect(setPan).not.toHaveBeenCalled();
  });
});

// ─── Error resilience ─────────────────────────────────────────────────────────

describe('OfficeCanvas — error resilience', () => {
  it('logs console.error and does not throw when loadDefaultLayout throws', () => {
    mockLoadDefaultLayout.mockImplementation(() => {
      throw new Error('Layout not found');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<OfficeCanvas />)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ─── Sprite integration (US-003-002 Layer 4) ──────────────────────────────────

describe('OfficeCanvas — sprite initialization', () => {
  const agents = [
    { agentId: 'dev-lead', deskPosition: { x: 2, y: 3 }, color: '#4CAF50' },
    { agentId: 'dev-tdd-red', deskPosition: { x: 5, y: 3 }, color: '#FF5500' },
  ];

  it('initializes sprites from agentAssignments prop', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    expect(engine.addSprite).toHaveBeenCalledTimes(2);
  });

  it('creates sprites with correct IDs', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    const firstCall = engine.addSprite.mock.calls[0][0];
    expect(firstCall.id).toBe('sprite-dev-lead');
    expect(firstCall.agentId).toBe('dev-lead');
  });

  it('creates sprites with correct positions', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    const firstSprite = engine.addSprite.mock.calls[0][0];
    expect(firstSprite.position).toEqual({ x: 2, y: 3 });
  });

  it('creates sprites with correct colors', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    const second = engine.addSprite.mock.calls[1][0];
    expect(second.color).toBe('#FF5500');
  });

  it('does not add sprites when agentAssignments is empty', () => {
    render(<OfficeCanvas agentAssignments={[]} />);
    const engine = getRendererInstance().__mockEngine;
    expect(engine.addSprite).not.toHaveBeenCalled();
  });

  it('does not add sprites when agentAssignments is omitted', () => {
    render(<OfficeCanvas />);
    const engine = getRendererInstance().__mockEngine;
    expect(engine.addSprite).not.toHaveBeenCalled();
  });
});

describe('OfficeCanvas — animation engine update in game loop', () => {
  it('startGameLoop receives update callback that calls engine.update', () => {
    render(<OfficeCanvas />);
    // Get the callbacks passed to startGameLoop
    const gameLoopCalls = mockStartGameLoop.mock.calls;
    expect(gameLoopCalls.length).toBe(1);
    const { update } = gameLoopCalls[0][1];
    expect(typeof update).toBe('function');
  });

  it('update callback invokes engine.update()', () => {
    render(<OfficeCanvas />);
    const engine = getRendererInstance().__mockEngine;
    const { update } = mockStartGameLoop.mock.calls[0][1];
    update(16.67);
    expect(engine.update).toHaveBeenCalled();
  });
});

describe('OfficeCanvas — activity message handling', () => {
  const agents = [
    { agentId: 'dev-lead', deskPosition: { x: 2, y: 3 }, color: '#4CAF50' },
  ];

  it('applies agent status on activity-update message', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    // Make getSprite return a truthy value
    engine.getSprite.mockReturnValue({ id: 'sprite-dev-lead' });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'activity-update', agentId: 'dev-lead', status: 'thinking' },
      }),
    );

    expect(engine.applyAgentStatus).toHaveBeenCalledWith(
      'sprite-dev-lead',
      'thinking',
      expect.any(Number),
      undefined,
      undefined,
    );
  });

  it('ignores messages with wrong type', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'some-other-type', agentId: 'dev-lead', status: 'idle' },
      }),
    );

    expect(engine.applyAgentStatus).not.toHaveBeenCalled();
  });

  it('ignores messages for unknown sprites', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    engine.getSprite.mockReturnValue(undefined);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'activity-update', agentId: 'unknown-agent', status: 'idle' },
      }),
    );

    expect(engine.applyAgentStatus).not.toHaveBeenCalled();
  });

  it('passes targetX/targetY for move animations', () => {
    render(<OfficeCanvas agentAssignments={agents} />);
    const engine = getRendererInstance().__mockEngine;
    engine.getSprite.mockReturnValue({ id: 'sprite-dev-lead' });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'activity-update',
          agentId: 'dev-lead',
          status: 'active',
          targetX: 10,
          targetY: 5,
        },
      }),
    );

    expect(engine.applyAgentStatus).toHaveBeenCalledWith(
      'sprite-dev-lead',
      'active',
      expect.any(Number),
      10,
      5,
    );
  });

  it('cleans up message listener on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<OfficeCanvas agentAssignments={agents} />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));
    removeSpy.mockRestore();
  });
});
