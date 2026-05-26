import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { withAlpha } from '../../utils/color';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NeonButtonVariant = 'primary' | 'secondary' | 'ghost';

interface NeonButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: NeonButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function NeonButton({
  label,
  variant = 'primary',
  icon,
  loading = false,
  style,
  fullWidth = false,
  onPress,
  disabled,
  ...rest
}: NeonButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress: PressableProps['onPress'] = (e) => {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animStyle,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textPrimary : colors.block.cyan} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
  },
  fullWidth: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.block.hotPink,
    borderWidth: 1,
    borderColor: withAlpha(colors.block.hotPink, 0.6),
    ...shadows.buttonPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.block.cyan,
    ...shadows.buttonSecondary,
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minHeight: spacing.minTouchTarget,
    minWidth: spacing.minTouchTarget,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.block.cyan,
  },
  ghost: {
    color: colors.textMuted,
    fontSize: 22,
  },
});
