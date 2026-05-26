import { getIntroTotalDurationMs, introTiming } from '../src/theme/animation';

describe('getIntroTotalDurationMs', () => {
  it('waits for logo and title motion plus hold before home', () => {
    const motionEnd = Math.max(
      introTiming.logoFade,
      introTiming.titleDelay + introTiming.titleFade
    );
    expect(getIntroTotalDurationMs()).toBe(motionEnd + introTiming.hold);
  });
});
