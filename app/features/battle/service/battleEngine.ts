import { DifficultyTier, Question, TopicId } from '../../topics/models/question';
import { BattleEngineState, SubmitAnswerResult } from '../models/battle';
import { pickNextDifficultyTier, updateElo, SLOW_RESPONSE_THRESHOLD_MS } from './elo';
import { computeHintFrequency } from './hintFrequency';
import { buildDifficultyNotice, buildHintNotice, TuklasNotice } from './noticeRules';

function pickQuestion(
  questions: Question[],
  correctlyAnsweredIds: string[],
  targetTier: DifficultyTier,
  excludeId?: string
): Question | null {
  const remaining = questions.filter((q) => !correctlyAnsweredIds.includes(q.id) && q.id !== excludeId);
  if (remaining.length === 0) return null;
  return remaining.reduce((closest, q) =>
    Math.abs(q.difficultyTier - targetTier) < Math.abs(closest.difficultyTier - targetTier) ? q : closest
  );
}

/** Player starts with one life per question in the set — mirrors how enemy HP loses one share per correct answer. */
export function getMaxPlayerHp(questions: Question[]): number {
  return Math.max(1, questions.length);
}

export function createBattleState(topicId: TopicId, questions: Question[], thetaStudent: number): BattleEngineState {
  const currentTier = pickNextDifficultyTier(thetaStudent);
  const firstQuestion = pickQuestion(questions, [], currentTier) ?? questions[0];
  const maxPlayerHp = getMaxPlayerHp(questions);
  return {
    currentTopicId: topicId,
    questions,
    correctlyAnsweredIds: [],
    currentQuestionId: firstQuestion.id,
    thetaStudent,
    currentTier,
    hintFrequency: computeHintFrequency(firstQuestion.difficultyBeta, thetaStudent),
    questionsAnswered: 0,
    correctStreak: 0,
    hintsUsedThisSession: 0,
    playerHp: maxPlayerHp,
    maxPlayerHp,
    isDefeated: false,
  };
}

export function getCurrentQuestion(state: BattleEngineState): Question {
  const question = state.questions.find((q) => q.id === state.currentQuestionId);
  if (!question) {
    throw new Error(`Battle state points at missing question ${state.currentQuestionId}`);
  }
  return question;
}

export interface SubmitAnswerInput {
  selectedIndex: number;
  responseTimeMs: number;
}

/**
 * Pure transition: one answer in, the next engine state + any "Tuklas noticed..."
 * notices out. Kept free of React/UI so it can be unit-tested with mocked
 * signal inputs per the PRD's three-layer testing requirement.
 */
export function submitAnswer(state: BattleEngineState, input: SubmitAnswerInput): SubmitAnswerResult {
  const current = getCurrentQuestion(state);
  const wasCorrect = input.selectedIndex === current.correctIndex;

  const eloResult = updateElo({
    thetaStudent: state.thetaStudent,
    betaQuestion: current.difficultyBeta,
    isCorrect: wasCorrect,
    responseTimeMs: input.responseTimeMs,
  });

  const correctlyAnsweredIds = wasCorrect
    ? [...state.correctlyAnsweredIds, current.id]
    : state.correctlyAnsweredIds;
  const correctStreak = wasCorrect ? state.correctStreak + 1 : 0;
  const playerHp = wasCorrect ? state.playerHp : Math.max(0, state.playerHp - 1);
  const isDefeated = playerHp <= 0;

  const nextTier = pickNextDifficultyTier(eloResult.thetaStudent);
  const nextHintFrequency = computeHintFrequency(current.difficultyBeta, eloResult.thetaStudent);

  const notices: TuklasNotice[] = [];
  const difficultyNotice = buildDifficultyNotice(state.currentTier, nextTier, correctStreak);
  if (difficultyNotice) notices.push(difficultyNotice);
  const hintNotice = buildHintNotice(state.hintFrequency, nextHintFrequency);
  if (hintNotice) notices.push(hintNotice);

  const setCleared = !isDefeated && correctlyAnsweredIds.length === state.questions.length;
  const tierDropped = nextTier < state.currentTier;
  const nextQuestion = wasCorrect
    ? pickQuestion(state.questions, correctlyAnsweredIds, nextTier)
    : tierDropped
      ? pickQuestion(state.questions, correctlyAnsweredIds, nextTier, current.id) ?? current
      : current; // PRD §Phase3: an ordinary miss (no tier change) still retries the same question

  const nextState: BattleEngineState = {
    ...state,
    correctlyAnsweredIds,
    currentQuestionId: nextQuestion ? nextQuestion.id : current.id,
    thetaStudent: eloResult.thetaStudent,
    currentTier: nextTier,
    hintFrequency: nextHintFrequency,
    questionsAnswered: state.questionsAnswered + 1,
    correctStreak,
    playerHp,
    isDefeated,
  };

  return { state: nextState, wasCorrect, notices, setCleared };
}

export function revealHint(state: BattleEngineState): BattleEngineState {
  return { ...state, hintsUsedThisSession: state.hintsUsedThisSession + 1 };
}

export { SLOW_RESPONSE_THRESHOLD_MS };
