import { useCallback, useRef, useState } from 'react';
import { Question, TopicId } from '../../topics/models/question';
import { BattleEngineState } from '../models/battle';
import { createBattleState, getCurrentQuestion, submitAnswer, revealHint } from './battleEngine';
import { TuklasNotice } from './noticeRules';

export interface UseBattleEngineResult {
  state: BattleEngineState;
  currentQuestion: Question;
  noticeQueue: TuklasNotice[];
  lastResult: { wasCorrect: boolean } | null;
  setCleared: boolean;
  submit: (selectedIndex: number) => void;
  dismissNotice: () => void;
  useHint: () => void;
  startTimer: () => void;
  resetBattle: () => void;
}

/** React-facing wrapper around the pure battleEngine reducer — keeps screens free of adaptive-engine math. */
export function useBattleEngine(topicId: TopicId, questions: Question[], initialTheta: number): UseBattleEngineResult {
  const [state, setState] = useState<BattleEngineState>(() => createBattleState(topicId, questions, initialTheta));
  const initialThetaRef = useRef(initialTheta);
  const [noticeQueue, setNoticeQueue] = useState<TuklasNotice[]>([]);
  const [lastResult, setLastResult] = useState<{ wasCorrect: boolean } | null>(null);
  const [setCleared, setSetCleared] = useState(false);
  const startedAtRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
  }, []);

  const submit = useCallback(
    (selectedIndex: number) => {
      const responseTimeMs = Date.now() - startedAtRef.current;
      const result = submitAnswer(state, { selectedIndex, responseTimeMs });
      setState(result.state);
      setLastResult({ wasCorrect: result.wasCorrect });
      if (result.notices.length > 0) {
        setNoticeQueue((queue) => [...queue, ...result.notices]);
      }
      if (result.setCleared) {
        setSetCleared(true);
      }
    },
    [state]
  );

  const dismissNotice = useCallback(() => {
    setNoticeQueue((queue) => queue.slice(1));
  }, []);

  const useHint = useCallback(() => {
    setState((s) => revealHint(s));
  }, []);

  const resetBattle = useCallback(() => {
    setState(createBattleState(topicId, questions, initialThetaRef.current));
    setNoticeQueue([]);
    setLastResult(null);
    setSetCleared(false);
  }, [topicId, questions]);

  return {
    state,
    currentQuestion: getCurrentQuestion(state),
    noticeQueue,
    lastResult,
    setCleared,
    submit,
    dismissNotice,
    useHint,
    startTimer,
    resetBattle,
  };
}
