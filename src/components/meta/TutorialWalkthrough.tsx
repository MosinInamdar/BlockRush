import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { TUTORIAL_STEPS, useTutorialStore } from '../../store/tutorialStore';
import { colors, spacing, typography } from '../../theme';
import { shadows } from '../../theme/shadows';
import { NeonButton } from '../ui';

interface TutorialWalkthroughProps {
  visible: boolean;
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

/** Compact in-flow tutorial card — responsive for phone screens. */
export function TutorialWalkthrough({ visible }: TutorialWalkthroughProps) {
  const { width, height } = useWindowDimensions();
  const compact = height < 740 || width < 360;

  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const advanceStep = useTutorialStore((s) => s.advanceStep);
  const skipTutorial = useTutorialStore((s) => s.skipTutorial);

  const step = TUTORIAL_STEPS[stepIndex];
  if (!visible || !step) return null;

  const isLast = stepIndex >= TUTORIAL_STEPS.length - 1;
  const waitingForAction = Boolean(step.waitFor);
  const showDemoNote = step.highlight === 'drag-demo' || step.highlight === 'grid-row';

  return (
    <View style={[styles.card, compact && styles.cardCompact, waitingForAction && styles.cardInteractive]}>
      <View style={styles.topRow}>
        <ProgressDots current={stepIndex} total={TUTORIAL_STEPS.length} />
        <Pressable onPress={() => void skipTutorial()} hitSlop={12} style={styles.skipBtn}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.contentRow}>
        <View style={[styles.emojiBadge, compact && styles.emojiBadgeCompact]}>
          <Text style={[styles.emoji, compact && styles.emojiCompact]}>{step.emoji}</Text>
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
            {step.title}
          </Text>
          <Text
            style={[styles.body, compact && styles.bodyCompact]}
            numberOfLines={waitingForAction ? 2 : 3}
          >
            {step.body}
          </Text>
        </View>
      </View>

      {waitingForAction ? (
        <View style={styles.actionBanner}>
          <Text style={styles.actionIcon}>{step.highlight === 'drag-demo' ? '👆' : '🎯'}</Text>
          <Text style={styles.actionHint}>
            {step.waitFor === 'placement'
              ? showDemoNote
                ? 'Follow the animated hand — then try it yourself!'
                : 'Drag a block from the tray onto the board'
              : 'Fill a full row or column to clear it'}
          </Text>
        </View>
      ) : (
        <NeonButton
          variant="primary"
          label={isLast ? 'Start playing' : 'Next'}
          onPress={advanceStep}
          style={styles.nextBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.block.electricBlue,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  cardCompact: {
    padding: spacing.sm,
    borderRadius: 14,
    marginBottom: spacing.xs,
  },
  cardInteractive: {
    borderColor: colors.block.amber,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gridLine,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.block.electricBlue,
  },
  dotDone: {
    backgroundColor: colors.block.cyan,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skip: {
    ...typography.caption,
    color: colors.block.cyan,
    fontWeight: '700',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBadgeCompact: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  emoji: {
    fontSize: 24,
  },
  emojiCompact: {
    fontSize: 20,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...typography.label,
    fontFamily: typography.display.fontFamily,
    fontSize: 17,
    color: colors.block.electricBlue,
    marginBottom: 2,
  },
  titleCompact: {
    fontSize: 15,
  },
  body: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  bodyCompact: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.35)',
  },
  actionIcon: {
    fontSize: 18,
  },
  actionHint: {
    ...typography.caption,
    flex: 1,
    color: colors.block.amber,
    fontWeight: '600',
    lineHeight: 16,
  },
  nextBtn: {
    marginTop: spacing.sm,
    minHeight: 44,
  },
});
