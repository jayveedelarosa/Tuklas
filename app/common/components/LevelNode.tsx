import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';

export type LevelNodeStatus = 'locked' | 'playable' | 'beaten' | 'comingSoon';

interface MapStarNodeProps {
  index: number;
  status: LevelNodeStatus;
  onPress: () => void;
  testID?: string;
  size?: number;
}

const STAR_SIZE = 40;

/** Map-embedded level star — locked / unlocked pulse / completed gold. */
export function MapStarNode({ index, status, onPress, testID, size = STAR_SIZE }: MapStarNodeProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const disabled = status === 'locked' || status === 'comingSoon';

  useEffect(() => {
    if (status !== 'playable') {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const glyph =
    status === 'locked' || status === 'comingSoon' ? '☆' : status === 'beaten' ? '★' : '⭐';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.hitArea, pressed && !disabled && styles.pressed]}
    >
      <Animated.View
        style={[
          styles.star,
          { width: size, height: size, borderRadius: size / 2 },
          status === 'beaten' && styles.beaten,
          status === 'playable' && styles.playable,
          (status === 'locked' || status === 'comingSoon') && styles.locked,
          status === 'playable' && { transform: [{ scale: pulse }] },
        ]}
      >
        {status === 'playable' && <View style={styles.glowRing} />}
        <Text
          style={[
            styles.glyph,
            disabled && styles.lockedGlyph,
            status === 'beaten' && styles.beatenGlyph,
          ]}
        >
          {glyph}
        </Text>
        <Text style={[styles.levelLabel, disabled && styles.lockedLabel]}>{index}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** @deprecated Use MapStarNode — kept for type exports and backward compatibility. */
export const LevelNode = MapStarNode;

const styles = StyleSheet.create({
  hitArea: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85 },
  star: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  beaten: {
    backgroundColor: '#FFD54F',
    borderColor: '#F9A825',
    shadowColor: '#F9A825',
    shadowOpacity: 0.6,
  },
  playable: {
    backgroundColor: colors.secondary,
    borderColor: '#2A7FA8',
    shadowColor: colors.secondary,
    shadowOpacity: 0.55,
  },
  locked: {
    backgroundColor: '#9E9E9E',
    borderColor: '#757575',
    opacity: 0.55,
  },
  glowRing: {
    position: 'absolute',
    width: '130%',
    height: '130%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(61,165,217,0.45)',
  },
  glyph: { fontSize: fontSizes.lg, color: '#fff' },
  beatenGlyph: { color: '#5D4037', fontSize: fontSizes.xl },
  lockedGlyph: { color: '#E0E0E0', fontSize: fontSizes.md },
  levelLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: '#fff',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lockedLabel: { color: '#ddd', opacity: 0.7 },
});
