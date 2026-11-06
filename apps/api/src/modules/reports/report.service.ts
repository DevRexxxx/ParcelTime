import { prisma } from '../../lib/prisma';
import { ParcelStatus, TaskStatus, DeliveryAttemptOutcome } from '@parceltime/shared';
import dayjs from 'dayjs';

export async function getDashboardStats(societyId: string) {
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  const [
    totalParcels,
    receivedToday,
    inStorage,
    scheduled,
    outForDelivery,
    deliveredTotal,
    unclaimed,
    pickupRequests,
  ] = await Promise.all([
    prisma.parcel.count({ where: { societyId } }),
    prisma.parcel.count({
      where: {
        societyId,
        receivedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.parcel.count({
      where: { societyId, status: ParcelStatus.RECEIVED },
    }),
    prisma.parcel.count({
      where: { societyId, status: ParcelStatus.SCHEDULED },
    }),
    prisma.parcel.count({
      where: { societyId, status: ParcelStatus.OUT_FOR_DELIVERY },
    }),
    prisma.parcel.count({
      where: { societyId, status: ParcelStatus.DELIVERED },
    }),
    prisma.parcel.count({
      where: { societyId, status: ParcelStatus.UNCLAIMED },
    }),
    prisma.pickupRequest.count({
      where: { parcel: { societyId }, status: 'REQUESTED' },
    }),
  ]);

  // Storage utilization
  const storageLocations = await prisma.storageLocation.findMany({
    where: { societyId, active: true },
    include: {
      _count: {
        select: {
          parcels: {
            where: {
              status: { in: [ParcelStatus.RECEIVED, ParcelStatus.SCHEDULED, ParcelStatus.ASSIGNED] },
            },
          },
        },
      },
    },
  });

  const storageStats = storageLocations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    capacity: loc.capacity,
    used: loc._count.parcels,
    occupancyPct: loc.capacity > 0 ? Math.round((loc._count.parcels / loc.capacity) * 100) : 0,
  }));

  return {
    summary: {
      totalParcels,
      receivedToday,
      inStorage,
      scheduled,
      outForDelivery,
      deliveredTotal,
      unclaimed,
      pickupRequests,
    },
    storageStats,
  };
}

export async function getSlotUtilization(societyId: string, date: string) {
  const instances = await prisma.slotInstance.findMany({
    where: { societyId, date },
    include: { template: true },
    orderBy: { startTime: 'asc' },
  });

  return instances.map((instance) => ({
    id: instance.id,
    label: instance.template.label,
    startTime: instance.startTime,
    endTime: instance.endTime,
    capacity: instance.capacity,
    bookedCount: instance.bookedCount,
    utilizationPct:
      instance.capacity > 0
        ? Math.round((instance.bookedCount / instance.capacity) * 100)
        : 0,
    status: instance.status,
  }));
}

export async function getExecutivePerformance(societyId: string) {
  const executives = await prisma.societyMember.findMany({
    where: {
      societyId,
      roles: { has: 'DELIVERY_EXECUTIVE' },
      status: 'ACTIVE',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          assignedTasks: {
            where: { parcel: { societyId } },
            select: {
              status: true,
              attempts: {
                select: { outcome: true, verificationMethod: true },
              },
            },
          },
        },
      },
    },
  });

  return executives.map((member) => {
    const tasks = member.user.assignedTasks;
    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const failed = tasks.filter((t) => t.status === TaskStatus.FAILED).length;
    const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;

    let overrides = 0;
    tasks.forEach((t) => {
      overrides += t.attempts.filter((a) => a.verificationMethod === 'STAFF_OVERRIDE').length;
    });

    return {
      userId: member.user.id,
      name: member.user.name,
      totalAssigned: tasks.length,
      completed,
      failed,
      inProgress,
      overrides,
      successRatePct:
        completed + failed > 0 ? Math.round((completed / (completed + failed)) * 100) : 100,
    };
  });
}

