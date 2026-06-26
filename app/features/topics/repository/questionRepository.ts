import { Question, TopicId } from '../models/question';
import numberSenseBank from '../data/number-sense.json';
import oneMoreOneLessBank from '../data/one-more-one-less.json';
import regroupingBank from '../data/regrouping.json';

/**
 * BR-07 safety net: if a bundled bank fails to parse or is shaped wrong,
 * the student never sees a crash or raw error — they silently get this
 * hardcoded 5-question set instead so the demo never stalls mid-battle.
 */
export const SAFETY_BANKS: Record<TopicId, Question[]> = {
  'number-sense': [
    { id: 'safe_ns_1', topicId: 'number-sense', prompt: 'How do you write 2 in words?', promptTagalog: 'Paano isusulat sa salita ang 2?', difficultyTier: -1, difficultyBeta: -0.5, choices: ['Dalawa', 'Isa', 'Tatlo', 'Apat'], correctIndex: 0, sourceModule: 'Module 1' },
    { id: 'safe_ns_2', topicId: 'number-sense', prompt: 'Which numeral matches "Lima"?', promptTagalog: 'Alin ang tambilang ng "Lima"?', difficultyTier: 0, difficultyBeta: 0, choices: ['5', '4', '6', '15'], correctIndex: 0, sourceModule: 'Module 1' },
    { id: 'safe_ns_3', topicId: 'number-sense', prompt: 'What is 10 in words?', promptTagalog: 'Ano ang 10 sa salita?', difficultyTier: 0, difficultyBeta: 0.1, choices: ['Sampu', 'Siyam', 'Labing-isa', 'Isandaan'], correctIndex: 0, sourceModule: 'Module 1' },
    { id: 'safe_ns_4', topicId: 'number-sense', prompt: 'What is 50 in words?', promptTagalog: 'Ano ang 50 sa salita?', difficultyTier: 1, difficultyBeta: 0.6, choices: ['Limampu', 'Limang', 'Apatnapu', 'Animnapu'], correctIndex: 0, sourceModule: 'Module 1' },
    { id: 'safe_ns_5', topicId: 'number-sense', prompt: 'What is 99 in words?', promptTagalog: 'Ano ang 99 sa salita?', difficultyTier: 1, difficultyBeta: 0.8, choices: ["Siyamnapu't siyam", "Siyamnapu", "Walumpu't siyam", 'Isandaan'], correctIndex: 0, sourceModule: 'Module 1' },
  ],
  'one-more-one-less': [
    { id: 'safe_omol_1', topicId: 'one-more-one-less', prompt: 'What is one more than 3?', promptTagalog: '3 higit ng isa ay ____.', difficultyTier: -1, difficultyBeta: -0.5, choices: ['4', '2', '3', '5'], correctIndex: 0, sourceModule: 'Module 2' },
    { id: 'safe_omol_2', topicId: 'one-more-one-less', prompt: 'What is one less than 10?', promptTagalog: '10 mas kaunti ng isa ay ____.', difficultyTier: 0, difficultyBeta: 0, choices: ['9', '11', '10', '8'], correctIndex: 0, sourceModule: 'Module 2' },
    { id: 'safe_omol_3', topicId: 'one-more-one-less', prompt: 'What is one more than 19?', promptTagalog: '19 higit ng isa ay ____.', difficultyTier: 0, difficultyBeta: 0.1, choices: ['20', '18', '19', '21'], correctIndex: 0, sourceModule: 'Module 2' },
    { id: 'safe_omol_4', topicId: 'one-more-one-less', prompt: 'What is one less than 50?', promptTagalog: '50 mas kaunti ng isa ay ____.', difficultyTier: 1, difficultyBeta: 0.6, choices: ['49', '51', '48', '50'], correctIndex: 0, sourceModule: 'Module 2' },
    { id: 'safe_omol_5', topicId: 'one-more-one-less', prompt: 'What is one more than 99?', promptTagalog: '99 higit ng isa ay ____.', difficultyTier: 1, difficultyBeta: 0.8, choices: ['100', '98', '99', '101'], correctIndex: 0, sourceModule: 'Module 2' },
  ],
  regrouping: [
    { id: 'safe_rg_1', topicId: 'regrouping', prompt: 'What is 12 in tens and ones?', promptTagalog: 'Ano ang 12 sa tens at ones?', difficultyTier: -1, difficultyBeta: -0.5, choices: ['1 tens 2 ones', '2 tens 1 ones', '1 tens 1 ones', '0 tens 12 ones'], correctIndex: 0, sourceModule: 'Module 3' },
    { id: 'safe_rg_2', topicId: 'regrouping', prompt: 'What is 20 in tens and ones?', promptTagalog: 'Ano ang 20 sa tens at ones?', difficultyTier: 0, difficultyBeta: 0, choices: ['2 tens 0 ones', '0 tens 2 ones', '1 tens 0 ones', '20 tens 0 ones'], correctIndex: 0, sourceModule: 'Module 3' },
    { id: 'safe_rg_3', topicId: 'regrouping', prompt: 'What is 33 in tens and ones?', promptTagalog: 'Ano ang 33 sa tens at ones?', difficultyTier: 0, difficultyBeta: 0.1, choices: ['3 tens 3 ones', '3 tens 0 ones', '33 tens 0 ones', '0 tens 33 ones'], correctIndex: 0, sourceModule: 'Module 3' },
    { id: 'safe_rg_4', topicId: 'regrouping', prompt: '50 objects make how many groups of ten?', promptTagalog: 'Ang 50 bagay ay may ilang pangkat ng tigsasampu?', difficultyTier: 1, difficultyBeta: 0.6, choices: ['5 pangkat, 0 naiwan', '50 pangkat, 0 naiwan', '5 pangkat, 5 naiwan', '0 pangkat, 50 naiwan'], correctIndex: 0, sourceModule: 'Module 3' },
    { id: 'safe_rg_5', topicId: 'regrouping', prompt: 'What is 100 equivalent to in hundreds, tens, and ones?', promptTagalog: 'Ang 100 ay katumbas ng ilang hundreds, tens, at ones?', difficultyTier: 1, difficultyBeta: 0.8, choices: ['1 hundreds, 0 tens, 0 ones', '0 hundreds, 10 tens, 0 ones', '1 hundreds, 1 tens, 0 ones', '10 hundreds, 0 tens, 0 ones'], correctIndex: 0, sourceModule: 'Module 3' },
  ],
};

