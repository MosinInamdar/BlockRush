import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../AppLogo';
import { GameWordmark, NeonBackdrop, NeonButton, StatCard } from '../ui';
import { useGameStore } from '../../store/gameStore';
import { spacing } from '../../theme';
import { ResumeDialog } from './ResumeDialog';

export function HomeScreen() {
  const router = useRouter();
  const bestScore = useGameStore((s) => s.bestScore);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const loadSavedGame = useGameStore((s) => s.loadSavedGame);
  const getSavedGameSummary = useGameStore((s) => s.getSavedGameSummary);

  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [resumeVisible, setResumeVisible] = useState(false);
  const coldStartPromptDone = useRef(false);

  const statOpacity = useSharedValue(0);
  const statY = useSharedValue(12);
  const playOpacity = useSharedValue(0);
  const playY = useSharedValue(16);
  const continueOpacity = useSharedValue(0);
  const continueY = useSharedValue(16);

  useEffect(() => {
    statOpacity.value = withDelay(80, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    statY.value = withDelay(80, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    playOpacity.value = withDelay(160, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    playY.value = withDelay(160, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    continueOpacity.value = withDelay(240, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    continueY.value = withDelay(240, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, [statOpacity, statY, playOpacity, playY, continueOpacity, continueY]);

  const statStyle = useAnimatedStyle(() => ({
    opacity: statOpacity.value,
    transform: [{ translateY: statY.value }],
  }));

  const playStyle = useAnimatedStyle(() => ({
    opacity: playOpacity.value,
    transform: [{ translateY: playY.value }],
  }));

  const continueStyle = useAnimatedStyle(() => ({
    opacity: continueOpacity.value,
    transform: [{ translateY: continueY.value }],
  }));

  const refreshSavedSummary = useCallback(async () => {
    const summary = await getSavedGameSummary();
    if (summary) {
      setSavedScore(summary.score);
      if (!coldStartPromptDone.current) {
        coldStartPromptDone.current = true;
        setResumeVisible(true);
      }
    } else {
      setSavedScore(null);
      setResumeVisible(false);
    }
  }, [getSavedGameSummary]);

  useFocusEffect(
    useCallback(() => {
      void refreshSavedSummary();
    }, [refreshSavedSummary])
  );

  const goToGame = () => {
    router.push('/game');
  };

  const onPlay = () => {
    if (savedScore !== null) {
      setResumeVisible(true);
      return;
    }
    startNewGame();
    goToGame();
  };

  const onContinue = async () => {
    const loaded = await loadSavedGame();
    setResumeVisible(false);
    if (loaded) {
      goToGame();
    } else {
      setSavedScore(null);
    }
  };

  const onNewGame = () => {
    startNewGame();
    setResumeVisible(false);
    setSavedScore(null);
    goToGame();
  };

  return (
    <NeonBackdrop>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <NeonButton
            variant="ghost"
            label="⚙"
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
            style={styles.settingsBtn}
          />
        </View>

        <View style={styles.hero}>
          <AppLogo size={96} />
          <GameWordmark />
          <Animated.View style={[styles.statWrap, statStyle]}>
            <StatCard label="BEST" value={bestScore} />
          </Animated.View>
        </View>

        <View style={styles.actions}>
          {savedScore !== null && (
            <Animated.View style={[styles.continueWrap, continueStyle]}>
              <NeonButton
                variant="secondary"
                label={`Continue · ${savedScore}`}
                onPress={() => void onContinue()}
                fullWidth
                accessibilityLabel={`Continue game with score ${savedScore}`}
              />
            </Animated.View>
          )}
          <Animated.View style={playStyle}>
            <NeonButton
              variant="primary"
              label="▶  PLAY"
              onPress={onPlay}
              fullWidth
              accessibilityLabel="Play new game"
            />
          </Animated.View>
        </View>

        <ResumeDialog
          visible={resumeVisible}
          savedScore={savedScore ?? 0}
          onContinue={() => void onContinue()}
          onNewGame={onNewGame}
        />
      </SafeAreaView>
    </NeonBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  settingsBtn: {
    borderRadius: 22,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  statWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  continueWrap: {
    width: '100%',
  },
});
