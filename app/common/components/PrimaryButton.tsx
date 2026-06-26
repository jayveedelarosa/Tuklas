import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

interface PrimaryButtonProps {
  label: string;
  labelTagalog?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/** Bottom-anchored primary action button, sized well past the 48x48dp minimum for Grade 1 hands. */
export function PrimaryButton({
  label,
  labelTagalog,
  onPress,
  variant = 'primary',
  disabled,
  style,
  testID,
}: PrimaryButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.labelStack}>
        <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
        {labelTagalog ? (
          <Text style={[styles.labelTagalog, variant === 'ghost' && styles.ghostLabel]}>{labelTagalog}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    minWidth: 64,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  ghost: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.97 }] },
  labelStack: { alignItems: 'center' },
  label: { color: '#fff', fontSize: 18, fontWeight: '800' },
  labelTagalog: { color: '#fff', fontSize: 13, fontWeight: '500', opacity: 0.9, marginTop: 1 },
  ghostLabel: { color: colors.textDark },
});
