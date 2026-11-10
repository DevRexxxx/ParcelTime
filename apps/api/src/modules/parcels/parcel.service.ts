import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import {
  ParcelStatus,
  RegisterParcelSchema,
  NotificationCategory,
  PickupRequestStatus,
  VerificationMethod,
  ReportDamageDisputeSchema,
} from '@parceltime/shared';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { writeAuditLog } from '../audit/audit.service';

// Allowed state transitions
const TRANSITIONS: Record<string, ParcelStatus[]> = {
  [ParcelStatus.RECEIVED]: [ParcelStatus.SCHEDULED, ParcelStatus.CANCELLED],
  [ParcelStatus.SCHEDULED]: [
    ParcelStatus.ASSIGNED,
    ParcelStatus.RECEIVED,
    ParcelStatus.CANCELLED,
  ],
  [ParcelStatus.ASSIGNED]: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.SCHEDULED],
  [ParcelStatus.OUT_FOR_DELIVERY]: [ParcelStatus.DELIVERED, ParcelStatus.ASSIGNED],
  [ParcelStatus.DELIVERED]: [],
  [ParcelStatus.CANCELLED]: [ParcelStatus.RECEIVED],
  [ParcelStatus.UNCLAIMED]: [ParcelStatus.RETURNED_TO_COURIER, ParcelStatus.SCHEDULED],
  [ParcelStatus.RETURNED_TO_COURIER]: [],
};

