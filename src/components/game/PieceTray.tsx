import { StyleSheet, View } from 'react-native';
import { Piece } from '../../engine/types';
import { spacing } from '../../theme';
import { DraggablePiece } from './DraggablePiece';

interface PieceTrayProps {
  pieces: [Piece, Piece, Piece];
  usedPieces: [boolean, boolean, boolean];
  cellSize: number;
  draggingIndex: number | null;
  canInteract: boolean;
  onDragStart: (index: 0 | 1 | 2, piece: Piece, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
}

const SLOT_MIN = 96;

export function PieceTray({
  pieces,
  usedPieces,
  cellSize,
  draggingIndex,
  canInteract,
  onDragStart,
  onDragMove,
  onDragEnd,
}: PieceTrayProps) {
  const trayCellSize = Math.min(cellSize * 0.72, 32);

  return (
    <View style={styles.tray}>
      {pieces.map((piece, index) => (
        <View key={`${piece.id}-${index}`} style={[styles.slot, { minWidth: SLOT_MIN }]}>
          <DraggablePiece
            piece={piece}
            pieceIndex={index as 0 | 1 | 2}
            cellSize={trayCellSize}
            used={usedPieces[index]}
            hidden={draggingIndex === index}
            enabled={canInteract}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 100,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
