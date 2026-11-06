import { prisma } from '../../lib/prisma';
import { UserRole } from '@parceltime/shared';

export interface WriteAuditLogParams {
  societyId: string;
  parcelId?: string;
  actorId?: string;
  actorRole?: UserRole;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  metadata?: any;
  requestId?: string;
  flagged?: boolean;
}

export async function writeAuditLog(params: WriteAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        societyId: params.societyId,
        parcelId: params.parcelId,
        actorId: params.actorId,
        actorRole: params.actorRole,
        eventType: params.eventType,
        previousStatus: params.previousStatus,
        newStatus: params.newStatus,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        requestId: params.requestId,
        flagged: params.flagged ?? false,
      },
    });
  } catch (error) {
    // Audit log errors shouldn't crash transactions if non-critical, but should log
    console.error('Failed to write audit log:', error);
    return null;
  }
}

export async function listAuditLogs(
  societyId: string,
  filters: {
    parcelId?: string;
    actorId?: string;
    flagged?: boolean;
    limit?: number;
    cursor?: string;
  }
) {
  const limit = filters.limit ?? 50;
  const where: any = { societyId };

  if (filters.parcelId) where.parcelId = filters.parcelId;
  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.flagged !== undefined) where.flagged = filters.flagged;

  const logs = await prisma.auditLog.findMany({
    where,
    take: limit + 1,
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { id: true, name: true, email: true } },
      parcel: { select: { id: true, parcelCode: true, trackingNumber: true } },
    },
  });

  const hasMore = logs.length > limit;
  const data = hasMore ? logs.slice(0, limit) : logs;
  const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

  return {
    data,
    hasMore,
    cursor: nextCursor,
  };
}

