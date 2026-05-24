import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SettingsRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SettingsRow({ label, description, value, onValueChange }: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gridLine, true: colors.block.electricBlue }}
        thumbColor={colors.textPrimary}
      />
    </View>
  );
}

interface SettingsInfoRowProps {
  label: string;
  value: string;
}

export function SettingsInfoRow({ label, value }: SettingsInfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface SettingsLinkRowProps {
  label: string;
  onPress: () => void;
}

export function SettingsLinkRow({ label, onPress }: SettingsLinkRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gridLine,
  },
  textBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  infoValue: {
    ...typography.label,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
