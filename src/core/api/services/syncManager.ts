import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { create } from 'zustand';

import { getChaosConfig, setChaosConfig } from '@/core/api/interceptors/chaos';
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
  isForcedOffline: boolean;
  actualConnected: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  setNetworkState: (connected: boolean, reachable: boolean | null) => void;
  setForcedOffline: (forced: boolean) => void;
  syncQueue: () => Promise<void>;
  updatePendingCount: () => void;
}

const initialChaos = getChaosConfig();
const initialForcedOffline = Boolean(initialChaos.offline);

// Sync initial online status to TanStack Query onlineManager
onlineManager.setOnline(!initialForcedOffline);

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isForcedOffline: initialForcedOffline,
  actualConnected: true,
  isConnected: !initialForcedOffline,
  isInternetReachable: !initialForcedOffline,
  isSyncing: false,
  pendingSyncCount: getMutationQueue().length,

  setForcedOffline: (forced: boolean) => {
    setChaosConfig({ offline: forced });
    const actual = get().actualConnected;
    const effectiveConnected = forced ? false : actual;
    const wasOffline = !get().isConnected;

    // Notify TanStack Query onlineManager
    onlineManager.setOnline(effectiveConnected);

    set({
      isForcedOffline: forced,
      isConnected: effectiveConnected,
      isInternetReachable: forced ? false : actual,
    });

    if (wasOffline && effectiveConnected) {
      get().syncQueue();
    }
  },

  setNetworkState: (connected: boolean, reachable: boolean | null) => {
    const isForced = get().isForcedOffline;
    const effectiveConnected = isForced ? false : connected;
    const effectiveReachable = isForced ? false : (reachable ?? connected);
    const wasOffline = !get().isConnected;

    // Notify TanStack Query onlineManager
    onlineManager.setOnline(effectiveConnected);

    set({
      actualConnected: connected,
      isConnected: effectiveConnected,
      isInternetReachable: effectiveReachable,
    });

    // Auto-sync mutations & refresh queries when transitioning from offline to online
    if (wasOffline && effectiveConnected) {
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
        } else if (mutation.type === 'PLACE_ORDER') {
          await apiClient.post(API_ENDPOINTS.PLACE_ORDER, mutation.payload);
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

    // Automatically invalidate and refetch all query caches with fresh server data
    queryClient.invalidateQueries();

    set({ isSyncing: false, pendingSyncCount: getMutationQueue().length });

    if (successCount > 0) {
      showSuccessToast(`${successCount} offline actions synced successfully!`, 'Sync Complete');
    }
  },
}));

export function initNetworkListener(): () => void {
  // Fetch initial net info state
  NetInfo.fetch().then((state) => {
    useNetworkStore
      .getState()
      .setNetworkState(Boolean(state.isConnected), state.isInternetReachable);
  });

  const unsubscribe = NetInfo.addEventListener((state) => {
    useNetworkStore
      .getState()
      .setNetworkState(Boolean(state.isConnected), state.isInternetReachable);
  });

  return unsubscribe;
}
