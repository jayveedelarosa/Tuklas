import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { ChatbotResponse } from '../../features/learning/models/chatbot';
import { getResponseForBeat } from '../../features/learning/repository/chatbotRepository';

interface ChatBubbleProps {
  currentBeat: number | null;
}

/** Hardcoded-response chatbot icon shown through Phase 2 — no live API call. */
export function ChatBubble({ currentBeat }: ChatBubbleProps) {
  const [response, setResponse] = useState<ChatbotResponse | null>(null);

  const handlePress = () => {
    setResponse(getResponseForBeat(currentBeat));
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {response ? (
        <Pressable style={styles.bubble} onPress={() => setResponse(null)} testID="chatbot-bubble-message">
          <Text style={styles.bubbleEn}>{response.displayTextEn}</Text>
          <Text style={styles.bubbleTl}>{response.displayText}</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.icon} onPress={handlePress} testID="chatbot-icon">
        <Text style={styles.iconGlyph}>💬</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, alignItems: 'flex-end' },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  iconGlyph: { fontSize: 24 },
  bubble: {
    maxWidth: 220,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  bubbleEn: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  bubbleTl: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
