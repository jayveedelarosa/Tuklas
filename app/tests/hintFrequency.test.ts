import { computeHintFrequency, HINT_OFFER_THRESHOLD } from '../features/battle/service/hintFrequency';

describe('Adaptive Engine — hint frequency (PRD §3.2-B)', () => {
  it('is 0 when the student is at or above the question difficulty', () => {
    expect(computeHintFrequency(0, 0)).toBe(0);
    expect(computeHintFrequency(0, 1)).toBe(0);
  });

  it('rises as the gap between question difficulty and ability widens', () => {
    const small = computeHintFrequency(0.5, 0);
    const big = computeHintFrequency(1.5, 0);
    expect(big).toBeGreaterThan(small);
  });

  it('is clamped to [0, 1]', () => {
    expect(computeHintFrequency(10, -10)).toBe(1);
    expect(computeHintFrequency(-10, 10)).toBe(0);
  });

  it('crosses the hint-offer threshold for a sufficiently large struggling gap', () => {
    const frequency = computeHintFrequency(1, -0.5);
    expect(frequency).toBeGreaterThanOrEqual(HINT_OFFER_THRESHOLD);
  });
});
