import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/** Consistent ~350ms transitions — deeper screens slide in from the right. */
export const defaultStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 350,
};

export const forwardScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 350,
};

export const backScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 350,
};
