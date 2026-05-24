import { StyleSheet, View } from 'react-native';
import { Piece } from '../../engine/types';
import { PieceView } from './PieceView';

interface DragOverlayProps {
  piece: Piece;
  cellSize: number;
  absoluteX: number;
  absoluteY: number;
}

export function DragOverlay({ piece, cellSize, absoluteX, absoluteY }: DragOverlayProps) {
  const width = piece.boundingBox.cols * cellSize;
  const height = piece.boundingBox.rows * cellSize;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          left: absoluteX - width / 2,
          top: absoluteY - height / 2,
        },
      ]}
    >
      <View style={styles.lift}>
        <PieceView piece={piece} cellSize={cellSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 100,
  },
  lift: {
    transform: [{ scale: 1.05 }],
  },
});
