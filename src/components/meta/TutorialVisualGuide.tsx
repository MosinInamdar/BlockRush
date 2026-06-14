import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { GridLayoutMetrics } from '../../hooks/useGridLayout';
import { GRID_SIZE } from '../../engine/constants';
import type { TutorialStep } from '../../store/tutorialStore';
import { colors } from '../../theme';
import { BlockCell } from '../game/BlockCell';

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialVisualGuideProps {
  visible: boolean;
  step: TutorialStep | null;
  gridLayout: GridLayoutMetrics | null;
  trayLayout: ScreenRect | null;
}

const DEMO_PIECE_COLOR = colors.block.cyan;
const DEMO_CELL = 14;
const HAND_SIZE = 28;

function PulseRing({
  rect,
  color,
  inset = 4,
}: {
  rect: ScreenRect;
  color: string;
  inset?: number;
}) {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        ringStyle,
        {
          left: rect.x - inset,
          top: rect.y - inset,
          width: rect.width + inset * 2,
          height: rect.height + inset * 2,
          borderColor: color,
          shadowColor: color,
        },
      ]}
    />
  );
}

function DragDemo({
  fromX,
  fromY,
  toX,
  toY,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}) {
  const progress = useSharedValue(0);
  const pieceOpacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(300, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) })),
        withDelay(500, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
    pieceOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(200, withTiming(1, { duration: 200 })),
        withDelay(1100, withTiming(0, { duration: 200 })),
        withDelay(800, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
  }, [progress, pieceOpacity]);

  const handStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: fromX + (toX - fromX) * progress.value - HAND_SIZE / 2 },
      { translateY: fromY + (toY - fromY) * progress.value - HAND_SIZE / 2 },
      { scale: 0.95 + progress.value * 0.08 },
    ],
  }));

  const pieceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: fromX + (toX - fromX) * progress.value - DEMO_CELL },
      { translateY: fromY + (toY - fromY) * progress.value - DEMO_CELL / 2 },
    ],
    opacity: pieceOpacity.value,
  }));

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.demoPieceWrap, pieceStyle]}>
        <BlockCell size={DEMO_CELL} color={DEMO_PIECE_COLOR} filled />
        <BlockCell size={DEMO_CELL} color={DEMO_PIECE_COLOR} filled />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.hand, handStyle]}>
        <Text style={styles.handEmoji}>👆</Text>
      </Animated.View>
    </>
  );
}

function TargetDot({ x, y }: { x: number; y: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.35, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      false
    );
  }, [scale]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.targetDot, dotStyle, { left: x - 10, top: y - 10 }]}
    />
  );
}

export function TutorialVisualGuide({
  visible,
  step,
  gridLayout,
  trayLayout,
}: TutorialVisualGuideProps) {
  if (!visible || !step || step.highlight === 'none') return null;

  const cellSize = gridLayout?.cellSize ?? 0;
  const gridW = cellSize * GRID_SIZE;

  const gridRect: ScreenRect | null = gridLayout
    ? {
        x: gridLayout.originX,
        y: gridLayout.originY,
        width: gridW,
        height: gridW,
      }
    : null;

  const rowIndex = step.demoGridRow ?? 6;
  const rowRect: ScreenRect | null =
    gridLayout && cellSize > 0
      ? {
          x: gridLayout.originX,
          y: gridLayout.originY + rowIndex * cellSize,
          width: gridW,
          height: cellSize,
        }
      : null;

  const dragFrom = trayLayout
    ? {
        x: trayLayout.x + trayLayout.width * 0.18,
        y: trayLayout.y + trayLayout.height * 0.5,
      }
    : null;

  const dragTo =
    gridLayout && cellSize > 0
      ? {
          x: gridLayout.originX + 3 * cellSize + cellSize / 2,
          y: gridLayout.originY + 3 * cellSize + cellSize / 2,
        }
      : null;

  return (
    <View style={styles.root} pointerEvents="none">
      {step.highlight === 'grid' && gridRect && (
        <PulseRing rect={gridRect} color={colors.block.electricBlue} inset={6} />
      )}

      {step.highlight === 'tray' && trayLayout && (
        <PulseRing rect={trayLayout} color={colors.block.amber} inset={4} />
      )}

      {step.highlight === 'grid-row' && rowRect && (
        <>
          <PulseRing rect={rowRect} color={colors.block.neonGreen} inset={2} />
          <View
            style={[
              styles.rowLabel,
              {
                left: rowRect.x + 4,
                top: rowRect.y + (rowRect.height - 20) / 2,
              },
            ]}
          >
            <Text style={styles.rowLabelText}>Fill this row</Text>
          </View>
        </>
      )}

      {step.highlight === 'drag-demo' && (
        <>
          {trayLayout && <PulseRing rect={trayLayout} color={colors.block.amber} inset={4} />}
          {gridLayout && cellSize > 0 && (
            <PulseRing
              rect={{
                x: gridLayout.originX + 2 * cellSize,
                y: gridLayout.originY + 2 * cellSize,
                width: cellSize * 3,
                height: cellSize * 2,
              }}
              color={colors.block.cyan}
              inset={3}
            />
          )}
          {dragFrom && dragTo && (
            <>
              <DragDemo
                fromX={dragFrom.x}
                fromY={dragFrom.y}
                toX={dragTo.x}
                toY={dragTo.y}
              />
              <TargetDot x={dragTo.x} y={dragTo.y} />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 480,
    elevation: 480,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    borderRadius: 12,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  hand: {
    position: 'absolute',
    width: HAND_SIZE,
    height: HAND_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEmoji: {
    fontSize: 26,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  demoPieceWrap: {
    position: 'absolute',
    flexDirection: 'row',
  },
  targetDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.block.cyan,
    backgroundColor: 'rgba(0, 255, 204, 0.25)',
  },
  rowLabel: {
    position: 'absolute',
    backgroundColor: colors.block.neonGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rowLabelText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
