import {
  cacheDirectory,
  EncodingType,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { buildToneWavBase64 } from './audio/wavTone';
import { useSettingsStore } from '../store/settingsStore';

export type FeedbackEvent = 'place' | 'clear' | 'combo' | 'gameover' | 'newBest';

type ExpoAudioModule = typeof import('expo-audio');

let audioModule: ExpoAudioModule | null = null;
let audioInitFailed = false;
const toneCache = new Map<string, string>();

async function getAudioModule(): Promise<ExpoAudioModule | null> {
  if (audioInitFailed) return null;
  if (audioModule) return audioModule;
  try {
    audioModule = await import('expo-audio');
    await audioModule.setAudioModeAsync({ playsInSilentMode: true });
    return audioModule;
  } catch {
    audioInitFailed = true;
    return null;
  }
}

async function toneUri(frequencyHz: number, durationMs: number): Promise<string | null> {
  if (!cacheDirectory) return null;
  const key = `${frequencyHz}-${durationMs}`;
  if (!toneCache.has(key)) {
    const base64 = buildToneWavBase64(frequencyHz, durationMs);
    const path = `${cacheDirectory}tone-${key}.wav`;
    await writeAsStringAsync(path, base64, {
      encoding: EncodingType.Base64,
    });
    toneCache.set(key, path);
  }
  return toneCache.get(key) ?? null;
}

async function playTone(frequencyHz: number, durationMs: number) {
  if (!useSettingsStore.getState().sfxEnabled) return;
  const expo = await getAudioModule();
  if (!expo) return;
  try {
    const uri = await toneUri(frequencyHz, durationMs);
    if (!uri) return;
    const player = expo.createAudioPlayer(uri);
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
      }
    });
    player.play();
    setTimeout(() => {
      try {
        player.remove();
      } catch {
        // already removed
      }
    }, durationMs + 150);
  } catch {
    // simulator / permissions — fail silently
  }
}

export const feedback = {
  async play(event: FeedbackEvent, linesCleared = 0) {
    switch (event) {
      case 'place':
        await playTone(180, 45);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'clear':
        await playTone(320 + linesCleared * 40, 90);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'combo':
        await playTone(480 + linesCleared * 35, 120);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'gameover':
        await playTone(140, 160);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'newBest':
        await playTone(520, 100);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  },
};
