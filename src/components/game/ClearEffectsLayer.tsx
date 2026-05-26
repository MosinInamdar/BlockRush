import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getClearPopAnchor } from '../../engine/clearAnimation';
import { ClearEffectState } from '../../store/gameStore';
import { CONFETTI_COLORS, clearTiming } from '../../theme/animation';
import { colors } from '../../theme';

interface ClearEffectsLayerProps {
  effect: ClearEffectState;
  cellSize: number;
  onComplete: () => void;
}

type Phase = 'flash' | 'pulse' | 'collapse' | 'particles';

const COMBO_LABELS: Record<number, string> = {
  2: 'DOUBLE!',
  3: 'TRIPLE!',
  4: 'MEGA BLAST!',
};

export function ClearEffectsLayer({ effect, cellSize, onComplete }: ClearEffectsLayerProps) {
  const [phase, setPhase] = useState<Phase>('flash');
  const gridPx = cellSize * 8;
  const isCombo = effect.linesCleared >= 2;
  const isMega = effect.linesCleared >= 3;

  const popAnchor = useMemo(
    () => getClearPopAnchor(effect.clearedRows, effect.clearedCols, cellSize),
    [effect, cellSize]
  );

  const edgeGlow = useSharedValue(0);
  const screenFlash = useSharedValue(0);
  const scoreY = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0.6);

  useEffect(() => {
    setPhase('flash');
    edgeGlow.value = withSequence(
      withTiming(1, { duration: clearTiming.edgeGlow / 2 }),
      withTiming(isCombo ? 0.65 : 0, { duration: clearTiming.edgeGlow / 2 })
    );
    screenFlash.value = withSequence(
      withTiming(isMega ? 0.55 : isCombo ? 0.4 : 0.28, { duration: 70 }),
      withTiming(0, { duration: clearTiming.flash + 40 })
    );
    scoreOpacity.value = withTiming(1, { duration: 80 });
    scoreScale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 280 }),
      withTiming(1, { duration: 120 })
    );
    scoreY.value = withTiming(-32, { duration: clearTiming.scorePop, easing: Easing.out(Easing.cubic) });

    const t1 = setTimeout(() => setPhase('pulse'), clearTiming.flash);
    const t2 = setTimeout(() => setPhase('collapse'), clearTiming.flash + clearTiming.scaleUp);
    const t3 = setTimeout(
      () => setPhase('particles'),
      clearTiming.flash + clearTiming.scaleUp + clearTiming.collapse
    );
    const done = setTimeout(onComplete, clearTiming.totalBlock);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(done);
    };
  }, [effect, onComplete, edgeGlow, screenFlash, scoreOpacity, scoreScale, scoreY, isCombo, isMega]);

  const edgeStyle = useAnimatedStyle(() => ({
    opacity: edgeGlow.value * (isCombo ? 0.7 : 0.45),
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: screenFlash.value,
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
    transform: [{ translateY: scoreY.value }, { scale: scoreScale.value }],
  }));

  const particlesPerCell = isMega ? 5 : isCombo ? 4 : 3;

  const particles = useMemo(
    () =>
      effect.cells.flatMap((cell, cellIndex) =>
        Array.from({ length: particlesPerCell }, (_, i) => {
          const angle = (i / particlesPerCell) * Math.PI * 2 + cellIndex * 0.3;
          const dist = cellSize * (0.9 + (i % 3) * 0.35);
          return {
            id: `${cell.row}-${cell.col}-${cellIndex}-${i}`,
            row: cell.row,
            col: cell.col,
            color: cell.color,
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist - 12,
            size: Math.max(4, cellSize * (0.18 + (i % 2) * 0.06)),
          };
        })
      ),
    [effect.cells, cellSize, particlesPerCell]
  );

  const confetti = useMemo(() => {
    if (!isCombo) return [];
    const count = isMega ? 28 : 18;
    return Array.from({ length: count }, (_, i) => ({
      id: `confetti-${i}`,
      x: Math.random() * gridPx,
      startY: -20 - Math.random() * 40,
      endY: gridPx + 30 + Math.random() * 40,
      drift: (Math.random() - 0.5) * gridPx * 0.35,
      rotation: (Math.random() - 0.5) * 720,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w: 5 + (i % 3) * 2,
      h: 8 + (i % 4) * 2,
      delay: (i % 6) * 35,
    }));
  }, [isCombo, isMega, gridPx]);

  const comboLabel =
    COMBO_LABELS[Math.min(effect.linesCleared, 4) as keyof typeof COMBO_LABELS] ??
    `COMBO x${effect.linesCleared}`;

  return (
    <View style={[styles.layer, { width: gridPx, height: gridPx }]} pointerEvents="none">
      <Animated.View style={[styles.screenFlash, flashStyle]} />
      <BlastRing gridPx={gridPx} intense={isCombo} />
      <Animated.View style={[styles.edgeGlow, edgeStyle]} />
      {isCombo && <Animated.View style={[styles.edgeGlowInner, edgeStyle]} />}

      {effect.cells.map((cell) => (
        <ClearCellBurst
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          cellSize={cellSize}
          phase={phase}
          intense={isCombo}
        />
      ))}

      {phase === 'particles' &&
        particles.map((p) => (
          <Particle
            key={p.id}
            cellSize={cellSize}
            row={p.row}
            col={p.col}
            color={p.color}
            dx={p.dx}
            dy={p.dy}
            size={p.size}
          />
        ))}

      {phase === 'particles' &&
        confetti.map((c) => (
          <ConfettiPiece key={c.id} {...c} />
        ))}

      <Animated.View
        style={[styles.scorePop, { left: popAnchor.x - 44, top: popAnchor.y - 18 }, scoreStyle]}
      >
        <Text style={[styles.scorePopText, isCombo && styles.scorePopCombo]}>+{effect.clearBonus}</Text>
      </Animated.View>

      {isCombo && <ComboBanner label={comboLabel} linesCleared={effect.linesCleared} mega={isMega} />}
    </View>
  );
}

