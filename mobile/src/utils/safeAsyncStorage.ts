import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Safe wrapper around AsyncStorage that catches errors instead of crashing.
 * Falls back to in-memory Map when native module is unavailable.
 */
const memoryFallback = new Map<string, string>();

async function isAvailable(): Promise<boolean> {
  try {
    const key = '__async_storage_probe__';
    await AsyncStorage.setItem(key, '1');
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

let availabilityPromise: Promise<boolean> | null = null;

function checkAvailable(): Promise<boolean> {
  if (!availabilityPromise) {
    availabilityPromise = isAvailable();
  }
  return availabilityPromise;
}

export const safeAsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const available = await checkAvailable();
      if (available) {
        return await AsyncStorage.getItem(key);
      }
      return memoryFallback.get(key) ?? null;
    } catch (e) {
      console.warn('[safeAsyncStorage] getItem failed, using fallback:', (e as Error).message);
      return memoryFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryFallback.set(key, value);
    try {
      const available = await checkAvailable();
      if (available) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('[safeAsyncStorage] setItem failed, using fallback:', (e as Error).message);
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryFallback.delete(key);
    try {
      const available = await checkAvailable();
      if (available) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[safeAsyncStorage] removeItem failed:', (e as Error).message);
    }
  },
};
