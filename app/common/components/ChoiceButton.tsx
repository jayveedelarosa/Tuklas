import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii } from '../theme/colors';
import { fonts, fontSizes, lineHeights } from '../theme/typography';

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect';

interface ChoiceButtonProps {
  label: string;
  state: ChoiceState;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
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
        style={[
          styles.label,
          compact && styles.labelCompact,
          (state === 'correct' || state === 'incorrect') && styles.outcomeLabel,
        ]}
        numberOfLines={compact ? 3 : undefined}
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseCompact: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 40,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 0,
    overflow: 'hidden',
  },
  selected: { borderColor: colors.secondary, backgroundColor: '#EAF6FC' },
  correct: { borderColor: colors.success, backgroundColor: '#E9F7EA' },
  incorrect: { borderColor: colors.danger, backgroundColor: '#FBEAEA' },
  pressed: { transform: [{ scale: 0.98 }] },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    color: colors.textDark,
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.relaxed,
    flexShrink: 1,
  },
  outcomeLabel: { fontFamily: fonts.display },
});
