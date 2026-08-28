import { appStorage } from '@/core/storage';

export interface RemoteConfigValues {
  enableDiscounts: boolean;
  enableSlotInstantConfirmation: boolean;
  enableHealthRecordsPdfExport: boolean;
  maxCartQuantityPerItem: number;
  maintenanceMode: boolean;
}

const REMOTE_CONFIG_KEY = 'remote_config';

const defaultRemoteConfig: RemoteConfigValues = {
  enableDiscounts: true,
  enableSlotInstantConfirmation: true,
  enableHealthRecordsPdfExport: true,
  maxCartQuantityPerItem: 10,
  maintenanceMode: false,
};

export function getRemoteConfig(): RemoteConfigValues {
  const raw = appStorage.getString(REMOTE_CONFIG_KEY);
  if (!raw) return defaultRemoteConfig;
  try {
    return { ...defaultRemoteConfig, ...JSON.parse(raw) };
  } catch {
    return defaultRemoteConfig;
  }
}

export function setRemoteConfig(config: Partial<RemoteConfigValues>): void {
  const current = getRemoteConfig();
  appStorage.set(REMOTE_CONFIG_KEY, JSON.stringify({ ...current, ...config }));
}

export function useFeatureFlag(flag: keyof RemoteConfigValues): boolean | number {
  return getRemoteConfig()[flag];
}
