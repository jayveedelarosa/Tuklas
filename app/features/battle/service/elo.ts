import { DifficultyTier } from '../../topics/models/question';

/** PRD §3.2-A K-factor: sensitivity of each rating update. */
export const ELO_K_FACTOR = 0.45;
/** A correct answer slower than this (ms) counts as a "weaker" correct — PRD §3.2-A Step 4. */
export const SLOW_RESPONSE_THRESHOLD_MS = 6000;
const SLOW_RESPONSE_K_MULTIPLIER = 0.5;

export function predictProbabilityCorrect(thetaStudent: number, betaQuestion: number): number {
  return 1 / (1 + Math.exp(-(thetaStudent - betaQuestion)));
}

export interface EloUpdateInput {
  thetaStudent: number;
  betaQuestion: number;
  isCorrect: boolean;
  responseTimeMs: number;
  k?: number;
}

export interface EloUpdateResult {
  thetaStudent: number;
  betaQuestion: number;
  probabilityCorrect: number;
}

export function updateElo({
  thetaStudent,
  betaQuestion,
  isCorrect,
  responseTimeMs,
  k = ELO_K_FACTOR,
}: EloUpdateInput): EloUpdateResult {
  const probabilityCorrect = predictProbabilityCorrect(thetaStudent, betaQuestion);
  const actual = isCorrect ? 1 : 0;
  const wasSlowCorrect = isCorrect && responseTimeMs > SLOW_RESPONSE_THRESHOLD_MS;
  const effectiveK = wasSlowCorrect ? k * SLOW_RESPONSE_K_MULTIPLIER : k;

  return {
    thetaStudent: thetaStudent + effectiveK * (actual - probabilityCorrect),
    betaQuestion: betaQuestion + effectiveK * (probabilityCorrect - actual),
    probabilityCorrect,
  };
}

const AVAILABLE_TIERS: DifficultyTier[] = [-1, 0, 1];

/** PRD §3.2-A Step 3: pick the tier whose beta is closest to the student's current theta. */
export function pickNextDifficultyTier(thetaStudent: number): DifficultyTier {
  return AVAILABLE_TIERS.reduce((closest, tier) =>
    Math.abs(tier - thetaStudent) < Math.abs(closest - thetaStudent) ? tier : closest
  );
}
