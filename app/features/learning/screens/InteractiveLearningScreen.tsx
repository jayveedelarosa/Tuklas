import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, radii, spacing } from '../../../common/theme/colors';
import { tuklasMascot } from '../../../common/theme/characterArt';
import { getResponseForBeat } from '../repository/chatbotRepository';
import { BilingualText } from '../../../common/components/BilingualText';
import { PrimaryButton } from '../../../common/components/PrimaryButton';
import { ChatBubble } from '../../../common/components/ChatBubble';

type Props = NativeStackScreenProps<RootStackParamList, 'InteractiveLearning'>;

const TOTAL_SANTOL = 26;
const GROUP_SIZE = 10;
const GROUPS_OF_TEN = Math.floor(TOTAL_SANTOL / GROUP_SIZE);
const LEFTOVER_ONES = TOTAL_SANTOL % GROUP_SIZE;
const TOTAL_BEATS = 5;

/**
 * PRD Phase 2 — the five-beat calm-down primer before the graded battle starts.
 * No quiz signal here; the student taps through each beat at their own pace
 * (no auto-advance timers) and gets a short bilingual caption explaining what
 * just happened on screen.
 */
export function InteractiveLearningScreen({ navigation, route }: Props) {
  const { levelId } = route.params;
  const [beat, setBeat] = useState(1);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [beat]);

  const goToBattle = () => navigation.replace('Battle', { levelId });
  const goToNextBeat = () => setBeat((b) => Math.min(b + 1, TOTAL_BEATS));

  const caption = beat <= 4 ? getResponseForBeat(beat) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.guideRow}>
          <Image source={tuklasMascot.calm} style={styles.guideImage} />
        </View>

        <Animated.View style={[styles.stage, { opacity: fade }]}>
          {beat === 1 && <UnsortedPile />}
          {beat === 2 && <GroupingAnimation />}
          {(beat === 3 || beat === 4 || beat === 5) && <GroupedWithLeftovers highlight={beat === 4 ? 'both' : null} />}
          {beat === 4 && <Equation />}
        </Animated.View>

        {caption && (
          <View style={styles.captionBlock} testID={`phase2-caption-${beat}`}>
            <BilingualText en={caption.displayTextEn} tl={caption.displayText} align="center" size="sm" />
          </View>
        )}

        {beat < TOTAL_BEATS && (
          <View style={styles.promptBlock}>
            <PrimaryButton label="Next" labelTagalog="Susunod" onPress={goToNextBeat} style={styles.ctaButton} testID="beat-next-button" />
          </View>
        )}

        {beat === TOTAL_BEATS && (
          <View style={styles.promptBlock}>
            <BilingualText
              en="Tens and ones — that's all today's battle needs."
              tl="Tens at ones — iyon lang ang kailangan mo para sa laban ngayon."
              align="center"
            />
            <PrimaryButton label="Let's go" labelTagalog="Tara na" onPress={goToBattle} style={styles.ctaButton} testID="lets-go-button" />
          </View>
        )}
      </ScrollView>

      <ChatBubble currentBeat={beat <= 4 ? beat : null} />
    </SafeAreaView>
  );
}

function UnsortedPile() {
  return (
    <View style={styles.pileWrap} testID="phase2-beat-pile">
      {Array.from({ length: TOTAL_SANTOL }).map((_, i) => (
        <Text key={i} style={styles.fruit}>🟢</Text>
      ))}
    </View>
  );
}

function GroupingAnimation() {
  return (
    <View testID="phase2-beat-grouping">
      {Array.from({ length: GROUPS_OF_TEN }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.groupRow}>
          {Array.from({ length: GROUP_SIZE }).map((_, i) => (
            <Text key={i} style={styles.fruit}>🟢</Text>
          ))}
        </View>
      ))}
      <View style={styles.leftoverRow}>
        {Array.from({ length: LEFTOVER_ONES }).map((_, i) => (
          <Text key={i} style={styles.fruitSmall}>🟢</Text>
        ))}
      </View>
    </View>
  );
}

function GroupedWithLeftovers({ highlight }: { highlight: 'both' | null }) {
  return (
    <View testID="phase2-beat-grouped">
      <View style={[styles.tensBlock, highlight === 'both' && styles.highlighted]}>
        {Array.from({ length: GROUPS_OF_TEN }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.groupRow}>
            {Array.from({ length: GROUP_SIZE }).map((_, i) => (
              <Text key={i} style={styles.fruit}>🟢</Text>
            ))}
          </View>
        ))}
      </View>
      <View style={[styles.onesBlock, highlight === 'both' && styles.highlighted]}>
        {Array.from({ length: LEFTOVER_ONES }).map((_, i) => (
          <Text key={i} style={styles.fruitSmall}>🟢</Text>
        ))}
      </View>
    </View>
  );
}

function Equation() {
  return (
    <View style={styles.equationRow} testID="phase2-beat-equation">
      <Text style={styles.equationText}>{TOTAL_SANTOL} = </Text>
      <Text style={[styles.equationText, styles.equationHighlight]}>{GROUPS_OF_TEN} tens</Text>
      <Text style={styles.equationText}> + </Text>
      <Text style={[styles.equationText, styles.equationHighlight]}>{LEFTOVER_ONES} ones</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  guideRow: { alignItems: 'center', marginBottom: spacing.sm },
  guideImage: { width: 72, height: 72, resizeMode: 'contain' },
  stage: { alignItems: 'center' },
  pileWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 320 },
  fruit: { fontSize: 26, margin: 2 },
  fruitSmall: { fontSize: 20, margin: 2, opacity: 0.85 },
  groupRow: { flexDirection: 'row', borderWidth: 2, borderColor: colors.primary, borderRadius: radii.md, padding: 4, marginBottom: spacing.sm },
  leftoverRow: { flexDirection: 'row', marginTop: spacing.sm },
  tensBlock: { padding: spacing.sm, borderRadius: radii.md },
  onesBlock: { flexDirection: 'row', marginTop: spacing.sm, padding: spacing.sm, borderRadius: radii.md },
  highlighted: { backgroundColor: '#FFE3C2' },
  equationRow: { flexDirection: 'row', marginTop: spacing.lg, flexWrap: 'wrap', justifyContent: 'center' },
  equationText: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  equationHighlight: { color: colors.primaryDark },
  captionBlock: { alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  promptBlock: { alignItems: 'center', paddingBottom: spacing.lg },
  ctaButton: { marginTop: spacing.md, minWidth: 160 },
});
