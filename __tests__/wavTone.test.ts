import { buildToneWavBase64 } from '../src/services/audio/wavTone';

describe('buildToneWavBase64', () => {
  it('returns valid base64 WAV data without Node buffer', () => {
    const b64 = buildToneWavBase64(440, 50);
    expect(b64.length).toBeGreaterThan(0);
    expect(b64).toMatch(/^[A-Za-z0-9+/]+=*$/);
    const decoded = atob(b64);
    expect(decoded.startsWith('RIFF')).toBe(true);
  });
});
