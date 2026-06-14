import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

interface TutorialHintBannerProps {
  message: string;
  onDismiss: () => void;
}

/** Non-blocking hint shown below the HUD — does not cover the piece tray. */
export function TutorialHintBanner({ message, onDismiss }: TutorialHintBannerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { top: insets.top + 56 }]}
      pointerEvents="box-none"
    >
      <View style={styles.banner} pointerEvents="auto">
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
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
    zIndex: 440,
    elevation: 440,
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
