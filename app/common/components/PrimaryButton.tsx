import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii } from '../theme/colors';
import { fonts, fontSizes, lineHeights, uiSpacing } from '../theme/typography';

interface PrimaryButtonProps {
  label: string;
  labelTagalog?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  compact?: boolean;
  icon?: ImageSourcePropType;
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
  compact,
  icon,
}: PrimaryButtonProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        compact && styles.baseCompact,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Image source={icon} style={[styles.icon, compact && styles.iconCompact]} /> : null}
        <View style={styles.labelStack}>
          <Text style={[styles.label, compact && styles.labelCompact, variant === 'ghost' && styles.ghostLabel]}>
            {label}
          </Text>
          {labelTagalog ? (
            <Text
              style={[
                styles.labelTagalog,
                compact && styles.labelTagalogCompact,
                variant === 'ghost' && styles.ghostLabel,
              ]}
            >
              {labelTagalog}
            </Text>
          ) : null}
        </View>
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
    paddingVertical: uiSpacing.buttonPaddingV,
    paddingHorizontal: uiSpacing.buttonPaddingH,
  },
  baseCompact: { minHeight: 32, minWidth: 0, paddingVertical: 4, paddingHorizontal: 12 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  ghost: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.97 }] },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 22, height: 22, resizeMode: 'contain', marginRight: 6 },
  iconCompact: { width: 16, height: 16, marginRight: 4 },
  labelStack: { alignItems: 'center' },
  label: {
    color: '#fff',
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  labelTagalog: {
    color: '#fff',
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    opacity: 0.9,
    marginTop: 2,
  },
  ghostLabel: { color: colors.textDark },
  labelCompact: { fontSize: fontSizes.sm, lineHeight: fontSizes.sm * lineHeights.tight },
  labelTagalogCompact: { fontSize: fontSizes.xs, lineHeight: fontSizes.xs * lineHeights.tight, marginTop: 0 },
});
