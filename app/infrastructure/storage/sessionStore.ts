import { create } from 'zustand';
import { PlayerProfile } from '../../features/onboarding/models/player';
import { BattleEngineState } from '../../features/battle/models/battle';
import { PomodoroSessionRecord } from '../../features/pomodoro/models/pomodoro';
import {
  computeCompletionRate,
  computeSessionLength,
  computeBreakLength,
  BASELINE_SESSION_MIN,
  BASELINE_BREAK_MIN,
} from '../../features/pomodoro/service/pomodoroEngine';

/**
 * In-memory-only runtime state (PRD §4/§8: no persistence across restarts).
 * Hydrated from a read-only seed fixture when a player is selected at
 * onboarding; everything here resets when the app restarts or a new
 * player is chosen, which also doubles as the documented crash-recovery path.
 */
interface SessionState {
  activePlayer: PlayerProfile | null;
  completedLevelIds: string[];
  unlockedCharacterIds: string[];
  thetaStudent: number;
  streakCount: number;
  pomodoroHistory: PomodoroSessionRecord[];
  currentSessionLength: number;
  currentBreakLength: number;
  battle: BattleEngineState | null;
  hydrateFromPlayer: (player: PlayerProfile) => void;
  setBattleState: (battle: BattleEngineState | null) => void;
  completeLevel: (levelId: string, characterId: string) => void;
  recordPomodoroSession: (record: PomodoroSessionRecord) => void;
  applyPomodoroAdjustment: (sessionLength: number, breakLength: number) => void;
  resetSession: () => void;
}

const INITIAL_STATE = {
  activePlayer: null as PlayerProfile | null,
  completedLevelIds: [] as string[],
  unlockedCharacterIds: [] as string[],
  thetaStudent: 0,
  streakCount: 0,
  pomodoroHistory: [] as PomodoroSessionRecord[],
  currentSessionLength: BASELINE_SESSION_MIN,
  currentBreakLength: BASELINE_BREAK_MIN,
  battle: null as BattleEngineState | null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...INITIAL_STATE,

  hydrateFromPlayer: (player) => {
    const completionRate = computeCompletionRate(player.pomodoroSessionHistory);
    set({
      activePlayer: player,
      completedLevelIds: player.completedLevelIds,
      unlockedCharacterIds: player.unlockedCharacterIds,
      thetaStudent: player.thetaStudent,
      streakCount: player.streakCount,
      pomodoroHistory: player.pomodoroSessionHistory,
      currentSessionLength: computeSessionLength(completionRate),
      currentBreakLength: computeBreakLength(completionRate),
      battle: null,
    });
  },

  setBattleState: (battle) =>
    set({ battle, thetaStudent: battle ? battle.thetaStudent : get().thetaStudent }),

  completeLevel: (levelId, characterId) =>
    set((state) => ({
      completedLevelIds: state.completedLevelIds.includes(levelId)
        ? state.completedLevelIds
        : [...state.completedLevelIds, levelId],
      unlockedCharacterIds: state.unlockedCharacterIds.includes(characterId)
        ? state.unlockedCharacterIds
        : [...state.unlockedCharacterIds, characterId],
    })),

  recordPomodoroSession: (record) =>
    set((state) => ({
      pomodoroHistory: [...state.pomodoroHistory, record],
      streakCount: record.completed ? state.streakCount + 1 : 0,
    })),

  applyPomodoroAdjustment: (sessionLength, breakLength) =>
    set({ currentSessionLength: sessionLength, currentBreakLength: breakLength }),

  resetSession: () => set({ ...INITIAL_STATE }),
}));
