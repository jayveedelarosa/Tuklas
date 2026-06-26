import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../theme/colors';
import { BilingualText } from './BilingualText';
import { PrimaryButton } from './PrimaryButton';
import { getResponseForBeat, getSampleProblemReply, getAnswerReply } from '../../features/learning/repository/chatbotRepository';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.round(SCREEN_WIDTH * 0.38);

interface PanelMessage {
  id: number;
  text: string;
  /** 'user' renders right-aligned; 'bot' renders left-aligned */
  sender: 'user' | 'bot';
}

interface ChatPanelProps {
  visible: boolean;
  onClose: () => void;
  currentBeat: number | null;
  /** Level ID forwarded from the screen so the chatbot can pull questions from the right level bank. */
  levelId?: string;
  /** Seam for the teammate wiring up real bot logic — called after a message is appended locally. No reply is generated here. */
  onSendMessage?: (text: string) => void;
}

export function ChatPanel({ visible, onClose, currentBeat, levelId, onSendMessage }: ChatPanelProps) {
  const translateX = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const nextId = useRef(0);
  /** Tracks which turn we are in the 2-turn sequence. Odd turns (1, 3, …) = ask a problem; even turns (2, 4, …) = reveal the answer. */
  const turnRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: visible ? 0 : PANEL_WIDTH, duration: 250, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [visible, translateX, backdropOpacity]);

  const pinnedHint = getResponseForBeat(currentBeat);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    // Append the user's message
    const userId = nextId.current++;
    setMessages((prev) => [...prev, { id: userId, text, sender: 'user' }]);
    setDraft('');
    onSendMessage?.(text);

    // Determine the bot's reply based on the current turn
    turnRef.current += 1;
    const isOddTurn = turnRef.current % 2 !== 0;
    const botReply = isOddTurn
      ? getSampleProblemReply(levelId ?? 'level3')
      : getAnswerReply();

    // Combine Filipino and English into one bubble text
    const botText = `${botReply.displayText}\n${botReply.displayTextEn}`;
    const botId = nextId.current++;
    setMessages((prev) => [...prev, { id: botId, text: botText, sender: 'bot' }]);

    // Scroll to the bottom after state updates
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="chatbot-panel-backdrop" />
      </Animated.View>

      <Animated.View style={[styles.panel, { width: PANEL_WIDTH, transform: [{ translateX }] }]} testID="chatbot-panel">
        <SafeAreaView style={styles.panelSafeArea} edges={['top', 'right', 'bottom']}>
          <View style={styles.header}>
            <BilingualText en="Ask Tuklas" tl="Magtanong kay Tuklas" size="sm" />
            <Pressable onPress={onClose} testID="chatbot-panel-close" style={styles.closeButton}>
              <Text style={styles.closeGlyph}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            testID="chatbot-message-list"
          >
            <View style={styles.pinnedHint} testID="chatbot-pinned-hint">
              <BilingualText en={pinnedHint.displayTextEn} tl={pinnedHint.displayText} size="sm" />
            </View>

            {messages.map((message, index) => (
              <View
                key={message.id}
                style={[styles.messageBubble, message.sender === 'bot' ? styles.botBubble : styles.userBubble]}
                testID={`chatbot-message-${index}`}
              >
                <Text style={[styles.messageText, message.sender === 'bot' && styles.botMessageText]}>{message.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type your question..."
              placeholderTextColor={colors.textMuted}
              testID="chatbot-input"
              multiline
            />
            <PrimaryButton
              label="Send"
              labelTagalog="Ipadala"
              onPress={handleSend}
              style={styles.sendButton}
              testID="chatbot-send-button"
            />
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    elevation: 10,
  },
  panelSafeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  closeGlyph: { fontSize: 16, color: colors.textDark, fontWeight: '700' },
  messageList: { flex: 1 },
  messageListContent: { padding: spacing.sm, flexGrow: 1 },
  pinnedHint: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  messageText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  botMessageText: { color: colors.textDark },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 88,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.textDark,
    backgroundColor: colors.background,
  },
  sendButton: { minHeight: 44, minWidth: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
