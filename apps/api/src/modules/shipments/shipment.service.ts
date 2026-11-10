import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import {
  ShipmentExternalStatus,
  ShipmentInternalStatus,
  ShipmentDiscoverySource,
  ShipmentEventDomain,
  NotificationCategory,
} from '@parceltime/shared';
import { ShipmentNormalizer } from './shipment-normalizer';
import { ShipmentMatcher } from './shipment-matcher';
import { TrackingRegistry } from '../../integrations/tracking/tracking-registry';
import { createNotification } from '../notifications/notification.service';
import crypto from 'crypto';

export interface CreateShipmentInput {
  trackingNumber: string;
  carrierCode: string;
  orderReference?: string;
  merchantName?: string;
  estimatedDeliveryAt?: string | null;
  sourceType?: 'MANUAL' | 'SHARE_FORWARD' | 'GMAIL';
}

export class ShipmentService {
  /**
   * Register or link a manual / shared shipment
   */
  static async createManualShipment(
    societyId: string,
    residentId: string,
    input: CreateShipmentInput
  ) {
    const cleanTracking = ShipmentNormalizer.cleanTrackingNumber(input.trackingNumber);
    const normalizedCarrier = ShipmentNormalizer.normalizeCarrier(input.carrierCode);

    // Look up resident's active unit
    const unitMember = await prisma.unitMembership.findFirst({
      where: { userId: residentId, unit: { societyId }, status: 'ACTIVE' },
    });

    if (!unitMember) {
      throw Errors.FORBIDDEN();
    }

    // Deduplication check
    const match = await ShipmentMatcher.findMatch({
      societyId,
      trackingNumber: cleanTracking,
      carrierCode: normalizedCarrier,
      orderReference: input.orderReference,
      residentId,
    });

    if (match.matchedShipmentId) {
      // Link source reference without creating a duplicate shipment
      await prisma.shipmentSourceReference.create({
        data: {
          shipmentId: match.matchedShipmentId,
          sourceType: (input.sourceType as any) || ShipmentDiscoverySource.MANUAL,
          externalReference: input.orderReference || cleanTracking,
          metadata: { note: 'Linked via manual entry fallback' },
        },
      });

      return await prisma.shipment.findUnique({
        where: { id: match.matchedShipmentId },
        include: { events: { orderBy: { occurredAt: 'desc' } } },
      });
    }

    // Create tracking number hash for fast indexing
    const trackingNumberHash = crypto.createHash('sha256').update(cleanTracking).digest('hex');

    const estimatedDate = input.estimatedDeliveryAt ? new Date(input.estimatedDeliveryAt) : null;

    const shipment = await prisma.shipment.create({
      data: {
        societyId,
        residentId,
        unitId: unitMember.unitId,
        trackingNumber: cleanTracking,
        trackingNumberHash,
        carrierCode: normalizedCarrier,
        orderReference: input.orderReference,
        merchantName: input.merchantName || 'E-Commerce Merchant',
        discoverySource: (input.sourceType as any) || ShipmentDiscoverySource.MANUAL,
        externalStatus: ShipmentExternalStatus.IN_TRANSIT,
        internalStatus: ShipmentInternalStatus.EXPECTED,
        estimatedDeliveryAt: estimatedDate,
        lastCarrierEventAt: new Date(),
        matchConfidence: 1.0,
        sourceReferences: {
          create: {
            sourceType: (input.sourceType as any) || ShipmentDiscoverySource.MANUAL,
            externalReference: input.orderReference || cleanTracking,
          },
        },
        events: {
          create: {
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: 'TRACKING_REGISTERED',
            status: ShipmentExternalStatus.IN_TRANSIT,
            description: `Shipment added via ${input.sourceType || 'MANUAL'} entry`,
            location: 'Carrier Transit Network',
            sourceProvider: normalizedCarrier,
          },
        },
      },
      include: {
        events: true,
      },
    });

    // Register with tracking provider adapter asynchronously
    try {
      const adapter = TrackingRegistry.get(normalizedCarrier);
      await adapter.createTracking({
        trackingNumber: cleanTracking,
        carrierCode: normalizedCarrier,
        reference: input.orderReference,
      });
    } catch {
      // Soft-fail: provider registration failure does not block manual entry
    }

    return shipment;
  }

