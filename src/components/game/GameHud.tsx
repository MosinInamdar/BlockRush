import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ScoreChip } from '../ui';
import { colors, spacing } from '../../theme';

interface GameHudProps {
  score: number;
  bestScore: number;
}

export function GameHud({ score, bestScore }: GameHudProps) {
  const prevScore = useRef(score);
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    if (score > prevScore.current) {
      scoreScale.value = withSequence(
        withTiming(1.08, { duration: 100 }),
        withTiming(1, { duration: 120 })
      );
    }
    prevScore.current = score;
  }, [score, scoreScale]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  return (
    <View style={styles.hud}>
      <Animated.View style={scoreAnimStyle}>
        <ScoreChip label="SCORE" value={score} accentColor={colors.textPrimary} />
      </Animated.View>
      <ScoreChip label="BEST" value={bestScore} accentColor={colors.block.amber} />
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
