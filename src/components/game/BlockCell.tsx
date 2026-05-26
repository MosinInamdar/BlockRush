import { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { withAlpha } from '../../utils/color';
import { colors } from '../../theme';

interface BlockCellProps {
  size: number;
  color?: string;
  ghost?: boolean;
  filled?: boolean;
  style?: ViewStyle;
}

function BlockCellComponent({ size, color, ghost, filled, style }: BlockCellProps) {
  const inner = size - 2;

  if (ghost && color) {
    return (
      <View
        style={[
          styles.cell,
          { width: size, height: size },
          style,
          { backgroundColor: withAlpha(color, 0.3) },
        ]}
      />
    );
  }

  if (filled && color) {
    const glow = size >= 24;
    return (
      <View style={[styles.cell, { width: size, height: size }, style]}>
        <View
          style={[
            styles.block,
            glow && styles.blockGlow,
            {
              width: inner,
              height: inner,
              backgroundColor: color,
              borderColor: withAlpha(color, 0.55),
              shadowColor: color,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cell,
        styles.empty,
        { width: size, height: size },
        style,
      ]}
    />
  );
}

function propsAreEqual(prev: BlockCellProps, next: BlockCellProps): boolean {
  return (
    prev.size === next.size &&
    prev.color === next.color &&
    prev.ghost === next.ghost &&
    prev.filled === next.filled
  );
}

export const BlockCell = memo(BlockCellComponent, propsAreEqual);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gridLine,
  },
  empty: {
    backgroundColor: colors.surface,
  },
  block: {
    borderWidth: 1,
    borderRadius: 2,
  },
  blockGlow: {
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
});
