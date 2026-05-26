import { TurboModuleRegistry } from 'react-native';
import {
  canUseFirebaseAnalytics,
  canUseGoogleMobileAds,
  NATIVE_MODULE_NAMES,
} from '../src/utils/nativeModules';

describe('nativeModules', () => {
  const getSpy = jest.spyOn(TurboModuleRegistry, 'get');

  afterEach(() => {
    getSpy.mockReset();
  });

  it('detects Google Mobile Ads when the TurboModule is linked', () => {
    getSpy.mockImplementation((name) =>
      name === NATIVE_MODULE_NAMES.googleMobileAds ? ({} as never) : null
    );
    expect(canUseGoogleMobileAds()).toBe(true);
    expect(canUseFirebaseAnalytics()).toBe(false);
  });

  it('detects Firebase when the TurboModule is linked', () => {
    getSpy.mockImplementation((name) =>
      name === NATIVE_MODULE_NAMES.firebaseApp ? ({} as never) : null
    );
    expect(canUseFirebaseAnalytics()).toBe(true);
    expect(canUseGoogleMobileAds()).toBe(false);
  });

  it('returns false when modules are missing (Expo Go)', () => {
    getSpy.mockReturnValue(null);
    expect(canUseGoogleMobileAds()).toBe(false);
    expect(canUseFirebaseAnalytics()).toBe(false);
  });
});
