import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { tuklasMascot } from '../theme/characterArt';
import { TuklasNotice } from '../../features/battle/service/noticeRules';

interface TuklasNoticedBannerProps {
  notice: TuklasNotice | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/** PRD §3.1 demo-critical requirement: every adaptive adjustment must show this, never adjust silently. */
export function TuklasNoticedBanner({ notice, onDismiss, autoDismissMs = 4000 }: TuklasNoticedBannerProps) {
  const translateY = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    if (!notice) return;
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, { toValue: -160, duration: 250, useNativeDriver: true }).start(onDismiss);
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]} testID="tuklas-noticed-banner">
      <Image source={tuklasMascot.idle1} style={styles.icon} />
      <View style={styles.textBlock}>
        <Text style={styles.heading}>Tuklas noticed...</Text>
        <Text style={styles.en}>{notice.en}</Text>
        <Text style={styles.tl}>{notice.tl}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.bannerBackground,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 50,
    elevation: 8,
  },
  icon: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm },
  textBlock: { flex: 1 },
  heading: { color: colors.primary, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  en: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tl: { color: '#fff', fontSize: 12, opacity: 0.85, marginTop: 1 },
});
