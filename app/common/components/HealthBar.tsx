import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme/colors';

interface HealthBarProps {
  ratio: number; // 0..1
}

/** Pure presentational bar — caller decides what the ratio means (enemy progress, player lives, etc). */
export function HealthBar({ ratio }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <View style={styles.track} testID="monster-health-bar">
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: clamped > 0.3 ? colors.hpFull : colors.hpLow }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 14, borderRadius: radii.pill, backgroundColor: '#00000022', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill },
});
