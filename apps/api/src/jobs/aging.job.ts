import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { ParcelStatus, NotificationCategory } from '@parceltime/shared';
import dayjs from 'dayjs';
import { writeAuditLog } from '../modules/audit/audit.service';
import { createNotification } from '../modules/notifications/notification.service';

export async function processUnclaimedParcels(): Promise<number> {
  const societies = await prisma.society.findMany({
    where: { status: 'ACTIVE' },
  });

  let totalUpdated = 0;

  for (const society of societies) {
    const thresholdDays = society.unclaimedThresholdDays || 7;
    const cutoffDate = dayjs().subtract(thresholdDays, 'day').toDate();

    // Find parcels in RECEIVED status received before cutoff with no active schedule or pickup
    const staleParcels = await prisma.parcel.findMany({
      where: {
        societyId: society.id,
        status: ParcelStatus.RECEIVED,
        receivedAt: { lte: cutoffDate },
        schedules: {
          none: { status: 'ACTIVE' },
        },
        pickupRequests: {
          none: { status: 'REQUESTED' },
        },
      },
      include: {
        unit: {
          include: {
            members: {
              where: { status: 'ACTIVE' },
              select: { userId: true },
            },
          },
        },
      },
    });

    for (const parcel of staleParcels) {
      await prisma.$transaction(async (tx) => {
        await tx.parcel.update({
          where: { id: parcel.id },
          data: {
            status: ParcelStatus.UNCLAIMED,
            statusUpdatedAt: new Date(),
            version: { increment: 1 },
          },
        });

        await writeAuditLog({
          societyId: society.id,
          parcelId: parcel.id,
          eventType: 'UNCLAIMED_AGING',
          previousStatus: ParcelStatus.RECEIVED,
          newStatus: ParcelStatus.UNCLAIMED,
          metadata: { thresholdDays, receivedAt: parcel.receivedAt },
        });

        // Notify active unit members
        for (const member of parcel.unit.members) {
          await createNotification({
            societyId: society.id,
            userId: member.userId,
            type: NotificationCategory.UNCLAIMED_WARNING,
            title: 'Action Needed: Unclaimed Parcel Warning',
            message: `Your parcel ${parcel.parcelCode} from ${parcel.courier} has been in society storage for over ${thresholdDays} days. Please schedule delivery or request self-pickup.`,
            relatedParcelId: parcel.id,
          });
        }
      });

      totalUpdated++;
    }
  }

  if (totalUpdated > 0) {
    logger.info(`Unclaimed aging job: marked ${totalUpdated} parcels as UNCLAIMED`);
  }

  return totalUpdated;
}