function BlastRing({ gridPx, intense }: { gridPx: number; intense: boolean }) {
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    scale.value = 0.2;
    opacity.value = intense ? 0.9 : 0.65;
    scale.value = withTiming(intense ? 1.55 : 1.25, {
      duration: clearTiming.blastRing,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0, { duration: clearTiming.blastRing });
  }, [intense, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const size = gridPx * 0.55;

  return (
    <Animated.View
      style={[
        styles.blastRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: gridPx / 2 - size / 2,
          top: gridPx / 2 - size / 2,
          borderWidth: intense ? 3 : 2,
        },
        style,
      ]}
    />
  );
}

function ComboBanner({
  label,
  linesCleared,
  mega,
}: {
  label: string;
  linesCleared: number;
  mega: boolean;
}) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-8);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.12, { damping: 6, stiffness: 320 }),
      withTiming(1, { duration: 140 })
    );
    opacity.value = withTiming(1, { duration: 120 });
    rotate.value = withSequence(
      withTiming(6, { duration: 90 }),
      withTiming(0, { duration: 120 })
    );

    const fade = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 220 });
      scale.value = withTiming(1.05, { duration: 220 });
    }, clearTiming.comboBanner - 240);

    return () => clearTimeout(fade);
  }, [label, linesCleared, scale, opacity, rotate]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.comboWrap, style]} pointerEvents="none">
      <View style={[styles.comboBadge, mega && styles.comboBadgeMega]}>
        <Text style={[styles.comboText, mega && styles.comboTextMega]}>{label}</Text>
        <Text style={styles.comboSub}>x{linesCleared} LINES</Text>
      </View>
    </Animated.View>
  );
}

