import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { BilingualText } from './BilingualText';
import { TopicId } from '../../features/topics/models/question';

interface QuestionCardProps {
  prompt: string;
  promptTagalog: string;
  topicId: TopicId;
  variant?: 'default' | 'battle';
  showHint?: boolean;
  hintEn?: string;
  hintTl?: string;
}

const TOPIC_GLYPHS: Record<TopicId, string> = {
  'number-sense': '🔢',
  'one-more-one-less': '🥭',
  regrouping: '🟢',
};

const HINT_ANIM_MS = 180;

export function QuestionCard({
  prompt,
  promptTagalog,
  topicId,
  variant = 'default',
  showHint,
  hintEn,
  hintTl,
}: QuestionCardProps) {
  const battle = variant === 'battle';
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintTranslateY = useRef(new Animated.Value(-6)).current;

  useEffect(() => {
    if (!battle) return;
    if (showHint) {
      Animated.parallel([
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: HINT_ANIM_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(hintTranslateY, {
          toValue: 0,
          duration: HINT_ANIM_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      hintOpacity.setValue(0);
      hintTranslateY.setValue(-6);
    }
  }, [showHint, battle, hintOpacity, hintTranslateY]);

  return (
    <View style={[styles.card, battle && styles.cardBattle]} testID="question-card">
      {!battle && <Text style={styles.visualAid}>{TOPIC_GLYPHS[topicId].repeat(3)}</Text>}
      <View style={battle ? styles.battleContent : undefined}>
        <BilingualText
          en={prompt}
          tl={promptTagalog}
          size={battle ? 'sm' : 'lg'}
          align="center"
          color={battle ? '#fff' : undefined}
        />
      </View>
      {battle && showHint && hintEn && hintTl ? (
        <Animated.View
          style={[
            styles.hintWrap,
            { opacity: hintOpacity, transform: [{ translateY: hintTranslateY }] },
          ]}
          testID="hint-copy"
        >
          <BilingualText en={hintEn} tl={hintTl} size="sm" color="#FFE3C2" align="center" />
        </Animated.View>
      ) : null}
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
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  battleContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  hintWrap: {
    marginTop: spacing.sm,
    width: '100%',
  },
  visualAid: { fontSize: 36, marginBottom: spacing.sm },
});
