import chatbotData from '../../../../data/chatbot_responses.json';
import { ChatbotResponse } from '../models/chatbot';

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
