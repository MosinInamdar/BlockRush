import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageGet, storageRemove, storageSet } from '../src/utils/safeStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('safeStorage', () => {
  it('returns null when getItem throws', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    expect(await storageGet('@test')).toBeNull();
  });

  it('returns false when setItem throws', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    expect(await storageSet('@test', '1')).toBe(false);
  });

  it('does not throw when removeItem fails', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    await expect(storageRemove('@test')).resolves.toBeUndefined();
  });
});
