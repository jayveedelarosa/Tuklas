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

/** Focus-time streak panel — sized to match the 6×5 reference layout. */
const STREAK_CELL_SIZE = 30;
const STREAK_COLUMNS = 6;
const STREAK_DAYS = 30;
/** +11% from prior 108px; moderate bump, not panel-hero size. */
const TUKLAS_SIZE = 120;
/** Nudge timer column toward screen center (right of default left edge). */
const LEFT_COLUMN_SHIFT_PX = 48;
/** Tuklas anchor inset from screen edges (inside SafeAreaView padding). */
const TUKLAS_INSET_RIGHT = 12;
const TUKLAS_INSET_BOTTOM = 16;

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

      <View style={styles.mainRow}>
        <View style={styles.leftColumn}>
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
            <PrimaryButton
              label="Start session"
              labelTagalog="Simulan"
              onPress={startSession}
              style={styles.cta}
              testID="start-session"
            />
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
            <PrimaryButton
              label="Continue"
              labelTagalog="Magpatuloy"
              onPress={finishBreak}
              style={styles.cta}
              testID="finish-break"
            />
          )}
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.streakSection}>
            <Text style={styles.streakLabel}>🔥 {streakCount}-day streak</Text>

            <StreakHeatmap
              history={history}
              days={STREAK_DAYS}
              columns={STREAK_COLUMNS}
              legendPlacement="right"
              cellSize={STREAK_CELL_SIZE}
            />
          </View>
        </View>
      </View>

      <View style={styles.tuklasZone} pointerEvents="box-none">
        <View style={styles.tuklasRow}>
          {bubbleVisible ? (
            <Animated.View
              style={[
                styles.speechBubble,
                { opacity: bubbleOpacity, transform: [{ scale: bubbleScale }] },
              ]}
              testID="focus-tuklas-bubble"
            >
              <BilingualText en={quote.en} tl={quote.tl} size="sm" align="center" />
            </Animated.View>
          ) : null}
          <Pressable
            onPress={handleTuklasPress}
            testID="focus-tuklas-mascot"
            hitSlop={12}
            style={styles.tuklasPressable}
          >
            <Image source={tuklasMascot.calm} style={styles.tuklasImage} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  mainRow: { flex: 1, flexDirection: 'row' },
  leftColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: LEFT_COLUMN_SHIFT_PX,
    paddingRight: spacing.md,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.surface,
    borderWidth: 6,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
  cta: { minWidth: 200, alignSelf: 'center' },
  row: { flexDirection: 'row', alignSelf: 'center' },
  rowButton: { marginRight: spacing.sm, minWidth: 130 },
  rightPanel: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  streakSection: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  streakLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xxl,
    color: colors.textDark,
    marginBottom: spacing.md,
    lineHeight: fontSizes.xxl * lineHeights.normal,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  tuklasZone: {
    position: 'absolute',
    right: TUKLAS_INSET_RIGHT,
    bottom: TUKLAS_INSET_BOTTOM,
    maxWidth: '52%',
    zIndex: 10,
  },
  tuklasRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  speechBubble: {
    flexShrink: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
    maxWidth: 220,
    zIndex: 1,
  },
  tuklasPressable: { zIndex: 2, flexShrink: 0 },
  tuklasImage: { width: TUKLAS_SIZE, height: TUKLAS_SIZE, resizeMode: 'contain' },
});
