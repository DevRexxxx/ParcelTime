import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import {
  SlotInstanceStatus,
  ParcelStatus,
  DeliveryScheduleStatus,
  TaskStatus,
  NotificationCategory,
  SlotTemplateSchema,
  BookSlotSchema,
  RescheduleSchema,
} from '@parceltime/shared';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { writeAuditLog } from '../audit/audit.service';
import { createNotification } from '../notifications/notification.service';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function createTemplate(
  societyId: string,
  data: z.infer<typeof SlotTemplateSchema>
) {
  return await prisma.slotTemplate.create({
    data: {
      societyId,
      label: data.label,
      startTime: data.startTime,
      endTime: data.endTime,
      capacity: data.capacity,
      activeWeekdays: data.activeWeekdays,
      active: data.active ?? true,
    },
  });
}

export async function listTemplates(societyId: string) {
  return await prisma.slotTemplate.findMany({
    where: { societyId, active: true },
    orderBy: { startTime: 'asc' },
  });
}

export async function listAvailableSlots(societyId: string, date: string) {
  const society = await prisma.society.findUnique({
    where: { id: societyId },
  });
  if (!society) throw Errors.NOT_FOUND('Society');

  // Check scheduling horizon
  const today = dayjs().tz(society.timezone).startOf('day');
  const targetDate = dayjs(date).tz(society.timezone).startOf('day');
  const horizonDate = today.add(society.schedulingHorizonDays, 'day');

  if (targetDate.isBefore(today)) {
    throw Errors.VALIDATION('Cannot view or book slots in the past');
  }
  if (targetDate.isAfter(horizonDate)) {
    throw Errors.VALIDATION(`Cannot book beyond ${society.schedulingHorizonDays} days ahead`);
  }

  // Ensure instances exist for this date
  await generateSlotInstancesForDate(societyId, date);

  // Return instances with cutoff status
  const instances = await prisma.slotInstance.findMany({
    where: { societyId, date },
    include: { template: true },
    orderBy: { startTime: 'asc' },
  });

  const now = dayjs().tz(society.timezone);

  return instances.map((instance) => {
    // Check cutoff
    const slotStart = dayjs.tz(`${instance.date} ${instance.startTime}`, 'YYYY-MM-DD HH:mm', society.timezone);
    const cutoffTime = slotStart.subtract(society.slotCutoffHours, 'hour');
    const isCutoffPassed = now.isAfter(cutoffTime);
    const isFull = instance.bookedCount >= instance.capacity;

    return {
      ...instance,
      isCutoffPassed,
      isAvailable: instance.status === SlotInstanceStatus.OPEN && !isCutoffPassed && !isFull,
      remainingCapacity: Math.max(0, instance.capacity - instance.bookedCount),
    };
  });
}

export async function generateSlotInstancesForDate(societyId: string, date: string) {
  const templates = await prisma.slotTemplate.findMany({
    where: { societyId, active: true },
  });

  const dayOfWeek = dayjs(date).day(); // 0 = Sunday

  for (const template of templates) {
    if (!template.activeWeekdays.includes(dayOfWeek)) continue;

    const existing = await prisma.slotInstance.findUnique({
      where: {
        templateId_date: {
          templateId: template.id,
          date,
        },
      },
    });

    if (!existing) {
      await prisma.slotInstance.create({
        data: {
          societyId,
          templateId: template.id,
          date,
          startTime: template.startTime,
          endTime: template.endTime,
          capacity: template.capacity,
          bookedCount: 0,
          status: SlotInstanceStatus.OPEN,
        },
      });
    }
  }
}

