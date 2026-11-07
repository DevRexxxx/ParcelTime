import { ParcelItem, SlotItem, DeliveryTaskItem } from './types';
import { INITIAL_PARCELS, INITIAL_SLOTS, INITIAL_TASKS } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    if (fallback !== undefined) {
      console.warn(`[ParcelTime API] Request to ${url} failed; using offline/mock fallback:`, error);
      return fallback;
    }
    throw error;
  }
}

export const api = {
  // Parcels
  async getParcels(): Promise<ParcelItem[]> {
    return fetchWithFallback<ParcelItem[]>('/parcels', { method: 'GET' }, INITIAL_PARCELS);
  },

  async registerParcel(data: Partial<ParcelItem>): Promise<ParcelItem> {
    const fallbackParcel: ParcelItem = {
      id: `p-${Date.now()}`,
      parcelCode: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      courier: data.courier || 'Express Courier',
      trackingNumber: data.trackingNumber || `TRK-${Date.now()}`,
      unitNumber: data.unitNumber || '102',
      tower: data.tower || 'Tower A',
      recipientName: data.recipientName || 'Resident',
      status: 'RECEIVED',
      storageLocation: data.storageLocation || 'Storage Vault - Shelf A',
      receivedAt: 'Just now',
      notes: data.notes,
    };

    return fetchWithFallback<ParcelItem>(
      '/parcels',
      {
        method: 'POST',
        body: JSON.stringify({
          courier: data.courier,
          trackingNumber: data.trackingNumber,
          unitId: data.id || 'unit-default',
          storageLocationId: 'loc-default',
          recipientName: data.recipientName,
          idempotencyKey: `idemp-${Date.now()}`,
        }),
      },
      fallbackParcel
    );
  },

  async scheduleSlot(parcelId: string, slotInstanceId: string, deliveryNote?: string) {
    return fetchWithFallback(
      `/slots/${parcelId}/book`,
      {
        method: 'POST',
        body: JSON.stringify({
          slotInstanceId,
          deliveryNote,
          idempotencyKey: `book-${Date.now()}`,
        }),
      },
      { success: true, message: 'Parcel scheduled successfully' }
    );
  },

  // Slots
  async getAvailableSlots(date?: string): Promise<SlotItem[]> {
    const query = date ? `?date=${date}` : '';
    return fetchWithFallback<SlotItem[]>(`/slots/available${query}`, { method: 'GET' }, INITIAL_SLOTS);
  },

  // Tasks
  async getTasks(): Promise<DeliveryTaskItem[]> {
    return fetchWithFallback<DeliveryTaskItem[]>('/tasks', { method: 'GET' }, INITIAL_TASKS);
  },

  async verifyHandoverOtp(taskId: string, otp: string) {
    return fetchWithFallback(
      `/tasks/${taskId}/verify-otp`,
      {
        method: 'POST',
        body: JSON.stringify({
          otp,
          idempotencyKey: `verify-${Date.now()}`,
        }),
      },
      { success: true, status: 'DONE' }
    );
  },

  // Reports
  async getDashboardReports() {
    return fetchWithFallback(
      '/reports/dashboard',
      { method: 'GET' },
      {
        summary: {
          totalParcels: 4,
          inStorage: 2,
          scheduled: 1,
          outForDelivery: 1,
          deliveredTotal: 1,
        },
      }
    );
  },

  // Units & Towers
  async searchUnits(query?: string) {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return fetchWithFallback(`/society/units/search${q}`, { method: 'GET' }, []);
  },

  async bulkImportUnits(units: Array<{ towerName: string; floor: number; unitNumber: string }>) {
    return fetchWithFallback(
      '/society/units/import',
      {
        method: 'POST',
        body: JSON.stringify({ units }),
      },
      { total: units.length, imported: units.length, failed: 0, errors: [] }
    );
  },

  // Slot Templates & Instances
  async updateSlotTemplate(id: string, data: any) {
    return fetchWithFallback(`/slots/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updateSlotInstance(id: string, data: any) {
    return fetchWithFallback(`/slots/instances/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Devices & Notifications
  async registerDevice(platform: string, token: string) {
    return fetchWithFallback('/devices', {
      method: 'POST',
      body: JSON.stringify({ platform, token }),
    });
  },

  async getNotificationPreferences() {
    return fetchWithFallback('/notification-preferences', { method: 'GET' }, []);
  },

  async updateNotificationPreference(category: string, enabled: boolean) {
    return fetchWithFallback('/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify({ category, enabled }),
    });
  },

  // Invites
  async resendInvite(inviteId: string) {
    return fetchWithFallback(`/society/invites/${inviteId}/resend`, {
      method: 'POST',
    });
  },
};


