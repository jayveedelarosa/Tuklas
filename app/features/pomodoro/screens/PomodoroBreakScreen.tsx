import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { recomputePomodoroAdjustment } from '../service/pomodoroEngine';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { fonts, fontSizes, lineHeights } from '../../../common/theme/typography';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';
import { TuklasNoticedBanner } from '../../../common/components/TuklasNoticedBanner';
import { StreakHeatmap } from '../../../common/components/StreakHeatmap';
import { TuklasNotice } from '../../battle/service/noticeRules';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { nextFocusQuote } from '../data/focusQuotes';

type Props = NativeStackScreenProps<RootStackParamList, 'PomodoroBreak'>;
type Phase = 'idle' | 'session' | 'break';

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function PomodoroBreakScreen({ navigation, route }: Props) {
  const { fromBattleVictory } = route.params ?? { fromBattleVictory: false };
  const sessionLength = useSessionStore((s) => s.currentSessionLength);
  const breakLength = useSessionStore((s) => s.currentBreakLength);
  const history = useSessionStore((s) => s.pomodoroHistory);
  const streakCount = useSessionStore((s) => s.streakCount);
  const recordPomodoroSession = useSessionStore((s) => s.recordPomodoroSession);
  const applyPomodoroAdjustment = useSessionStore((s) => s.applyPomodoroAdjustment);

  const [phase, setPhase] = useState<Phase>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(sessionLength * 60);
  const [notice, setNotice] = useState<TuklasNotice | null>(null);
  const [quote] = useState(() => nextFocusQuote());
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (phase !== 'session' && phase !== 'break') return;
    if (remainingSeconds <= 0) return;
    const timer = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, remainingSeconds]);

  const startSession = () => {
    setPhase('session');
    setRemainingSeconds(sessionLength * 60);
    startedAtRef.current = Date.now();
  };

  const resolveSession = (completed: boolean) => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000));
    const record = {
      completed,
      date: new Date().toISOString().slice(0, 10),
      plannedLength: sessionLength,
      actualLength: completed ? sessionLength : elapsedMinutes,
    };
    recordPomodoroSession(record);
    const adjustment = recomputePomodoroAdjustment([...history, record], sessionLength, breakLength);
    applyPomodoroAdjustment(adjustment.sessionLength, adjustment.breakLength);
    if (adjustment.notices.length > 0) setNotice(adjustment.notices[0]);
    setPhase('break');
    setRemainingSeconds(adjustment.breakLength * 60);
  };

  const finishBreak = () => {
    if (fromBattleVictory) {
      navigation.replace('SessionSummary');
    } else {
      navigation.replace('Map');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TuklasNoticedBanner notice={notice} onDismiss={() => setNotice(null)} />

      <View style={styles.focusBlock}>
        <BilingualText
          en={phase === 'break' ? 'Break time!' : 'Focus time'}
          tl={phase === 'break' ? 'Oras ng pahinga!' : 'Oras ng pagtutok'}
          size="lg"
          align="center"
        />

        <View style={styles.timerCircle} testID="pomodoro-timer">
          <Text style={styles.timerText}>{formatClock(remainingSeconds)}</Text>
          <Text style={styles.timerSub}>
            {phase === 'break' ? `${breakLength} min break` : `${sessionLength} min session`}
          </Text>
        </View>

        {phase === 'idle' && (
          <PrimaryButton label="Start session" labelTagalog="Simulan" onPress={startSession} style={styles.cta} testID="start-session" />
        )}

        {phase === 'session' && (
          <View style={styles.row}>
            <PrimaryButton
              label="Complete"
              labelTagalog="Tapos na"
              onPress={() => resolveSession(true)}
              style={styles.rowButton}
              testID="complete-session"
            />
            <PrimaryButton
              label="Abandon"
              labelTagalog="Itigil"
              variant="ghost"
              onPress={() => resolveSession(false)}
              style={styles.rowButton}
              testID="abandon-session"
            />
          </View>
        )}

        {phase === 'break' && (
          <PrimaryButton label="Continue" labelTagalog="Magpatuloy" onPress={finishBreak} style={styles.cta} testID="finish-break" />
        )}
      </View>

      <View style={styles.streakBlock}>
        <Text style={styles.streakLabel}>🔥 {streakCount}-day streak</Text>
        <StreakHeatmap history={history} />
      </View>

      <View style={styles.tuklasCorner} testID="focus-tuklas-mascot">
        <View style={styles.speechBubble}>
          <BilingualText en={quote.en} tl={quote.tl} size="sm" align="center" />
        </View>
        <Image source={tuklasMascot.calm} style={styles.tuklasImage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, flexDirection: 'row', padding: spacing.lg },
  focusBlock: { flex: 1.2, alignItems: 'center', justifyContent: 'center' },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.surface,
    borderWidth: 6,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  timerText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xxl,
    color: colors.textDark,
    lineHeight: fontSizes.xxl * lineHeights.normal,
  },
  timerSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cta: { minWidth: 200 },
  row: { flexDirection: 'row' },
  rowButton: { marginHorizontal: spacing.sm, minWidth: 130 },
  streakBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  streakLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    color: colors.textDark,
    marginBottom: spacing.md,
    lineHeight: fontSizes.xl * lineHeights.normal,
  },
  tuklasCorner: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    alignItems: 'flex-end',
    maxWidth: 220,
  },
  speechBubble: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    maxWidth: 200,
  },
  tuklasImage: { width: 72, height: 72, resizeMode: 'contain' },
});
