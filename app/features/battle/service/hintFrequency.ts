import { clamp } from '../../../common/utils/clamp';

/** PRD §3.2-B: how readily a hint is offered, derived from the same Elo numbers as difficulty. */
export const HINT_SENSITIVITY = 0.5;
export const HINT_OFFER_THRESHOLD = 0.5;

export function computeHintFrequency(
  betaQuestion: number,
  thetaStudent: number,
  sensitivity = HINT_SENSITIVITY
): number {
  return clamp((betaQuestion - thetaStudent) * sensitivity, 0, 1);
}
