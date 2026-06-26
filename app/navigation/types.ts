export type RootStackParamList = {
  Onboarding: undefined;
  Map: undefined;
  InteractiveLearning: { levelId: string };
  Battle: { levelId: string };
  PomodoroBreak: { fromBattleVictory: boolean };
  SessionSummary: undefined;
  Roster: undefined;
};
