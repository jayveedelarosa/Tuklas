import React from 'react';
import { Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { listLevels } from '../repository/levelRepository';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { LevelNode, LevelNodeStatus } from '../../../common/components/LevelNode';
import { BilingualText } from '../../../common/components/BilingualText';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { colors, spacing, radii } from '../../../common/theme/colors';
import { TOTAL_MAP_NODES, PLAYABLE_LEVEL_ID } from '../models/level';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const levels = listLevels();
  const completedLevelIds = useSessionStore((s) => s.completedLevelIds);
  const streakCount = useSessionStore((s) => s.streakCount);
  const activePlayer = useSessionStore((s) => s.activePlayer);

  const statusFor = (index: number): { status: LevelNodeStatus; levelId: string } => {
    const levelId = `level${index + 1}`;
    const level = levels.find((l) => l.id === levelId);
    if (!level) return { status: 'comingSoon', levelId };
    if (level.playable) {
      return { status: completedLevelIds.includes(levelId) ? 'beaten' : 'playable', levelId };
    }
    if (completedLevelIds.includes(levelId)) return { status: 'beaten', levelId };
    return { status: 'comingSoon', levelId };
  };

  const handleNodePress = (levelId: string, status: LevelNodeStatus) => {
    if (levelId === PLAYABLE_LEVEL_ID) {
      navigation.navigate('InteractiveLearning', { levelId });
      return;
    }
    if (status === 'beaten') {
      Alert.alert('Already explored!', 'Natuklasan na natin ito — tara sa Level 3!');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground
        source={require('../../../../assets/map/Manila City [L].png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('Roster')} style={styles.headerButton} testID="open-roster">
            <Text style={styles.headerButtonGlyph}>🧌</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Image source={tuklasMascot.idle2} style={styles.headerMascot} />
            <Text style={styles.streakText}>🔥 {streakCount}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('PomodoroBreak', { fromBattleVictory: false })}
            style={styles.headerButton}
            testID="open-pomodoro"
          >
            <Text style={styles.headerButtonGlyph}>⏱️</Text>
          </Pressable>
        </View>

        <BilingualText
          en={`Hi, ${activePlayer?.name ?? 'Explorer'}! Tap a lit-up spot to explore.`}
          tl="Hoy! Pindutin ang nakasinding lugar para magsaliksik."
          align="center"
          color="#fff"
        />

        <ScrollView contentContainerStyle={styles.path} showsVerticalScrollIndicator={false}>
          {Array.from({ length: TOTAL_MAP_NODES }).map((_, index) => {
            const { status, levelId } = statusFor(index);
            const level = levels.find((l) => l.id === levelId);
            const align = index % 3 === 0 ? 'flex-start' : index % 3 === 1 ? 'center' : 'flex-end';
            return (
              <View key={levelId} style={[styles.nodeRow, { alignItems: align }]}>
                <LevelNode
                  index={index + 1}
                  status={status}
                  onPress={() => handleNodePress(levelId, status)}
                  testID={`level-node-${levelId}`}
                />
                <Text style={styles.nodeLabel} numberOfLines={1}>
                  {status === 'comingSoon' ? 'Coming soon' : level?.name}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.35, resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bannerBackground,
    opacity: 0.55,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  headerButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerButtonGlyph: { fontSize: 22 },
  headerCenter: { alignItems: 'center' },
  headerMascot: { width: 44, height: 44, resizeMode: 'contain' },
  streakText: { color: '#fff', fontWeight: '800', marginTop: 2 },
  path: { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  nodeRow: { marginBottom: spacing.lg, width: '100%' },
  nodeLabel: { color: '#fff', fontSize: 12, marginTop: 4, maxWidth: 120, textAlign: 'center' },
});
