import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BilingualText } from './BilingualText';
import { PrimaryButton } from './PrimaryButton';
import { colors, radii, spacing } from '../theme/colors';
import { fonts, fontSizes, lineHeights } from '../theme/typography';

const FADE_IN_MS = 280;

interface BattleVictoryScreenProps {
  characterName: string;
  starsEarned: number;
  correctCount: number;
  totalQuestions: number;
  onContinue: () => void;
  onReplay: () => void;
}

function AnimatedStars({ count }: { count: number }) {
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((a) => a.setValue(0));
    Animated.stagger(
      180,
      anims.map((a) =>
        Animated.spring(a, { toValue: 1, friction: 5, useNativeDriver: true })
      )
    ).start();
  }, [count, anims]);

  return (
    <View style={styles.starRow}>
      {[1, 2, 3].map((i, idx) => (
        <Animated.Text
          key={i}
          style={[
            styles.star,
            i <= count ? styles.starGold : styles.starEmpty,
            { transform: [{ scale: anims[idx] }], opacity: anims[idx] },
          ]}
        >
          {i <= count ? '★' : '☆'}
        </Animated.Text>
      ))}
    </View>
  );
}

function FadeInCard({ children }: { children: React.ReactNode }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: FADE_IN_MS,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  return <Animated.View style={{ opacity: fade, width: '100%', alignItems: 'center' }}>{children}</Animated.View>;
}

export function BattleVictoryScreen({
  characterName,
  starsEarned,
  correctCount,
  totalQuestions,
  onContinue,
  onReplay,
}: BattleVictoryScreenProps) {
  return (
    <View style={styles.overlay} testID="victory-block">
      <View style={styles.card}>
        <FadeInCard>
          <Text style={styles.sparkle}>✨🎉✨</Text>
          <BilingualText en="Victory!" tl="Tagumpay!" size="lg" align="center" />
          <Text style={styles.subtitle}>
            You defeated {characterName}! ({correctCount}/{totalQuestions} correct)
          </Text>
          <AnimatedStars count={starsEarned} />
          <View style={styles.btnRow}>
            <PrimaryButton
              label="Continue"
              labelTagalog="Sundan"
              onPress={onContinue}
              testID="acknowledge-victory"
              style={styles.btn}
            />
            <PrimaryButton
              label="Replay"
              labelTagalog="Ulitin"
              variant="ghost"
              onPress={onReplay}
              testID="victory-replay-button"
              style={styles.btn}
            />
          </View>
        </FadeInCard>
      </View>
    </View>
  );
}

interface BattleDefeatScreenProps {
  characterName: string;
  onRetry: () => void;
  onMap: () => void;
}

export function BattleDefeatScreen({ characterName, onRetry, onMap }: BattleDefeatScreenProps) {
  return (
    <View style={styles.overlay} testID="defeat-block">
      <View style={styles.card}>
        <FadeInCard>
          <Text style={styles.somber}>💪</Text>
          <BilingualText en="Try Again!" tl="Subukan Ulit!" size="lg" align="center" />
          <BilingualText
            en="You'll get it next time!"
            tl="Kaya mo yan!"
            size="sm"
            align="center"
          />
          <Text style={styles.subtitle}>{characterName} won this round.</Text>
          <View style={styles.btnRow}>
            <PrimaryButton
              label="Try Again"
              labelTagalog="Ulitin"
              onPress={onRetry}
              testID="retry-button"
              style={styles.btn}
            />
            <PrimaryButton
              label="Map"
              labelTagalog="Mapa"
              variant="ghost"
              onPress={onMap}
              testID="defeat-map-button"
              style={styles.btn}
            />
          </View>
        </FadeInCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
    maxWidth: 420,
    width: '90%',
  },
  sparkle: { fontSize: 32, marginBottom: spacing.sm },
  somber: { fontSize: 36, marginBottom: spacing.sm },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  starRow: { flexDirection: 'row', gap: 12, marginVertical: spacing.md },
  star: { fontSize: 36 },
  starGold: { color: '#FFD54F' },
  starEmpty: { color: '#C9BFAF' },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { minWidth: 130 },
});
