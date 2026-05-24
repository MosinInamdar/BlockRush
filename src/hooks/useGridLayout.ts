import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

export interface GridLayoutMetrics {
  originX: number;
  originY: number;
  cellSize: number;
}

export function useGridLayout(cellSize: number) {
  const gridRef = useRef<View>(null);
  const [layout, setLayout] = useState<GridLayoutMetrics | null>(null);

  const measure = useCallback(() => {
    gridRef.current?.measureInWindow((x, y) => {
      setLayout({ originX: x, originY: y, cellSize });
    });
  }, [cellSize]);

  const onGridLayout = useCallback(() => {
    measure();
  }, [measure]);

  return { gridRef, layout, onGridLayout, remeasureGrid: measure };
}
