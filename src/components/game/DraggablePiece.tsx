import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { Piece } from '../../engine/types';
import { PieceView } from './PieceView';

interface DraggablePieceProps {
  piece: Piece;
  pieceIndex: 0 | 1 | 2;
  cellSize: number;
  used: boolean;
  hidden: boolean;
  enabled: boolean;
  onDragStart: (index: 0 | 1 | 2, piece: Piece, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
}

export function DraggablePiece({
  piece,
  pieceIndex,
  cellSize,
  used,
  hidden,
  enabled,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DraggablePieceProps) {
  const slotWidth = piece.boundingBox.cols * cellSize;
  const slotHeight = piece.boundingBox.rows * cellSize;

  const pan = Gesture.Pan()
    .enabled(enabled && !used)
    .onBegin((e) => {
      runOnJS(onDragStart)(pieceIndex, piece, e.absoluteX, e.absoluteY);
    })
    .onUpdate((e) => {
      runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
    })
    .onEnd(() => {
      runOnJS(onDragEnd)();
    });

  if (used) {
    return <View style={[styles.slot, { width: slotWidth, height: slotHeight, opacity: 0.25 }]} />;
  }

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[
          styles.slot,
          { width: slotWidth, height: slotHeight },
          hidden && styles.hidden,
        ]}
      >
        <PieceView piece={piece} cellSize={cellSize} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    opacity: 0,
  },
});
