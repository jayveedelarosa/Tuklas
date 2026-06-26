import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SKIP_ANIMATION = process.env.JEST_WORKER_ID !== undefined;

interface BattleIntroTransitionProps {
  onComplete: () => void;
}

/**
 * Pokemon-style battle opening: white flashes → diagonal wipe → hand off to battle.
 * Skipped instantly under Jest so smoke tests stay deterministic.
 */
export function BattleIntroTransition({ onComplete }: BattleIntroTransitionProps) {
  const flash = useRef(new Animated.Value(0)).current;
  const wipe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (SKIP_ANIMATION) {
      onComplete();
      return;
    }

    const flashSeq = Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);

    const wipeAnim = Animated.timing(wipe, {
      toValue: 1,
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    Animated.sequence([flashSeq, wipeAnim]).start(() => onComplete());
  }, [flash, wipe, onComplete]);

  if (SKIP_ANIMATION) return null;

  const wipeTranslate = wipe.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_W * 1.4, SCREEN_W * 0.2],
  });

  return (
    <View style={styles.overlay} pointerEvents="none" testID="battle-intro-transition">
      <Animated.View style={[styles.flash, { opacity: flash }]} />
      <Animated.View
        style={[
          styles.wipe,
          {
            transform: [{ translateX: wipeTranslate }, { rotate: '-18deg' }],
          },
        ]}
      />
      <Animated.View style={[styles.blackout, { opacity: wipe }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#000',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF8E7',
  },
  wipe: {
    position: 'absolute',
    top: -SCREEN_H * 0.2,
    left: 0,
    width: SCREEN_W * 0.55,
    height: SCREEN_H * 1.4,
    backgroundColor: colors.primary,
  },
  blackout: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
});
