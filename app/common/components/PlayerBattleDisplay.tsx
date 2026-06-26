import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { fonts, fontSizes, lineHeights } from '../theme/typography';
import { HealthBar } from './HealthBar';

interface PlayerBattleDisplayProps {
  hp: number;
  maxHp: number;
  hpRatio: number;
  hpAnimationKey?: string;
}

export function PlayerBattleDisplay({ hp, maxHp, hpRatio, hpAnimationKey }: PlayerBattleDisplayProps) {
  return (
    <View style={styles.statusBox} testID="player-status-box">
      <View style={styles.nameRow}>
        <Text style={styles.name}>BUBOY</Text>
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
    top: spacing.sm,
    left: spacing.sm,
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
