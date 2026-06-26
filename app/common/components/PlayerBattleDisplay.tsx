import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { HealthBar } from './HealthBar';

interface PlayerBattleDisplayProps {
  hp: number;
  maxHp: number;
  hpRatio: number;
}

/**
 * Player status box only — Buboy's sprite is already painted into the
 * Level 3 background art, so this renders no Image of its own (doing so
 * would duplicate the character). Anchored top-left, swapped with
 * MonsterDisplay's box per user feedback.
 */
export function PlayerBattleDisplay({ hp, maxHp, hpRatio }: PlayerBattleDisplayProps) {
  return (
    <View style={styles.statusBox} testID="player-status-box">
      <View style={styles.nameRow}>
        <Text style={styles.name}>BUBOY</Text>
        <Text style={styles.level}>Lv5</Text>
      </View>
      <HealthBar ratio={hpRatio} />
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
  name: { fontSize: 13, fontWeight: '800', color: colors.textDark },
  level: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  hpNumbers: { fontSize: 10, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
});
