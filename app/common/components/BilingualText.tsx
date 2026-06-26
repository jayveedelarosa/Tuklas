import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface BilingualTextProps {
  en: string;
  tl: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  align?: 'left' | 'center';
}

/** BR-08: every English UI string ships with a Tagalog line directly beneath it. */
export function BilingualText({ en, tl, size = 'md', color = colors.textDark, align = 'left' }: BilingualTextProps) {
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      <Text style={[styles[`${size}En`], { color, textAlign: align }]}>{en}</Text>
      <Text style={[styles[`${size}Tl`], { color, textAlign: align }]}>{tl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  smEn: { fontSize: 13, fontWeight: '600' },
  smTl: { fontSize: 11, fontWeight: '400', opacity: 0.75, marginTop: 1 },
  mdEn: { fontSize: 17, fontWeight: '700' },
  mdTl: { fontSize: 14, fontWeight: '400', opacity: 0.75, marginTop: 2 },
  lgEn: { fontSize: 24, fontWeight: '800' },
  lgTl: { fontSize: 17, fontWeight: '500', opacity: 0.75, marginTop: 4 },
});
