import crypto from 'crypto';
import { TrackingProvider, NormalizedTrackingEvent } from './tracking-provider.interface';
import { ShipmentExternalStatus } from '@parceltime/shared';

export class ShiprocketAdapter implements TrackingProvider {
  name = 'SHIPROCKET';
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.SHIPROCKET_WEBHOOK_SECRET || 'shiprocket_test_secret_2026';
  }

  async createTracking(input: {
    trackingNumber: string;
    carrierCode?: string;
    reference?: string;
  }) {
    return {
      providerTrackingId: `sr_${input.trackingNumber}`,
      normalizedCarrier: input.carrierCode || 'SHIPROCKET',
      status: 'registered' as const,
    };
  }

  async getTracking(providerTrackingId: string) {
    return {
      status: ShipmentExternalStatus.IN_TRANSIT,
      events: [
        {
          eventCode: 'IN_TRANSIT',
          status: ShipmentExternalStatus.IN_TRANSIT,
          description: 'Shipment dispatched through Shiprocket network',
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
    const signature = headers['x-shiprocket-signature'] || headers['shiprocket-signature'];
    if (!signature || typeof signature !== 'string') {
      // In dev/test, accept authorization header token if matching secret
      const token = headers['x-api-key'] || headers['authorization'];
      if (token === this.secret || token === `Bearer ${this.secret}`) return true;
      return false;
    }

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const computed = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
    } catch {
      return false;
    }
  }

  async normalizeWebhook(payload: any) {
    const trackingNumber = payload?.awb || payload?.tracking_number || payload?.shipment_id || '';
    const carrierCode = payload?.courier_name || 'SHIPROCKET';
    const rawStatus = (payload?.current_status || payload?.status || '').toUpperCase();
    const providerEventId = payload?.id || `${payload?.awb}_${payload?.timestamp || Date.now()}`;

    let status = ShipmentExternalStatus.IN_TRANSIT;
    if (rawStatus.includes('PICKED') || rawStatus.includes('MANIFEST')) {
      status = ShipmentExternalStatus.PICKED_UP;
    } else if (rawStatus.includes('OUT FOR DELIVERY')) {
      status = ShipmentExternalStatus.OUT_FOR_DELIVERY;
    } else if (rawStatus.includes('DELIVERED')) {
      status = ShipmentExternalStatus.DELIVERED_TO_SOCIETY;
    } else if (rawStatus.includes('RTO') || rawStatus.includes('RETURN')) {
      status = ShipmentExternalStatus.RETURNED_TO_SENDER;
    } else if (rawStatus.includes('CANCEL')) {
      status = ShipmentExternalStatus.EXCEPTION;
    }

    const events: NormalizedTrackingEvent[] = [
      {
        eventCode: rawStatus,
        status,
        description: payload?.activity || payload?.scans?.[0]?.activity || `Carrier status: ${rawStatus}`,
        location: payload?.current_location || payload?.scans?.[0]?.location,
        occurredAt: payload?.scans?.[0]?.date || new Date().toISOString(),
        sourceProvider: this.name,
        providerEventId,
      },
    ];

    return {
      trackingNumber,
      carrierCode,
      providerEventId,
      events,
      estimatedDeliveryAt: payload?.etd,
    };
  }
}

