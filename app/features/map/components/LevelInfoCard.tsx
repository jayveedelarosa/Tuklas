import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';
import { uiIcons } from '../../../common/theme/uiIcons';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { fonts, fontSizes, lineHeights, uiSpacing } from '../../../common/theme/typography';
import type { LevelNodeStatus } from '../../../common/components/LevelNode';
import type { LevelLessonCopy } from '../data/levelLessons';

interface LevelInfoCardProps {
  visible: boolean;
  levelName: string;
  cityLabel: string;
  levelIndex: number;
  status: LevelNodeStatus;
  lesson: LevelLessonCopy;
  starsEarned: number;
  onPlay: () => void;
  onDismiss: () => void;
}

function StarRow({ earned }: { earned: number }) {
  return (
    <View style={styles.starRow} testID="level-star-row">
      {[1, 2, 3].map((i) => (
        <Text key={i} style={[styles.starIcon, i <= earned ? styles.starFilled : styles.starEmpty]}>
          {i <= earned ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

/** Candy Crush–style compact floating level card over the map. */
export function LevelInfoCard({
  visible,
  levelName,
  cityLabel,
  levelIndex,
  status,
  lesson,
  starsEarned,
  onPlay,
  onDismiss,
}: LevelInfoCardProps) {
  const pop = useRef(new Animated.Value(0)).current;
  const { width: sw } = useWindowDimensions();
  const cardWidth = Math.min(340, sw * 0.46);

  useEffect(() => {
    Animated.spring(pop, {
      toValue: visible ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [visible, pop]);

  if (!visible) return null;

  const canPlay = status === 'playable';
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.card,
          { width: cardWidth, transform: [{ scale }], opacity: pop },
        ]}
        testID="level-info-card"
      >
        <Pressable style={styles.closeX} onPress={onDismiss} testID="level-close-button" hitSlop={8}>
          <Text style={styles.closeXText}>✕</Text>
        </Pressable>

        <Text style={styles.levelTitle}>Level {levelIndex}</Text>
        <Text style={styles.cityLabel}>{cityLabel}</Text>
        <Text style={styles.topicName}>{levelName}</Text>

        <StarRow earned={starsEarned} />

        <BilingualText en={lesson.en} tl={lesson.tl} size="sm" align="center" />

        <View style={styles.actions}>
          {canPlay ? (
            <PrimaryButton
              label="Play!"
              labelTagalog="Maglaro!"
              onPress={onPlay}
              testID="level-play-button"
              style={styles.playBtn}
            />
          ) : (
            <View style={styles.lockedNoteRow}>
              {status !== 'beaten' && <Image source={uiIcons.lock} style={styles.lockIcon} />}
              <Text style={styles.lockedNote}>{status === 'beaten' ? '★ Completed' : 'Locked'}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: '#FFF5F8',
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: uiSpacing.cardPadding,
    paddingTop: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    alignItems: 'center',
  },
  closeX: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeXText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  levelTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    color: colors.primaryDark,
    lineHeight: fontSizes.xl * lineHeights.normal,
  },
  cityLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  topicName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    color: colors.textDark,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  starIcon: { fontSize: 28 },
  starFilled: { color: '#FFD54F' },
  starEmpty: { color: '#C9BFAF' },
  actions: { marginTop: spacing.md, alignItems: 'center', width: '100%' },
  playBtn: { minWidth: 140, alignSelf: 'center' },
  lockedNoteRow: { flexDirection: 'row', alignItems: 'center' },
  lockIcon: { width: 16, height: 16, resizeMode: 'contain', marginRight: 4 },
  lockedNote: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});
