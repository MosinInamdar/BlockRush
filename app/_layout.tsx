import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { useMonetizationInit } from '../src/hooks/useMonetizationInit';
import { analyticsEvents } from '../src/services/analytics/analyticsService';
import { useGameStore } from '../src/store/gameStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash already prevented or unavailable
});

export default function RootLayout() {
  const loadBestScore = useGameStore((s) => s.loadBestScore);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const appOpenLogged = useRef(false);

  useMonetizationInit();

  useEffect(() => {
    void (async () => {
      try {
        await Promise.all([loadBestScore(), loadSettings()]);
        if (!appOpenLogged.current) {
          appOpenLogged.current = true;
          void analyticsEvents.appOpen();
        }
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, [loadBestScore, loadSettings]);

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        />
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
