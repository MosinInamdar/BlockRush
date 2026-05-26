import type { AudioPlayer } from 'expo-audio';
import { soundAssets } from '../constants/soundAssets';
import { ensureAudioSession } from './audio/audioSession';

const MUSIC_VOLUME = 0.32;

let musicPlayer: AudioPlayer | null = null;

async function ensureMusicPlayer(): Promise<AudioPlayer | null> {
  const expo = await ensureAudioSession();
  if (!expo) return null;
  if (musicPlayer) return musicPlayer;
  try {
    musicPlayer = expo.createAudioPlayer(soundAssets.musicLoop, { downloadFirst: true });
    musicPlayer.loop = true;
    musicPlayer.volume = MUSIC_VOLUME;
    return musicPlayer;
  } catch {
    return null;
  }
}

export const backgroundMusic = {
  async sync(shouldPlay: boolean) {
    if (!shouldPlay) {
      backgroundMusic.stop();
      return;
    }
    const player = await ensureMusicPlayer();
    if (!player) return;
    if (!player.playing) {
      player.play();
    }
  },

  stop() {
    if (!musicPlayer) return;
    musicPlayer.pause();
    void musicPlayer.seekTo(0);
  },
};
