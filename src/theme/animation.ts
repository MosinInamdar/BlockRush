/** Clear VFX timings — see docs/CONTENT-SPEC.md */
export const clearTiming = {
  flash: 80,
  scaleUp: 60,
  collapse: 100,
  particles: 300,
  scorePop: 400,
  edgeGlow: 200,
  comboShake: 120,
  /** Total input lock while lines are clearing */
  totalBlock: 520,
} as const;
