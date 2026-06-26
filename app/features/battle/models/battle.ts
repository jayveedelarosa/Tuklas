import { DifficultyTier, Question, TopicId } from '../../topics/models/question';
import { TuklasNotice } from '../service/noticeRules';

/** PRD §8 BattleSession entity, in-memory only — resets on app restart. */
export interface BattleSession {
  currentTopicId: TopicId;
  questionsAnswered: number;
  correctStreak: number;
  hintsUsedThisSession: number;
}

export interface BattleEngineState extends BattleSession {
  questions: Question[];
  correctlyAnsweredIds: string[];
  currentQuestionId: string;
  thetaStudent: number;
  currentTier: DifficultyTier;
  hintFrequency: number;
  playerHp: number;
  maxPlayerHp: number;
  isDefeated: boolean;
}

export interface SubmitAnswerResult {
  state: BattleEngineState;
  wasCorrect: boolean;
  notices: TuklasNotice[];
  setCleared: boolean;
}
