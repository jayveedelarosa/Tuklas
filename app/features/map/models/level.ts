export interface RawLevelQuestion {
  id: string;
  topic: string;
  difficultyTier: number;
  difficultyBeta: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
}

/** PRD §8 levels.json — map node metadata. Level 3 is the only playable node (PRD §4). */
export interface Level {
  id: string;
  name: string;
  characterName: string;
  playable: boolean;
  questions: RawLevelQuestion[];
}

export const TOTAL_MAP_NODES = 9;
export const PLAYABLE_LEVEL_ID = 'level3';
