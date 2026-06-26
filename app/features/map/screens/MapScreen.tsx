import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { listLevels } from '../repository/levelRepository';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { LevelNodeStatus } from '../../../common/components/LevelNode';
import { BilingualText } from '../../../common/components/BilingualText';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { colors, spacing } from '../../../common/theme/colors';
import { fonts, fontSizes } from '../../../common/theme/typography';
import { TOTAL_MAP_NODES, PLAYABLE_LEVEL_ID } from '../models/level';
import { MAP_NODE_LAYOUTS } from '../data/mapLayout';
import { LEVEL_LESSONS } from '../data/levelLessons';
import { InteractiveMapCanvas } from '../components/InteractiveMapCanvas';
import { LevelInfoCard } from '../components/LevelInfoCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

interface SelectedLevel {
  levelId: string;
  status: LevelNodeStatus;
  index: number;
}

const HINT_VISIBLE_MS = 3500;
const HINT_FADE_MS = 500;

export function MapScreen({ navigation }: Props) {
  const levels = listLevels();
  const completedLevelIds = useSessionStore((s) => s.completedLevelIds);
  const streakCount = useSessionStore((s) => s.streakCount);
  const activePlayer = useSessionStore((s) => s.activePlayer);
  const mapHintDismissed = useSessionStore((s) => s.mapHintDismissed);
  const dismissMapHint = useSessionStore((s) => s.dismissMapHint);
  const levelBestStars = useSessionStore((s) => s.levelBestStars);
  const resetSession = useSessionStore((s) => s.resetSession);

  const [selected, setSelected] = useState<SelectedLevel | null>(null);
  const [highlightLevelId, setHighlightLevelId] = useState<string | null>(null);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);
  const hintOpacity = useRef(new Animated.Value(mapHintDismissed ? 0 : 1)).current;
  const [hintVisible, setHintVisible] = useState(!mapHintDismissed);

  const dismissHint = useCallback(() => {
    if (mapHintDismissed) return;
    Animated.timing(hintOpacity, {
      toValue: 0,
      duration: HINT_FADE_MS,
      useNativeDriver: true,
    }).start(() => {
      setHintVisible(false);
      dismissMapHint();
    });
  }, [mapHintDismissed, hintOpacity, dismissMapHint]);

  useEffect(() => {
    if (mapHintDismissed) return;
    const timer = setTimeout(dismissHint, HINT_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [mapHintDismissed, dismissHint]);

  const statusFor = useCallback(
    (index: number): { status: LevelNodeStatus; levelId: string } => {
      const levelId = `level${index + 1}`;
      const level = levels.find((l) => l.id === levelId);
      if (!level) return { status: 'comingSoon', levelId };
      if (level.playable) {
        return { status: completedLevelIds.includes(levelId) ? 'beaten' : 'playable', levelId };
      }
      if (completedLevelIds.includes(levelId)) return { status: 'beaten', levelId };
      return { status: 'comingSoon', levelId };
    },
    [levels, completedLevelIds]
  );

  const stars = useMemo(
    () =>
      Array.from({ length: TOTAL_MAP_NODES }).map((_, index) => {
        const { status, levelId } = statusFor(index);
        return { levelId, index: index + 1, status };
      }),
    [statusFor]
  );

  const handleStarPress = (levelId: string, status: LevelNodeStatus) => {
    if (status === 'comingSoon' || status === 'locked') return;
    const index = MAP_NODE_LAYOUTS.findIndex((n) => n.levelId === levelId) + 1;
    setHighlightLevelId(levelId);
    setFocusTargetId(levelId);
    setSelected({ levelId, status, index: index || parseInt(levelId.replace('level', ''), 10) });
  };

  const handlePlay = () => {
    if (!selected || selected.status !== 'playable') return;
    navigation.navigate('InteractiveLearning', { levelId: selected.levelId });
    setSelected(null);
    setHighlightLevelId(null);
    setFocusTargetId(null);
  };

  const handleBack = () => {
    resetSession();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  const selectedLevel = selected ? levels.find((l) => l.id === selected.levelId) : null;
  const selectedCity = selected ? MAP_NODE_LAYOUTS.find((n) => n.levelId === selected.levelId)?.cityLabel : '';
  const lesson = selected ? LEVEL_LESSONS[selected.levelId] : null;
  const starsEarned = selected ? (levelBestStars[selected.levelId] ?? (selected.status === 'beaten' ? 3 : 0)) : 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.mapContainer}>
        <InteractiveMapCanvas
          stars={stars}
          completedLevelIds={completedLevelIds}
          selectedLevelId={selected?.levelId ?? null}
          highlightLevelId={highlightLevelId}
          initialFocusLevelId={PLAYABLE_LEVEL_ID}
          focusTargetLevelId={focusTargetId}
          onStarPress={handleStarPress}
        />

        <View style={styles.hud} pointerEvents="box-none">
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.headerButton} testID="map-back-button">
              <Text style={styles.backGlyph}>←</Text>
            </Pressable>
            <View style={styles.headerCenter}>
              <Image source={tuklasMascot.idle2} style={styles.headerMascot} />
              <Text style={styles.streakText}>🔥 {streakCount}</Text>
            </View>
            <View style={styles.headerRight}>
              <Pressable onPress={() => navigation.navigate('Roster')} style={styles.headerButton} testID="open-roster">
                <Text style={styles.headerButtonGlyph}>🧌</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('PomodoroBreak', { fromBattleVictory: false })}
                style={[styles.headerButton, styles.headerButtonSpaced]}
                testID="open-pomodoro"
              >
                <Text style={styles.headerButtonGlyph}>⏱️</Text>
              </Pressable>
            </View>
          </View>

          {hintVisible && (
            <Pressable onPress={dismissHint} testID="map-hint-banner">
              <Animated.View style={[styles.hintBanner, { opacity: hintOpacity }]}>
                <BilingualText
                  en={`Hi, ${activePlayer?.name ?? 'Explorer'}! Pinch to zoom, tap a star to explore.`}
                  tl={`Hoy, ${activePlayer?.name ?? 'Explorer'}! I-zoom ang mapa, pindutin ang bituin.`}
                  align="center"
                  color="#fff"
                  size="sm"
                />
              </Animated.View>
            </Pressable>
          )}
        </View>

        {selected && selectedLevel && lesson && (
          <LevelInfoCard
            visible
            levelName={selectedLevel.name}
            cityLabel={selectedCity ?? ''}
            levelIndex={selected.index}
            status={selected.status}
            lesson={lesson}
            starsEarned={starsEarned}
            onPlay={handlePlay}
            onDismiss={() => {
              setSelected(null);
              setHighlightLevelId(null);
              setFocusTargetId(null);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  mapContainer: { flex: 1 },
  hud: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  headerButtonSpaced: { marginLeft: spacing.xs },
  headerButtonGlyph: { fontSize: 20 },
  backGlyph: { fontFamily: fonts.display, fontSize: fontSizes.lg, color: colors.textDark },
  headerCenter: { alignItems: 'center' },
  headerMascot: { width: 40, height: 40, resizeMode: 'contain' },
  streakText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hintBanner: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(59,42,26,0.72)',
    borderRadius: 12,
    padding: spacing.sm,
  },
});
