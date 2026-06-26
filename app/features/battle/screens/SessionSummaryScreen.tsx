import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { colors, spacing } from '../../../common/theme/colors';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

export function SessionSummaryScreen({ navigation }: Props) {
  const completedLevelIds = useSessionStore((s) => s.completedLevelIds);
  const unlockedCharacterIds = useSessionStore((s) => s.unlockedCharacterIds);
  const streakCount = useSessionStore((s) => s.streakCount);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.mascotBlock}>
        <Image source={tuklasMascot.idle1} style={styles.mascot} />
        <BilingualText en="Great session today!" tl="Magaling ang sesyon mo ngayon!" size="lg" align="center" />
      </View>

      <View style={styles.rightBlock}>
        <View style={styles.statsBlock}>
          <Text style={styles.statLine}>📍 Levels beaten: {completedLevelIds.length}/3</Text>
          <Text style={styles.statLine}>🧌 Characters unlocked: {unlockedCharacterIds.length}/3</Text>
          <Text style={styles.statLine}>🔥 Streak: {streakCount} days</Text>
        </View>

        <PrimaryButton
          label="Back to map"
          labelTagalog="Bumalik sa mapa"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Map' }] })}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  mascotBlock: { flex: 1, alignItems: 'center' },
  mascot: { width: 96, height: 96, resizeMode: 'contain', marginBottom: spacing.md },
  rightBlock: { flex: 1, alignItems: 'flex-start' },
  statsBlock: { marginBottom: spacing.lg, alignItems: 'flex-start' },
  statLine: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: spacing.sm },
  cta: { minWidth: 200 },
});
