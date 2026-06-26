import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { characterArt } from '../../../common/theme/characterArt';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Roster'>;

const ROSTER = [
  { id: 'sigbin', name: 'Sigbin' },
  { id: 'tikbalang', name: 'Tikbalang' },
  { id: 'aswang', name: 'Aswang' },
  { id: 'kapre', name: 'Kapre' },
] as const;

export function RosterScreen({ navigation }: Props) {
  const unlockedCharacterIds = useSessionStore((s) => s.unlockedCharacterIds);

  return (
    <SafeAreaView style={styles.screen}>
      <BilingualText en="Your folklore roster" tl="Mga natuklasan mong nilalang" size="lg" align="center" />
      <View style={styles.grid}>
        {ROSTER.map((entry) => {
          const unlocked = unlockedCharacterIds.includes(entry.id);
          return (
            <View key={entry.id} style={styles.cardWrap} testID={`roster-card-${entry.id}`}>
              <Image
                source={characterArt[entry.id].calm}
                style={[styles.art, !unlocked && styles.artLocked]}
              />
              <Text style={styles.name}>{unlocked ? entry.name : '???'}</Text>
              <Text style={styles.status}>{unlocked ? 'Unlocked' : 'Locked'}</Text>
            </View>
          );
        })}
      </View>
      <PrimaryButton label="Back to map" labelTagalog="Bumalik sa mapa" onPress={() => navigation.goBack()} style={styles.back} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xl },
  cardWrap: {
    width: 110,
    margin: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  art: { width: 72, height: 72, resizeMode: 'contain' },
  artLocked: { opacity: 0.25, tintColor: colors.locked },
  name: { marginTop: spacing.sm, fontWeight: '800', color: colors.textDark },
  status: { fontSize: 11, color: colors.textMuted },
  back: { marginTop: spacing.xl, minWidth: 180 },
});
