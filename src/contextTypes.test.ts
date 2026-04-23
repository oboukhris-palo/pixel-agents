import {
  calculateTokenPercentage,
  calculateThreshold,
  getThresholdColor,
  isValidTokenUsage,
} from './contextTypes';

describe('calculateTokenPercentage', () => {
  it('returns 0 when used is 0', () => {
    expect(calculateTokenPercentage(0, 100000)).toBe(0);
  });

  it('returns 50 when used is half of total', () => {
    expect(calculateTokenPercentage(50000, 100000)).toBe(50);
  });

  it('returns 100 when used equals total', () => {
    expect(calculateTokenPercentage(100000, 100000)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(calculateTokenPercentage(1, 3)).toBe(33);
  });

  it('clamps to 0 when used is negative', () => {
    expect(calculateTokenPercentage(-100, 100000)).toBe(0);
  });

  it('clamps to 100 when used exceeds total', () => {
    expect(calculateTokenPercentage(120000, 100000)).toBe(100);
  });

  it('returns 0 when total is 0 (no division by zero)', () => {
    expect(calculateTokenPercentage(0, 0)).toBe(0);
  });
});

describe('calculateThreshold', () => {
  it('returns safe for 0%', () => {
    expect(calculateThreshold(0)).toBe('safe');
  });

  it('returns safe for 69%', () => {
    expect(calculateThreshold(69)).toBe('safe');
  });

  it('returns warning for 70%', () => {
    expect(calculateThreshold(70)).toBe('warning');
  });

  it('returns warning for 89%', () => {
    expect(calculateThreshold(89)).toBe('warning');
  });

  it('returns critical for 90%', () => {
    expect(calculateThreshold(90)).toBe('critical');
  });

  it('returns critical for 100%', () => {
    expect(calculateThreshold(100)).toBe('critical');
  });
});

describe('getThresholdColor', () => {
  it('maps safe to green', () => {
    expect(getThresholdColor('safe')).toBe('#28a745');
  });

  it('maps warning to yellow', () => {
    expect(getThresholdColor('warning')).toBe('#ffc107');
  });

  it('maps critical to red', () => {
    expect(getThresholdColor('critical')).toBe('#dc3545');
  });
});

describe('isValidTokenUsage', () => {
  it('returns true for valid breakdown (sum equals total)', () => {
    const usage = {
      total: 100000,
      used: 60000,
      percentage: 60,
      breakdown: { githubCode: 30000, projectCode: 20000, chatHistory: 10000 },
      threshold: 'safe' as const,
    };
    expect(isValidTokenUsage(usage)).toBe(true);
  });

  it('returns false when breakdown sum does not equal used', () => {
    const usage = {
      total: 100000,
      used: 60000,
      percentage: 60,
      breakdown: { githubCode: 10000, projectCode: 10000, chatHistory: 10000 },
      threshold: 'safe' as const,
    };
    expect(isValidTokenUsage(usage)).toBe(false);
  });

  it('returns false for negative values', () => {
    const usage = {
      total: 100000,
      used: -1,
      percentage: 0,
      breakdown: { githubCode: 0, projectCode: 0, chatHistory: 0 },
      threshold: 'safe' as const,
    };
    expect(isValidTokenUsage(usage)).toBe(false);
  });
});
