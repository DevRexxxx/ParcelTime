import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { NotificationCategory, DeliveryScheduleStatus, ParcelStatus } from '@parceltime/shared';
import dayjs from 'dayjs';
import { createNotification } from '../modules/notifications/notification.service';

export async function processDailyReminders(): Promise<number> {
  const todayStr = dayjs().format('YYYY-MM-DD');

  // Find all active schedules for today
  const activeSchedules = await prisma.deliverySchedule.findMany({
    where: {
      status: DeliveryScheduleStatus.ACTIVE,
      slotInstance: {
        date: todayStr,
      },
      parcel: {
        status: { in: [ParcelStatus.SCHEDULED, ParcelStatus.ASSIGNED] },
      },
    },
    include: {
      slotInstance: true,
      parcel: {
        include: { unit: true },
      },
    },
  });

  let sentCount = 0;

  for (const schedule of activeSchedules) {
    await createNotification({
      societyId: schedule.parcel.societyId,
      userId: schedule.requestedById,
      type: NotificationCategory.REMINDER,
      title: 'Reminder: Parcel Arriving Today',
      message: `Your parcel ${schedule.parcel.parcelCode} (${schedule.parcel.courier}) is scheduled for delivery today between ${schedule.slotInstance.startTime} - ${schedule.slotInstance.endTime}.`,
      relatedParcelId: schedule.parcelId,
    });
    sentCount++;
  }

  if (sentCount > 0) {
    logger.info(`Daily reminder job: dispatched ${sentCount} reminders for ${todayStr}`);
  }

  return sentCount;
}

