import crypto from 'crypto';
import { TrackingProvider, NormalizedTrackingEvent } from './tracking-provider.interface';
import { ShipmentExternalStatus } from '@parceltime/shared';

export class AftershipAdapter implements TrackingProvider {
  name = 'AFTERSHIP';
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.AFTERSHIP_WEBHOOK_SECRET || 'aftership_test_webhook_secret_2026';
  }

  async createTracking(input: {
    trackingNumber: string;
    carrierCode?: string;
    reference?: string;
  }) {
    return {
      providerTrackingId: `aft_${input.trackingNumber}`,
      normalizedCarrier: input.carrierCode || 'unknown',
      status: 'registered' as const,
    };
  }

  async getTracking(providerTrackingId: string) {
    return {
      status: ShipmentExternalStatus.IN_TRANSIT,
      events: [
        {
          eventCode: 'InTransit',
          status: ShipmentExternalStatus.IN_TRANSIT,
          description: 'Package in transit via carrier network',
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
    const signature = headers['aftership-hmac-sha256'] || headers['x-aftership-hmac-sha256'];
    if (!signature || typeof signature !== 'string') return false;

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const computed = crypto.createHmac('sha256', this.secret).update(payload).digest('base64');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
    } catch {
      return false;
    }
  }

  async normalizeWebhook(payload: any) {
    const data = payload?.msg || payload?.data?.tracking || payload;
    const trackingNumber = data?.tracking_number || data?.trackingNumber || '';
    const carrierCode = data?.slug || data?.carrierCode || 'OTHER';
    const tag = (data?.tag || data?.status || '').toLowerCase();
    const providerEventId = payload?.event_id || data?.id;

    let status = ShipmentExternalStatus.IN_TRANSIT;
    if (tag.includes('info') || tag.includes('pending')) {
      status = ShipmentExternalStatus.LABEL_CREATED;
    } else if (tag.includes('transit')) {
      status = ShipmentExternalStatus.IN_TRANSIT;
    } else if (tag.includes('outfordelivery') || tag.includes('out_for_delivery')) {
      status = ShipmentExternalStatus.OUT_FOR_DELIVERY;
    } else if (tag.includes('delivered')) {
      // Key invariant: External courier delivery scan is DELIVERED_TO_SOCIETY, NOT resident handover!
      status = ShipmentExternalStatus.DELIVERED_TO_SOCIETY;
    } else if (tag.includes('fail') || tag.includes('attempt')) {
      status = ShipmentExternalStatus.FAILED_ATTEMPT;
    } else if (tag.includes('exception')) {
      status = ShipmentExternalStatus.EXCEPTION;
    }

    const events: NormalizedTrackingEvent[] = [
      {
        eventCode: data?.tag || 'UPDATE',
        status,
        description: data?.subtag_message || data?.last_updated_note || `Carrier status: ${tag}`,
        location: data?.destination_raw || data?.origin_raw,
        occurredAt: data?.updated_at || new Date().toISOString(),
        sourceProvider: this.name,
        providerEventId,
      },
    ];

    return {
      trackingNumber,
      carrierCode,
      providerEventId,
      events,
      estimatedDeliveryAt: data?.expected_delivery,
    };
  }
}

