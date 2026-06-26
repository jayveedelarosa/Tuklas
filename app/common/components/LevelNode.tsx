import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme/colors';

export type LevelNodeStatus = 'locked' | 'playable' | 'beaten' | 'comingSoon';

interface LevelNodeProps {
  index: number;
  status: LevelNodeStatus;
  onPress: () => void;
  testID?: string;
}

export function LevelNode({ index, status, onPress, testID }: LevelNodeProps) {
  const disabled = status === 'locked' || status === 'comingSoon';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.node,
        status === 'beaten' && styles.beaten,
        status === 'playable' && styles.playable,
        (status === 'locked' || status === 'comingSoon') && styles.locked,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.lockedLabel]}>
        {status === 'locked' || status === 'comingSoon' ? '🔒' : status === 'beaten' ? '★' : index}
      </Text>
    </Pressable>
  );
}

const SIZE = 52;

const styles = StyleSheet.create({
  node: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  beaten: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  playable: { backgroundColor: colors.secondary, borderColor: '#2A7FA8' },
  locked: { backgroundColor: colors.locked, borderColor: colors.locked },
  pressed: { transform: [{ scale: 0.94 }] },
  label: { fontSize: 18, fontWeight: '800', color: '#fff' },
  lockedLabel: { color: '#fff', opacity: 0.7, fontSize: 16 },
});
