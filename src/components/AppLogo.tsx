import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { APP_LOGO } from '../constants/branding';

interface AppLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

/** BlockRush logo image used on home and marketing surfaces. */
export function AppLogo({ size = 120, style, imageStyle }: AppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={APP_LOGO}
        style={[{ width: size, height: size, borderRadius: size * 0.2 }, imageStyle]}
        resizeMode="contain"
        accessibilityLabel="BlockRush logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
