import { createBattleState, getCurrentQuestion, submitAnswer, revealHint } from '../features/battle/service/battleEngine';
import { getQuestionBank } from '../features/topics/repository/questionRepository';
import { HINT_OFFER_THRESHOLD } from '../features/battle/service/hintFrequency';

const regroupingQuestions = getQuestionBank('regrouping');

function wrongIndexFor(correctIndex: number, choicesLength: number): number {
  return (correctIndex + 1) % choicesLength;
}

describe('Battle Engine (mocked signal inputs, PRD three-layer testing)', () => {
  it('starts a fresh student (theta 0) at difficulty tier 0', () => {
    const state = createBattleState('regrouping', regroupingQuestions, 0);
    expect(state.currentTier).toBe(0);
    expect(state.questionsAnswered).toBe(0);
    expect(state.correctStreak).toBe(0);
  });

  it('an incorrect answer retries the same question rather than hard-failing (PRD §Phase3)', () => {
    let state = createBattleState('regrouping', regroupingQuestions, 0);
    const question = getCurrentQuestion(state);
    const result = submitAnswer(state, {
      selectedIndex: wrongIndexFor(question.correctIndex, question.choices.length),
      responseTimeMs: 4000,
    });
    expect(result.wasCorrect).toBe(false);
    expect(result.state.currentQuestionId).toBe(question.id);
    expect(result.state.correctStreak).toBe(0);
  });

  it('a correct answer advances to a different question and raises theta', () => {
    const state = createBattleState('regrouping', regroupingQuestions, 0);
    const question = getCurrentQuestion(state);
    const result = submitAnswer(state, { selectedIndex: question.correctIndex, responseTimeMs: 2000 });
    expect(result.wasCorrect).toBe(true);
    expect(result.state.thetaStudent).toBeGreaterThan(0);
    expect(result.state.correctlyAnsweredIds).toContain(question.id);
  });

  it('repeated correct streaks escalate difficulty and surface a "Tuklas noticed" notice', () => {
    let state = createBattleState('regrouping', regroupingQuestions, 0);
    let lastNotices = [] as ReturnType<typeof submitAnswer>['notices'];
    for (let i = 0; i < regroupingQuestions.length; i += 1) {
      const question = getCurrentQuestion(state);
      const result = submitAnswer(state, { selectedIndex: question.correctIndex, responseTimeMs: 1500 });
      state = result.state;
      lastNotices = result.notices;
      if (result.setCleared) break;
    }
    expect(lastNotices.length + state.correctStreak).toBeGreaterThan(0);
    expect(state.correctlyAnsweredIds.length).toBe(regroupingQuestions.length);
  });

  it('repeated struggle (wrong answers) eventually crosses the hint-offer threshold', () => {
    let state = createBattleState('regrouping', regroupingQuestions, 0);
    let hintNoticeFired = false;
    for (let i = 0; i < 6; i += 1) {
      const question = getCurrentQuestion(state);
      const result = submitAnswer(state, {
        selectedIndex: wrongIndexFor(question.correctIndex, question.choices.length),
        responseTimeMs: 7000,
      });
      state = result.state;
      if (result.notices.some((n) => n.id === 'hint-offered')) hintNoticeFired = true;
    }
    expect(state.hintFrequency).toBeGreaterThanOrEqual(HINT_OFFER_THRESHOLD);
    expect(hintNoticeFired).toBe(true);
  });

  it('a struggling run eventually drops the difficulty tier and notices the student', () => {
    let state = createBattleState('regrouping', regroupingQuestions, 0);
    let difficultyDownFired = false;
    for (let i = 0; i < 6; i += 1) {
      const question = getCurrentQuestion(state);
      const result = submitAnswer(state, {
        selectedIndex: wrongIndexFor(question.correctIndex, question.choices.length),
        responseTimeMs: 7000,
      });
      state = result.state;
      if (result.notices.some((n) => n.id === 'difficulty-down')) difficultyDownFired = true;
    }
    expect(state.currentTier).toBeLessThan(0);
    expect(difficultyDownFired).toBe(true);
  });

  it('the question set clears only once every question has been answered correctly at least once', () => {
    let state = createBattleState('regrouping', regroupingQuestions, 0);
    let setCleared = false;
    let guard = 0;
    while (!setCleared && guard < 50) {
      const question = getCurrentQuestion(state);
      const result = submitAnswer(state, { selectedIndex: question.correctIndex, responseTimeMs: 2000 });
      state = result.state;
      setCleared = result.setCleared;
      guard += 1;
    }
    expect(setCleared).toBe(true);
    expect(new Set(state.correctlyAnsweredIds).size).toBe(regroupingQuestions.length);
  });

  it('revealHint increments the session hint counter without altering the question', () => {
    const state = createBattleState('regrouping', regroupingQuestions, 0);
    const afterHint = revealHint(state);
    expect(afterHint.hintsUsedThisSession).toBe(state.hintsUsedThisSession + 1);
    expect(afterHint.currentQuestionId).toBe(state.currentQuestionId);
  });

  it('starts with one life per question, mirroring how enemy HP tracks correct answers', () => {
    const state = createBattleState('regrouping', regroupingQuestions, 0);
    expect(state.maxPlayerHp).toBe(regroupingQuestions.length);
    expect(state.playerHp).toBe(regroupingQuestions.length);
    expect(state.isDefeated).toBe(false);
  });

  it('a wrong answer costs the player one HP without clearing the set', () => {
    const state = createBattleState('regrouping', regroupingQuestions, 0);
    const question = getCurrentQuestion(state);
    const result = submitAnswer(state, {
      selectedIndex: wrongIndexFor(question.correctIndex, question.choices.length),
      responseTimeMs: 4000,
    });
    expect(result.state.playerHp).toBe(state.playerHp - 1);
    expect(result.state.isDefeated).toBe(false);
    expect(result.setCleared).toBe(false);
  });

  it('running out of HP marks the battle as defeated and stops clearing the set', () => {
    let state = createBattleState('regrouping', regroupingQuestions, 0);
    let result = submitAnswer(state, { selectedIndex: -1, responseTimeMs: 4000 });
    for (let i = 1; i < state.maxPlayerHp; i += 1) {
      state = result.state;
      result = submitAnswer(state, { selectedIndex: -1, responseTimeMs: 4000 });
    }
    expect(result.state.playerHp).toBe(0);
    expect(result.state.isDefeated).toBe(true);
    expect(result.setCleared).toBe(false);
  });
});
