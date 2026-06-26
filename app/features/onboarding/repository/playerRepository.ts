import playersData from '../../../../data/players.json';
import { PlayerProfile } from '../models/player';

const SAFETY_PLAYERS: PlayerProfile[] = [
  { id: 'player1', name: 'Player 1', completedLevelIds: ['level1', 'level2'], unlockedCharacterIds: ['tikbalang', 'aswang', 'sigbin'], streakCount: 1, thetaStudent: 0, pomodoroSessionHistory: [] },
  { id: 'player2', name: 'Player 2', completedLevelIds: ['level1', 'level2'], unlockedCharacterIds: ['tikbalang', 'aswang', 'sigbin'], streakCount: 1, thetaStudent: 0, pomodoroSessionHistory: [] },
  { id: 'player3', name: 'Player 3', completedLevelIds: ['level1', 'level2'], unlockedCharacterIds: ['tikbalang', 'aswang'], streakCount: 0, thetaStudent: 0, pomodoroSessionHistory: [] },
];

function isValidPlayer(value: unknown): value is PlayerProfile {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.completedLevelIds);
}

/** BR-07-style guard: malformed seed data falls back to generic profiles rather than crashing onboarding. */
export function listPlayers(): PlayerProfile[] {
  try {
    const players = (playersData as { players?: unknown[] }).players;
    if (Array.isArray(players) && players.length >= 3 && players.every(isValidPlayer)) {
      return players as PlayerProfile[];
    }
    return SAFETY_PLAYERS;
  } catch {
    return SAFETY_PLAYERS;
  }
}

export function getPlayer(id: string): PlayerProfile | undefined {
  return listPlayers().find((p) => p.id === id);
}
