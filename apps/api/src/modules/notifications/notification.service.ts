import { prisma } from '../../lib/prisma';
import { NotificationCategory } from '@parceltime/shared';

export interface CreateNotificationParams {
  societyId: string;
  userId: string;
  type: NotificationCategory;
  title: string;
  message: string;
  relatedParcelId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    // Check preferences
    const pref = await prisma.notificationPreference.findUnique({
      where: {
        userId_category: {
          userId: params.userId,
          category: params.type,
        },
      },
    });

    if (pref && !pref.enabled) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        societyId: params.societyId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedParcelId: params.relatedParcelId,
      },
    });

    // Also record outbox event for FCM / push worker
    await prisma.outboxEvent.create({
      data: {
        societyId: params.societyId,
        eventType: `NOTIFICATION_${params.type}`,
        payload: {
          notificationId: notification.id,
          userId: params.userId,
          title: params.title,
          message: params.message,
          relatedParcelId: params.relatedParcelId,
        },
      },
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function listNotifications(
  userId: string,
  societyId: string,
  options: { unreadOnly?: boolean; limit?: number; cursor?: string }
) {
  const limit = options.limit ?? 30;
  const where: any = { userId, societyId };
  if (options.unreadOnly) where.read = false;

  const notifications = await prisma.notification.findMany({
    where,
    take: limit + 1,
    cursor: options.cursor ? { id: options.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = notifications.length > limit;
  const data = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

  return { data, hasMore, cursor: nextCursor };
}

export async function markAsRead(userId: string, notificationId: string) {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string, societyId: string) {
  return await prisma.notification.updateMany({
    where: { userId, societyId, read: false },
    data: { read: true },
  });
}

