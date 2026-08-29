import { create } from 'zustand';

import { appStorage } from '@/core/storage';

export interface FeatureFlags {
  enableAyushDiscount: boolean;
  enablePdfExport: boolean;
  enableDoctorRatingSort: boolean;
  enableExpressDelivery: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableAyushDiscount: true,
  enablePdfExport: true,
  enableDoctorRatingSort: true,
  enableExpressDelivery: true,
};

const FLAGS_STORAGE_KEY = 'remote_feature_flags';

function loadStoredFlags(): FeatureFlags {
  const raw = appStorage.getString(FLAGS_STORAGE_KEY);
  if (!raw) return DEFAULT_FLAGS;
  try {
    return { ...DEFAULT_FLAGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FLAGS;
  }
}

interface FeatureFlagsState {
  flags: FeatureFlags;
  setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  resetFlags: () => void;
}

export const useFeatureFlags = create<FeatureFlagsState>((set, get) => ({
  flags: loadStoredFlags(),

  setFlag: (key, value) => {
    const updated = { ...get().flags, [key]: value };
    appStorage.set(FLAGS_STORAGE_KEY, JSON.stringify(updated));
    set({ flags: updated });
  },

  resetFlags: () => {
    appStorage.set(FLAGS_STORAGE_KEY, JSON.stringify(DEFAULT_FLAGS));
    set({ flags: DEFAULT_FLAGS });
  },
}));
