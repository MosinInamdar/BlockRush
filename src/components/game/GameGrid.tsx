import { forwardRef, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Grid } from '../../engine/types';
import { GhostCell } from '../../hooks/usePieceDrag';
import { colors } from '../../theme';
import { GridRow } from './GridRow';

interface GameGridProps {
  grid: Grid;
  cellSize: number;
  ghostCells: GhostCell[];
  ghostColor: string | null;
  onLayout: (event: LayoutChangeEvent) => void;
}

export const GameGrid = forwardRef<View, GameGridProps>(function GameGrid(
  { grid, cellSize, ghostCells, ghostColor, onLayout },
  ref
) {
  const ghostSet = useMemo(
    () => new Set(ghostCells.map((c) => `${c.row},${c.col}`)),
    [ghostCells]
  );

  return (
    <View ref={ref} style={styles.wrapper} onLayout={onLayout}>
      <View style={[styles.grid, { borderColor: colors.gridLine }]}>
        {grid.map((row, rowIndex) => (
          <GridRow
            key={`row-${rowIndex}`}
            rowIndex={rowIndex}
            row={row}
            cellSize={cellSize}
            ghostSet={ghostSet}
            ghostColor={ghostColor}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  grid: {
    borderWidth: 1,
  },
});
