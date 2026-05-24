import { StyleSheet, View } from 'react-native';
import { Piece } from '../../engine/types';
import { BlockCell } from './BlockCell';

interface PieceViewProps {
  piece: Piece;
  cellSize: number;
}

export function PieceView({ piece, cellSize }: PieceViewProps) {
  const { rows, cols } = piece.boundingBox;

  return (
    <View style={[styles.container, { width: cols * cellSize, height: rows * cellSize }]}>
      {piece.shape.map(([dr, dc], index) => (
        <View
          key={`${dr}-${dc}-${index}`}
          style={{
            position: 'absolute',
            left: dc * cellSize,
            top: dr * cellSize,
          }}
        >
          <BlockCell size={cellSize} color={piece.color} filled />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
