import { clamp } from '../../../common/utils/clamp';
import { PomodoroSessionRecord } from '../models/pomodoro';
import { TuklasNotice } from '../../battle/service/noticeRules';

/** PRD §3.2-C — bounded adjustment around the Cirillo 25/5 baseline. */
export const BASELINE_SESSION_MIN = 25;
export const BASELINE_BREAK_MIN = 5;
export const ADJUSTMENT_STEP_MIN = 5;
export const SESSION_BOUNDS = { min: 15, max: 35 };
export const BREAK_BOUNDS = { min: 5, max: 10 };
const ROLLING_WINDOW = 5;

export function computeCompletionRate(history: PomodoroSessionRecord[], windowSize = ROLLING_WINDOW): number {
  const recent = history.slice(-windowSize);
  if (recent.length === 0) return 0.5;
  return recent.filter((s) => s.completed).length / recent.length;
}

export function computeSessionLength(completionRate: number): number {
  const raw = BASELINE_SESSION_MIN + ADJUSTMENT_STEP_MIN * (completionRate - 0.5) * 2;
  return clamp(raw, SESSION_BOUNDS.min, SESSION_BOUNDS.max);
}

export function computeBreakLength(completionRate: number): number {
  const raw = BASELINE_BREAK_MIN + ADJUSTMENT_STEP_MIN * (1 - completionRate) * 2;
  return clamp(raw, BREAK_BOUNDS.min, BREAK_BOUNDS.max);
}

export interface PomodoroAdjustment {
  sessionLength: number;
  breakLength: number;
  notices: TuklasNotice[];
}

/**
 * Recomputes session/break length from session history and produces the
 * mandatory "Tuklas noticed..." notice whenever a length actually changes —
 * an adjustment with no on-screen message isn't demoable per PRD §3.1.
 */
export function recomputePomodoroAdjustment(
  history: PomodoroSessionRecord[],
  previousSessionLength: number,
  previousBreakLength: number
): PomodoroAdjustment {
  const completionRate = computeCompletionRate(history);
  const sessionLength = computeSessionLength(completionRate);
  const breakLength = computeBreakLength(completionRate);

  const notices: TuklasNotice[] = [];
  if (sessionLength > previousSessionLength) {
    notices.push({
      id: 'difficulty-up',
      en: "Tuklas noticed you've been finishing your sessions easily — here's a longer one",
      tl: 'Napansin ni Tuklas na kaya mo na ang mga sesyon — mas mahabang sesyon, dito na!',
    });
  } else if (sessionLength < previousSessionLength) {
    notices.push({
      id: 'difficulty-down',
      en: "Tuklas noticed you've been finding focus time tough — here's a shorter session",
      tl: 'Napansin ni Tuklas na mahirap pa ang pagtutok — mas maikling sesyon, dito na!',
    });
  }
  if (breakLength > previousBreakLength) {
    notices.push({
      id: 'difficulty-down',
      en: "Tuklas noticed you could use more rest — here's a longer break",
      tl: 'Napansin ni Tuklas na kailangan mo ng mas mahabang pahinga — dito na!',
    });
  } else if (breakLength < previousBreakLength) {
    notices.push({
      id: 'difficulty-up',
      en: "Tuklas noticed you're recovering fast — here's a shorter break",
      tl: 'Napansin ni Tuklas na mabilis kang nakakabawi — mas maikling pahinga, dito na!',
    });
  }

  return { sessionLength, breakLength, notices };
}