export function canTransition(from: ParcelStatus, to: ParcelStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export async function registerParcel(
  data: z.infer<typeof RegisterParcelSchema>,
  societyId: string,
  receivedById: string
) {
  // Idempotency check
  const existing = await prisma.parcel.findFirst({
    where: {
      societyId,
      courier: data.courier,
      trackingNumber: data.trackingNumber,
    },
  });
  if (existing) return existing;

  const parcelCode = `PT-${Date.now().toString(36).toUpperCase()}`;

  const parcel = await prisma.parcel.create({
    data: {
      societyId,
      parcelCode,
      courier: data.courier,
      trackingNumber: data.trackingNumber,
      unitId: data.unitId,
      recipientName: data.recipientName,
      receivedById,
      storageLocationId: data.storageLocationId,
      status: ParcelStatus.RECEIVED,
    },
    include: {
      unit: { include: { tower: true } },
      storageLocation: true,
      receivedBy: true,
    },
  });

  await writeAuditLog({
    societyId,
    parcelId: parcel.id,
    actorId: receivedById,
    eventType: 'PARCEL_RECEIVED',
    newStatus: ParcelStatus.RECEIVED,
  });

  // Auto-bridge to any matching expected USIE Shipment
  try {
    const cleanTracking = data.trackingNumber.trim().replace(/[\s\-_#:]+/g, '').toUpperCase();
    const matchingShipment = await prisma.shipment.findFirst({
      where: {
        societyId,
        trackingNumber: cleanTracking,
        matchedParcelId: null,
      },
    });

    if (matchingShipment) {
      await prisma.shipment.update({
        where: { id: matchingShipment.id },
        data: {
          matchedParcelId: parcel.id,
          internalStatus: 'STORED' as any,
          updatedAt: new Date(),
        },
      });

      await prisma.shipmentEvent.create({
        data: {
          shipmentId: matchingShipment.id,
          eventDomain: 'INTERNAL_CUSTODY' as any,
          eventCode: 'RECEPTION_VERIFIED',
          status: 'STORED',
          description: `Auto-linked on physical gate registration. Parcel code: ${parcel.parcelCode}`,
          location: 'Society Storage Vault',
          sourceProvider: 'PARCELTIME_GATE',
        },
      });
    }
  } catch {
    // Non-blocking auto-link
  }

  return parcel;
}

export async function getParcelById(id: string, societyId: string) {
  const parcel = await prisma.parcel.findFirst({
    where: { id, societyId },
    include: {
      unit: { include: { tower: true } },
      storageLocation: true,
      receivedBy: true,
      schedules: {
        where: { status: 'ACTIVE' },
        include: { slotInstance: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!parcel) throw Errors.NOT_FOUND('Parcel');
  return parcel;
}

export async function listParcels(
  societyId: string,
  filters: { status?: ParcelStatus; unitId?: string; cursor?: string; limit?: number }
) {
  const limit = filters.limit ?? 20;
  const parcels = await prisma.parcel.findMany({
    where: {
      societyId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.unitId ? { unitId: filters.unitId } : {}),
      ...(filters.cursor ? { id: { lt: filters.cursor } } : {}),
    },
    include: {
      unit: { include: { tower: true } },
      storageLocation: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const hasMore = parcels.length > limit;
  const data = hasMore ? parcels.slice(0, limit) : parcels;
  return { data, hasMore, cursor: hasMore ? data[data.length - 1].id : undefined };
}

export async function moveParcelStorage(
  parcelId: string,
  societyId: string,
  storageLocationId: string,
  actorId: string
) {
  const parcel = await prisma.parcel.findFirst({ where: { id: parcelId, societyId } });
  if (!parcel) throw Errors.NOT_FOUND('Parcel');

  const updated = await prisma.parcel.update({
    where: { id: parcelId },
    data: { storageLocationId },
  });

  await writeAuditLog({
    societyId,
    parcelId,
    actorId,
    eventType: 'STORAGE_MOVED',
    metadata: { storageLocationId },
  });

  return updated;
}

export async function returnToCourier(
  parcelId: string,
  societyId: string,
  reason: string,
  actorId: string
) {
  const parcel = await prisma.parcel.findFirst({ where: { id: parcelId, societyId } });
  if (!parcel) throw Errors.NOT_FOUND('Parcel');

  if (!canTransition(parcel.status as ParcelStatus, ParcelStatus.RETURNED_TO_COURIER)) {
    throw Errors.INVALID_STATE(
      `Cannot return parcel in status ${parcel.status} to courier`
    );
  }

  const updated = await prisma.parcel.update({
    where: { id: parcelId },
    data: {
      status: ParcelStatus.RETURNED_TO_COURIER,
      statusUpdatedAt: new Date(),
      notes: reason,
    },
  });

  await writeAuditLog({
    societyId,
    parcelId,
    actorId,
    eventType: 'RETURNED_TO_COURIER',
    previousStatus: parcel.status,
    newStatus: ParcelStatus.RETURNED_TO_COURIER,
    metadata: { reason },
  });

  return updated;
}

export async function getParcelTimeline(parcelId: string, societyId: string) {
  const parcel = await prisma.parcel.findFirst({ where: { id: parcelId, societyId } });
  if (!parcel) throw Errors.NOT_FOUND('Parcel');

  return prisma.auditLog.findMany({
    where: { parcelId },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getParcelByQrToken(qrToken: string, societyId: string) {
  const parcel = await prisma.parcel.findFirst({
    where: { qrToken, societyId },
    include: {
      unit: { include: { tower: true } },
      storageLocation: true,
    },
  });
  if (!parcel) throw Errors.NOT_FOUND('Parcel');
  return parcel;
}

export async function completePickup(
  parcelId: string,
  societyId: string,
  verifiedById: string,
  data: { verificationMethod: VerificationMethod; otp?: string }
) {
  return await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUnique({
      where: { id: parcelId },
    });
    if (!parcel || parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Parcel');
    }

    await tx.pickupRequest.updateMany({
      where: { parcelId, status: PickupRequestStatus.REQUESTED },
      data: {
        status: PickupRequestStatus.COMPLETED,
        verifiedById,
        verificationMethod: data.verificationMethod,
        completedAt: new Date(),
      },
    });

    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        status: ParcelStatus.DELIVERED,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    await writeAuditLog({
      societyId,
      parcelId,
      actorId: verifiedById,
      eventType: 'PICKUP_COMPLETED',
      previousStatus: parcel.status,
      newStatus: ParcelStatus.DELIVERED,
      metadata: { verificationMethod: data.verificationMethod },
    });

    return updatedParcel;
  });
}

// Damage / Dispute Workflow (Roadmap 5 & 8.6 — P1)
export async function reportDamageDispute(
  parcelId: string,
  societyId: string,
  actorId: string,
  data: z.infer<typeof ReportDamageDisputeSchema>
) {
  const parcel = await prisma.parcel.findFirst({
    where: { id: parcelId, societyId },
  });
  if (!parcel) throw Errors.NOT_FOUND('Parcel');

  await writeAuditLog({
    societyId,
    parcelId,
    actorId,
    eventType: 'PARCEL_DISPUTE_REPORTED',
    metadata: {
      description: data.description,
      photoRef: data.photoRef,
      timestamp: new Date().toISOString(),
    },
    flagged: true,
  });

  return {
    success: true,
    parcelId,
    message: 'Dispute report logged in immutable audit registry for society admin review.',
  };
}

