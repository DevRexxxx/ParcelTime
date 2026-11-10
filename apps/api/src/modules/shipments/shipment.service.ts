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

export interface DiscoveredShipmentCandidate {
  trackingNumber: string;
  carrierCode: string;
  orderReference?: string;
  merchantName?: string;
  estimatedDeliveryAt?: string;
  confidence: number;
}

export class ShipmentService {
  /**
   * Register or link a manual / shared shipment.
   * Enforces cross-resident privacy, pre-intake gate auto-linking, and concurrency resilience (§10 & §14).
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

    // Deduplication & Cross-Resident Conflict check
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
      // Link source reference without creating duplicate records
      const existingRef = await prisma.shipmentSourceReference.findFirst({
        where: {
          shipmentId: match.matchedShipmentId,
          sourceType: (input.sourceType as any) || ShipmentDiscoverySource.MANUAL,
          externalReference: input.orderReference || cleanTracking,
        },
      });

      if (!existingRef) {
        await prisma.shipmentSourceReference.create({
          data: {
            shipmentId: match.matchedShipmentId,
            sourceType: (input.sourceType as any) || ShipmentDiscoverySource.MANUAL,
            externalReference: input.orderReference || cleanTracking,
            metadata: { note: 'Linked via manual entry fallback' },
          },
        });
      }

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

    const initialExternalStatus = preExistingParcel
      ? ShipmentExternalStatus.DELIVERED_TO_SOCIETY
      : ShipmentExternalStatus.IN_TRANSIT;

    const initialEvents: any[] = [
      {
        eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
        eventCode: 'TRACKING_REGISTERED',
        status: initialExternalStatus,
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

    let shipment;
    try {
      shipment = await prisma.shipment.create({
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
          externalStatus: initialExternalStatus,
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
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Concurrency collision: another concurrent request created the record
        const existing = await prisma.shipment.findFirst({
          where: { societyId, trackingNumber: cleanTracking },
          include: {
            events: { orderBy: { occurredAt: 'desc' } },
            sourceReferences: true,
            matchedParcel: { include: { storageLocation: true } },
          },
        });
        if (existing) {
          if (existing.residentId !== residentId) {
            throw Errors.CONFLICT('This tracking number is already registered to another resident in this society');
          }
          return existing;
        }
      }
      throw err;
    }

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
   * Ingest discovered shipment (e.g. Gmail parser, marketplace sync)
   * Supports both (societyId, residentId, unitId, candidate) and (societyId, residentId, candidate, unitId?) signatures.
   */
  static async ingestDiscoveredShipment(
    societyId: string,
    residentId: string,
    unitIdOrCandidate: string | DiscoveredShipmentCandidate,
    candidateOrUnitId?: DiscoveredShipmentCandidate | string
  ) {
    let unitId: string | undefined;
    let candidate: DiscoveredShipmentCandidate;

    if (typeof unitIdOrCandidate === 'string') {
      unitId = unitIdOrCandidate;
      candidate = candidateOrUnitId as DiscoveredShipmentCandidate;
    } else {
      candidate = unitIdOrCandidate;
      unitId = typeof candidateOrUnitId === 'string' ? candidateOrUnitId : undefined;
    }

    const cleanTracking = ShipmentNormalizer.cleanTrackingNumber(candidate.trackingNumber);
    if (!cleanTracking || cleanTracking.length < 4) {
      return { action: 'SKIPPED', reason: 'Invalid tracking number (fewer than 4 alphanumeric characters)' };
    }
    const normalizedCarrier = ShipmentNormalizer.normalizeCarrier(candidate.carrierCode);

    // If unitId was not supplied, resolve via active UnitMembership
    if (!unitId) {
      const membership = await prisma.unitMembership.findFirst({
        where: { userId: residentId, unit: { societyId }, status: 'ACTIVE' },
      });
      if (!membership) {
        return { action: 'SKIPPED', reason: 'Resident has no active unit membership in society' };
      }
      unitId = membership.unitId;
    }

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
      const existingRef = await prisma.shipmentSourceReference.findFirst({
        where: {
          shipmentId: match.matchedShipmentId,
          sourceType: ShipmentDiscoverySource.GMAIL,
          externalReference: candidate.orderReference || cleanTracking,
        },
      });

      if (!existingRef) {
        await prisma.shipmentSourceReference.create({
          data: {
            shipmentId: match.matchedShipmentId,
            sourceType: ShipmentDiscoverySource.GMAIL,
            externalReference: candidate.orderReference || cleanTracking,
            metadata: { confidence: candidate.confidence },
          },
        });
      }
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

    const initialExternalStatus = preExistingParcel
      ? ShipmentExternalStatus.DELIVERED_TO_SOCIETY
      : ShipmentExternalStatus.IN_TRANSIT;

    const initialEvents: any[] = [
      {
        eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
        eventCode: 'EMAIL_DISCOVERY',
        status: initialExternalStatus,
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

    let shipment;
    try {
      shipment = await prisma.shipment.create({
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
          externalStatus: initialExternalStatus,
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
    } catch (err: any) {
      if (err.code === 'P2002') {
        const existing = await prisma.shipment.findFirst({
          where: { societyId, trackingNumber: cleanTracking },
        });
        if (existing) {
          return { action: 'LINKED', shipmentId: existing.id };
        }
      }
      throw err;
    }

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
   * Atomic custody transition with dispute audit logging and unit consistency check (§10 & §14).
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

    if (shipment.matchedParcelId && shipment.matchedParcelId !== parcelId) {
      throw Errors.VALIDATION('Shipment is already linked to another gate parcel');
    }

    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { unit: true, storageLocation: true },
    });

    if (!parcel || parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Parcel');
    }

    const isUnitMismatch = shipment.unitId !== parcel.unitId;

    // Atomic database update of custody linkage and internal event
    const [updated] = await prisma.$transaction([
      prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          matchedParcelId: parcelId,
          internalStatus: ShipmentInternalStatus.STORED,
          updatedAt: new Date(),
        },
      }),
      prisma.shipmentEvent.create({
        data: {
          shipmentId,
          eventDomain: ShipmentEventDomain.INTERNAL_CUSTODY,
          eventCode: 'RECEPTION_VERIFIED',
          status: ShipmentInternalStatus.STORED,
          description: `Physical custody verified at gate reception. Parcel code: ${parcel.parcelCode}`,
          location: parcel.storageLocation?.name || 'Society Storage Vault',
          sourceProvider: 'PARCELTIME_GATE',
        },
      }),
    ]);