export async function bookSlot(
  societyId: string,
  parcelId: string,
  requestedById: string,
  data: z.infer<typeof BookSlotSchema>
) {
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  if (!society) throw Errors.NOT_FOUND('Society');

  return await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUnique({
      where: { id: parcelId },
      include: { schedules: { where: { status: DeliveryScheduleStatus.ACTIVE } } },
    });
    if (!parcel || parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Parcel');
    }

    if (parcel.status !== ParcelStatus.RECEIVED && parcel.status !== ParcelStatus.CANCELLED) {
      throw Errors.INVALID_STATE(`Parcel cannot be scheduled from status ${parcel.status}`);
    }

    const slotInstance = await tx.slotInstance.findUnique({
      where: { id: data.slotInstanceId },
    });
    if (!slotInstance || slotInstance.societyId !== societyId) {
      throw Errors.NOT_FOUND('Slot');
    }

    if (slotInstance.status !== SlotInstanceStatus.OPEN) {
      throw Errors.SLOT_FULL();
    }

    // Cutoff validation
    const now = dayjs().tz(society.timezone);
    const slotStart = dayjs.tz(
      `${slotInstance.date} ${slotInstance.startTime}`,
      'YYYY-MM-DD HH:mm',
      society.timezone
    );
    const cutoffTime = slotStart.subtract(society.slotCutoffHours, 'hour');
    if (now.isAfter(cutoffTime)) {
      throw Errors.SLOT_CUTOFF();
    }

    // Check capacity concurrency
    if (slotInstance.bookedCount >= slotInstance.capacity) {
      throw Errors.SLOT_FULL();
    }

    // Increment slot booking atomically
    await tx.slotInstance.update({
      where: { id: slotInstance.id },
      data: { bookedCount: { increment: 1 } },
    });

    // Mark previous active schedules as superseded
    await tx.deliverySchedule.updateMany({
      where: { parcelId, status: DeliveryScheduleStatus.ACTIVE },
      data: { status: DeliveryScheduleStatus.SUPERSEDED },
    });

    // Create schedule
    const schedule = await tx.deliverySchedule.create({
      data: {
        parcelId,
        requestedById,
        slotInstanceId: slotInstance.id,
        deliveryNote: data.deliveryNote,
        status: DeliveryScheduleStatus.ACTIVE,
      },
    });

    // Create initial DeliveryTask
    const task = await tx.deliveryTask.create({
      data: {
        scheduleId: schedule.id,
        parcelId,
        status: TaskStatus.OPEN,
      },
    });

    // Update parcel status
    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        status: ParcelStatus.SCHEDULED,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    await writeAuditLog({
      societyId,
      parcelId,
      actorId: requestedById,
      eventType: 'SLOT_BOOKED',
      previousStatus: parcel.status,
      newStatus: ParcelStatus.SCHEDULED,
      metadata: { slotInstanceId: slotInstance.id, date: slotInstance.date, time: slotInstance.startTime },
    });

    await createNotification({
      societyId,
      userId: requestedById,
      type: NotificationCategory.SCHEDULE_CONFIRMED,
      title: 'Delivery Scheduled',
      message: `Your parcel ${parcel.parcelCode} is scheduled for ${slotInstance.date} between ${slotInstance.startTime} - ${slotInstance.endTime}.`,
      relatedParcelId: parcelId,
    });

    return { schedule, task, parcel: updatedParcel };
  });
}

export async function rescheduleSlot(
  societyId: string,
  parcelId: string,
  requestedById: string,
  data: z.infer<typeof RescheduleSchema>
) {
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  if (!society) throw Errors.NOT_FOUND('Society');

  return await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUnique({
      where: { id: parcelId },
      include: {
        schedules: {
          where: { status: DeliveryScheduleStatus.ACTIVE },
          include: { slotInstance: true },
        },
      },
    });
    if (!parcel || parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Parcel');
    }

    if (parcel.status !== ParcelStatus.SCHEDULED) {
      throw Errors.INVALID_STATE('Only scheduled parcels can be rescheduled');
    }

    const currentSchedule = parcel.schedules[0];
    if (!currentSchedule) {
      throw Errors.NOT_FOUND('Active schedule');
    }

    // Check cutoff on existing slot
    const now = dayjs().tz(society.timezone);
    const currentStart = dayjs.tz(
      `${currentSchedule.slotInstance.date} ${currentSchedule.slotInstance.startTime}`,
      'YYYY-MM-DD HH:mm',
      society.timezone
    );
    const cutoffTime = currentStart.subtract(society.slotCutoffHours, 'hour');
    if (now.isAfter(cutoffTime)) {
      throw Errors.SLOT_CUTOFF();
    }

    // New slot checks
    const newSlot = await tx.slotInstance.findUnique({
      where: { id: data.slotInstanceId },
    });
    if (!newSlot || newSlot.societyId !== societyId || newSlot.status !== SlotInstanceStatus.OPEN) {
      throw Errors.SLOT_FULL();
    }
    if (newSlot.bookedCount >= newSlot.capacity) {
      throw Errors.SLOT_FULL();
    }

    // Release capacity on current slot
    await tx.slotInstance.update({
      where: { id: currentSchedule.slotInstanceId },
      data: { bookedCount: { decrement: 1 } },
    });

    // Reserve capacity on new slot
    await tx.slotInstance.update({
      where: { id: newSlot.id },
      data: { bookedCount: { increment: 1 } },
    });

    // Supersede old schedule
    await tx.deliverySchedule.update({
      where: { id: currentSchedule.id },
      data: { status: DeliveryScheduleStatus.SUPERSEDED },
    });

    // Create new schedule
    const newSchedule = await tx.deliverySchedule.create({
      data: {
        parcelId,
        requestedById,
        slotInstanceId: newSlot.id,
        deliveryNote: data.deliveryNote ?? currentSchedule.deliveryNote,
        status: DeliveryScheduleStatus.ACTIVE,
      },
    });

    // Create or update task
    await tx.deliveryTask.updateMany({
      where: { parcelId, status: TaskStatus.OPEN },
      data: { scheduleId: newSchedule.id },
    });

    await writeAuditLog({
      societyId,
      parcelId,
      actorId: requestedById,
      eventType: 'SLOT_RESCHEDULED',
      previousStatus: ParcelStatus.SCHEDULED,
      newStatus: ParcelStatus.SCHEDULED,
      metadata: {
        oldSlotId: currentSchedule.slotInstanceId,
        newSlotId: newSlot.id,
        newDate: newSlot.date,
      },
    });

    await createNotification({
      societyId,
      userId: requestedById,
      type: NotificationCategory.SCHEDULE_CHANGED,
      title: 'Delivery Rescheduled',
      message: `Your parcel ${parcel.parcelCode} delivery has been moved to ${newSlot.date} (${newSlot.startTime} - ${newSlot.endTime}).`,
      relatedParcelId: parcelId,
    });

    return newSchedule;
  });
}

