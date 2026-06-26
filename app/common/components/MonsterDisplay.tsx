import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { fonts, fontSizes, lineHeights } from '../theme/typography';
import { HealthBar } from './HealthBar';

interface MonsterDisplayProps {
  characterName: string;
  hp: number;
  maxHp: number;
  hpRatio: number;
  hpAnimationKey?: string;
}

export function MonsterDisplay({ characterName, hp, maxHp, hpRatio, hpAnimationKey }: MonsterDisplayProps) {
  return (
    <View style={styles.statusBox} testID="monster-status-box">
      <View style={styles.nameRow}>
        <Text style={styles.name}>{characterName.toUpperCase()}</Text>
        <Text style={styles.level}>Lv5</Text>
      </View>
      <HealthBar ratio={hpRatio} animationKey={hpAnimationKey} />
      <Text style={styles.hpNumbers}>{hp}/{maxHp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBox: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 170,
    backgroundColor: colors.battleBoxBg,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.textDark,
    padding: spacing.sm,
  },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    color: colors.textDark,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },
  level: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  hpNumbers: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
});
