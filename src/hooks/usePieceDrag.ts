import { useCallback, useRef, useState } from 'react';
import { findSnapPosition, getGhostCells, pixelToGridOrigin } from '../engine/placement';
import { Piece } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { GridLayoutMetrics } from './useGridLayout';

export interface GhostCell {
  row: number;
  col: number;
}

export interface DragState {
  pieceIndex: 0 | 1 | 2;
  piece: Piece;
  absoluteX: number;
  absoluteY: number;
}

export function usePieceDrag(layout: GridLayoutMetrics | null) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [ghostCells, setGhostCells] = useState<GhostCell[]>([]);
  const dragRef = useRef<DragState | null>(null);

  const updateGhost = useCallback(
    (piece: Piece, absoluteX: number, absoluteY: number) => {
      if (!layout) {
        setGhostCells([]);
        return;
      }

      const grid = useGameStore.getState().grid;
      const { row, col } = pixelToGridOrigin(
        absoluteX,
        absoluteY,
        layout.originX,
        layout.originY,
        layout.cellSize,
        piece
      );
      const snap = findSnapPosition(grid, piece, row, col);
      if (snap) {
        setGhostCells(getGhostCells(grid, piece, snap.row, snap.col));
      } else {
        setGhostCells([]);
      }
    },
    [layout]
  );

  const startDrag = useCallback(
    (pieceIndex: 0 | 1 | 2, piece: Piece, absoluteX: number, absoluteY: number) => {
      const next: DragState = { pieceIndex, piece, absoluteX, absoluteY };
      dragRef.current = next;
      setDrag(next);
      updateGhost(piece, absoluteX, absoluteY);
    },
    [updateGhost]
  );

  const moveDrag = useCallback(
    (absoluteX: number, absoluteY: number) => {
      const prev = dragRef.current;
      if (!prev) return;
      const next = { ...prev, absoluteX, absoluteY };
      dragRef.current = next;
      setDrag(next);
      updateGhost(prev.piece, absoluteX, absoluteY);
    },
    [updateGhost]
  );

  const endDrag = useCallback(() => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    setGhostCells([]);

    if (!current || !layout) return;

    const { piece, pieceIndex } = current;
    const grid = useGameStore.getState().grid;
    const { row, col } = pixelToGridOrigin(
      current.absoluteX,
      current.absoluteY,
      layout.originX,
      layout.originY,
      layout.cellSize,
      piece
    );
    const snap = findSnapPosition(grid, piece, row, col);
    if (snap) {
      useGameStore.getState().placePiece(pieceIndex, snap.row, snap.col);
    }
  }, [layout]);

  const cancelDrag = useCallback(() => {
    dragRef.current = null;
    setDrag(null);
    setGhostCells([]);
  }, []);

  return {
    drag,
    ghostCells,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
  };
}
