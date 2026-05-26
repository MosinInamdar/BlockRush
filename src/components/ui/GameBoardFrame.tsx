import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

interface GameBoardFrameProps {
  children: ReactNode;
}

export function GameBoardFrame({ children }: GameBoardFrameProps) {
  return <View style={styles.frame}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    padding: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.block.cyan,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
});
