import { fontFamilies } from './fonts';

export const typography = {
  display: {
    fontSize: 42,
    fontFamily: fontFamilies.display,
    letterSpacing: 2,
  },
  button: {
    fontSize: 18,
    fontFamily: fontFamilies.displaySemiBold,
    letterSpacing: 1.5,
  },
  stat: {
    fontSize: 36,
    fontFamily: fontFamilies.display,
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
} as const;
