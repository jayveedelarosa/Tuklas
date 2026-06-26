import { predictProbabilityCorrect, pickNextDifficultyTier, updateElo, ELO_K_FACTOR } from '../features/battle/service/elo';

describe('Adaptive Engine — Elo difficulty (PRD §3.2-A)', () => {
  it('predicts a 50/50 chance when student ability equals question difficulty', () => {
    expect(predictProbabilityCorrect(0, 0)).toBeCloseTo(0.5);
    expect(predictProbabilityCorrect(1, 1)).toBeCloseTo(0.5);
  });

  it('predicts a higher chance of success when ability exceeds difficulty', () => {
    expect(predictProbabilityCorrect(2, 0)).toBeGreaterThan(0.5);
    expect(predictProbabilityCorrect(0, 2)).toBeLessThan(0.5);
  });

  it('a correct answer raises theta and an incorrect answer lowers it', () => {
    const correct = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: true, responseTimeMs: 2000 });
    const incorrect = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: false, responseTimeMs: 2000 });
    expect(correct.thetaStudent).toBeGreaterThan(0);
    expect(incorrect.thetaStudent).toBeLessThan(0);
  });

  it('a slow correct answer counts as a weaker correct than a fast one (Step 4 tiebreaker)', () => {
    const fast = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: true, responseTimeMs: 1500 });
    const slow = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: true, responseTimeMs: 9000 });
    expect(slow.thetaStudent).toBeGreaterThan(0);
    expect(slow.thetaStudent).toBeLessThan(fast.thetaStudent);
  });

  it('a slow incorrect answer is not softened (tiebreaker only applies to correct answers)', () => {
    const normal = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: false, responseTimeMs: 2000 });
    const slow = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: false, responseTimeMs: 9000 });
    expect(slow.thetaStudent).toBeCloseTo(normal.thetaStudent);
  });

  it('respects a custom K-factor', () => {
    const defaultK = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: true, responseTimeMs: 1000 });
    const biggerK = updateElo({ thetaStudent: 0, betaQuestion: 0, isCorrect: true, responseTimeMs: 1000, k: ELO_K_FACTOR * 2 });
    expect(biggerK.thetaStudent).toBeGreaterThan(defaultK.thetaStudent);
  });

  it('picks the difficulty tier whose beta is closest to theta (Step 3 flow-theory matching)', () => {
    expect(pickNextDifficultyTier(0)).toBe(0);
    expect(pickNextDifficultyTier(-0.9)).toBe(-1);
    expect(pickNextDifficultyTier(0.9)).toBe(1);
    expect(pickNextDifficultyTier(-0.4)).toBe(0);
    expect(pickNextDifficultyTier(0.4)).toBe(0);
  });
});
