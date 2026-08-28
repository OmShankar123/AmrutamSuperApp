import * as SecureStore from 'expo-secure-store';

import { secureStorage } from './index';

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    secureStorage.set(key, value);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;
    return secureStorage.getString(key) ?? null;
  } catch {
    return secureStorage.getString(key) ?? null;
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    secureStorage.remove(key);
  }
}
