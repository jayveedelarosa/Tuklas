import { PomodoroSessionRecord } from '../../pomodoro/models/pomodoro';

/** PRD §8 players.json — pre-seeded, read-only demo fixtures. */
export interface PlayerProfile {
  id: string;
  name: string;
  completedLevelIds: string[];
  unlockedCharacterIds: string[];
  streakCount: number;
  thetaStudent: number;
  pomodoroSessionHistory: PomodoroSessionRecord[];
}
