import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResumeDialog } from '../src/components/meta';
import { useGameStore } from '../src/store/gameStore';
import { colors, spacing, typography } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const bestScore = useGameStore((s) => s.bestScore);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const loadSavedGame = useGameStore((s) => s.loadSavedGame);
  const getSavedGameSummary = useGameStore((s) => s.getSavedGameSummary);

  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [resumeVisible, setResumeVisible] = useState(false);
  const coldStartPromptDone = useRef(false);

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
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
          hitSlop={12}
          accessibilityLabel="Settings"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        <Text style={styles.logo}>BlockRush</Text>
        <Text style={styles.subtitle}>Neon Block Puzzle</Text>

        {bestScore > 0 && (
          <View style={styles.bestWrap}>
            <Text style={styles.bestLabel}>BEST</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        )}

        {savedScore !== null && (
        <Pressable
          style={styles.continueBtn}
          onPress={() => void onContinue()}
          accessibilityRole="button"
          accessibilityLabel={`Continue game with score ${savedScore}`}
        >
          <Text style={styles.continueText}>Continue · {savedScore}</Text>
        </Pressable>
        )}

        <Pressable
          style={styles.button}
          onPress={onPlay}
          accessibilityRole="button"
          accessibilityLabel="Play new game"
        >
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>
      </View>

      <ResumeDialog
        visible={resumeVisible}
        savedScore={savedScore ?? 0}
        onContinue={() => void onContinue()}
        onNewGame={onNewGame}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  settingsBtn: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gridLine,
  },
  settingsIcon: {
    fontSize: 22,
    color: colors.textMuted,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.block.electricBlue,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  bestWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bestLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  bestValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.block.amber,
    marginTop: spacing.xs,
  },
  continueBtn: {
    borderWidth: 1,
    borderColor: colors.block.cyan,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minWidth: 200,
    minHeight: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: colors.block.cyan,
    fontWeight: '700',
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.block.hotPink,
    paddingHorizontal: 56,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 200,
    minHeight: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
