import { create } from 'zustand';

import { appStorage } from '@/core/storage';

export interface RemoteConfigParams {
  // Feature Toggles (Boolean Flags)
  enableAyushDiscount: boolean;
  enablePdfExport: boolean;
  enableDoctorRatingSort: boolean;
  enableExpressDelivery: boolean;

  // Remote Config Dynamic Variables
  freeDeliveryThreshold: number; // e.g. 299, 500, 999
  discountPercentage: number; // e.g. 10, 15, 20
  promotionalHeadline: string;
}

const DEFAULT_CONFIG: RemoteConfigParams = {
  enableAyushDiscount: true,
  enablePdfExport: true,
  enableDoctorRatingSort: true,
  enableExpressDelivery: true,
  freeDeliveryThreshold: 500,
  discountPercentage: 10,
  promotionalHeadline: 'AYUSH Ministry Discount',
};

const REMOTE_CONFIG_STORAGE_KEY = 'remote_feature_flags_and_config';

function loadStoredConfig(): RemoteConfigParams {
  const raw = appStorage.getString(REMOTE_CONFIG_STORAGE_KEY);
  if (!raw) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

interface RemoteConfigState {
  flags: RemoteConfigParams;
  setFlag: <K extends keyof RemoteConfigParams>(key: K, value: RemoteConfigParams[K]) => void;
  resetFlags: () => void;
}

export const useFeatureFlags = create<RemoteConfigState>((set, get) => ({
  flags: loadStoredConfig(),

  setFlag: (key, value) => {
    const updated = { ...get().flags, [key]: value };
    appStorage.set(REMOTE_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    set({ flags: updated });
  },

  resetFlags: () => {
    appStorage.set(REMOTE_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
    set({ flags: DEFAULT_CONFIG });
  },
}));
