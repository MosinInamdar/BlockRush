import AsyncStorage from '@react-native-async-storage/async-storage';

/** Reads storage without throwing — returns null on failure. */
export async function storageGet(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes storage without throwing — returns whether the write succeeded. */
export async function storageSet(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Removes a key without throwing. */
export async function storageRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
