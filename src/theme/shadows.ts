import { colors } from './colors';

/** Neon glow presets for menus and CTAs (platform shadow props). */
export const shadows = {
  logoGlow: {
    shadowColor: colors.block.electricBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  },
  buttonPrimary: {
    shadowColor: colors.block.hotPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonSecondary: {
    shadowColor: colors.block.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  card: {
    shadowColor: colors.block.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
