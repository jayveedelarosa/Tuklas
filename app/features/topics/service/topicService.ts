import { TOPICS, Topic, TopicId } from '../models/question';

export function getTopic(topicId: TopicId): Topic {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) {
    throw new Error(`Unknown topic: ${topicId}`);
  }
  return topic;
}

export function listTopics(): Topic[] {
  return TOPICS;
}
