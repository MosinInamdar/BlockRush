import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NewBestBadge } from '../meta/NewBestBadge';
import { colors, spacing, typography } from '../../theme';

interface GameOverOverlayProps {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onWatchContinue: () => Promise<boolean>;
  onGoHome?: () => void;
}

export function GameOverOverlay({
  score,
  bestScore,
  isNewBest,
  onPlayAgain,
  onWatchContinue,
  onGoHome,
}: GameOverOverlayProps) {
  const router = useRouter();
  const [rewardLoading, setRewardLoading] = useState(false);

  const goHome = () => {
    onGoHome?.();
    router.replace('/');
  };

  const handleWatchContinue = async () => {
    setRewardLoading(true);
    try {
      await onWatchContinue();
    } finally {
      setRewardLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.score}>{score}</Text>
        {isNewBest && <NewBestBadge />}
        <Text style={styles.best}>Best {bestScore}</Text>

        <Pressable
          style={[styles.rewarded, rewardLoading && styles.rewardedDisabled]}
          onPress={() => void handleWatchContinue()}
          disabled={rewardLoading}
          accessibilityRole="button"
          accessibilityLabel="Watch ad to continue playing"
        >
          {rewardLoading ? (
            <ActivityIndicator color={colors.block.cyan} />
          ) : (
            <>
              <Text style={styles.rewardedText}>Watch to Continue</Text>
              <Text style={styles.rewardedHint}>Removes 3 blocks · ~30 sec</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.primary}
          onPress={onPlayAgain}
          accessibilityRole="button"
          accessibilityLabel="Play again"
        >
          <Text style={styles.primaryText}>Play Again</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Go to home screen"
        >
          <Text style={styles.secondaryText}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  card: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gridLine,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.score,
    color: colors.block.hotPink,
    marginBottom: spacing.sm,
  },
  score: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  best: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  rewarded: {
    borderWidth: 1,
    borderColor: colors.block.cyan,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.minTouchTarget,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  rewardedDisabled: {
    opacity: 0.6,
  },
  rewardedText: {
    color: colors.block.cyan,
    fontWeight: '700',
    fontSize: 16,
  },
  rewardedHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  primary: {
    backgroundColor: colors.block.hotPink,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    width: '100%',
    minHeight: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  primaryText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  secondary: {
    paddingVertical: spacing.sm,
    width: '100%',
    minHeight: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
