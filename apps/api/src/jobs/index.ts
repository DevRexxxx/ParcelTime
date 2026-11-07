import { logger } from '../lib/logger';
import { processUnclaimedParcels } from './aging.job';
import { processSlotGeneration } from './slot-generator.job';
import { processDailyReminders } from './reminder.job';
import { processOutboxEvents } from './outbox.job';

export interface JobTimers {
  outboxInterval?: NodeJS.Timeout;
  agingInterval?: NodeJS.Timeout;
  slotGenInterval?: NodeJS.Timeout;
  reminderInterval?: NodeJS.Timeout;
}

let activeTimers: JobTimers = {};

export function startBackgroundJobs(): JobTimers {
  logger.info('Starting ParcelTime background worker jobs...');

  // Outbox processor (every 30 seconds)
  const outboxInterval = setInterval(async () => {
    try {
      await processOutboxEvents(20);
    } catch (err) {
      logger.error('Error running outbox processor:', err);
    }
  }, 30 * 1000);

  // Unclaimed parcel aging check (every 1 hour)
  const agingInterval = setInterval(async () => {
    try {
      await processUnclaimedParcels();
    } catch (err) {
      logger.error('Error running unclaimed aging job:', err);
    }
  }, 60 * 60 * 1000);

  // Slot generation for horizon (every 6 hours)
  const slotGenInterval = setInterval(async () => {
    try {
      await processSlotGeneration();
    } catch (err) {
      logger.error('Error running slot generator job:', err);
    }
  }, 6 * 60 * 60 * 1000);

  // Daily delivery reminders (every 2 hours)
  const reminderInterval = setInterval(async () => {
    try {
      await processDailyReminders();
    } catch (err) {
      logger.error('Error running daily reminder job:', err);
    }
  }, 2 * 60 * 60 * 1000);

  activeTimers = {
    outboxInterval,
    agingInterval,
    slotGenInterval,
    reminderInterval,
  };

  return activeTimers;
}

export function stopBackgroundJobs() {
  if (activeTimers.outboxInterval) clearInterval(activeTimers.outboxInterval);
  if (activeTimers.agingInterval) clearInterval(activeTimers.agingInterval);
  if (activeTimers.slotGenInterval) clearInterval(activeTimers.slotGenInterval);
  if (activeTimers.reminderInterval) clearInterval(activeTimers.reminderInterval);
  logger.info('ParcelTime background jobs stopped');
}

export * from './aging.job';
export * from './slot-generator.job';
export * from './reminder.job';
export * from './outbox.job';

