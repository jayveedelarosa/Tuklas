import {
  computeCompletionRate,
  computeSessionLength,
  computeBreakLength,
  recomputePomodoroAdjustment,
  BASELINE_SESSION_MIN,
  BASELINE_BREAK_MIN,
  SESSION_BOUNDS,
  BREAK_BOUNDS,
} from '../features/pomodoro/service/pomodoroEngine';
import { PomodoroSessionRecord } from '../features/pomodoro/models/pomodoro';

function recordsOf(pattern: boolean[]): PomodoroSessionRecord[] {
  return pattern.map((completed, i) => ({
    completed,
    date: `2026-06-${10 + i}`,
    plannedLength: 25,
    actualLength: completed ? 25 : 10,
  }));
}

describe('Pomodoro Adaptive Engine (PRD §3.2-C)', () => {
  it('defaults to a neutral 0.5 completion rate with no history', () => {
    expect(computeCompletionRate([])).toBe(0.5);
  });

  it('computes completion rate over the rolling window only', () => {
    const history = recordsOf([false, false, false, true, true, true, true, true]);
    expect(computeCompletionRate(history, 5)).toBe(1);
  });

  it('session length grows for a student who keeps finishing easily', () => {
    const length = computeSessionLength(1);
    expect(length).toBeGreaterThan(BASELINE_SESSION_MIN);
    expect(length).toBeLessThanOrEqual(SESSION_BOUNDS.max);
  });

  it('session length shrinks for a student who keeps abandoning', () => {
    const length = computeSessionLength(0);
    expect(length).toBeLessThan(BASELINE_SESSION_MIN);
    expect(length).toBeGreaterThanOrEqual(SESSION_BOUNDS.min);
  });

  it('break length grows for a student who keeps abandoning', () => {
    const length = computeBreakLength(0);
    expect(length).toBeGreaterThan(BASELINE_BREAK_MIN);
    expect(length).toBeLessThanOrEqual(BREAK_BOUNDS.max);
  });

  it('break length bottoms out at the baseline for a student who always finishes (formula floors at completionRate=1)', () => {
    const length = computeBreakLength(1);
    expect(length).toBe(BASELINE_BREAK_MIN);
  });

  it('never drifts outside the defensible bounds regardless of input', () => {
    expect(computeSessionLength(-5)).toBe(SESSION_BOUNDS.min);
    expect(computeSessionLength(5)).toBe(SESSION_BOUNDS.max);
    expect(computeBreakLength(-5)).toBe(BREAK_BOUNDS.max);
    expect(computeBreakLength(5)).toBe(BREAK_BOUNDS.min);
  });

  it('fires a "Tuklas noticed" notice only when a length actually changes (PRD §3.1)', () => {
    const easyHistory = recordsOf([true, true, true, true, true]);
    const adjustment = recomputePomodoroAdjustment(easyHistory, BASELINE_SESSION_MIN, BASELINE_BREAK_MIN);
    expect(adjustment.sessionLength).toBeGreaterThan(BASELINE_SESSION_MIN);
    expect(adjustment.notices.length).toBeGreaterThan(0);
  });

  it('produces no notice when the recomputed lengths match the previous ones', () => {
    const neutralHistory: PomodoroSessionRecord[] = [];
    // No history defaults to a neutral 0.5 completion rate, which the PRD's
    // break formula resolves to 10 (not the baseline) — pass that in as the
    // "previous" value so this run is a true no-change case.
    const adjustment = recomputePomodoroAdjustment(neutralHistory, BASELINE_SESSION_MIN, 10);
    expect(adjustment.sessionLength).toBe(BASELINE_SESSION_MIN);
    expect(adjustment.breakLength).toBe(10);
    expect(adjustment.notices).toHaveLength(0);
  });
});
