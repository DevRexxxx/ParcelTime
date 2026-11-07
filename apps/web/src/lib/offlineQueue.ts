import { ParcelItem } from './types';

const QUEUE_STORAGE_KEY = 'pt_reception_offline_queue';

export interface QueuedParcelRegistration {
  id: string;
  data: Partial<ParcelItem>;
  timestamp: string;
  attempts: number;
}

export function getOfflineQueue(): QueuedParcelRegistration[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue from localStorage:', e);
    return [];
  }
}

export function enqueueOfflineParcel(parcel: Partial<ParcelItem>): QueuedParcelRegistration {
  const queue = getOfflineQueue();
  const queuedItem: QueuedParcelRegistration = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    data: parcel,
    timestamp: new Date().toISOString(),
    attempts: 0,
  };

  queue.push(queuedItem);
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save queued parcel to localStorage:', e);
  }

  return queuedItem;
}

export function removeFromOfflineQueue(queueId: string): void {
  const queue = getOfflineQueue().filter((item) => item.id !== queueId);
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to update offline queue:', e);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear offline queue:', e);
  }
}

export async function syncOfflineQueue(
  syncHandler: (item: Partial<ParcelItem>) => Promise<boolean>
): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remainingQueue: QueuedParcelRegistration[] = [];

  for (const item of queue) {
    try {
      const success = await syncHandler(item.data);
      if (success) {
        synced++;
      } else {
        failed++;
        remainingQueue.push({ ...item, attempts: item.attempts + 1 });
      }
    } catch {
      failed++;
      remainingQueue.push({ ...item, attempts: item.attempts + 1 });
    }
  }

  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  } catch (e) {
    console.error('Failed to persist remaining queue:', e);
  }

  return { synced, failed };
}

