import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface ResumeDialogProps {
  visible: boolean;
  savedScore: number;
  onContinue: () => void;
  onNewGame: () => void;
}

export function ResumeDialog({ visible, savedScore, onContinue, onNewGame }: ResumeDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Continue?</Text>
          <Text style={styles.body}>You have a game in progress with score {savedScore}.</Text>

          <Pressable style={styles.primary} onPress={onContinue}>
            <Text style={styles.primaryText}>Continue</Text>
          </Pressable>

          <Pressable style={styles.secondary} onPress={onNewGame}>
            <Text style={styles.secondaryText}>New Game</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gridLine,
    borderRadius: 16,
    padding: spacing.lg,
  },
  title: {
    ...typography.score,
    color: colors.block.electricBlue,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  primary: {
    backgroundColor: colors.block.hotPink,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  secondary: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
