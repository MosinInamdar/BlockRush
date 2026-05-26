import * as Haptics from 'expo-haptics';
import type { AudioPlayer } from 'expo-audio';
import { soundAssets, type SfxAssetKey } from '../constants/soundAssets';
import { useSettingsStore } from '../store/settingsStore';
import { ensureAudioSession } from './audio/audioSession';

export type FeedbackEvent = 'place' | 'clear' | 'combo' | 'gameover' | 'newBest';

const SFX_VOLUME = 0.88;
const EVENT_TO_ASSET: Record<FeedbackEvent, SfxAssetKey> = {
  place: 'place',
  clear: 'clear',
  combo: 'combo',
  gameover: 'gameover',
  newBest: 'newBest',
};

let sfxPlayers: Partial<Record<FeedbackEvent, AudioPlayer>> | null = null;
let lastPlayAt = 0;

async function ensureSfxPlayers(): Promise<Partial<Record<FeedbackEvent, AudioPlayer>> | null> {
  if (sfxPlayers) return sfxPlayers;
  const expo = await ensureAudioSession();
  if (!expo) return null;

  const players: Partial<Record<FeedbackEvent, AudioPlayer>> = {};
  const events = Object.keys(EVENT_TO_ASSET) as FeedbackEvent[];

  try {
    await Promise.all(
      events.map(async (event) => {
        const assetKey = EVENT_TO_ASSET[event];
        const player = expo.createAudioPlayer(soundAssets[assetKey], {
          downloadFirst: true,
          keepAudioSessionActive: true,
        });
        player.volume = SFX_VOLUME;
        players[event] = player;
        await expo.preload(soundAssets[assetKey]);
      })
    );
    sfxPlayers = players;
    return players;
  } catch {
    return null;
  }
}

function playSfx(event: FeedbackEvent) {
  if (!useSettingsStore.getState().sfxEnabled) return;
  const player = sfxPlayers?.[event];
  if (!player) {
    void ensureSfxPlayers().then((pool) => {
      const retry = pool?.[event];
      if (retry) {
        void retry.seekTo(0);
        retry.play();
      }
    });
    return;
  }
  void player.seekTo(0);
  player.play();
}

function runHaptic(event: FeedbackEvent) {
  switch (event) {
    case 'place':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'clear':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'combo':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'gameover':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'newBest':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
  }
}

function dispatchSfx(event: FeedbackEvent) {
  playSfx(event);
  runHaptic(event);
}

export const feedback = {
  async prewarm() {
    await ensureSfxPlayers();
  },

  async play(event: FeedbackEvent, linesCleared = 0) {
    dispatchSfx(event);
    void linesCleared;
  },

  /** Low-latency SFX for gameplay — debounces duplicate place within 40ms. */
  playImmediate(event: FeedbackEvent, linesCleared = 0) {
    const now = Date.now();
    if (now - lastPlayAt < 40 && event === 'place') return;
    lastPlayAt = now;

    if (!useSettingsStore.getState().sfxEnabled) {
      runHaptic(event);
      return;
    }

    dispatchSfx(event);
    void linesCleared;
  },
};
