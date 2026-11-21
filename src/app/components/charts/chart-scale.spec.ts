import { niceTicks, shortNumber } from './chart-scale';

describe('niceTicks (axis of the charts)', () => {
  it('gives round steps that start at zero and cover the maximum', () => {
    expect(niceTicks(100)).toEqual([0, 50, 100]);
    expect(niceTicks(7)).toEqual([0, 2, 4, 6, 8]);
    const ticks = niceTicks(371);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(371);
    const step = ticks[1] - ticks[0];
    expect(ticks.every((t, i) => t === i * step)).toBeTrue();          // evenly spaced
    expect([100, 200, 500].includes(step)).toBeTrue();                   // a round step
  });

  it('never returns an empty or broken axis for an empty chart', () => {
    expect(niceTicks(0)).toEqual([0, 1]);
    expect(niceTicks(-5)).toEqual([0, 1]);
    expect(niceTicks(NaN)).toEqual([0, 1]);
  });

  it('keeps small numbers whole (no half a request on the axis)', () => {
    expect(niceTicks(3).every(Number.isInteger)).toBeTrue();
  });
});

describe('shortNumber', () => {
  it('writes thousands and millions in short form with a French decimal comma', () => {
    expect(shortNumber(950)).toBe('950');
    expect(shortNumber(12500)).toBe('12,5 k');
    expect(shortNumber(2500000)).toBe('2,5 M');
  });
});
