import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { uiIcons } from '../theme/uiIcons';
import { ChatPanel } from './ChatPanel';

interface ChatBubbleProps {
  currentBeat: number | null;
  /** Seam for the teammate wiring up real bot logic — forwarded from ChatPanel. */
  onSendMessage?: (text: string) => void;
}

/** Chat entry point icon shown through Phase 2 — opens the slide-in ChatPanel, no live API call. */
export function ChatBubble({ currentBeat, onSendMessage }: ChatBubbleProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <View style={styles.wrapper} pointerEvents="box-none">
        <Pressable style={styles.icon} onPress={() => setPanelOpen(true)} testID="chatbot-icon">
          <Image source={uiIcons.chatBubble} style={styles.iconGlyph} />
        </Pressable>
      </View>

      <ChatPanel
        visible={panelOpen}
        onClose={() => setPanelOpen(false)}
        currentBeat={currentBeat}
        onSendMessage={onSendMessage}
      />
    </>
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
  iconGlyph: { width: 24, height: 24, resizeMode: 'contain' },
});
