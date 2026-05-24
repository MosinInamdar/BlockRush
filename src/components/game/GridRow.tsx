import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Cell, Grid } from '../../engine/types';
import { BlockCell } from './BlockCell';

interface GridRowProps {
  rowIndex: number;
  row: Cell[];
  cellSize: number;
  ghostSet: Set<string>;
  ghostColor: string | null;
}

function GridRowComponent({ rowIndex, row, cellSize, ghostSet, ghostColor }: GridRowProps) {
  return (
    <View style={styles.row}>
      {row.map((cell, colIndex) => {
        const key = `${rowIndex},${colIndex}`;
        const isGhost = ghostSet.has(key) && !cell.filled;

        return (
          <BlockCell
            key={key}
            size={cellSize}
            filled={cell.filled}
            color={cell.filled ? cell.color : isGhost ? ghostColor ?? undefined : undefined}
            ghost={isGhost && !!ghostColor}
          />
        );
      })}
    </View>
  );
}

export const GridRow = memo(GridRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
