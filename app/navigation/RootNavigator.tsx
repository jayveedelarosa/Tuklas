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

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="InteractiveLearning" component={InteractiveLearningScreen} />
        <Stack.Screen name="Battle" component={BattleScreen} />
        <Stack.Screen name="PomodoroBreak" component={PomodoroBreakScreen} />
        <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
        <Stack.Screen name="Roster" component={RosterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