  /**
   * Ingest discovered shipment (e.g. Gmail parser)
   */
  static async ingestDiscoveredShipment(
    societyId: string,
    residentId: string,
    unitId: string,
    candidate: {
      trackingNumber: string;
      carrierCode: string;
      orderReference?: string;
      merchantName?: string;
      estimatedDeliveryAt?: string;
      confidence: number;
    }
  ) {
    const cleanTracking = ShipmentNormalizer.cleanTrackingNumber(candidate.trackingNumber);
    const normalizedCarrier = ShipmentNormalizer.normalizeCarrier(candidate.carrierCode);

    const match = await ShipmentMatcher.findMatch({
      societyId,
      trackingNumber: cleanTracking,
      carrierCode: normalizedCarrier,
      orderReference: candidate.orderReference,
      residentId,
    });

    if (match.matchedShipmentId) {
      await prisma.shipmentSourceReference.create({
        data: {
          shipmentId: match.matchedShipmentId,
          sourceType: ShipmentDiscoverySource.GMAIL,
          externalReference: candidate.orderReference || cleanTracking,
          metadata: { confidence: candidate.confidence },
        },
      });
      return { action: 'LINKED', shipmentId: match.matchedShipmentId };
    }

    const trackingNumberHash = crypto.createHash('sha256').update(cleanTracking).digest('hex');
    const estimatedDate = candidate.estimatedDeliveryAt ? new Date(candidate.estimatedDeliveryAt) : null;

    const shipment = await prisma.shipment.create({
      data: {
        societyId,
        residentId,
        unitId,
        trackingNumber: cleanTracking,
        trackingNumberHash,
        carrierCode: normalizedCarrier,
        orderReference: candidate.orderReference,
        merchantName: candidate.merchantName || 'E-Commerce Merchant',
        discoverySource: ShipmentDiscoverySource.GMAIL,
        externalStatus: ShipmentExternalStatus.IN_TRANSIT,
        internalStatus: ShipmentInternalStatus.EXPECTED,
        estimatedDeliveryAt: estimatedDate,
        lastCarrierEventAt: new Date(),
        matchConfidence: candidate.confidence,
        sourceReferences: {
          create: {
            sourceType: ShipmentDiscoverySource.GMAIL,
            externalReference: candidate.orderReference || cleanTracking,
            metadata: { confidence: candidate.confidence },
          },
        },
        events: {
          create: {
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: 'EMAIL_DISCOVERY',
            status: ShipmentExternalStatus.IN_TRANSIT,
            description: `Automated shipment discovery from ${candidate.merchantName || 'Order Email'}`,
            location: 'External Merchant Dispatch',
            sourceProvider: 'GMAIL',
          },
        },
      },
    });

    return { action: 'CREATED', shipmentId: shipment.id };
  }

  /**
   * List shipments for resident
   */
  static async listResidentShipments(societyId: string, residentId: string) {
    return await prisma.shipment.findMany({
      where: { societyId, residentId },
      include: {
        events: { orderBy: { occurredAt: 'desc' } },
        matchedParcel: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Expected arrivals for Reception / Gate dashboard
   */
  static async getExpectedShipmentsForReception(societyId: string) {
    return await prisma.shipment.findMany({
      where: {
        societyId,
        matchedParcelId: null, // Not yet physically logged at reception
        internalStatus: {
          in: [
            ShipmentInternalStatus.EXPECTED,
            ShipmentInternalStatus.RECEIVED_AT_GATE,
          ],
        },
      },
      include: {
        resident: { select: { id: true, name: true, phone: true } },
        unit: { select: { id: true, unitNumber: true, tower: { select: { name: true } } } },
      },
      orderBy: { estimatedDeliveryAt: 'asc' },
    });
  }

  /**
   * Bridge: Connect physical reception Parcel intake to external Shipment
   */
  static async matchShipmentToParcel(
    societyId: string,
    shipmentId: string,
    parcelId: string,
    actorId: string
  ) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment || shipment.societyId !== societyId) {
      throw Errors.NOT_FOUND('Shipment');
    }

    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { unit: true },
    });

    if (!parcel || parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Parcel');
    }

    // Update shipment with custody linkage
    const updated = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        matchedParcelId: parcelId,
        internalStatus: ShipmentInternalStatus.STORED,
        updatedAt: new Date(),
      },
    });

    // Record internal custody event
    await prisma.shipmentEvent.create({
      data: {
        shipmentId,
        eventDomain: ShipmentEventDomain.INTERNAL_CUSTODY,
        eventCode: 'RECEPTION_VERIFIED',
        status: ShipmentInternalStatus.STORED,
        description: `Physical custody verified at gate reception. Parcel code: ${parcel.parcelCode}`,
        location: 'Society Storage Vault',
        sourceProvider: 'PARCELTIME_GATE',
      },
    });

    // Notify resident that external shipment has physically arrived at the gate
    await createNotification({
      societyId,
      userId: shipment.residentId,
      type: NotificationCategory.PARCEL_RECEIVED,
      title: 'Incoming Shipment Arrived at Gate',
      message: `Your ${shipment.carrierCode} shipment (${shipment.trackingNumber}) has arrived at reception and is stored in vault. Schedule doorstep delivery or select gate pickup.`,
      relatedParcelId: parcelId,
    });

    return updated;
  }
}