const BUNDLED_BANKS: Record<TopicId, unknown> = {
  'number-sense': numberSenseBank,
  'one-more-one-less': oneMoreOneLessBank,
  regrouping: regroupingBank,
};

export function isValidQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) return false;
  const q = value as Record<string, unknown>;
  return (
    typeof q.id === 'string' &&
    typeof q.prompt === 'string' &&
    typeof q.promptTagalog === 'string' &&
    Array.isArray(q.choices) &&
    q.choices.length >= 2 &&
    typeof q.correctIndex === 'number' &&
    q.correctIndex >= 0 &&
    q.correctIndex < q.choices.length
  );
}

export function isValidBank(bank: unknown): bank is { questions: Question[] } {
  if (typeof bank !== 'object' || bank === null) return false;
  const candidate = (bank as Record<string, unknown>).questions;
  return Array.isArray(candidate) && candidate.length >= 3 && candidate.every(isValidQuestion);
}

/**
 * Loads the bundled question bank for a topic, falling back to the
 * hardcoded safety set on any shape/parse failure (BR-07). Never throws.
 */
export function getQuestionBank(topicId: TopicId): Question[] {
  try {
    const bank = BUNDLED_BANKS[topicId];
    if (isValidBank(bank)) {
      return bank.questions;
    }
    return SAFETY_BANKS[topicId];
  } catch {
    return SAFETY_BANKS[topicId];
  }
}

export function getQuestionsByIds(topicId: TopicId, ids: string[]): Question[] {
  const bank = getQuestionBank(topicId);
  const byId = new Map(bank.map((q) => [q.id, q]));
  const found = ids.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));
  return found.length === ids.length && found.length > 0 ? found : bank;
}
