export type TopicId = 'number-sense' | 'one-more-one-less' | 'regrouping';

export type DifficultyTier = -1 | 0 | 1;

export interface Question {
  id: string;
  topicId: TopicId;
  prompt: string;
  promptTagalog: string;
  difficultyTier: DifficultyTier;
  difficultyBeta: number;
  choices: string[];
  correctIndex: number;
  visualAid?: string;
  sourceModule: 'Module 1' | 'Module 2' | 'Module 3';
}

export interface Topic {
  id: TopicId;
  displayName: string;
  displayNameTagalog: string;
}

export const TOPICS: Topic[] = [
  { id: 'number-sense', displayName: 'Number Sense', displayNameTagalog: 'Pagkilala sa Bilang' },
  { id: 'one-more-one-less', displayName: 'One More / One Less', displayNameTagalog: 'Higit o Kulang ng Isa' },
  { id: 'regrouping', displayName: 'Regrouping', displayNameTagalog: 'Pagpapangkat' },
];
