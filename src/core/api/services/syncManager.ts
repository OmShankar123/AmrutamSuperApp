import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';

import { logger } from '@/core/logger';
import { queryClient } from '@/core/providers/QueryProvider';
import {
  getMutationQueue,
  removeQueuedMutation,
  updateQueuedMutationRetry,
} from '@/core/storage/queue';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isSyncing: boolean;
  pendingSyncCount: number;
  setNetworkState: (connected: boolean, reachable: boolean | null) => void;
  syncQueue: () => Promise<void>;
  updatePendingCount: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isConnected: true,
  isInternetReachable: true,
  isSyncing: false,
  pendingSyncCount: getMutationQueue().length,

  setNetworkState: (isConnected, isInternetReachable) => {
    const wasOffline = !get().isConnected;
    set({ isConnected, isInternetReachable });

    // Auto-sync when transitioning from offline to online
    if (wasOffline && isConnected) {
      get().syncQueue();
    }
  },

  updatePendingCount: () => {
    set({ pendingSyncCount: getMutationQueue().length });
  },

  syncQueue: async () => {
    const queue = getMutationQueue();
    if (queue.length === 0 || get().isSyncing) return;

    set({ isSyncing: true });
    logger.log('SyncManager', `Processing ${queue.length} offline mutations...`);

    let successCount = 0;

    for (const mutation of queue) {
      try {
        if (mutation.type === 'BOOK_CONSULTATION') {
          await apiClient.post(API_ENDPOINTS.BOOK_CONSULTATION, mutation.payload);
        } else if (mutation.type === 'CANCEL_CONSULTATION') {
          await apiClient.post(API_ENDPOINTS.CANCEL_CONSULTATION(mutation.payload.bookingId));
        }
        removeQueuedMutation(mutation.id);
        successCount++;
      } catch (err: any) {
        logger.error('SyncManager', `Failed to sync mutation ${mutation.id}:`, err?.message);
        if (mutation.retryCount >= 3) {
          removeQueuedMutation(mutation.id);
          showErrorToast(`Offline sync failed for: ${mutation.type}`);
        } else {
          updateQueuedMutationRetry(mutation.id);
        }
      }
    }

    // Refresh query caches for consultations and records
    queryClient.invalidateQueries({ queryKey: ['consultations'] });
    queryClient.invalidateQueries({ queryKey: ['health-records'] });

    set({ isSyncing: false, pendingSyncCount: getMutationQueue().length });

    if (successCount > 0) {
      showSuccessToast(`${successCount} offline actions synced successfully!`, 'Sync Complete');
    }
  },
}));

export function initNetworkListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    useNetworkStore
      .getState()
      .setNetworkState(Boolean(state.isConnected), state.isInternetReachable);
  });

  return unsubscribe;
}
