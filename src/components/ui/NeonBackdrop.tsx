import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GRID_SIZE } from '../../engine/constants';
import { colors } from '../../theme/colors';
import { withAlpha } from '../../utils/color';

interface NeonBackdropProps {
  children?: ReactNode;
  /** Fade grid in on mount (intro). Home passes false for instant grid. */
  animateGridIn?: boolean;
  /** `game` hides decor grid so only the play board shows lines. */
  variant?: 'menu' | 'game';
  /** Stronger center glow behind the board (game screen). */
  centerGlow?: boolean;
}

const DECOR_BLOCKS = [
  { row: 1, col: 1, color: colors.block.electricBlue },
  { row: 2, col: 5, color: colors.block.hotPink },
  { row: 5, col: 6, color: colors.block.neonGreen },
] as const;

export function NeonBackdrop({
  children,
  animateGridIn = false,
  variant = 'menu',
  centerGlow = false,
}: NeonBackdropProps) {
  const { width, height } = useWindowDimensions();
  const showDecorGrid = variant === 'menu';
  const gridOpacity = useSharedValue(animateGridIn ? 0 : showDecorGrid ? 0.35 : 0);

  useEffect(() => {
    if (!animateGridIn || !showDecorGrid) return;
    gridOpacity.value = withTiming(0.35, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [animateGridIn, showDecorGrid, gridOpacity]);

  const gridStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
  }));

  const cellSize = Math.min(width, height) / (GRID_SIZE + 2);
  const gridWidth = cellSize * GRID_SIZE;
  const gridHeight = gridWidth;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          colors.background,
          withAlpha(colors.block.violet, 0.12),
          colors.background,
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          'transparent',
          withAlpha(colors.block.electricBlue, centerGlow ? 0.14 : 0.08),
          'transparent',
        ]}
        start={{ x: 0.5, y: centerGlow ? 0.42 : 0.35 }}
        end={{ x: 0.5, y: 0.75 }}
        style={StyleSheet.absoluteFill}
      />

      {showDecorGrid && (
      <Animated.View
        style={[
          styles.gridWrap,
          { width: gridWidth, height: gridHeight },
          gridStyle,
        ]}
        pointerEvents="none"
      >
        {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridLine, styles.gridLineH, { top: i * cellSize }]}
          />
        ))}
        {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLine, styles.gridLineV, { left: i * cellSize }]}
          />
        ))}
        {DECOR_BLOCKS.map((b) => (
          <View
            key={`${b.row}-${b.col}`}
            style={[
              styles.decorBlock,
              {
                left: b.col * cellSize + 1,
                top: b.row * cellSize + 1,
                width: cellSize - 2,
                height: cellSize - 2,
                backgroundColor: withAlpha(b.color, 0.2),
                borderColor: withAlpha(b.color, 0.35),
              },
            ]}
          />
        ))}
      </Animated.View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  gridWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    opacity: 0.35,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.gridLine,
  },
  gridLineH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  decorBlock: {
    position: 'absolute',
    borderRadius: 3,
    borderWidth: 1,
  },
});
