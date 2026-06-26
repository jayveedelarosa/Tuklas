/**
 * BR-07: "any data-load failure on the bundled JSON falls back to a hardcoded
 * 5-question safety set per topic so the demo never crashes mid-battle."
 * This simulates a corrupted bundled JSON file via jest.mock and asserts the
 * repository silently swaps in the safety set instead of throwing.
 */
jest.mock('../features/topics/data/regrouping.json', () => ({
  topicId: 'regrouping',
  questions: 'not-an-array',
}));

describe('questionRepository BR-07 fallback (simulated corrupt bundle)', () => {
  it('returns the hardcoded safety set instead of throwing when the bank is malformed', () => {
    jest.isolateModules(() => {
      const {
        getQuestionBank,
        SAFETY_BANKS,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
      } = require('../features/topics/repository/questionRepository');
      expect(() => getQuestionBank('regrouping')).not.toThrow();
      expect(getQuestionBank('regrouping')).toEqual(SAFETY_BANKS.regrouping);
    });
  });
});
