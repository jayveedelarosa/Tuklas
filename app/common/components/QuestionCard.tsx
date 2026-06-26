import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
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

const BATTLE_MIN_HEIGHT = 88;

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
  const hintHeight = useRef(new Animated.Value(0)).current;
  const [hintMeasured, setHintMeasured] = useState(0);

  useEffect(() => {
    Animated.timing(hintHeight, {
      toValue: showHint ? hintMeasured : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [showHint, hintMeasured, hintHeight]);

  const onHintLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && h !== hintMeasured) setHintMeasured(h);
  };

  return (
    <View style={[styles.card, battle && styles.cardBattle]} testID="question-card">
      {!battle && <Text style={styles.visualAid}>{TOPIC_GLYPHS[topicId].repeat(3)}</Text>}
      <View style={[battle && styles.battleContent]}>
        <BilingualText
          en={prompt}
          tl={promptTagalog}
          size={battle ? 'sm' : 'lg'}
          align="center"
          color={battle ? '#fff' : undefined}
        />
      </View>
      {battle && hintEn && hintTl ? (
        <Animated.View style={{ height: hintHeight, overflow: 'hidden' }}>
          <View onLayout={onHintLayout} testID="hint-copy">
            <BilingualText en={hintEn} tl={hintTl} size="sm" color="#FFE3C2" align="center" />
          </View>
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
    minHeight: BATTLE_MIN_HEIGHT,
    flex: 1,
  },
  battleContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  visualAid: { fontSize: 36, marginBottom: spacing.sm },
});
