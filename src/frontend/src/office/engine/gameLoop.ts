import { MAX_DELTA_TIME_SEC } from '../../constants.js'

export interface GameLoopCallbacks {
  update: (dt: number) => void
  render: (ctx: CanvasRenderingContext2D) => void
}

/**
 * Lightweight game loop for dashboard rendering (15 FPS target).
 * This throttles requestAnimationFrame to reduce CPU usage in VS Code extension.
 * Dashboard animations (walking, idle) don't need 60 FPS, and high FPS causes IDE crashes.
 */
export function startGameLoop(
  canvas: HTMLCanvasElement,
  callbacks: GameLoopCallbacks,
): () => void {
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  let lastTime = 0
  let rafId = 0
  let stopped = false
  let frameCount = 0
  const FRAME_SKIP = 4 // Skip 4 frames, render every 5th frame → ~12 FPS on 60 Hz monitor

  const frame = (time: number) => {
    if (stopped) return
    const dt = lastTime === 0 ? 0 : Math.min((time - lastTime) / 1000, MAX_DELTA_TIME_SEC)
    lastTime = time

    callbacks.update(dt)

    // Throttle rendering: only render every FRAME_SKIP frames to reduce CPU usage
    if (frameCount++ % FRAME_SKIP === 0) {
      ctx.imageSmoothingEnabled = false
      callbacks.render(ctx)
    }

    rafId = requestAnimationFrame(frame)
  }

  rafId = requestAnimationFrame(frame)

  return () => {
    stopped = true
    cancelAnimationFrame(rafId)
  }
}
