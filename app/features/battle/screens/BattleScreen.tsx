import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { getLevel } from '../../map/repository/levelRepository';
import { getQuestionsByIds } from '../../topics/repository/questionRepository';
import { useSessionStore } from '../../../infrastructure/storage/sessionStore';
import { useBattleEngine } from '../service/useBattleEngine';
import { HINT_OFFER_THRESHOLD } from '../service/hintFrequency';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { fonts, fontSizes } from '../../../common/theme/typography';
import { QuestionCard } from '../../../common/components/QuestionCard';
import { ChoiceButton } from '../../../common/components/ChoiceButton';
import { PrimaryButton } from '../../../common/components/PrimaryButton';
import { MonsterDisplay } from '../../../common/components/MonsterDisplay';
import { PlayerBattleDisplay } from '../../../common/components/PlayerBattleDisplay';
import { TuklasNoticedBanner } from '../../../common/components/TuklasNoticedBanner';
import { BilingualText } from '../../../common/components/BilingualText';
import { BattleVictoryScreen, BattleDefeatScreen } from '../../../common/components/BattleResultScreens';

type Props = NativeStackScreenProps<RootStackParamList, 'Battle'>;

const battleBg = require('../../../../assets/levels/Level 3.png');

const HINT_COPY: Record<string, { en: string; tl: string }> = {
  regrouping: {
    en: 'Hint: count how many full groups of ten you can make first — the leftovers are the ones.',
    tl: 'Hint: bilangin muna kung ilang buong pangkat ng sampu ang mabubuo — ang matitira ang ones.',
  },
  'number-sense': {
    en: 'Hint: break the number into tens and ones before you say it in words.',
    tl: 'Hint: hatiin muna sa tens at ones ang bilang bago mo sabihin sa salita.',
  },
  'one-more-one-less': {
    en: "Hint: 'one more' counts forward by 1; 'one less' counts backward by 1.",
    tl: "Hint: ang 'one more' ay dagdag-isa (+1); ang 'one less' ay bawas-isa (-1).",
  },
};

