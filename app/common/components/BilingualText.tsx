import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes, lineHeights } from '../theme/typography';

interface BilingualTextProps {
  en: string;
  tl: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  align?: 'left' | 'center';
  icon?: ImageSourcePropType;
}

/** BR-08: every English UI string ships with a Tagalog line directly beneath it. */
export function BilingualText({ en, tl, size = 'md', color = colors.textDark, align = 'left', icon }: BilingualTextProps) {
  return (
    <View style={styles.row}>
      {icon ? <Image source={icon} style={styles.icon} /> : null}
      <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }}>
        <Text style={[styles[`${size}En`], { color, textAlign: align }]}>{en}</Text>
        <Text style={[styles[`${size}Tl`], { color, textAlign: align }]}>{tl}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 22, height: 22, resizeMode: 'contain', marginRight: 6 },
  smEn: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  smTl: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.relaxed,
    opacity: 0.8,
    marginTop: 2,
  },
  mdEn: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  mdTl: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
    opacity: 0.8,
    marginTop: 4,
  },
  lgEn: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.normal,
  },
  lgTl: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.relaxed,
    opacity: 0.8,
    marginTop: 4,
  },
});
