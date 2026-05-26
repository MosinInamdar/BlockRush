import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { typography } from '../../theme/typography';

interface StatCardProps {
  label: string;
  value: number;
}

export function StatCard({ label, value }: StatCardProps) {
  const display = value > 0 ? String(value) : '—';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
    fontSize: 13,
  },
  value: {
    ...typography.stat,
    fontSize: 32,
    color: colors.block.amber,
  },
});