function starsFromHp(playerHp: number, maxPlayerHp: number): number {
  const ratio = maxPlayerHp > 0 ? playerHp / maxPlayerHp : 0;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

export function BattleScreen({ navigation, route }: Props) {
  const { levelId } = route.params;
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const questions = useMemo(
    () => getQuestionsByIds('regrouping', (level?.questions ?? []).map((q) => q.id)),
    [level]
  );
  const thetaStudent = useSessionStore((s) => s.thetaStudent);
  const setBattleState = useSessionStore((s) => s.setBattleState);
  const completeLevel = useSessionStore((s) => s.completeLevel);
  const recordLevelStars = useSessionStore((s) => s.recordLevelStars);

  const engine = useBattleEngine('regrouping', questions, thetaStudent);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedbackPhase, setFeedbackPhase] = useState<'answering' | 'revealed'>('answering');
  const [displayedQuestion, setDisplayedQuestion] = useState(engine.currentQuestion);
  const [showHintCopy, setShowHintCopy] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryStars, setVictoryStars] = useState(1);
  const wasDefeatedRef = useRef(false);
  const hpTick = useRef(0);
  const [damageTarget, setDamageTarget] = useState<'player' | 'enemy' | null>(null);

  useEffect(() => {
    setBattleState(engine.state);
  }, [engine.state]);

  useEffect(() => {
    if (wasDefeatedRef.current && !engine.state.isDefeated) {
      setDisplayedQuestion(engine.currentQuestion);
    }
    wasDefeatedRef.current = engine.state.isDefeated;
  }, [engine.state.isDefeated]);

  useEffect(() => {
    if (engine.setCleared && level && !showVictory) {
      completeLevel(level.id, level.characterName.toLowerCase());
      const stars = starsFromHp(engine.state.playerHp, engine.state.maxPlayerHp);
      setVictoryStars(stars);
      recordLevelStars(level.id, stars);
      setShowVictory(true);
    }
  }, [engine.setCleared, level, showVictory]);

  useEffect(() => {
    engine.startTimer();
  }, []);

  if (!level) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text>Level not found.</Text>
      </SafeAreaView>
    );
  }

  const monsterMaxHp = engine.state.questions.length;
  const monsterHp = monsterMaxHp - engine.state.correctlyAnsweredIds.length;
  const hpRatio = monsterHp / monsterMaxHp;
  const playerHpRatio = engine.state.playerHp / engine.state.maxPlayerHp;
  const enemyHpKey = damageTarget === 'enemy' ? `m-${hpTick.current}` : undefined;
  const playerHpKey = damageTarget === 'player' ? `p-${hpTick.current}` : undefined;

  const handleChoicePress = (index: number) => {
    if (feedbackPhase === 'revealed') return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    const wasCorrect = selectedIndex === engine.currentQuestion.correctIndex;
    setDisplayedQuestion(engine.currentQuestion);
    setFeedbackPhase('revealed');
    engine.submit(selectedIndex);
    setDamageTarget(wasCorrect ? 'enemy' : 'player');
    hpTick.current += 1;
  };

  const handleContinue = () => {
    if (engine.setCleared) return;
    engine.startTimer();
    setSelectedIndex(null);
    setFeedbackPhase('answering');
    setShowHintCopy(false);
    setDisplayedQuestion(engine.currentQuestion);
  };

  const handleRetry = () => {
    engine.resetBattle();
    engine.startTimer();
    setSelectedIndex(null);
    setFeedbackPhase('answering');
    setShowHintCopy(false);
    setShowVictory(false);
    setDamageTarget(null);
    hpTick.current += 1;
  };

  const handleVictoryContinue = () => {
    navigation.replace('PomodoroBreak', { fromBattleVictory: true });
  };

  const handleVictoryReplay = () => {
    handleRetry();
  };

  const handleDefeatMap = () => {
    navigation.replace('Map');
  };

  const choiceState = (index: number): 'idle' | 'selected' | 'correct' | 'incorrect' => {
    if (feedbackPhase === 'answering') return index === selectedIndex ? 'selected' : 'idle';
    if (index === displayedQuestion.correctIndex) return 'correct';
    if (index === selectedIndex) return 'incorrect';
    return 'idle';
  };

  const hintReady = engine.state.hintFrequency >= HINT_OFFER_THRESHOLD;
  const hintCopy = HINT_COPY[engine.state.currentTopicId];

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground source={battleBg} style={styles.bg} resizeMode="cover">
        <TuklasNoticedBanner notice={engine.noticeQueue[0] ?? null} onDismiss={engine.dismissNotice} />

        {showVictory && (
          <BattleVictoryScreen
            characterName={level.characterName}
            starsEarned={victoryStars}
            correctCount={engine.state.correctlyAnsweredIds.length}
            totalQuestions={engine.state.questions.length}
            onContinue={handleVictoryContinue}
            onReplay={handleVictoryReplay}
          />
        )}

        {engine.state.isDefeated && !showVictory && (
          <BattleDefeatScreen
            characterName={level.characterName}
            onRetry={handleRetry}
            onMap={handleDefeatMap}
          />
        )}

        {!showVictory && !engine.state.isDefeated && (
          <>
            <View style={styles.topBar}>
              <Text style={styles.questionCounter}>
                {engine.state.correctlyAnsweredIds.length}/{engine.state.questions.length}
              </Text>
              <HintButton
                ready={hintReady}
                onPress={() => {
                  engine.useHint();
                  setShowHintCopy(true);
                }}
              />
            </View>

            <View style={styles.sceneArea}>
              <MonsterDisplay
                characterName={level.characterName}
                hp={monsterHp}
                maxHp={monsterMaxHp}
                hpRatio={hpRatio}
                hpAnimationKey={enemyHpKey}
              />
              <PlayerBattleDisplay
                hp={engine.state.playerHp}
                maxHp={engine.state.maxPlayerHp}
                hpRatio={playerHpRatio}
                hpAnimationKey={playerHpKey}
              />
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.dialogueBox}>
                {feedbackPhase === 'answering' ? (
                  <QuestionCard
                    prompt={displayedQuestion.prompt}
                    promptTagalog={displayedQuestion.promptTagalog}
                    topicId={displayedQuestion.topicId}
                    variant="battle"
                    showHint={showHintCopy}
                    hintEn={hintCopy?.en}
                    hintTl={hintCopy?.tl}
                  />
                ) : (
                  <View style={styles.feedbackCenter}>
                    <BilingualText
                      en={engine.lastResult?.wasCorrect ? '🎉 Correct! Great job!' : "Not quite — let's try again."}
                      tl={engine.lastResult?.wasCorrect ? 'Tama! Galing!' : 'Hindi pa tama — subukan ulit.'}
                      size="md"
                      color="#fff"
                      align="center"
                    />
                  </View>
                )}
              </View>

              <View style={styles.menuBox}>
                {feedbackPhase === 'answering' ? (
                  <View style={styles.answeringStack}>
                    <View style={styles.choiceGrid}>
                      {[0, 1].map((rowIndex) => (
                        <View key={rowIndex} style={styles.choiceRow}>
                          {displayedQuestion.choices.slice(rowIndex * 2, rowIndex * 2 + 2).map((choice, colIndex) => {
                            const index = rowIndex * 2 + colIndex;
                            return (
                              <ChoiceButton
                                key={`${displayedQuestion.id}-${index}`}
                                label={choice}
                                state={choiceState(index)}
                                onPress={() => handleChoicePress(index)}
                                testID={`choice-${index}`}
                                style={styles.choiceCell}
                                compact
                              />
                            );
                          })}
                        </View>
                      ))}
                    </View>
                    <PrimaryButton
                      label="Submit"
                      labelTagalog="Sagutin"
                      onPress={handleSubmit}
                      disabled={selectedIndex === null}
                      style={styles.submitButton}
                      testID="submit-answer"
                    />
                  </View>
                ) : (
                  <PrimaryButton
                    label="Next"
                    labelTagalog="Susunod"
                    onPress={handleContinue}
                    style={styles.nextButton}
                    testID="continue-button"
                  />
                )}
              </View>
            </View>
          </>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

function HintButton({ ready, onPress }: { ready: boolean; onPress: () => void }) {
  return (
    <PrimaryButton
      label={ready ? '💡 Hint' : '💡'}
      onPress={onPress}
      variant={ready ? 'secondary' : 'ghost'}
      style={styles.hintButton}
      testID="hint-button"
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  questionCounter: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    color: '#fff',
    backgroundColor: '#00000066',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  hintButton: { minHeight: 32, paddingVertical: 2, paddingHorizontal: spacing.sm },
  sceneArea: { flex: 1.3, position: 'relative' },
  bottomRow: { flex: 1, flexDirection: 'row', padding: spacing.sm },
  dialogueBox: {
    flex: 1.1,
    backgroundColor: colors.battleDialogueBg,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: colors.battleDialogueBorder,
    padding: spacing.sm,
    marginRight: spacing.sm,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  feedbackCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: colors.battleMenuBorder,
    padding: spacing.sm,
    justifyContent: 'flex-end',
    minHeight: 160,
  },
  answeringStack: { alignSelf: 'stretch' },
  choiceGrid: { marginBottom: 10 },
  choiceRow: { flexDirection: 'row', marginBottom: 10 },
  choiceCell: { flex: 1, marginHorizontal: 4 },
  submitButton: { minHeight: 44, marginTop: 12, alignSelf: 'stretch' },
  nextButton: { minHeight: 44, alignSelf: 'center', width: '55%' },
});
