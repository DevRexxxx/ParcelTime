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
import { writeAuditLog } from '../audit/audit.service';
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
    if (!cleanTracking || cleanTracking.length < 4) {
      throw Errors.VALIDATION('Tracking number must contain at least 4 alphanumeric characters');
    }
    const normalizedCarrier = ShipmentNormalizer.normalizeCarrier(input.carrierCode);

    // Look up resident's active unit
    const unitMember = await prisma.unitMembership.findFirst({
      where: { userId: residentId, unit: { societyId }, status: 'ACTIVE' },
    });

    if (!unitMember) {
      throw Errors.FORBIDDEN();
    }

    // Deduplication & Conflict check
    const match = await ShipmentMatcher.findMatch({
      societyId,
      trackingNumber: cleanTracking,
      carrierCode: normalizedCarrier,
      orderReference: input.orderReference,
      residentId,
    });

    if (match.outcome === 'CONFLICT') {
      throw Errors.CONFLICT(
        match.reason || 'This tracking number is already registered to another resident in this society'
      );
    }

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

      const existingShipment = await prisma.shipment.findUnique({
        where: { id: match.matchedShipmentId },
        include: {
          events: { orderBy: { occurredAt: 'desc' } },
          sourceReferences: true,
          matchedParcel: { include: { storageLocation: true } },
        },
      });

      if (!existingShipment) {
        throw Errors.NOT_FOUND('Shipment');
      }

      return existingShipment;
    }

    // Check if the physical parcel was already logged at reception gate
    const preExistingParcel = await prisma.parcel.findFirst({
      where: {
        societyId,
        trackingNumber: cleanTracking,
      },
      include: {
        storageLocation: true,
      },
    });

    // Create tracking number hash for fast indexing
    const trackingNumberHash = crypto.createHash('sha256').update(cleanTracking).digest('hex');
    const estimatedDate = input.estimatedDeliveryAt ? new Date(input.estimatedDeliveryAt) : null;

    const initialInternalStatus = preExistingParcel
      ? ShipmentInternalStatus.STORED
      : ShipmentInternalStatus.EXPECTED;

    const initialEvents: any[] = [
      {
        eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
        eventCode: 'TRACKING_REGISTERED',
        status: ShipmentExternalStatus.IN_TRANSIT,
        description: `Shipment added via ${input.sourceType || 'MANUAL'} entry`,
        location: 'Carrier Transit Network',
        sourceProvider: normalizedCarrier,
      },
    ];

    if (preExistingParcel) {
      initialEvents.push({
        eventDomain: ShipmentEventDomain.INTERNAL_CUSTODY,
        eventCode: 'AUTO_LINKED_TO_GATE_PARCEL',
        status: ShipmentInternalStatus.STORED,
        description: `Auto-linked to pre-existing gate parcel ${preExistingParcel.parcelCode} stored at reception`,
        location: preExistingParcel.storageLocation?.name || 'Society Storage Vault',
        sourceProvider: 'PARCELTIME_GATE',
      });
    }

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
        externalStatus: preExistingParcel
          ? ShipmentExternalStatus.DELIVERED_TO_SOCIETY
          : ShipmentExternalStatus.IN_TRANSIT,
        internalStatus: initialInternalStatus,
        matchedParcelId: preExistingParcel ? preExistingParcel.id : null,
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
          create: initialEvents,
        },
      },
      include: {
        events: { orderBy: { occurredAt: 'desc' } },
        sourceReferences: true,
        matchedParcel: { include: { storageLocation: true } },
      },
    });

    if (preExistingParcel) {
      await writeAuditLog({
        societyId,
        parcelId: preExistingParcel.id,
        actorId: residentId,
        eventType: 'SHIPMENT_LINKED',
        newStatus: preExistingParcel.status,
        metadata: {
          shipmentId: shipment.id,
          trackingNumber: cleanTracking,
          carrierCode: normalizedCarrier,
          mechanism: 'PRE_INTAKE_AUTO_LINK',
        },
      });

      await createNotification({
        societyId,
        userId: residentId,
        type: NotificationCategory.PARCEL_RECEIVED,
        title: 'Shipment Already at Gate Reception',
        message: `Your ${normalizedCarrier} shipment (${cleanTracking}) was already logged at reception. Ready for doorstep delivery or pickup.`,
        relatedParcelId: preExistingParcel.id,
      });
    }

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
    if (!cleanTracking || cleanTracking.length < 4) {
      return { action: 'SKIPPED', reason: 'Invalid tracking number (fewer than 4 alphanumeric characters)' };
    }
    const normalizedCarrier = ShipmentNormalizer.normalizeCarrier(candidate.carrierCode);

    const match = await ShipmentMatcher.findMatch({
      societyId,
      trackingNumber: cleanTracking,
      carrierCode: normalizedCarrier,
      orderReference: candidate.orderReference,
      residentId,
    });

    if (match.outcome === 'CONFLICT') {
      return { action: 'CONFLICT', reason: match.reason };
    }

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

    const preExistingParcel = await prisma.parcel.findFirst({
      where: {
        societyId,
        trackingNumber: cleanTracking,
      },
      include: {
        storageLocation: true,
      },
    });

    const trackingNumberHash = crypto.createHash('sha256').update(cleanTracking).digest('hex');
    const estimatedDate = candidate.estimatedDeliveryAt ? new Date(candidate.estimatedDeliveryAt) : null;

    const initialInternalStatus = preExistingParcel
      ? ShipmentInternalStatus.STORED
      : ShipmentInternalStatus.EXPECTED;

    const initialEvents: any[] = [
      {
        eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
        eventCode: 'EMAIL_DISCOVERY',
        status: ShipmentExternalStatus.IN_TRANSIT,
        description: `Automated shipment discovery from ${candidate.merchantName || 'Order Email'}`,
        location: 'External Merchant Dispatch',
        sourceProvider: 'GMAIL',
      },
    ];

    if (preExistingParcel) {
      initialEvents.push({
        eventDomain: ShipmentEventDomain.INTERNAL_CUSTODY,
        eventCode: 'AUTO_LINKED_TO_GATE_PARCEL',
        status: ShipmentInternalStatus.STORED,
        description: `Auto-linked to pre-existing gate parcel ${preExistingParcel.parcelCode} stored at reception`,
        location: preExistingParcel.storageLocation?.name || 'Society Storage Vault',
        sourceProvider: 'PARCELTIME_GATE',
      });
    }

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
        externalStatus: preExistingParcel
          ? ShipmentExternalStatus.DELIVERED_TO_SOCIETY
          : ShipmentExternalStatus.IN_TRANSIT,
        internalStatus: initialInternalStatus,
        matchedParcelId: preExistingParcel ? preExistingParcel.id : null,
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
          create: initialEvents,
        },
      },
    });

    if (preExistingParcel) {
      await writeAuditLog({
        societyId,
        parcelId: preExistingParcel.id,
        actorId: residentId,
        eventType: 'SHIPMENT_LINKED',
        newStatus: preExistingParcel.status,
        metadata: {
          shipmentId: shipment.id,
          trackingNumber: cleanTracking,
          carrierCode: normalizedCarrier,
          mechanism: 'DISCOVERY_PRE_INTAKE_AUTO_LINK',
        },
      });

      await createNotification({
        societyId,
        userId: residentId,
        type: NotificationCategory.PARCEL_RECEIVED,
        title: 'Discovered Shipment Already at Gate',
        message: `Your ${normalizedCarrier} shipment (${cleanTracking}) from ${candidate.merchantName || 'Merchant'} is already stored at reception. Schedule doorstep delivery or select gate pickup.`,
        relatedParcelId: preExistingParcel.id,
      });
    }

    // Register with tracking provider adapter asynchronously
    try {
      const adapter = TrackingRegistry.get(normalizedCarrier);
      await adapter.createTracking({
        trackingNumber: cleanTracking,
        carrierCode: normalizedCarrier,
        reference: candidate.orderReference,
      });
    } catch {
      // Soft-fail: provider registration failure does not block ingestion
    }

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
        sourceReferences: true,
        matchedParcel: {
          include: {
            storageLocation: true,
          },
        },
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
      orderBy: [
        { externalStatus: 'desc' },
        { updatedAt: 'desc' },
      ],
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
      include: { unit: true, storageLocation: true },
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
        location: parcel.storageLocation?.name || 'Society Storage Vault',
        sourceProvider: 'PARCELTIME_GATE',
      },
    });

    // Write audit log for dispute traceability
    await writeAuditLog({
      societyId,
      parcelId,
      actorId,
      eventType: 'SHIPMENT_LINKED',
      newStatus: parcel.status,
      metadata: {
        shipmentId,
        trackingNumber: shipment.trackingNumber,
        carrierCode: shipment.carrierCode,
        parcelCode: parcel.parcelCode,
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
