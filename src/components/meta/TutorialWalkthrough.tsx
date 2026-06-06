import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TUTORIAL_STEPS, useTutorialStore } from '../../store/tutorialStore';
import { colors, spacing, typography } from '../../theme';
import { shadows } from '../../theme/shadows';
import { NeonButton } from '../ui';

interface TutorialWalkthroughProps {
  visible: boolean;
}

export function TutorialWalkthrough({ visible }: TutorialWalkthroughProps) {
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const advanceStep = useTutorialStore((s) => s.advanceStep);
  const skipTutorial = useTutorialStore((s) => s.skipTutorial);

  const step = TUTORIAL_STEPS[stepIndex];
  if (!step) return null;

  const isLast = stepIndex >= TUTORIAL_STEPS.length - 1;
  const waitingForAction = Boolean(step.waitFor);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.stepLabel}>
              Step {stepIndex + 1} of {TUTORIAL_STEPS.length}
            </Text>
            <Pressable onPress={() => void skipTutorial()} hitSlop={12}>
              <Text style={styles.skip}>Skip tutorial</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          {waitingForAction ? (
            <Text style={styles.actionHint}>
              {step.waitFor === 'placement'
                ? 'Try placing a block on the board…'
                : 'Try clearing a row or column…'}
            </Text>
          ) : (
            <NeonButton
              variant="primary"
              label={isLast ? 'Start playing' : 'Next'}
              onPress={advanceStep}
              fullWidth
              style={styles.nextBtn}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skip: {
    ...typography.caption,
    color: colors.block.cyan,
    fontWeight: '600',
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
    lineHeight: 20,
  },
  actionHint: {
    ...typography.caption,
    color: colors.block.amber,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  nextBtn: {
    marginTop: spacing.lg,
  },
});
