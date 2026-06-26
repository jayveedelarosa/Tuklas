import { listPlayers, getPlayer } from '../features/onboarding/repository/playerRepository';
import { listLevels, getLevel } from '../features/map/repository/levelRepository';
import { TOTAL_MAP_NODES, PLAYABLE_LEVEL_ID } from '../features/map/models/level';

describe('playerRepository', () => {
  it('seeds exactly the 3 demo profiles required by onboarding (PRD success criteria)', () => {
    const players = listPlayers();
    expect(players).toHaveLength(3);
    expect(players.map((p) => p.id)).toEqual(['player1', 'player2', 'player3']);
  });

  it('Player 1 and Player 2 load with all 3 levels beaten', () => {
    expect(getPlayer('player1')?.completedLevelIds).toEqual(['level1', 'level2', 'level3']);
    expect(getPlayer('player2')?.completedLevelIds).toEqual(['level1', 'level2', 'level3']);
  });

  it('Player 3 loads with levels 1-2 done, dropping fresh into level 3', () => {
    const player3 = getPlayer('player3');
    expect(player3?.completedLevelIds).toEqual(['level1', 'level2']);
    expect(player3?.unlockedCharacterIds).toHaveLength(2);
  });
});

describe('levelRepository', () => {
  it('only level3 is playable (PRD §4 locked scope)', () => {
    const levels = listLevels();
    const playable = levels.filter((l) => l.playable);
    expect(playable.map((l) => l.id)).toEqual([PLAYABLE_LEVEL_ID]);
  });

  it('level3 ships a 3-5 question battle set', () => {
    const level3 = getLevel('level3');
    expect(level3?.questions.length).toBeGreaterThanOrEqual(3);
    expect(level3?.questions.length).toBeLessThanOrEqual(5);
  });

  it('exposes the locked-node count used by the map (up to 15 nodes)', () => {
    expect(TOTAL_MAP_NODES).toBe(9);
  });
});
