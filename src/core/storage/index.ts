import { createMMKV } from 'react-native-mmkv';

export const appStorage = createMMKV({ id: 'amrutam-app-storage' });
export const secureStorage = createMMKV({ id: 'amrutam-secure-storage' });
export const cacheStorage = createMMKV({ id: 'amrutam-cache-storage' });
export const queueStorage = createMMKV({ id: 'amrutam-queue-storage' });

export async function initStorage(): Promise<void> {
  return Promise.resolve();
}

export const mmkvAdapter = {
  getItem: (key: string): string | null => appStorage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    appStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    appStorage.remove(key);
  },
};