function ClearCellBurst({
  cell,
  cellSize,
  phase,
  intense,
}: {
  cell: { row: number; col: number; color: string };
  cellSize: number;
  phase: Phase;
  intense: boolean;
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
      flash.value = withTiming(0, { duration: 50 });
      scale.value = withTiming(intense ? 1.12 : 1.06, { duration: clearTiming.scaleUp });
    } else if (phase === 'collapse') {
      scale.value = withTiming(0.05, { duration: clearTiming.collapse });
      opacity.value = withTiming(0, { duration: clearTiming.collapse });
    }
  }, [phase, flash, opacity, scale, intense]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    backgroundColor: flash.value > 0.5 ? '#FFFFFF' : cell.color,
    borderColor: cell.color,
    shadowOpacity: flash.value > 0.5 ? 0.9 : 0,
  }));

  return (
    <Animated.View
      style={[
        styles.cellBurst,
        intense && styles.cellBurstIntense,
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
  size,
}: {
  cellSize: number;
  row: number;
  col: number;
  color: string;
  dx: number;
  dy: number;
  size: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1.2);

  useEffect(() => {
    tx.value = withTiming(dx, { duration: clearTiming.particles, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(dy, { duration: clearTiming.particles, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(0, { duration: clearTiming.particles });
    scale.value = withTiming(0.3, { duration: clearTiming.particles });
  }, [dx, dy, opacity, tx, ty, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

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

function ConfettiPiece({
  x,
  startY,
  endY,
  drift,
  rotation,
  color,
  w,
  h,
  delay,
}: {
  x: number;
  startY: number;
  endY: number;
  drift: number;
  rotation: number;
  color: string;
  w: number;
  h: number;
  delay: number;
}) {
  const ty = useSharedValue(startY);
  const tx = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    ty.value = startY;
    tx.value = 0;
    rotate.value = 0;
    opacity.value = 0;
    opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
    ty.value = withDelay(
      delay,
      withTiming(endY, { duration: clearTiming.confetti, easing: Easing.in(Easing.quad) })
    );
    tx.value = withDelay(
      delay,
      withTiming(drift, { duration: clearTiming.confetti, easing: Easing.out(Easing.sin) })
    );
    rotate.value = withDelay(delay, withTiming(rotation, { duration: clearTiming.confetti }));
    opacity.value = withDelay(
      delay + clearTiming.confetti * 0.55,
      withTiming(0, { duration: clearTiming.confetti * 0.45 })
    );
  }, [startY, endY, drift, rotation, delay, ty, tx, rotate, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        { left: x, top: 0, width: w, height: h, backgroundColor: color },
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
    overflow: 'hidden',
  },
  screenFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  blastRing: {
    position: 'absolute',
    borderColor: colors.block.cyan,
    zIndex: 2,
  },
  edgeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.block.electricBlue,
    shadowColor: colors.block.hotPink,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    zIndex: 3,
  },
  edgeGlowInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 6,
    borderWidth: 2,
    borderColor: colors.block.amber,
    shadowColor: colors.block.violet,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 3,
  },
  cellBurst: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 2,
    zIndex: 4,
    shadowColor: '#FFFFFF',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  cellBurstIntense: {
    shadowRadius: 14,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
    zIndex: 5,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 1,
    zIndex: 6,
  },
  scorePop: {
    position: 'absolute',
    width: 88,
    alignItems: 'center',
    zIndex: 8,
  },
  scorePopText: {
    color: colors.block.amber,
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: colors.block.coral,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scorePopCombo: {
    fontSize: 28,
    color: colors.block.hotPink,
    textShadowColor: colors.block.violet,
    textShadowRadius: 14,
  },
  comboWrap: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    alignItems: 'center',
    zIndex: 9,
  },
  comboBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.block.hotPink,
    backgroundColor: 'rgba(13, 13, 20, 0.88)',
    alignItems: 'center',
    shadowColor: colors.block.violet,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  comboBadgeMega: {
    borderColor: colors.block.amber,
    shadowColor: colors.block.coral,
  },
  comboText: {
    color: colors.block.hotPink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  comboTextMega: {
    color: colors.block.amber,
    fontSize: 30,
  },
  comboSub: {
    marginTop: 4,
    color: colors.block.cyan,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
