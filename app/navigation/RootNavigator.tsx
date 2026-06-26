import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { MapScreen } from '../features/map/screens/MapScreen';
import { InteractiveLearningScreen } from '../features/learning/screens/InteractiveLearningScreen';
import { BattleScreen } from '../features/battle/screens/BattleScreen';
import { PomodoroBreakScreen } from '../features/pomodoro/screens/PomodoroBreakScreen';
import { SessionSummaryScreen } from '../features/battle/screens/SessionSummaryScreen';
import { RosterScreen } from '../features/roster/screens/RosterScreen';
import { defaultStackOptions, forwardScreenOptions } from './transitionConfig';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={defaultStackOptions}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={forwardScreenOptions} />
        <Stack.Screen name="Map" component={MapScreen} options={forwardScreenOptions} />
        <Stack.Screen name="InteractiveLearning" component={InteractiveLearningScreen} options={forwardScreenOptions} />
        <Stack.Screen name="Battle" component={BattleScreen} options={forwardScreenOptions} />
        <Stack.Screen name="PomodoroBreak" component={PomodoroBreakScreen} options={forwardScreenOptions} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} options={forwardScreenOptions} />
        <Stack.Screen name="Roster" component={RosterScreen} options={forwardScreenOptions} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
