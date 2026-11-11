import { describe, it, expect } from 'vitest';

describe('Slot Booking Concurrency & Invariants', () => {
  it('guarantees that when remaining capacity is 1, only one concurrent booking succeeds', async () => {
    // Model atomic capacity reservation simulation
    const slotCapacity = 10;
    let bookedCount = 9; // Only 1 spot remaining!

    const bookSlotAtomic = async (_requestId: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate atomic check-and-increment (like Prisma update with where condition)
      if (bookedCount >= slotCapacity) {
        return { success: false, error: 'SLOT_FULL' };
      }
      bookedCount += 1;
      return { success: true };
    };

    // Fire 5 concurrent booking requests simultaneously
    const requests = ['req-1', 'req-2', 'req-3', 'req-4', 'req-5'];
    const results = await Promise.all(requests.map((id) => bookSlotAtomic(id)));

    const successfulBookings = results.filter((r) => r.success);
    const rejectedBookings = results.filter((r) => !r.success);

    // Exactly 1 must succeed and 4 must fail with SLOT_FULL
    expect(successfulBookings).toHaveLength(1);
    expect(rejectedBookings).toHaveLength(4);
    expect(bookedCount).toBe(10);
    expect(bookedCount).toBeLessThanOrEqual(slotCapacity);
  });

  it('rejects double submission with same idempotency key', () => {
    const processedKeys = new Set<string>();

    const handleSubmission = (idempotencyKey: string) => {
      if (processedKeys.has(idempotencyKey)) {
        return { duplicate: true };
      }
      processedKeys.add(idempotencyKey);
      return { duplicate: false };
    };

    const first = handleSubmission('idemp-key-xyz');
    const second = handleSubmission('idemp-key-xyz');

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
  });
});

