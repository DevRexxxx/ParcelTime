import { ShipmentExternalStatus } from '@parceltime/shared';

export interface NormalizedTrackingEvent {
  eventCode: string;
  status: ShipmentExternalStatus;
  description?: string;
  location?: string;
  occurredAt: string;
  sourceProvider: string;
  providerEventId?: string;
}

export interface TrackingRegistrationResult {
  providerTrackingId: string;
  normalizedCarrier?: string;
  status: 'registered' | 'pending' | 'failed';
}

export interface TrackingQueryResult {
  status: ShipmentExternalStatus;
  events: NormalizedTrackingEvent[];
  estimatedDeliveryAt?: string;
}

export interface TrackingProvider {
  name: string;

  createTracking(input: {
    trackingNumber: string;
    carrierCode?: string;
    reference?: string;
  }): Promise<TrackingRegistrationResult>;

  getTracking(providerTrackingId: string): Promise<TrackingQueryResult>;

  verifyWebhook(
    rawBody: Buffer | string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<boolean>;

  normalizeWebhook(payload: unknown): Promise<{
    trackingNumber: string;
    carrierCode?: string;
    providerEventId?: string;
    events: NormalizedTrackingEvent[];
    estimatedDeliveryAt?: string;
  }>;
}

