import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { colors, spacing } from '../../../common/theme/colors';
import { fonts, fontSizes, lineHeights } from '../../../common/theme/typography';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

function StatLine({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statText}>{text}</Text>
    </View>
  );
}

export function SessionSummaryScreen({ navigation }: Props) {
  const completedLevelIds = useSessionStore((s) => s.completedLevelIds);
  const unlockedCharacterIds = useSessionStore((s) => s.unlockedCharacterIds);
  const streakCount = useSessionStore((s) => s.streakCount);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.leftColumn}>
        <View style={styles.mascotUnit}>
          <Image source={tuklasMascot.idle1} style={styles.mascot} />
          <BilingualText en="Great session today!" tl="Magaling ang sesyon mo ngayon!" size="lg" align="center" />
        </View>
      </View>

      <View style={styles.rightColumn}>
        <StatLine icon="📍" text={`Levels beaten: ${completedLevelIds.length}/3`} />
        <StatLine icon="🧌" text={`Characters unlocked: ${unlockedCharacterIds.length}/3`} />
        <StatLine icon="🔥" text={`Streak: ${streakCount} days`} />

        <PrimaryButton
          label="Back to map"
          labelTagalog="Bumalik sa mapa"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Map' }] })}
          style={styles.cta}
          testID="session-summary-map-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  mascotUnit: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  mascot: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: spacing.xs,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: spacing.md,
    maxWidth: '48%',
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statIcon: { fontSize: 18, marginRight: spacing.sm, width: 24, textAlign: 'center' },
  statText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textDark,
    lineHeight: fontSizes.md * lineHeights.normal,
    flexShrink: 1,
  },
  cta: {
    minWidth: 200,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});
