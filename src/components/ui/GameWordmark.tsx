import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface GameWordmarkProps {
  showTagline?: boolean;
}

export function GameWordmark({ showTagline = true }: GameWordmarkProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>BlockRush</Text>
      <View style={styles.underline} />
      {showTagline && <Text style={styles.tagline}>Neon Block Puzzle</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  title: {
    ...typography.display,
    fontSize: 36,
    color: colors.block.electricBlue,
    textAlign: 'center',
  },
  underline: {
    marginTop: 6,
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.block.hotPink,
  },
  tagline: {
    marginTop: 10,
    fontSize: 15,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
