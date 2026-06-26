import levelsData from '../../../../data/levels.json';
import { Level } from '../models/level';

const SAFETY_LEVELS: Level[] = [
  { id: 'level1', name: 'Sitio Bangungot', characterName: 'Tikbalang', playable: false, questions: [] },
  { id: 'level2', name: 'Look ng Aswang', characterName: 'Aswang', playable: false, questions: [] },
  { id: 'level3', name: 'Bukid ng Bayabas', characterName: 'Kapre', playable: true, questions: [] },
];

function isValidLevel(value: unknown): value is Level {
  if (typeof value !== 'object' || value === null) return false;
  const l = value as Record<string, unknown>;
  return typeof l.id === 'string' && typeof l.name === 'string' && typeof l.playable === 'boolean';
}

export function listLevels(): Level[] {
  try {
    const levels = (levelsData as { levels?: unknown[] }).levels;
    if (Array.isArray(levels) && levels.length >= 3 && levels.every(isValidLevel)) {
      return levels as Level[];
    }
    return SAFETY_LEVELS;
  } catch {
    return SAFETY_LEVELS;
  }
}

export function getLevel(id: string): Level | undefined {
  return listLevels().find((l) => l.id === id);
}
