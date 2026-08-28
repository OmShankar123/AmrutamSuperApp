import axios from 'axios';

import { logger } from '@/core/logger';

import { chaosRequestInterceptor, chaosResponseInterceptor } from './interceptors/chaos';

export const apiClient = axios.create({
  baseURL: 'http://localhost/mock-api/v1',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(chaosRequestInterceptor, (error) => Promise.reject(error));

apiClient.interceptors.response.use(chaosResponseInterceptor, (error) => {
  logger.error('API', error?.message ?? 'Unknown error');
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
