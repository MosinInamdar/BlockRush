import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';

interface ScoreChipProps {
  label: string;
  value: number;
  accentColor?: string;
}

export function ScoreChip({ label, value, accentColor = colors.textPrimary }: ScoreChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    fontSize: 11,
  },
  value: {
    ...typography.stat,
    fontSize: 22,
  },
});
