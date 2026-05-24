import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { clearTiming } from '../../theme/animation';

interface ScreenShakeProps {
  active: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function ScreenShake({ active, style, children }: ScreenShakeProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    translateX.value = withSequence(
      withTiming(-3, { duration: clearTiming.comboShake / 4 }),
      withTiming(3, { duration: clearTiming.comboShake / 4 }),
      withTiming(-3, { duration: clearTiming.comboShake / 4 }),
      withTiming(0, { duration: clearTiming.comboShake / 4 })
    );
  }, [active, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
