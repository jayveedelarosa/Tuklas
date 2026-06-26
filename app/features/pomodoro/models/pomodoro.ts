export interface PomodoroSessionRecord {
  completed: boolean;
  date: string;
  plannedLength: number;
  actualLength: number;
}

/** PRD §8 — in-memory only, resets on restart except the seeded fixtures. */
export interface PomodoroState {
  history: PomodoroSessionRecord[];
  streakCount: number;
  currentSessionLength: number;
  currentBreakLength: number;
}
