import { colors } from '../src/theme/colors';

describe('project setup', () => {
  it('loads theme tokens', () => {
    expect(colors.background).toBe('#0D0D14');
  });
});
