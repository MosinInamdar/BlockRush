/** App intro splash timings (ms) */
export const introTiming = {
  backdropFade: 300,
  logoFade: 500,
  glowPulse: 500,
  titleDelay: 350,
  titleFade: 400,
  /** Pause after logo + title finish before revealing home */
  hold: 500,
} as const;

/** When `onComplete` should fire after `ready` — matches AppIntroSplash sequence. */
export function getIntroTotalDurationMs(): number {
  const motionEnd = Math.max(
    introTiming.logoFade,
    introTiming.titleDelay + introTiming.titleFade
  );
  return motionEnd + introTiming.hold;
}

/** Clear VFX timings — see docs/CONTENT-SPEC.md */
export const clearTiming = {
  flash: 100,
  scaleUp: 80,
  collapse: 120,
  particles: 380,
  scorePop: 480,
  edgeGlow: 260,
  blastRing: 420,
  comboShake: 200,
  comboBanner: 680,
  confetti: 720,
  /** Total input lock while lines are clearing */
  totalBlock: 760,
} as const;

export const CONFETTI_COLORS = [
  '#00D4FF',
  '#39FF14',
  '#FF006E',
  '#FFB800',
  '#BF00FF',
  '#00FFCC',
  '#FF4500',
] as const;
