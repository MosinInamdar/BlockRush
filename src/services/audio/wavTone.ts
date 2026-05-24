const BASE64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;

    result += BASE64[(triplet >> 18) & 0x3f];
    result += BASE64[(triplet >> 12) & 0x3f];
    result += i + 1 < len ? BASE64[(triplet >> 6) & 0x3f] : '=';
    result += i + 2 < len ? BASE64[triplet & 0x3f] : '=';
  }

  return result;
}

/** Build a tiny mono 8-bit WAV tone in memory (no asset files required). */
export function buildToneWavBase64(
  frequencyHz: number,
  durationMs: number,
  volume = 0.35
): string {
  const sampleRate = 8000;
  const numSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const dataSize = numSamples;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequencyHz * t) * volume;
    const byte = Math.max(0, Math.min(255, Math.floor((sample + 1) * 127.5)));
    view.setUint8(44 + i, byte);
  }

  return bytesToBase64(new Uint8Array(buffer));
}
