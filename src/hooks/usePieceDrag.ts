import { useCallback, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useSharedValue } from 'react-native-reanimated';
import { findSnapPosition, getGhostCells, pixelToGridOrigin } from '../engine/placement';
import { Piece } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { GridLayoutMetrics } from './useGridLayout';

export interface GhostCell {
  row: number;
  col: number;
}

export interface DragMeta {
  pieceIndex: 0 | 1 | 2;
  piece: Piece;
  cellSize: number;
  width: number;
  height: number;
}

export function usePieceDrag(layout: GridLayoutMetrics | null) {
  const [dragMeta, setDragMeta] = useState<DragMeta | null>(null);
  const [ghostCells, setGhostCells] = useState<GhostCell[]>([]);
  const dragMetaRef = useRef<DragMeta | null>(null);
  const lastSnapKeyRef = useRef<string | null>(null);

  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const overlayVisible = useSharedValue(0);
  const hostOriginX = useSharedValue(0);
  const hostOriginY = useSharedValue(0);

  const updateGhost = useCallback(
    (piece: Piece, absoluteX: number, absoluteY: number) => {
      if (!layout) {
        if (lastSnapKeyRef.current !== null) {
          lastSnapKeyRef.current = null;
          setGhostCells([]);
        }
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
      const snapKey = snap ? `${snap.row},${snap.col}` : 'none';
      if (snapKey === lastSnapKeyRef.current) return;
      lastSnapKeyRef.current = snapKey;

      if (snap) {
        setGhostCells(getGhostCells(grid, piece, snap.row, snap.col));
      } else {
        setGhostCells([]);
      }
    },
    [layout]
  );

  const startDrag = useCallback(
    (
      pieceIndex: 0 | 1 | 2,
      piece: Piece,
      absoluteX: number,
      absoluteY: number,
      _trayCellSize: number
    ) => {
      const gridCell = layout?.cellSize ?? _trayCellSize;
      const width = piece.boundingBox.cols * gridCell;
      const height = piece.boundingBox.rows * gridCell;
      const meta: DragMeta = { pieceIndex, piece, cellSize: gridCell, width, height };

      dragMetaRef.current = meta;
      overlayX.value = absoluteX;
      overlayY.value = absoluteY;
      overlayVisible.value = 1;
      setDragMeta(meta);

      lastSnapKeyRef.current = null;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateGhost(piece, absoluteX, absoluteY);
    },
    [layout, updateGhost, overlayX, overlayY, overlayVisible]
  );

  const moveDrag = useCallback(
    (absoluteX: number, absoluteY: number) => {
      const prev = dragMetaRef.current;
      if (!prev) return;
      overlayX.value = absoluteX;
      overlayY.value = absoluteY;
      updateGhost(prev.piece, absoluteX, absoluteY);
    },
    [updateGhost, overlayX, overlayY]
  );

  const endDrag = useCallback(() => {
    const current = dragMetaRef.current;
    dragMetaRef.current = null;
    lastSnapKeyRef.current = null;
    overlayVisible.value = 0;
    setDragMeta(null);
    setGhostCells([]);

    if (!current || !layout) return;

    const { piece, pieceIndex } = current;
    const grid = useGameStore.getState().grid;
    const { row, col } = pixelToGridOrigin(
      overlayX.value,
      overlayY.value,
      layout.originX,
      layout.originY,
      layout.cellSize,
      piece
    );
    const snap = findSnapPosition(grid, piece, row, col);
    if (snap) {
      useGameStore.getState().placePiece(pieceIndex, snap.row, snap.col);
    }
  }, [layout, overlayX, overlayY, overlayVisible]);

  const measureDragHost = useCallback((x: number, y: number) => {
    hostOriginX.value = x;
    hostOriginY.value = y;
  }, [hostOriginX, hostOriginY]);

  const cancelDrag = useCallback(() => {
    dragMetaRef.current = null;
    lastSnapKeyRef.current = null;
    overlayVisible.value = 0;
    setDragMeta(null);
    setGhostCells([]);
  }, [overlayVisible]);

  return {
    dragMeta,
    ghostCells,
    overlayX,
    overlayY,
    overlayVisible,
    hostOriginX,
    hostOriginY,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    measureDragHost,
  };
}
