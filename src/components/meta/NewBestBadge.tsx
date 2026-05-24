import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing } from '../../theme';

export function NewBestBadge() {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSequence(
      withTiming(1.15, { duration: 220 }),
      withRepeat(withSequence(withTiming(1.05, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true)
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Text style={styles.trophy}>🏆</Text>
      <Text style={styles.label}>New Best!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  trophy: {
    fontSize: 28,
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.block.amber,
    letterSpacing: 0.5,
  },
});
