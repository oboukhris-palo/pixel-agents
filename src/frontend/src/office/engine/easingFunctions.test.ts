/**
 * Easing Functions Tests (US-003-002 Layer 2)
 */

import { linear, quadEaseInOut, sineEaseInOut, backEaseOut, Easing } from './easingFunctions';

describe('Easing functions', () => {
  // All easing functions must satisfy: f(0) ≈ 0 and f(1) ≈ 1
  describe.each([
    ['linear', linear],
    ['quadEaseInOut', quadEaseInOut],
    ['sineEaseInOut', sineEaseInOut],
    ['backEaseOut', backEaseOut],
  ])('%s', (_name, fn) => {
    it('returns ~0 at t=0', () => {
      expect(fn(0)).toBeCloseTo(0, 5);
    });

    it('returns ~1 at t=1', () => {
      expect(fn(1)).toBeCloseTo(1, 5);
    });

    it('returns values in reasonable range for t=0.5', () => {
      const mid = fn(0.5);
      expect(mid).toBeGreaterThanOrEqual(-0.1);
      expect(mid).toBeLessThanOrEqual(1.1);
    });
  });

  describe('linear', () => {
    it('returns exact input', () => {
      expect(linear(0.25)).toBe(0.25);
      expect(linear(0.75)).toBe(0.75);
    });
  });

  describe('quadEaseInOut', () => {
    it('is symmetric around 0.5', () => {
      // f(0.25) + f(0.75) should ≈ 1
      expect(quadEaseInOut(0.25) + quadEaseInOut(0.75)).toBeCloseTo(1, 5);
    });

    it('midpoint is 0.5', () => {
      expect(quadEaseInOut(0.5)).toBeCloseTo(0.5, 5);
    });
  });

  describe('sineEaseInOut', () => {
    it('midpoint is 0.5', () => {
      expect(sineEaseInOut(0.5)).toBeCloseTo(0.5, 5);
    });
  });

  describe('backEaseOut', () => {
    it('overshoots slightly before t=1', () => {
      // At some point during 0..1, the value exceeds 1.0 (overshoot)
      const samples = Array.from({ length: 100 }, (_, i) => backEaseOut(i / 100));
      expect(Math.max(...samples)).toBeGreaterThan(1.0);
    });
  });

  describe('Easing map', () => {
    it('contains all 4 easing functions', () => {
      expect(Object.keys(Easing)).toEqual(
        expect.arrayContaining(['linear', 'quadEaseInOut', 'sineEaseInOut', 'backEaseOut']),
      );
    });

    it('maps names to correct functions', () => {
      expect(Easing.linear).toBe(linear);
      expect(Easing.quadEaseInOut).toBe(quadEaseInOut);
      expect(Easing.sineEaseInOut).toBe(sineEaseInOut);
      expect(Easing.backEaseOut).toBe(backEaseOut);
    });
  });
});