export async function cancelSchedule(
  societyId: string,
  parcelId: string,
  requestedById: string,
  reason?: string
) {
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  if (!society) throw Errors.NOT_FOUND('Society');

  return await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.findUnique({
      where: { id: parcelId },
      include: {
        schedules: {
          where: { status: DeliveryScheduleStatus.ACTIVE },
          include: { slotInstance: true },
        },
      },
    });
    if (!parcel || parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Parcel');
    }

    if (parcel.status !== ParcelStatus.SCHEDULED) {
      throw Errors.INVALID_STATE('Only scheduled parcels can have their schedule cancelled');
    }

    const currentSchedule = parcel.schedules[0];
    if (currentSchedule) {
      await tx.slotInstance.update({
        where: { id: currentSchedule.slotInstanceId },
        data: { bookedCount: { decrement: 1 } },
      });

      await tx.deliverySchedule.update({
        where: { id: currentSchedule.id },
        data: { status: DeliveryScheduleStatus.CANCELLED },
      });
    }

    await tx.deliveryTask.updateMany({
      where: { parcelId, status: { in: [TaskStatus.OPEN, TaskStatus.ASSIGNED] } },
      data: { status: TaskStatus.CANCELLED },
    });

    const updatedParcel = await tx.parcel.update({
      where: { id: parcelId },
      data: {
        status: ParcelStatus.RECEIVED,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    await writeAuditLog({
      societyId,
      parcelId,
      actorId: requestedById,
      eventType: 'SCHEDULE_CANCELLED',
      previousStatus: ParcelStatus.SCHEDULED,
      newStatus: ParcelStatus.RECEIVED,
      metadata: { reason },
    });

    return updatedParcel;
  });
}

export async function updateTemplate(
  societyId: string,
  templateId: string,
  data: Partial<z.infer<typeof SlotTemplateSchema>>
) {
  const existing = await prisma.slotTemplate.findFirst({
    where: { id: templateId, societyId },
  });
  if (!existing) throw Errors.NOT_FOUND('SlotTemplate');

  return await prisma.slotTemplate.update({
    where: { id: templateId },
    data,
  });
}

export async function updateSlotInstance(
  societyId: string,
  instanceId: string,
  data: { capacity?: number; status?: SlotInstanceStatus },
  actorId: string
) {
  return await prisma.$transaction(async (tx) => {
    const instance = await tx.slotInstance.findFirst({
      where: { id: instanceId, societyId },
      include: {
        schedules: {
          where: { status: DeliveryScheduleStatus.ACTIVE },
          include: { parcel: true },
        },
      },
    });

    if (!instance) throw Errors.NOT_FOUND('SlotInstance');

    // If changing to BLOCKED, cancel affected schedules and move parcels back to RECEIVED
    if (data.status === SlotInstanceStatus.BLOCKED && instance.status !== SlotInstanceStatus.BLOCKED) {
      for (const schedule of instance.schedules) {
        await tx.deliverySchedule.update({
          where: { id: schedule.id },
          data: { status: DeliveryScheduleStatus.CANCELLED },
        });

        await tx.deliveryTask.updateMany({
          where: { scheduleId: schedule.id, status: { in: [TaskStatus.OPEN, TaskStatus.ASSIGNED] } },
          data: { status: TaskStatus.CANCELLED },
        });

        await tx.parcel.update({
          where: { id: schedule.parcelId },
          data: {
            status: ParcelStatus.RECEIVED,
            statusUpdatedAt: new Date(),
            version: { increment: 1 },
          },
        });

        await writeAuditLog({
          societyId,
          parcelId: schedule.parcelId,
          actorId,
          eventType: 'SLOT_BLOCKED_CANCELLED',
          previousStatus: ParcelStatus.SCHEDULED,
          newStatus: ParcelStatus.RECEIVED,
          metadata: { instanceId, reason: 'Slot blocked by admin' },
        });

        await createNotification({
          societyId,
          userId: schedule.requestedById,
          type: NotificationCategory.SCHEDULE_CHANGED,
          title: 'Delivery Slot Cancelled',
          message: `Your scheduled delivery window for parcel ${schedule.parcel.parcelCode} was cancelled due to a schedule change. Please reschedule at your convenience.`,
          relatedParcelId: schedule.parcelId,
        });
      }
    }

    const updated = await tx.slotInstance.update({
      where: { id: instanceId },
      data: {
        capacity: data.capacity !== undefined ? data.capacity : undefined,
        status: data.status !== undefined ? data.status : undefined,
      },
    });

    return updated;
  });
}


