import { queueStorage } from './index';

export interface QueuedMutation {
  id: string;
  type: 'BOOK_CONSULTATION' | 'CANCEL_CONSULTATION' | 'ADD_HEALTH_RECORD' | 'PLACE_ORDER';
  payload: any;
  createdAt: string;
  retryCount: number;
}

const QUEUE_KEY = 'mutation_queue';

export function getMutationQueue(): QueuedMutation[] {
  const raw = queueStorage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedMutation[];
  } catch {
    return [];
  }
}

export function enqueueMutation(
  mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'retryCount'>,
): QueuedMutation {
  const current = getMutationQueue();
  const newMutation: QueuedMutation = {
    ...mutation,
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  const updated = [...current, newMutation];
  queueStorage.set(QUEUE_KEY, JSON.stringify(updated));
  return newMutation;
}

export function removeQueuedMutation(id: string): void {
  const current = getMutationQueue();
  const filtered = current.filter((m) => m.id !== id);
  queueStorage.set(QUEUE_KEY, JSON.stringify(filtered));
}

export function updateQueuedMutationRetry(id: string): void {
  const current = getMutationQueue();
  const updated = current.map((m) => (m.id === id ? { ...m, retryCount: m.retryCount + 1 } : m));
  queueStorage.set(QUEUE_KEY, JSON.stringify(updated));
}

export function clearMutationQueue(): void {
  queueStorage.remove(QUEUE_KEY);
}
