import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { fonts, fontSizes, lineHeights, uiSpacing } from '../../../common/theme/typography';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statTextBlock}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

export function SessionSummaryScreen({ navigation }: Props) {
  const completedLevelIds = useSessionStore((s) => s.completedLevelIds);
  const unlockedCharacterIds = useSessionStore((s) => s.unlockedCharacterIds);
  const streakCount = useSessionStore((s) => s.streakCount);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.mascotBlock}>
        <Image source={tuklasMascot.idle1} style={styles.mascot} />
        <BilingualText en="Great session today!" tl="Magaling ang sesyon mo ngayon!" size="lg" align="center" />
        <Text style={styles.celebrate}>✨</Text>
      </View>

      <View style={styles.rightBlock}>
        <StatCard
          icon="📍"
          label="Levels beaten"
          value={`${completedLevelIds.length}/3`}
        />
        <StatCard
          icon="🧌"
          label="Characters unlocked"
          value={`${unlockedCharacterIds.length}/3`}
        />
        <StatCard
          icon="🔥"
          label="Day streak"
          value={`${streakCount}`}
        />

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  mascotBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.lg,
  },
  mascot: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: spacing.lg,
  },
  celebrate: { fontSize: 40, marginTop: spacing.sm },
  rightBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: spacing.lg,
    gap: uiSpacing.gap,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: uiSpacing.cardPadding,
    marginBottom: spacing.sm,
  },
  statIcon: { fontSize: 36, marginRight: spacing.md },
  statTextBlock: { flex: 1 },
  statValue: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xxl,
    color: colors.textDark,
    lineHeight: fontSizes.xxl * lineHeights.normal,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  cta: {
    minWidth: 240,
    minHeight: 60,
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
  },
});
