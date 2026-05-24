import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getClearPopAnchor } from '../../engine/clearAnimation';
import { ClearEffectState } from '../../store/gameStore';
import { clearTiming } from '../../theme/animation';
import { colors } from '../../theme';

interface ClearEffectsLayerProps {
  effect: ClearEffectState;
  cellSize: number;
  onComplete: () => void;
}

type Phase = 'flash' | 'pulse' | 'collapse' | 'particles';

export function ClearEffectsLayer({ effect, cellSize, onComplete }: ClearEffectsLayerProps) {
  const [phase, setPhase] = useState<Phase>('flash');
  const popAnchor = useMemo(
    () => getClearPopAnchor(effect.clearedRows, effect.clearedCols, cellSize),
    [effect, cellSize]
  );

  const edgeGlow = useSharedValue(0);
  const scoreY = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);

  useEffect(() => {
    setPhase('flash');
    edgeGlow.value = withSequence(
      withTiming(1, { duration: clearTiming.edgeGlow / 2 }),
      withTiming(0, { duration: clearTiming.edgeGlow / 2 })
    );
    scoreOpacity.value = withTiming(1, { duration: 80 });
    scoreY.value = withTiming(-28, { duration: clearTiming.scorePop, easing: Easing.out(Easing.cubic) });

    const t1 = setTimeout(() => setPhase('pulse'), clearTiming.flash);
    const t2 = setTimeout(() => setPhase('collapse'), clearTiming.flash + clearTiming.scaleUp);
    const t3 = setTimeout(() => setPhase('particles'), clearTiming.flash + clearTiming.scaleUp + clearTiming.collapse);
    const done = setTimeout(onComplete, clearTiming.totalBlock);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(done);
    };
  }, [effect, onComplete, edgeGlow, scoreOpacity, scoreY]);

  const edgeStyle = useAnimatedStyle(() => ({
    opacity: edgeGlow.value * 0.45,
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ translateY: scoreY.value }],
  }));

  const particles = useMemo(
    () =>
      effect.cells.flatMap((cell, cellIndex) =>
        Array.from({ length: 2 }, (_, i) => ({
          id: `${cell.row}-${cell.col}-${cellIndex}-${i}`,
          row: cell.row,
          col: cell.col,
          color: cell.color,
          dx: (Math.random() - 0.5) * cellSize * 1.2,
          dy: (Math.random() - 0.5) * cellSize * 1.2,
        }))
      ),
    [effect.cells, cellSize]
  );

  const showCombo = effect.linesCleared >= 2;

  return (
    <View style={[styles.layer, { width: cellSize * 8, height: cellSize * 8 }]} pointerEvents="none">
      <Animated.View style={[styles.edgeGlow, edgeStyle]} />

      {effect.cells.map((cell) => (
        <ClearCellBurst
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          cellSize={cellSize}
          phase={phase}
        />
      ))}

      {phase === 'particles' &&
        particles.map((p) => (
          <Particle key={p.id} cellSize={cellSize} row={p.row} col={p.col} color={p.color} dx={p.dx} dy={p.dy} />
        ))}

      <Animated.View
        style={[
          styles.scorePop,
          { left: popAnchor.x - 40, top: popAnchor.y - 16 },
          scoreStyle,
        ]}
      >
        <Text style={styles.scorePopText}>+{effect.clearBonus}</Text>
      </Animated.View>

      {showCombo && (
        <View style={styles.comboWrap}>
          <Text style={styles.comboText}>COMBO x{effect.linesCleared}</Text>
        </View>
      )}
    </View>
  );
}

function ClearCellBurst({
  cell,
  cellSize,
  phase,
}: {
  cell: { row: number; col: number; color: string };
  cellSize: number;
  phase: Phase;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (phase === 'flash') {
      flash.value = 1;
      opacity.value = 1;
      scale.value = 1;
    } else if (phase === 'pulse') {
      flash.value = withTiming(0, { duration: 40 });
      scale.value = withTiming(1.04, { duration: clearTiming.scaleUp });
    } else if (phase === 'collapse') {
      scale.value = withTiming(0.2, { duration: clearTiming.collapse });
      opacity.value = withTiming(0, { duration: clearTiming.collapse });
    }
  }, [phase, flash, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    backgroundColor: flash.value > 0.5 ? '#FFFFFF' : cell.color,
    borderColor: cell.color,
  }));

  return (
    <Animated.View
      style={[
        styles.cellBurst,
        {
          left: cell.col * cellSize,
          top: cell.row * cellSize,
          width: cellSize - 2,
          height: cellSize - 2,
        },
        style,
      ]}
    />
  );
}

function Particle({
  cellSize,
  row,
  col,
  color,
  dx,
  dy,
}: {
  cellSize: number;
  row: number;
  col: number;
  color: string;
  dx: number;
  dy: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    tx.value = withTiming(dx, { duration: clearTiming.particles });
    ty.value = withTiming(dy - 20, { duration: clearTiming.particles });
    opacity.value = withTiming(0, { duration: clearTiming.particles });
  }, [dx, dy, opacity, tx, ty]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const size = Math.max(4, cellSize * 0.22);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: col * cellSize + cellSize / 2 - size / 2,
          top: row * cellSize + cellSize / 2 - size / 2,
          width: size,
          height: size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  edgeGlow: {
    ...StyleSheet.absoluteFill,
    borderWidth: 3,
    borderColor: colors.block.electricBlue,
    shadowColor: colors.block.hotPink,
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  cellBurst: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 2,
  },
  particle: {
    position: 'absolute',
    borderRadius: 1,
  },
  scorePop: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  scorePopText: {
    color: colors.block.amber,
    fontSize: 22,
    fontWeight: '800',
  },
  comboWrap: {
    position: 'absolute',
    top: '38%',
    width: '100%',
    alignItems: 'center',
  },
  comboText: {
    color: colors.block.hotPink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: colors.block.violet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
