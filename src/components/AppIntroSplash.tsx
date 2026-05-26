import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { APP_LOGO } from '../constants/branding';
import { GameWordmark, NeonBackdrop } from './ui';
import { getIntroTotalDurationMs, introTiming } from '../theme/animation';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

interface AppIntroSplashProps {
  ready: boolean;
  onComplete: () => void;
}

const LOGO_SIZE = 148;

export function AppIntroSplash({ ready, onComplete }: AppIntroSplashProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const animationStarted = useRef(false);
  const completed = useRef(false);

  const finishIntro = () => {
    if (completed.current) return;
    completed.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    progressWidth.value = withTiming(ready ? 1 : 0.7, {
      duration: ready ? 200 : 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [ready, progressWidth]);

  useEffect(() => {
    if (!ready || animationStarted.current) return;
    animationStarted.current = true;

    logoOpacity.value = 0;
    logoScale.value = 0.92;
    glowScale.value = 0.8;
    glowOpacity.value = 0;
    titleOpacity.value = 0;

    logoOpacity.value = withTiming(1, {
      duration: introTiming.logoFade,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: introTiming.logoFade,
      easing: Easing.out(Easing.cubic),
    });

    glowOpacity.value = withSequence(
      withTiming(0.55, { duration: introTiming.glowPulse * 0.4 }),
      withTiming(0.3, { duration: introTiming.glowPulse * 0.6 })
    );
    glowScale.value = withSequence(
      withTiming(1.12, { duration: introTiming.glowPulse * 0.5, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: introTiming.glowPulse * 0.5 })
    );

    titleOpacity.value = withDelay(
      introTiming.titleDelay,
      withTiming(1, { duration: introTiming.titleFade, easing: Easing.out(Easing.cubic) })
    );

    const completeTimer = setTimeout(() => finishIntro(), getIntroTotalDurationMs());

    return () => clearTimeout(completeTimer);
  }, [ready, logoOpacity, logoScale, glowOpacity, glowScale, titleOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value * 200,
  }));

  return (
    <NeonBackdrop animateGridIn>
      <View style={styles.screen}>
        <View style={styles.hero}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image
              source={APP_LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="BlockRush"
            />
          </Animated.View>
          <Animated.View style={titleStyle}>
            <GameWordmark />
          </Animated.View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
    </NeonBackdrop>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: LOGO_SIZE * 1.6,
    height: LOGO_SIZE * 1.6,
    borderRadius: LOGO_SIZE * 0.8,
    backgroundColor: colors.block.electricBlue,
    ...shadows.logoGlow,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 30,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    maxWidth: 200,
    alignSelf: 'center',
    borderRadius: 2,
    backgroundColor: colors.gridLine,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.block.cyan,
  },
});
