import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
  useFonts,
} from '@expo-google-fonts/rajdhani';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';
import { AppIntroSplash } from '../src/components/AppIntroSplash';
import { useBackgroundMusic } from '../src/hooks/useBackgroundMusic';
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
  const [appReady, setAppReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const [fontsLoaded] = useFonts({
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

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
        setAppReady(true);
      }
    })();
  }, [loadBestScore, loadSettings]);

  const introReady = appReady && fontsLoaded;
  const showHome = introDone && fontsLoaded;

  useBackgroundMusic(showHome);

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        {showHome ? (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          />
        ) : (
          <AppIntroSplash ready={introReady} onComplete={handleIntroComplete} />
        )}
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
