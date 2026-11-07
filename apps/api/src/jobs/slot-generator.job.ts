import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import dayjs from 'dayjs';
import { generateSlotInstancesForDate } from '../modules/slots/slot.service';

export async function processSlotGeneration(): Promise<number> {
  const societies = await prisma.society.findMany({
    where: { status: 'ACTIVE' },
  });

  let generatedDatesCount = 0;

  for (const society of societies) {
    const horizonDays = society.schedulingHorizonDays || 14;
    const bufferDays = 3;
    const totalDays = horizonDays + bufferDays;

    for (let i = 0; i <= totalDays; i++) {
      const targetDate = dayjs().add(i, 'day').format('YYYY-MM-DD');
      await generateSlotInstancesForDate(society.id, targetDate);
      generatedDatesCount++;
    }
  }

  logger.info(`Slot generation job: checked/generated slots across ${societies.length} societies`);
  return generatedDatesCount;
}

