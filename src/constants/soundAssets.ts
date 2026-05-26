/** Bundled SFX / music — filenames must match `assets/sounds/`. */
export const soundAssets = {
  place: require('../../assets/sounds/place.mp3'),
  clear: require('../../assets/sounds/clear.mp3'),
  combo: require('../../assets/sounds/combo.mp3'),
  gameover: require('../../assets/sounds/gameover.mp3'),
  newBest: require('../../assets/sounds/newbest.mp3'),
  musicLoop: require('../../assets/sounds/music-loop.mp3'),
} as const;

export type SfxAssetKey = keyof Omit<typeof soundAssets, 'musicLoop'>;
