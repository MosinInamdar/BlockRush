import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Piece } from '../../engine/types';
import { PieceView } from './PieceView';

interface DragOverlayProps {
  piece: Piece;
  cellSize: number;
  width: number;
  height: number;
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  overlayVisible: SharedValue<number>;
  /** Window offset of the drag host container (from measureInWindow). */
  hostOriginX: SharedValue<number>;
  hostOriginY: SharedValue<number>;
}

export function DragOverlay({
  piece,
  cellSize,
  width,
  height,
  overlayX,
  overlayY,
  overlayVisible,
  hostOriginX,
  hostOriginY,
}: DragOverlayProps) {
  const style = useAnimatedStyle(() => {
    const x = overlayX.value - hostOriginX.value - width / 2;
    const y = overlayY.value - hostOriginY.value - height / 2;
    return {
      opacity: overlayVisible.value,
      transform: [{ translateX: x }, { translateY: y }, { scale: 1.08 }],
    };
  });

  return (
    <Animated.View
      style={[styles.overlay, { width, height }, style]}
      pointerEvents="none"
      collapsable={false}
    >
      <PieceView piece={piece} cellSize={cellSize} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});
