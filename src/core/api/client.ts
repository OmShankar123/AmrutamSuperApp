import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

import Env from '@env';
import { logger } from '@/core/logger';
import { showErrorToast } from '@/shared/utils/toast';

import {
  chaosRequestInterceptor,
  chaosResponseInterceptor,
  getChaosConfig,
} from './interceptors/chaos';
import { handleMockRoute } from './services/mockRouter';

export const apiClient = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  adapter: async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const chaos = getChaosConfig();
    // Provide realistic API latency (350ms default or chaos configured delay)
    const simulatedDelay = chaos.enabled ? chaos.delayMs : 350;
    if (simulatedDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, simulatedDelay));
    }

    if (chaos.enabled && chaos.offline) {
      return Promise.reject(new Error('Network offline (simulated)'));
    }

    if (chaos.enabled && chaos.errorRate > 0 && Math.random() < chaos.errorRate) {
      return Promise.reject(new Error('Server error (simulated 500)'));
    }

    // Handle mock API responses in-app
    const mockResponse = handleMockRoute(config);
    if (mockResponse) {
      if (mockResponse.status >= 400) {
        return Promise.reject({
          response: mockResponse,
          message: mockResponse.data?.message ?? 'Request failed',
        });
      }
      return Promise.resolve(mockResponse);
    }

    return Promise.reject({
      response: {
        data: { message: `Route ${config.url} not found in mock database` },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      },
      message: `Route ${config.url} not found`,
    });
  },
});

apiClient.interceptors.request.use(chaosRequestInterceptor, (error) => Promise.reject(error));

apiClient.interceptors.response.use(chaosResponseInterceptor, (error) => {
  logger.error('API', error?.message ?? 'Unknown error');
  const errorMsg =
    error?.response?.data?.message || error?.message || 'An error occurred during API request';

  // Show immediate error toast (suppress when offline since OfflineBanner is already visible)
  if (!errorMsg.toLowerCase().includes('offline')) {
    showErrorToast(errorMsg, 'API Error');
  }
  return Promise.reject(error);
});

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
