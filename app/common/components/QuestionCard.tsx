import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { BilingualText } from './BilingualText';
import { TopicId } from '../../features/topics/models/question';

interface QuestionCardProps {
  prompt: string;
  promptTagalog: string;
  topicId: TopicId;
  variant?: 'default' | 'battle';
}

const TOPIC_GLYPHS: Record<TopicId, string> = {
  'number-sense': '🔢',
  'one-more-one-less': '🥭',
  regrouping: '🟢',
};

/** Visual aid (per UI spec) is a themed glyph band above the prompt — real illustrations are a post-hackathon swap. */
export function QuestionCard({ prompt, promptTagalog, topicId, variant = 'default' }: QuestionCardProps) {
  const battle = variant === 'battle';
  return (
    <View style={[styles.card, battle && styles.cardBattle]} testID="question-card">
      {!battle && <Text style={styles.visualAid}>{TOPIC_GLYPHS[topicId].repeat(3)}</Text>}
      <BilingualText
        en={prompt}
        tl={promptTagalog}
        size={battle ? 'sm' : 'lg'}
        align={battle ? 'left' : 'center'}
        color={battle ? '#fff' : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardBattle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  visualAid: { fontSize: 36, marginBottom: spacing.sm },
});
