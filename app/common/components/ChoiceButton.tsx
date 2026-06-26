import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect';

interface ChoiceButtonProps {
  label: string;
  state: ChoiceState;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  /** Smaller, flex-filling variant for tight spaces (e.g. the battle screen's 2x2 grid). */
  compact?: boolean;
}

export function ChoiceButton({ label, state, onPress, disabled, testID, style, compact }: ChoiceButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        compact && styles.baseCompact,
        state === 'selected' && styles.selected,
        state === 'correct' && styles.correct,
        state === 'incorrect' && styles.incorrect,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[styles.label, compact && styles.labelCompact, (state === 'correct' || state === 'incorrect') && styles.outcomeLabel]}
        numberOfLines={compact ? 2 : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseCompact: {
    minHeight: 0,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginBottom: 0,
  },
  selected: { borderColor: colors.secondary, backgroundColor: '#EAF6FC' },
  correct: { borderColor: colors.success, backgroundColor: '#E9F7EA' },
  incorrect: { borderColor: colors.danger, backgroundColor: '#FBEAEA' },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { fontSize: 17, fontWeight: '700', color: colors.textDark, textAlign: 'center' },
  labelCompact: { fontSize: 12 },
  outcomeLabel: { fontWeight: '800' },
});
