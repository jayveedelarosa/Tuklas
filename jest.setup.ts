jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default
);

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (updater: () => object) => updater(),
    withTiming: (value: number) => value,
    withTiming: (value: number) => value,
    clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        onUpdate: () => ({ onEnd: () => ({}) }),
        onEnd: () => ({}),
      }),
      Pinch: () => ({
        onUpdate: () => ({ onEnd: () => ({}) }),
        onEnd: () => ({}),
      }),
      Simultaneous: (..._gestures: unknown[]) => ({}),
    },
  };
});

jest.mock('@expo-google-fonts/pixelify-sans', () => ({
  useFonts: () => [true],
  PixelifySans_400Regular: 'PixelifySans_400Regular',
  PixelifySans_700Bold: 'PixelifySans_700Bold',
}));
