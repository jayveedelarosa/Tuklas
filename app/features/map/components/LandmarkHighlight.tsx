import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../../common/theme/colors';

interface LandmarkHighlightProps {
  x: number;
  y: number;
  active: boolean;
}

/** Pop + glow on the city's landmark when its star is tapped. */
export function LandmarkHighlight({ x, y, active }: LandmarkHighlightProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      scale.setValue(0);
      opacity.setValue(0);
      return;
    }
    scale.setValue(0.6);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.25, friction: 4, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 320, useNativeDriver: true }),
      ]),
    ]).start();
  }, [active, scale, opacity]);

  if (!active) return null;

  const SIZE = 72;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          left: x - SIZE / 2,
          top: y - SIZE / 2,
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          opacity,
          transform: [{ scale }],
        },
      ]}
      testID="landmark-highlight"
    >
      <View style={styles.innerGlow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,138,61,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGlow: {
    width: '55%',
    height: '55%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,214,79,0.65)',
  },
});
