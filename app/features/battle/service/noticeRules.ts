import { DifficultyTier } from '../../topics/models/question';
import { HINT_OFFER_THRESHOLD } from './hintFrequency';

export interface TuklasNotice {
  id: 'difficulty-up' | 'difficulty-down' | 'hint-offered';
  en: string;
  tl: string;
}

/** PRD §3.1 demo-critical requirement: every adjustment must surface a visible notice. */
export function buildDifficultyNotice(
  prevTier: DifficultyTier,
  nextTier: DifficultyTier,
  correctStreak: number
): TuklasNotice | null {
  if (nextTier > prevTier) {
    return correctStreak >= 2
      ? {
          id: 'difficulty-up',
          en: "Tuklas noticed you're on a streak! Tougher question, coming right up.",
          tl: 'Napansin ni Tuklas na sunod-sunod ang tama mo! Hahanda na ng mas mahirap na tanong.',
        }
      : {
          id: 'difficulty-up',
          en: "Tuklas noticed you've got this — here's a tougher one",
          tl: 'Napansin ni Tuklas na kaya mo na ito — heto ang mas mahirap na tanong.',
        };
  }
  if (nextTier < prevTier) {
    return {
      id: 'difficulty-down',
      en: "Tuklas noticed you're finding this tricky — here's an easier question",
      tl: 'Napansin ni Tuklas na medyo nahihirapan ka — heto ang mas madaling tanong.',
    };
  }
  return null;
}

export function buildHintNotice(prevHintFrequency: number, nextHintFrequency: number): TuklasNotice | null {
  const crossedUp = prevHintFrequency < HINT_OFFER_THRESHOLD && nextHintFrequency >= HINT_OFFER_THRESHOLD;
  if (!crossedUp) return null;
  return {
    id: 'hint-offered',
    en: 'Tuklas noticed you might want a hint here',
    tl: 'Napansin ni Tuklas na baka makatulong sa’yo ang hint dito.',
  };
}
