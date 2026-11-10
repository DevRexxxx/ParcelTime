import { TrackingProvider, NormalizedTrackingEvent } from './tracking-provider.interface';
import { ShipmentExternalStatus } from '@parceltime/shared';

export class MockCarrierAdapter implements TrackingProvider {
  name: string;

  constructor(name = 'MOCK_CARRIER') {
    this.name = name;
  }

  async createTracking(input: {
    trackingNumber: string;
    carrierCode?: string;
    reference?: string;
  }) {
    return {
      providerTrackingId: `mock_${input.trackingNumber}`,
      normalizedCarrier: input.carrierCode || 'DELHIVERY',
      status: 'registered' as const,
    };
  }

  async getTracking(providerTrackingId: string) {
    return {
      status: ShipmentExternalStatus.OUT_FOR_DELIVERY,
      events: [
        {
          eventCode: 'OUT_FOR_DELIVERY',
          status: ShipmentExternalStatus.OUT_FOR_DELIVERY,
          description: 'Package is out for delivery with local courier',
          occurredAt: new Date().toISOString(),
          sourceProvider: this.name,
        },
      ],
    };
  }

  async verifyWebhook(
    rawBody: Buffer | string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<boolean> {
    // Allows testing in test/dev with any valid mock header
    return headers['x-mock-signature'] === 'valid_mock_signature' || true;
  }

  async normalizeWebhook(payload: any) {
    const trackingNumber = payload?.trackingNumber || 'MOCK-12345';
    const carrierCode = payload?.carrierCode || 'DELHIVERY';
    const status = payload?.status || ShipmentExternalStatus.OUT_FOR_DELIVERY;

    return {
      trackingNumber,
      carrierCode,
      providerEventId: payload?.providerEventId || `mock_evt_${Date.now()}`,
      events: [
        {
          eventCode: payload?.eventCode || 'UPDATE',
          status,
          description: payload?.description || 'Mock carrier event update',
          location: payload?.location || 'Bengaluru Sorting Hub',
          occurredAt: payload?.occurredAt || new Date().toISOString(),
          sourceProvider: this.name,
        },
      ],
      estimatedDeliveryAt: payload?.estimatedDeliveryAt,
    };
  }
}
