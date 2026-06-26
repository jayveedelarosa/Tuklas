import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme/colors';

interface HealthBarProps {
  ratio: number;
  /** When set, plays flash + drain. Omit to update silently (no damage on this side). */
  animationKey?: string | number;
}

/** Animated HP bar — flashes red on impact, then drains over ~700ms. */
export function HealthBar({ ratio, animationKey }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const widthAnim = useRef(new Animated.Value(clamped)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const prevKey = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (animationKey !== undefined && prevKey.current !== animationKey) {
      flash.setValue(1);
      Animated.parallel([
        Animated.timing(flash, { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.timing(widthAnim, {
          toValue: clamped,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
      prevKey.current = animationKey;
    } else if (animationKey === undefined) {
      widthAnim.setValue(clamped);
    } else if (prevKey.current === animationKey) {
      widthAnim.setValue(clamped);
    }
  }, [clamped, animationKey, widthAnim, flash]);

  const fillWidth = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const flashColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [clamped > 0.3 ? colors.hpFull : colors.hpLow, colors.hpLow],
  });

  return (
    <View style={styles.track} testID="monster-health-bar">
      <Animated.View style={[styles.fill, { width: fillWidth, backgroundColor: flashColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 14, borderRadius: radii.pill, backgroundColor: '#00000022', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill },
});
