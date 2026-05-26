type ExpoAudioModule = typeof import('expo-audio');

let audioModule: ExpoAudioModule | null = null;
let audioInitFailed = false;
let sessionReady = false;

export async function getAudioModule(): Promise<ExpoAudioModule | null> {
  if (audioInitFailed) return null;
  if (audioModule) return audioModule;
  try {
    audioModule = await import('expo-audio');
    return audioModule;
  } catch {
    audioInitFailed = true;
    return null;
  }
}

export async function ensureAudioSession(): Promise<ExpoAudioModule | null> {
  const expo = await getAudioModule();
  if (!expo || sessionReady) return expo;
  try {
    await expo.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    sessionReady = true;
  } catch {
    // Expo Go / simulator — continue without mode
  }
  return expo;
}
