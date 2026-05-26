import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeonButton } from '../ui';
import { NewBestBadge } from '../meta/NewBestBadge';
import { colors, spacing, typography } from '../../theme';
import { shadows } from '../../theme/shadows';

interface GameOverOverlayProps {
  visible: boolean;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onWatchContinue: () => Promise<boolean>;
  onGoHome?: () => void;
}

export function GameOverOverlay({
  visible,
  score,
  bestScore,
  isNewBest,
  onPlayAgain,
  onWatchContinue,
  onGoHome,
}: GameOverOverlayProps) {
  const router = useRouter();
  const [rewardLoading, setRewardLoading] = useState(false);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);
  const cardY = useSharedValue(16);

  useEffect(() => {
    if (!visible) {
      cardOpacity.value = 0;
      cardScale.value = 0.92;
      cardY.value = 16;
      return;
    }
    cardOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    cardScale.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.back(1.2)) });
    cardY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [visible, cardOpacity, cardScale, cardY]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }, { translateY: cardY.value }],
  }));

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View style={[styles.card, cardAnimStyle]}>
              <Text style={styles.title}>Game Over</Text>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.score}>{score}</Text>
              {isNewBest && <NewBestBadge />}
              <Text style={styles.best}>Best {bestScore}</Text>

              <View style={styles.actions}>
                <NeonButton
                  variant="secondary"
                  label="Watch to Continue"
                  onPress={() => void handleWatchContinue()}
                  loading={rewardLoading}
                  fullWidth
                  accessibilityLabel="Watch ad to continue playing"
                  style={styles.btn}
                />

                <NeonButton
                  variant="primary"
                  label="Play Again"
                  onPress={onPlayAgain}
                  fullWidth
                  accessibilityLabel="Play again"
                  style={styles.btn}
                />

                <NeonButton
                  variant="secondary"
                  label="Home"
                  onPress={goHome}
                  fullWidth
                  accessibilityLabel="Go to home screen"
                />
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  title: {
    ...typography.score,
    fontFamily: typography.display.fontFamily,
    color: colors.block.hotPink,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scoreLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  score: {
    ...typography.stat,
    fontSize: 48,
    lineHeight: 52,
    color: colors.textPrimary,
  },
  best: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
    alignSelf: 'stretch',
  },
  btn: {
    marginBottom: spacing.sm,
  },
});
