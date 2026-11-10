import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import { TrackingRegistry } from '../../integrations/tracking/tracking-registry';
import { ShipmentNormalizer } from '../shipments/shipment-normalizer';
import {
  WebhookInboxStatus,
  ShipmentExternalStatus,
  ShipmentInternalStatus,
  ShipmentEventDomain,
  NotificationCategory,
} from '@parceltime/shared';
import crypto from 'crypto';
import { createNotification } from '../notifications/notification.service';

export class WebhookService {
  /**
   * Ingests and durably processes inbound tracking webhooks
   */
  static async ingestWebhook(
    providerName: string,
    rawBody: Buffer | string,
    headers: Record<string, string | string[] | undefined>,
    parsedBody: any
  ) {
    const adapter = TrackingRegistry.get(providerName);

    // 1. Verify webhook signature
    const isValid = await adapter.verifyWebhook(rawBody, headers);
    if (!isValid) {
      throw Errors.UNAUTHENTICATED();
    }

    // 2. Normalize payload
    const normalized = await adapter.normalizeWebhook(parsedBody);
    const trackingNumber = ShipmentNormalizer.cleanTrackingNumber(normalized.trackingNumber);

    // Compute deterministic idempotency key
    const payloadString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    const providerEventId = normalized.providerEventId || payloadHash.substring(0, 32);
    const idempotencyKey = `${providerName.toUpperCase()}_${providerEventId}`;

    // 3. Persist to durable WebhookInbox (idempotent upsert)
    const inboxEntry = await prisma.webhookInbox.upsert({
      where: { idempotencyKey },
      update: {
        attemptCount: { increment: 1 },
      },
      create: {
        provider: providerName.toUpperCase(),
        providerEventId,
        idempotencyKey,
        payload: parsedBody,
        status: WebhookInboxStatus.PENDING,
      },
    });

    if (inboxEntry.status === WebhookInboxStatus.PROCESSED) {
      return { status: 'ALREADY_PROCESSED', idempotencyKey };
    }

    // 4. State projection: find active shipments matching this tracking number
    const matchingShipments = await prisma.shipment.findMany({
      where: { trackingNumber },
      include: { events: true },
    });

    for (const shipment of matchingShipments) {
      for (const event of normalized.events) {
        // Record immutable shipment event
        await prisma.shipmentEvent.create({
          data: {
            shipmentId: shipment.id,
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: event.eventCode,
            status: event.status,
            description: event.description,
            location: event.location,
            occurredAt: new Date(event.occurredAt),
            sourceProvider: providerName.toUpperCase(),
            providerEventId,
            payloadHash,
          },
        });

        // Determine internal custody reaction
        let newInternalStatus = shipment.internalStatus;
        if (event.status === ShipmentExternalStatus.DELIVERED_TO_SOCIETY) {
          // Key invariant: Courier delivered to gate, awaiting physical reception intake
          newInternalStatus = ShipmentInternalStatus.RECEIVED_AT_GATE;

          // Notify resident of gate drop
          await createNotification({
            societyId: shipment.societyId,
            userId: shipment.residentId,
            type: NotificationCategory.PARCEL_RECEIVED,
            title: 'Courier Arrived at Society Gate',
            message: `Courier marked shipment ${shipment.trackingNumber} as delivered to the gate. Reception will verify physical custody shortly.`,
            relatedParcelId: shipment.matchedParcelId || undefined,
          });
        }

        // Update shipment projection
        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            externalStatus: event.status,
            internalStatus: newInternalStatus,
            lastCarrierEventAt: new Date(event.occurredAt),
            estimatedDeliveryAt: normalized.estimatedDeliveryAt
              ? new Date(normalized.estimatedDeliveryAt)
              : shipment.estimatedDeliveryAt,
            updatedAt: new Date(),
          },
        });
      }
    }

    // 5. Mark webhook processed
    await prisma.webhookInbox.update({
      where: { id: inboxEntry.id },
      data: {
        status: WebhookInboxStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    return { status: 'PROCESSED', idempotencyKey, shipmentsUpdated: matchingShipments.length };
  }
}
