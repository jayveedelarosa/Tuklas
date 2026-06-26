import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { listPlayers } from '../repository/playerRepository';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { appLogo } from '../../../common/theme/characterArt';
import { BilingualText } from '../../../common/components/BilingualText';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_DEMO_LEVELS = 3;

export function OnboardingScreen({ navigation }: Props) {
  const players = listPlayers();
  const hydrateFromPlayer = useSessionStore((s) => s.hydrateFromPlayer);

  const handleSelect = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    hydrateFromPlayer(player);
    navigation.reset({ index: 0, routes: [{ name: 'Map' }] });
  };

  return (
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
        {players.map((player) => (
          <Pressable
            key={player.id}
            testID={`profile-card-${player.id}`}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleSelect(player.id)}
          >
            <Text style={styles.cardName}>{player.name}</Text>
            <Text style={styles.cardProgress}>
              {player.completedLevelIds.length}/{TOTAL_DEMO_LEVELS} levels beaten
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(player.completedLevelIds.length / TOTAL_DEMO_LEVELS) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.cardStreak}>🔥 {player.streakCount}-day streak</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 56, height: 56, resizeMode: 'contain', marginRight: spacing.md },
  cards: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    margin: spacing.sm,
    width: 220,
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  cardName: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  cardProgress: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 6 },
  progressTrack: { height: 8, borderRadius: radii.pill, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  cardStreak: { fontSize: 13, color: colors.textDark, marginTop: spacing.sm, fontWeight: '600' },
});
