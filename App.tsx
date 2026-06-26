import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, PixelifySans_400Regular, PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { StyleSheet, View } from 'react-native';
import { RootNavigator } from './app/navigation/RootNavigator';
import { colors } from './app/common/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.splash} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, backgroundColor: colors.background },
});
