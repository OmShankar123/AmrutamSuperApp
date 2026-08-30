import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { appStorage } from '@/core/storage';

const CHAOS_KEY = 'chaos_config';

export interface ChaosConfig {
  enabled: boolean;
  delayMs: number;
  errorRate: number;
  offline: boolean;
}

const defaultChaosConfig: ChaosConfig = {
  enabled: false,
  delayMs: 400,
  errorRate: 0,
  offline: false,
};

export function getChaosConfig(): ChaosConfig {
  const raw = appStorage.getString(CHAOS_KEY);
  if (!raw) return defaultChaosConfig;
  try {
    return JSON.parse(raw) as ChaosConfig;
  } catch {
    return defaultChaosConfig;
  }
}

export function setChaosConfig(config: Partial<ChaosConfig>): void {
  const current = getChaosConfig();
  appStorage.set(CHAOS_KEY, JSON.stringify({ ...current, ...config }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function chaosRequestInterceptor(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  const chaos = getChaosConfig();

  if (chaos.offline) {
    return Promise.reject(new Error('Network offline (simulated)'));
  }

  if (!chaos.enabled) return config;

  await sleep(chaos.delayMs);

  if (chaos.errorRate > 0 && Math.random() < chaos.errorRate) {
    return Promise.reject(new Error('Server error (simulated 500)'));
  }

  return config;
}

export async function chaosResponseInterceptor(response: AxiosResponse): Promise<AxiosResponse> {
  return response;
}
