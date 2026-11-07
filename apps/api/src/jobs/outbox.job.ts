import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { OutboxEventStatus } from '@parceltime/shared';

export async function processOutboxEvents(batchSize: number = 25): Promise<number> {
  const now = new Date();

  const pendingEvents = await prisma.outboxEvent.findMany({
    where: {
      status: OutboxEventStatus.PENDING,
      nextAttemptAt: { lte: now },
    },
    take: batchSize,
    orderBy: { createdAt: 'asc' },
  });

  let processedCount = 0;

  for (const event of pendingEvents) {
    try {
      // In production, integrate with Firebase Cloud Messaging (FCM) or Web Push API here
      // event.payload contains notificationId, userId, title, message
      logger.info(`Outbox dispatched: [${event.eventType}] to society ${event.societyId}`);

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: OutboxEventStatus.PROCESSED,
          processedAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      processedCount++;
    } catch (error) {
      logger.error(`Failed to process outbox event ${event.id}:`, error);

      const nextAttempts = event.attempts + 1;
      const isFailed = nextAttempts >= 5;

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          attempts: nextAttempts,
          status: isFailed ? OutboxEventStatus.FAILED : OutboxEventStatus.PENDING,
          nextAttemptAt: new Date(Date.now() + Math.pow(2, nextAttempts) * 60 * 1000), // exponential backoff
        },
      });
    }
  }

  return processedCount;
}

