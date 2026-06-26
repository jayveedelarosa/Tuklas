import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { nextFocusQuote, FocusQuote } from '../data/focusQuotes';

type Props = NativeStackScreenProps<RootStackParamList, 'PomodoroBreak'>;
type Phase = 'idle' | 'session' | 'break';

const BUBBLE_VISIBLE_MS = 4500;
const BUBBLE_FADE_MS = 300;
const BUBBLE_POP_MS = 200;

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
  const [quote, setQuote] = useState<FocusQuote>(() => nextFocusQuote());
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.8)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(Date.now());

  const clearDismissTimer = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  };

  const hideBubble = (animated = true) => {
    clearDismissTimer();
    if (!animated) {
      bubbleOpacity.setValue(0);
      bubbleScale.setValue(0.8);
      setBubbleVisible(false);
      return;
    }
    Animated.parallel([
      Animated.timing(bubbleOpacity, { toValue: 0, duration: BUBBLE_FADE_MS, useNativeDriver: true }),
      Animated.timing(bubbleScale, { toValue: 0.8, duration: BUBBLE_FADE_MS, useNativeDriver: true }),
    ]).start(() => setBubbleVisible(false));
  };

  const showBubble = (newQuote?: FocusQuote) => {
    clearDismissTimer();
    if (newQuote) setQuote(newQuote);
    setBubbleVisible(true);
    bubbleOpacity.setValue(0);
    bubbleScale.setValue(0.8);
    Animated.parallel([
      Animated.timing(bubbleOpacity, { toValue: 1, duration: BUBBLE_POP_MS, useNativeDriver: true }),
      Animated.timing(bubbleScale, { toValue: 1, duration: BUBBLE_POP_MS, useNativeDriver: true }),
    ]).start();
    dismissTimer.current = setTimeout(() => hideBubble(true), BUBBLE_VISIBLE_MS);
  };

  const handleTuklasPress = () => {
    if (bubbleVisible) {
      hideBubble(true);
      return;
    }
    showBubble(nextFocusQuote());
  };

  useEffect(() => () => clearDismissTimer(), []);

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

      <View style={styles.tuklasCorner} pointerEvents="box-none">
        {bubbleVisible && (
          <Animated.View
            style={[
              styles.speechBubble,
              { opacity: bubbleOpacity, transform: [{ scale: bubbleScale }] },
            ]}
            testID="focus-tuklas-bubble"
          >
            <BilingualText en={quote.en} tl={quote.tl} size="sm" align="center" />
          </Animated.View>
        )}
        <Pressable onPress={handleTuklasPress} testID="focus-tuklas-mascot" hitSlop={12}>
          <Image source={tuklasMascot.calm} style={styles.tuklasImage} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, flexDirection: 'row', padding: spacing.lg },
  focusBlock: { flex: 1.1, alignItems: 'center', justifyContent: 'center', paddingRight: spacing.md },
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
    maxWidth: 240,
  },
  speechBubble: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    maxWidth: 220,
  },
  tuklasImage: { width: 120, height: 120, resizeMode: 'contain' },
});
