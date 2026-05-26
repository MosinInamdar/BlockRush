import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { clearTiming } from '../../theme/animation';

export type ShakeIntensity = 'light' | 'medium' | 'heavy';

interface ScreenShakeProps {
  active: boolean;
  intensity?: ShakeIntensity;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const SHAKE_AMPLITUDE: Record<ShakeIntensity, number> = {
  light: 2,
  medium: 4,
  heavy: 7,
};

export function ScreenShake({
  active,
  intensity = 'medium',
  style,
  children,
}: ScreenShakeProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const amp = SHAKE_AMPLITUDE[intensity];
  const step = clearTiming.comboShake / 6;

  useEffect(() => {
    if (!active) return;
    translateX.value = withSequence(
      withTiming(-amp, { duration: step }),
      withTiming(amp, { duration: step }),
      withTiming(-amp * 0.7, { duration: step }),
      withTiming(amp * 0.7, { duration: step }),
      withTiming(-amp * 0.35, { duration: step }),
      withTiming(0, { duration: step })
    );
    translateY.value = withSequence(
      withTiming(amp * 0.35, { duration: step }),
      withTiming(-amp * 0.35, { duration: step }),
      withTiming(amp * 0.2, { duration: step }),
      withTiming(-amp * 0.2, { duration: step }),
      withTiming(0, { duration: step * 2 })
    );
  }, [active, intensity, amp, step, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
