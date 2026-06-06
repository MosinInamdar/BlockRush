import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface TutorialHintBannerProps {
  message: string;
  onDismiss: () => void;
}

export function TutorialHintBanner({ message, onDismiss }: TutorialHintBannerProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.banner}>
        <Text style={styles.text}>{message}</Text>
        <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    zIndex: 400,
    elevation: 400,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.block.violet,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  text: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  dismiss: {
    padding: spacing.xs,
  },
  dismissText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
