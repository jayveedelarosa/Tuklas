import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { listPlayers } from '../repository/playerRepository';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { appLogo, onboardingBackground } from '../../../common/theme/characterArt';
import { BilingualText } from '../../../common/components/BilingualText';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_DEMO_LEVELS = 3;
const AVATAR_PALETTE = [colors.primary, colors.secondary, colors.success, colors.danger, colors.primaryDark] as const;
const getAvatarColor = (index: number) => AVATAR_PALETTE[index % AVATAR_PALETTE.length];

export function OnboardingScreen({ navigation }: Props) {
  const players = listPlayers();
  const hydrateFromPlayer = useSessionStore((s) => s.hydrateFromPlayer);

  const progressAnims = useRef(
    players.reduce<Record<string, Animated.Value>>((acc, p) => {
      acc[p.id] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    Animated.stagger(
      120,
      players.map((p) =>
        Animated.timing(progressAnims[p.id], {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        })
      )
    ).start();
  }, []);

  const handleSelect = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    hydrateFromPlayer(player);
    navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  };

  return (
    <ImageBackground source={onboardingBackground} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Image source={appLogo} style={styles.logo} />
          <BilingualText
            en="Who's exploring today?"
            tl="Sino ang magsasaliksik ngayon?"
            size="lg"
          />
        </View>
        <View style={styles.cards}>
          {players.map((player, index) => {
            const completed = player.completedLevelIds.length;
            const targetPercent = (completed / TOTAL_DEMO_LEVELS) * 100;
            return (
              <Pressable
                key={player.id}
                testID={`profile-card-${player.id}`}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => handleSelect(player.id)}
                accessibilityRole="button"
                accessibilityLabel={`${player.name}. ${completed} of ${TOTAL_DEMO_LEVELS} levels beaten, ${completed} sa ${TOTAL_DEMO_LEVELS} antas tapos. ${player.streakCount}-day streak, ${player.streakCount} araw streak.`}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                    <Text style={styles.avatarInitial}>{player.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.cardName} numberOfLines={1}>{player.name}</Text>
                </View>
                <Text style={styles.cardProgress}>
                  {completed}/{TOTAL_DEMO_LEVELS} levels beaten
                </Text>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnims[player.id].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${targetPercent}%`],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.cardStreak}>🔥 {player.streakCount}-day streak</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 246, 229, 0.6)',
  },
  logo: { width: 56, height: 56, resizeMode: 'contain', marginRight: spacing.md },
  cards: { flex: 1, flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    margin: spacing.sm,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    maxWidth: 260,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.surface, fontSize: 20, fontWeight: '800' },
  cardName: { flex: 1, marginLeft: spacing.sm, fontSize: 20, fontWeight: '800', color: colors.textDark },
  cardProgress: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, marginBottom: 6 },
  progressTrack: { height: 8, borderRadius: radii.pill, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  cardStreak: { fontSize: 13, color: colors.textDark, marginTop: spacing.sm, fontWeight: '600' },
});
