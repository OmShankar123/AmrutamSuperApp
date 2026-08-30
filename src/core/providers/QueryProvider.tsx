import React from 'react';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { logger } from '@/core/logger';
import { cacheStorage } from '@/core/storage';

const persister = createSyncStoragePersister({
  storage: {
    getItem: (key: string) => cacheStorage.getString(key) ?? null,
    setItem: (key: string, value: string) => cacheStorage.set(key, value),
    removeItem: (key: string) => cacheStorage.remove(key),
  },
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'An error occurred while fetching data';
      if (
        !message.includes('Network offline') &&
        !message.includes('Network Error') &&
        error?.code !== 'ERR_NETWORK'
      ) {
        logger.error('QueryCache', message);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'The requested action could not be completed';
      if (
        !message.includes('Network offline') &&
        !message.includes('Network Error') &&
        error?.code !== 'ERR_NETWORK'
      ) {
        logger.error('MutationCache', message);
      }
    },
  }),
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days persistence in MMKV
      staleTime: 5 * 60 * 1000, // 5 minutes fresh
      retry: (failureCount, error: any) => {
        if (
          error?.message?.includes('Network offline') ||
          error?.message?.includes('Network Error') ||
          error?.code === 'ERR_NETWORK'
        ) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0,
      networkMode: 'offlineFirst',
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

export { queryClient, persister };
