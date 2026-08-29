import React from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { logger } from '@/core/logger';
import { showErrorToast } from '@/shared/utils/toast';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'An error occurred while fetching data';
      logger.error('QueryCache', message);
      // Suppress toast if offline since OfflineBanner already informs the user
      if (!message.includes('offline')) {
        showErrorToast(message, 'Network Error');
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'The requested action could not be completed';
      logger.error('MutationCache', message);
      showErrorToast(message, 'Action Failed');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: {
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { queryClient };
