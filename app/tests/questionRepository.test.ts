import {
  getQuestionBank,
  getQuestionsByIds,
  isValidBank,
  isValidQuestion,
  SAFETY_BANKS,
} from '../features/topics/repository/questionRepository';
import { TOPICS } from '../features/topics/models/question';

describe('questionRepository (data access layer)', () => {
  it('loads a well-formed bundled bank for every topic', () => {
    for (const topic of TOPICS) {
      const bank = getQuestionBank(topic.id);
      expect(bank.length).toBeGreaterThanOrEqual(3);
      expect(bank.every(isValidQuestion)).toBe(true);
      expect(bank.some((q) => q.topicId === topic.id)).toBe(true);
    }
  });

  it('BR-07: falls back to the hardcoded safety set when the bank shape is invalid', () => {
    expect(isValidBank({ questions: [] })).toBe(false);
    expect(isValidBank({ questions: SAFETY_BANKS.regrouping })).toBe(true);
    expect(isValidBank(null)).toBe(false);
    expect(isValidBank({ notQuestions: [] })).toBe(false);
  });

  it('rejects a question missing required fields', () => {
    expect(isValidQuestion({ id: 'x' })).toBe(false);
    expect(isValidQuestion(SAFETY_BANKS.regrouping[0])).toBe(true);
  });

  it('getQuestionsByIds falls back to the full bank when ids are unknown', () => {
    const result = getQuestionsByIds('regrouping', ['does-not-exist']);
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it('getQuestionsByIds returns the exact ordered subset when ids match', () => {
    const bank = getQuestionBank('regrouping');
    const ids = [bank[1].id, bank[0].id];
    const result = getQuestionsByIds('regrouping', ids);
    expect(result.map((q) => q.id)).toEqual(ids);
  });
});
