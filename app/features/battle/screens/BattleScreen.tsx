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
import { QuestionCard } from '../../../common/components/QuestionCard';
import { ChoiceButton } from '../../../common/components/ChoiceButton';
import { PrimaryButton } from '../../../common/components/PrimaryButton';
import { MonsterDisplay } from '../../../common/components/MonsterDisplay';
import { PlayerBattleDisplay } from '../../../common/components/PlayerBattleDisplay';
import { TuklasNoticedBanner } from '../../../common/components/TuklasNoticedBanner';
import { BilingualText } from '../../../common/components/BilingualText';

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

  const engine = useBattleEngine('regrouping', questions, thetaStudent);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedbackPhase, setFeedbackPhase] = useState<'answering' | 'revealed'>('answering');
  // Frozen snapshot of whichever question is on screen — for a correct answer the
  // engine advances state.currentQuestionId immediately, so the 'revealed' feedback
  // phase can't read engine.currentQuestion directly without showing the *next*
  // question's choices while claiming to give feedback on the one just answered.
  const [displayedQuestion, setDisplayedQuestion] = useState(engine.currentQuestion);
  const [showHintCopy, setShowHintCopy] = useState(false);
  const [victoryAcknowledged, setVictoryAcknowledged] = useState(false);
  const wasDefeatedRef = useRef(false);

  useEffect(() => {
    setBattleState(engine.state);
  }, [engine.state]);

  // engine.resetBattle() replaces the engine's internal state synchronously, so
  // engine.currentQuestion is stale until the next render — resync the frozen
  // snapshot once that render actually lands.
  useEffect(() => {
    if (wasDefeatedRef.current && !engine.state.isDefeated) {
      setDisplayedQuestion(engine.currentQuestion);
    }
    wasDefeatedRef.current = engine.state.isDefeated;
  }, [engine.state.isDefeated]);

  useEffect(() => {
    if (engine.setCleared && level) {
      completeLevel(level.id, level.characterName.toLowerCase());
    }
  }, [engine.setCleared]);

  useEffect(() => {
    engine.startTimer();
  }, []);

  useEffect(() => {
    if (engine.setCleared && victoryAcknowledged) {
      navigation.replace('PomodoroBreak', { fromBattleVictory: true });
    }
  }, [engine.setCleared, victoryAcknowledged]);

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

  const handleChoicePress = (index: number) => {
    if (feedbackPhase === 'revealed') return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setDisplayedQuestion(engine.currentQuestion);
    setFeedbackPhase('revealed');
    engine.submit(selectedIndex);
  };

  const handleContinue = () => {
    if (engine.setCleared) {
      setVictoryAcknowledged(true);
      return;
    }
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
  };

  const choiceState = (index: number): 'idle' | 'selected' | 'correct' | 'incorrect' => {
    if (feedbackPhase === 'answering') return index === selectedIndex ? 'selected' : 'idle';
    if (index === displayedQuestion.correctIndex) return 'correct';
    if (index === selectedIndex) return 'incorrect';
    return 'idle';
  };

  const hintReady = engine.state.hintFrequency >= HINT_OFFER_THRESHOLD;
  const hintCopy = HINT_COPY[engine.state.currentTopicId];

  if (engine.setCleared && victoryAcknowledged) {
    return null;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground source={battleBg} style={styles.bg} resizeMode="cover">
        <TuklasNoticedBanner notice={engine.noticeQueue[0] ?? null} onDismiss={engine.dismissNotice} />

        {!engine.setCleared && !engine.state.isDefeated && (
          <View style={styles.topBar}>
            <Text style={styles.questionCounter}>
              {engine.state.correctlyAnsweredIds.length}/{engine.state.questions.length}
            </Text>
            <HintButton
              ready={hintReady}
              hintsUsed={engine.state.hintsUsedThisSession}
              onPress={() => {
                engine.useHint();
                setShowHintCopy(true);
              }}
            />
          </View>
        )}

        <View style={styles.sceneArea}>
          <MonsterDisplay
            characterName={level.characterName}
            hp={monsterHp}
            maxHp={monsterMaxHp}
            hpRatio={hpRatio}
          />
          {!engine.setCleared && (
            <PlayerBattleDisplay
              hp={engine.state.playerHp}
              maxHp={engine.state.maxPlayerHp}
              hpRatio={playerHpRatio}
            />
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.dialogueBox}>
            {engine.state.isDefeated ? (
              <View testID="defeat-block">
                <BilingualText
                  en={`${level.characterName} got the better of you this time.`}
                  tl={`Natalo ka ni ${level.characterName} ngayon.`}
                  size="sm"
                  color="#fff"
                />
              </View>
            ) : engine.setCleared ? (
              <View testID="victory-block">
                <BilingualText
                  en={`You defeated ${level.characterName}!`}
                  tl={`Natalo mo si ${level.characterName}!`}
                  size="sm"
                  color="#fff"
                />
              </View>
            ) : feedbackPhase === 'answering' ? (
              <>
                <QuestionCard
                  prompt={displayedQuestion.prompt}
                  promptTagalog={displayedQuestion.promptTagalog}
                  topicId={displayedQuestion.topicId}
                  variant="battle"
                />
                {showHintCopy && hintCopy ? (
                  <View testID="hint-copy">
                    <BilingualText en={hintCopy.en} tl={hintCopy.tl} size="sm" color="#FFE3C2" />
                  </View>
                ) : null}
              </>
            ) : (
              <BilingualText
                en={engine.lastResult?.wasCorrect ? '🎉 Correct! Great job!' : "Not quite — let's try again."}
                tl={engine.lastResult?.wasCorrect ? 'Tama! Galing!' : 'Hindi pa tama — subukan ulit.'}
                size="md"
                color="#fff"
                align="center"
              />
            )}
          </View>

          <View style={styles.menuBox}>
            {engine.state.isDefeated ? (
              <PrimaryButton
                label="Try again"
                labelTagalog="Subukan muli"
                onPress={handleRetry}
                style={styles.menuButton}
                testID="retry-button"
              />
            ) : engine.setCleared ? (
              <PrimaryButton
                label="Continue"
                labelTagalog="Magpatuloy"
                onPress={handleContinue}
                style={styles.menuButton}
                testID="acknowledge-victory"
              />
            ) : feedbackPhase === 'answering' ? (
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
                  style={styles.menuButton}
                  testID="submit-answer"
                />
              </View>
            ) : (
              <PrimaryButton
                label="Next"
                labelTagalog="Susunod"
                onPress={handleContinue}
                style={styles.menuButton}
                testID="continue-button"
              />
            )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function HintButton({
  ready,
  hintsUsed,
  onPress,
}: {
  ready: boolean;
  hintsUsed: number;
  onPress: () => void;
}) {
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
    fontSize: 13,
    fontWeight: '800',
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
  },
  menuBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 3,
    borderColor: colors.battleMenuBorder,
    padding: spacing.xs,
    justifyContent: 'center',
  },
  answeringStack: { flex: 1, alignSelf: 'stretch' },
  choiceGrid: { flex: 1 },
  choiceRow: { flex: 1, flexDirection: 'row' },
  choiceCell: { flex: 1, marginHorizontal: 2, marginVertical: 2 },
  menuButton: { minHeight: 40, paddingVertical: 4, marginTop: 2, alignSelf: 'stretch' },
});
