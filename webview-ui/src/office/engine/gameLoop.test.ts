/**
 * GameLoop Tests — Layer 2 (TDD cycle for US-003-001)
 *
 * Tests the startGameLoop function using the existing functional pattern.
 * Covers: start, stop (cleanup), callbacks, imageSmoothingEnabled, stopped-flag.
 *
 * Strategy: use a manual rAF driver so tests are fully synchronous and deterministic.
 * JSDOM's requestAnimationFrame doesn't auto-tick in Jest; driving it manually is cleaner.
 */

import { startGameLoop } from './gameLoop';

// ─── Manual rAF driver ────────────────────────────────────────────────────────

type RafCallback = (time: number) => void;

let _rafCallbacks: Map<number, RafCallback>;
let _rafIdCounter: number;
let _canceledIds: Set<number>;
let _originalRaf: typeof requestAnimationFrame;
let _originalCaf: typeof cancelAnimationFrame;

function installManualRaf(): void {
  _rafCallbacks = new Map();
  _canceledIds = new Set();
  _rafIdCounter = 0;
  _originalRaf = window.requestAnimationFrame;
  _originalCaf = window.cancelAnimationFrame;

  window.requestAnimationFrame = (cb: RafCallback) => {
    const id = ++_rafIdCounter;
    _rafCallbacks.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id: number) => {
    _canceledIds.add(id);
    _rafCallbacks.delete(id);
  };
}

function restoreRaf(): void {
  window.requestAnimationFrame = _originalRaf;
  window.cancelAnimationFrame = _originalCaf;
}

/** Fire all pending rAF callbacks once with the given timestamp. */
function tickRaf(time = 16.0): void {
  const pending = [..._rafCallbacks.entries()];
  _rafCallbacks.clear();
  for (const [id, cb] of pending) {
    if (!_canceledIds.has(id)) cb(time);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 246;
  return canvas;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('startGameLoop', () => {
  beforeEach(installManualRaf);
  afterEach(restoreRaf);

  it('returns a stop (cleanup) function', () => {
    const stop = startGameLoop(makeCanvas(), { update: jest.fn(), render: jest.fn() });
    expect(typeof stop).toBe('function');
    stop();
  });

  it('calls requestAnimationFrame to start loop', () => {
    expect(_rafCallbacks.size).toBe(0);
    const stop = startGameLoop(makeCanvas(), { update: jest.fn(), render: jest.fn() });
    expect(_rafCallbacks.size).toBe(1); // one pending frame
    stop();
  });

  it('calls cancelAnimationFrame when stop is invoked', () => {
    const cafSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const stop = startGameLoop(makeCanvas(), { update: jest.fn(), render: jest.fn() });
    stop();
    expect(cafSpy).toHaveBeenCalled();
  });

  it('calls render callback on each frame tick', () => {
    const renderMock = jest.fn();
    const stop = startGameLoop(makeCanvas(), { update: jest.fn(), render: renderMock });

    tickRaf(16);   // fires frame 1

    expect(renderMock).toHaveBeenCalledTimes(1);
    stop();
  });

  it('calls render callback again on subsequent ticks', () => {
    const renderMock = jest.fn();
    const stop = startGameLoop(makeCanvas(), { update: jest.fn(), render: renderMock });

    tickRaf(16);   // frame 1 — schedules frame 2
    tickRaf(32);   // frame 2 — schedules frame 3

    expect(renderMock).toHaveBeenCalledTimes(2);
    stop();
  });

  it('calls update with dt=0 on first frame (no previous timestamp)', () => {
    const updateMock = jest.fn();
    const stop = startGameLoop(makeCanvas(), { update: updateMock, render: jest.fn() });

    // gameLoop: dt = lastTime === 0 ? 0 : ...; so ANY first-frame time yields dt=0
    tickRaf(16);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock.mock.calls[0][0]).toBe(0);
    stop();
  });

  it('calls update with dt > 0 on subsequent frames', () => {
    const updateMock = jest.fn();
    const stop = startGameLoop(makeCanvas(), { update: updateMock, render: jest.fn() });

    tickRaf(16);  // frame 1: dt = 0 (first frame), sets lastTime = 16
    tickRaf(32);  // frame 2: dt = (32 - 16) / 1000 = 0.016

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock.mock.calls[1][0]).toBeCloseTo(0.016, 5);
    stop();
  });

  it('sets imageSmoothingEnabled=false immediately on the 2D context', () => {
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;

    const stop = startGameLoop(canvas, { update: jest.fn(), render: jest.fn() });

    // imageSmoothingEnabled is set synchronously in startGameLoop, before first frame
    expect(ctx.imageSmoothingEnabled).toBe(false);
    stop();
  });

  it('does not call update or render after stop()', () => {
    const updateMock = jest.fn();
    const renderMock = jest.fn();
    const stop = startGameLoop(makeCanvas(), { update: updateMock, render: renderMock });

    stop(); // sets stopped = true, cancels rAF

    // Any remaining pending callbacks should be no-ops (cancelAnimationFrame removed them)
    tickRaf(16); // should not fire anything

    expect(updateMock).not.toHaveBeenCalled();
    expect(renderMock).not.toHaveBeenCalled();
  });
});
