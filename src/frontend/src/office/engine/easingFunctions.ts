/**
 * Easing Functions (US-003-002 Layer 2)
 *
 * Standard mathematical easing curves for sprite animations.
 * Reference: https://easings.net/
 */

/** Linear interpolation (no easing). */
export function linear(t: number): number {
  return t;
}

/** Quadratic ease-in-out: slow start, fast middle, slow end. */
export function quadEaseInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Sine ease-in-out: smooth sinusoidal curve. */
export function sineEaseInOut(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Back ease-out: slight overshoot then settle (c1 = 1.70158). */
export function backEaseOut(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

/** Map from easing name to function. */
export const Easing: Record<string, (t: number) => number> = {
  linear,
  quadEaseInOut,
  sineEaseInOut,
  backEaseOut,
};