    // Write audit log for dispute traceability (flagged if cross-unit mismatch)
    await writeAuditLog({
      societyId,
      parcelId,
      actorId,
      eventType: 'SHIPMENT_LINKED',
      newStatus: parcel.status,
      flagged: isUnitMismatch,
      metadata: {
        shipmentId,
        trackingNumber: shipment.trackingNumber,
        carrierCode: shipment.carrierCode,
        parcelCode: parcel.parcelCode,
        unitMismatch: isUnitMismatch,
        shipmentUnitId: shipment.unitId,
        parcelUnitId: parcel.unitId,
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

  /**
   * Processes verified inbound tracking webhook updates from carrier providers (AfterShip, Shiprocket, Delhivery)
   * Enforces External Delivery Invariant and projects status onto Shipment aggregate (§8, §10, §11).
   */
  static async processCarrierWebhookUpdate(params: {
    societyId?: string;
    trackingNumber: string;
    carrierCode?: string;
    status: ShipmentExternalStatus | string;
    eventCode: string;
    description?: string;
    location?: string;
    occurredAt?: Date;
    estimatedDeliveryAt?: Date | null;
    provider?: string;
    providerEventId?: string;
  }) {
    const cleanTracking = ShipmentNormalizer.cleanTrackingNumber(params.trackingNumber);
    if (!cleanTracking) return null;

    // Enforce External Delivery Invariant: courier delivery maps strictly to DELIVERED_TO_SOCIETY, NEVER DELIVERED_TO_RESIDENT
    let projectedStatus: ShipmentExternalStatus = ShipmentExternalStatus.IN_TRANSIT;
    const normalizedStatusStr = String(params.status).toUpperCase();

    if (
      normalizedStatusStr.includes('DELIVERED') ||
      normalizedStatusStr === ShipmentExternalStatus.DELIVERED ||
      normalizedStatusStr === ShipmentExternalStatus.DELIVERED_TO_SOCIETY
    ) {
      projectedStatus = ShipmentExternalStatus.DELIVERED_TO_SOCIETY;
    } else if (normalizedStatusStr.includes('OUT_FOR_DELIVERY') || normalizedStatusStr.includes('OUT FOR DELIVERY')) {
      projectedStatus = ShipmentExternalStatus.OUT_FOR_DELIVERY;
    } else if (normalizedStatusStr.includes('EXCEPTION') || normalizedStatusStr.includes('FAILED')) {
      projectedStatus = ShipmentExternalStatus.EXCEPTION;
    } else if (normalizedStatusStr.includes('PICKED_UP') || normalizedStatusStr.includes('PICKED UP')) {
      projectedStatus = ShipmentExternalStatus.PICKED_UP;
    }

    // Find all active shipments for this tracking number
    const whereClause: any = { trackingNumber: cleanTracking };
    if (params.societyId) whereClause.societyId = params.societyId;

    const shipments = await prisma.shipment.findMany({
      where: whereClause,
    });

    if (shipments.length === 0) return null;

    for (const shipment of shipments) {
      // Append event and update status atomically
      await prisma.$transaction([
        prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            externalStatus: projectedStatus,
            lastCarrierEventAt: params.occurredAt || new Date(),
            lastSyncedAt: new Date(),
            ...(params.estimatedDeliveryAt ? { estimatedDeliveryAt: params.estimatedDeliveryAt } : {}),
            updatedAt: new Date(),
          },
        }),
        prisma.shipmentEvent.create({
          data: {
            shipmentId: shipment.id,
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: params.eventCode || projectedStatus,
            status: projectedStatus,
            description: params.description || `Carrier status update: ${projectedStatus}`,
            location: params.location || 'Carrier Transit Network',
            occurredAt: params.occurredAt || new Date(),
            sourceProvider: params.provider || params.carrierCode || shipment.carrierCode,
            providerEventId: params.providerEventId,
          },
        }),
      ]);

      // Fire notifications on key milestone transitions
      if (projectedStatus === ShipmentExternalStatus.OUT_FOR_DELIVERY && shipment.externalStatus !== ShipmentExternalStatus.OUT_FOR_DELIVERY) {
        await createNotification({
          societyId: shipment.societyId,
          userId: shipment.residentId,
          type: NotificationCategory.PARCEL_RECEIVED,
          title: 'Package Out For Delivery',
          message: `Your ${shipment.carrierCode} package (${shipment.trackingNumber}) is out for delivery today and will arrive at gate soon.`,
        });
      } else if (projectedStatus === ShipmentExternalStatus.DELIVERED_TO_SOCIETY && shipment.externalStatus !== ShipmentExternalStatus.DELIVERED_TO_SOCIETY) {
        await createNotification({
          societyId: shipment.societyId,
          userId: shipment.residentId,
          type: NotificationCategory.PARCEL_RECEIVED,
          title: 'Courier Arrived at Society Gate',
          message: `Your ${shipment.carrierCode} courier has reported delivery to your society gate. Reception will verify physical intake shortly.`,
        });
      }
    }

    return { processedCount: shipments.length, projectedStatus };
  }
}

