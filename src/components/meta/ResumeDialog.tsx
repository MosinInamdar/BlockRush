import { Modal, StyleSheet, Text, View } from 'react-native';
import { NeonButton } from '../ui';
import { colors, spacing, typography } from '../../theme';
import { shadows } from '../../theme/shadows';

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

          <NeonButton
            variant="primary"
            label="Continue"
            onPress={onContinue}
            fullWidth
            style={styles.primaryBtn}
          />

          <NeonButton
            variant="secondary"
            label="New Game"
            onPress={onNewGame}
            fullWidth
            style={styles.secondaryBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    ...typography.score,
    fontFamily: typography.display.fontFamily,
    color: colors.block.electricBlue,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    marginBottom: spacing.sm,
  },
  secondaryBtn: {
    minHeight: 48,
  },
});
