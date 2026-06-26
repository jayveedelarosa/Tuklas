import chatbotData from '../../../../data/chatbot_responses.json';
import levelsData from '../../../../data/levels.json';
import { ChatbotResponse } from '../models/chatbot';

interface LevelQuestion {
  id: string;
  topic: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
}

const FALLBACK_RESPONSE: ChatbotResponse = {
  triggerKey: 'default_fallback',
  appliesDuringBeat: null,
  displayText: 'Subukan mong pindutin ang mga bagay sa screen para alamin pa!',
  displayTextEn: 'Try tapping things on screen to learn more!',
};

function listResponses(): ChatbotResponse[] {
  try {
    const responses = (chatbotData as { responses?: unknown[] }).responses;
    return Array.isArray(responses) ? (responses as ChatbotResponse[]) : [FALLBACK_RESPONSE];
  } catch {
    return [FALLBACK_RESPONSE];
  }
}

/** Pure lookup table, no LLM call — hardcoded so every demo run is identical (BR-07 spirit: never let a missing key crash the chatbot icon). */
export function getResponseForBeat(beat: number | null): ChatbotResponse {
  const responses = listResponses();
  const match = responses.find((r) => r.appliesDuringBeat === beat);
  return match ?? responses.find((r) => r.triggerKey === 'default_fallback') ?? FALLBACK_RESPONSE;
}

/** Holds the last question shown so the answer reply always matches it. */
let lastPickedQuestion: LevelQuestion | null = null;

/**
 * Turn 1 — picks a random question from the active level's bank and returns it
 * as a bilingual bot message (prompt only, no choices shown).
 */
export function getSampleProblemReply(levelId: string): { displayText: string; displayTextEn: string } {
  try {
    const levels = (levelsData as { levels: Array<{ id: string; questions: LevelQuestion[] }> }).levels;
    const level = levels.find((l) => l.id === levelId);
    const questions = level?.questions ?? [];
    if (questions.length === 0) {
      lastPickedQuestion = null;
      return {
        displayText: 'Subukan nating mag-practice! Wala pang available na tanong para sa level na ito.',
        displayTextEn: "Let's practice! No questions available for this level yet.",
      };
    }
    const picked = questions[Math.floor(Math.random() * questions.length)];
    lastPickedQuestion = picked;
    return {
      displayText: `Subukan mo ito: ${picked.prompt}`,
      displayTextEn: `Try this one: ${picked.prompt}`,
    };
  } catch {
    lastPickedQuestion = null;
    return {
      displayText: 'Subukan mo itong suliranin!',
      displayTextEn: 'Try out this problem!',
    };
  }
}

/**
 * Turn 2 — returns the correct answer for the last question picked by getSampleProblemReply.
 */
export function getAnswerReply(): { displayText: string; displayTextEn: string } {
  if (!lastPickedQuestion) {
    return {
      displayText: 'Ang sagot ay nasa iyong puso! (Walang narekord na tanong.)',
      displayTextEn: 'The answer is in your heart! (No question was recorded.)',
    };
  }
  const correctAnswer = lastPickedQuestion.choices[lastPickedQuestion.correctIndex];
  return {
    displayText: `Ang sagot ay: ${correctAnswer}`,
    displayTextEn: `The answer is: ${correctAnswer}`,
  };
}
