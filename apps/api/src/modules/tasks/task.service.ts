import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import {
  TaskStatus,
  ParcelStatus,
  OtpChallengeStatus,
  DeliveryAttemptOutcome,
  VerificationMethod,
  FailureReason,
  NotificationCategory,
  UserRole,
} from '@parceltime/shared';
import crypto from 'crypto';
import { writeAuditLog } from '../audit/audit.service';
import { createNotification } from '../notifications/notification.service';

export function hashOtp(parcelId: string, otp: string): string {
  const secret = process.env.OTP_SECRET || 'parceltime_production_otp_hmac_secret_key_2026';
  return crypto.createHmac('sha256', secret).update(`${parcelId}:${otp}`).digest('hex');
}

export async function generateHandoverOtp(societyId: string, parcelId: string, userId: string) {
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: { society: true },
  });

  if (!parcel || parcel.societyId !== societyId) {
    throw Errors.NOT_FOUND('Parcel');
  }

  // Generate 6 digit OTP
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = hashOtp(parcelId, rawOtp);
  const expiryMinutes = parcel.society.otpExpiryMinutes || 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Expire any existing active challenges
  await prisma.handoverChallenge.updateMany({
    where: { parcelId, status: OtpChallengeStatus.ACTIVE },
    data: { status: OtpChallengeStatus.REPLACED },
  });

  // Create new active challenge
  const challenge = await prisma.handoverChallenge.create({
    data: {
      parcelId,
      hashedOtp,
      expiresAt,
      maxAttempts: parcel.society.maxFailedAttempts || 5,
      status: OtpChallengeStatus.ACTIVE,
    },
  });

  await writeAuditLog({
    societyId,
    parcelId,
    actorId: userId,
    eventType: 'OTP_GENERATED',
    metadata: { challengeId: challenge.id, expiresAt },
  });

  return {
    code: rawOtp,
    expiresAt: expiresAt.toISOString(),
    attemptsRemaining: challenge.maxAttempts,
  };
}

export async function listTasks(
  societyId: string,
  filters: {
    status?: TaskStatus;
    executiveId?: string;
    limit?: number;
    cursor?: string;
  }
) {
  const limit = filters.limit ?? 30;
  const where: any = {
    parcel: { societyId },
  };

  if (filters.status) where.status = filters.status;
  if (filters.executiveId) where.executiveId = filters.executiveId;

  const tasks = await prisma.deliveryTask.findMany({
    where,
    take: limit + 1,
    cursor: filters.cursor ? { id: filters.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      parcel: {
        include: {
          unit: { include: { tower: true } },
          storageLocation: true,
        },
      },
      schedule: {
        include: { slotInstance: true },
      },
      executive: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  const hasMore = tasks.length > limit;
  const data = hasMore ? tasks.slice(0, limit) : tasks;
  const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

  return { data, hasMore, cursor: nextCursor };
}

export async function assignTask(
  societyId: string,
  taskId: string,
  executiveId: string,
  assignedById: string
) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.deliveryTask.findUnique({
      where: { id: taskId },
      include: { parcel: true },
    });

    if (!task || task.parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Task');
    }

    if (task.status !== TaskStatus.OPEN && task.status !== TaskStatus.ASSIGNED) {
      throw Errors.INVALID_STATE(`Task cannot be assigned from status ${task.status}`);
    }

    // Verify executive is active member of society
    const executiveMembership = await tx.societyMember.findFirst({
      where: {
        societyId,
        userId: executiveId,
        roles: { has: UserRole.DELIVERY_EXECUTIVE },
      },
    });

    if (!executiveMembership) {
      throw Errors.VALIDATION('Assigned user is not an active delivery executive for this society');
    }

    const updatedTask = await tx.deliveryTask.update({
      where: { id: taskId },
      data: {
        executiveId,
        assignedById,
        assignedAt: new Date(),
        status: TaskStatus.ASSIGNED,
      },
      include: { executive: true, parcel: true },
    });

    await tx.parcel.update({
      where: { id: task.parcelId },
      data: {
        status: ParcelStatus.ASSIGNED,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    await writeAuditLog({
      societyId,
      parcelId: task.parcelId,
      actorId: assignedById,
      eventType: 'TASK_ASSIGNED',
      previousStatus: task.parcel.status,
      newStatus: ParcelStatus.ASSIGNED,
      metadata: { executiveId, taskId },
    });

    await createNotification({
      societyId,
      userId: executiveId,
      type: NotificationCategory.TASK_ASSIGNED,
      title: 'New Delivery Assigned',
      message: `You have been assigned parcel ${task.parcel.parcelCode} for delivery.`,
      relatedParcelId: task.parcelId,
    });

    return updatedTask;
  });
}

export async function claimTask(societyId: string, taskId: string, executiveId: string) {
  return await assignTask(societyId, taskId, executiveId, executiveId);
}

export async function startDelivery(
  societyId: string,
  taskId: string,
  executiveId: string,
  parcelQrToken: string
) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        parcel: {
          include: {
            schedules: {
              where: { status: 'ACTIVE' },
              select: { requestedById: true },
            },
          },
        },
      },
    });

    if (!task || task.parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Task');
    }

    if (task.executiveId !== executiveId) {
      throw Errors.FORBIDDEN();
    }

    // Verify QR token matches parcel
    if (task.parcel.qrToken !== parcelQrToken) {
      throw Errors.VALIDATION('QR code does not match the assigned parcel');
    }

    const updatedTask = await tx.deliveryTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    await tx.parcel.update({
      where: { id: task.parcelId },
      data: {
        status: ParcelStatus.OUT_FOR_DELIVERY,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    await writeAuditLog({
      societyId,
      parcelId: task.parcelId,
      actorId: executiveId,
      eventType: 'OUT_FOR_DELIVERY',
      previousStatus: task.parcel.status,
      newStatus: ParcelStatus.OUT_FOR_DELIVERY,
      metadata: { taskId },
    });

    const residentId = task.parcel.schedules[0]?.requestedById;
    if (residentId) {
      await createNotification({
        societyId,
        userId: residentId,
        type: NotificationCategory.OUT_FOR_DELIVERY,
        title: 'Parcel Out for Delivery',
        message: `Executive has started delivery of parcel ${task.parcel.parcelCode}. View your handover OTP in the app.`,
        relatedParcelId: task.parcelId,
      });
    }

    return updatedTask;
  });
}

export async function verifyOtpAndComplete(
  societyId: string,
  taskId: string,
  executiveId: string,
  otp: string
) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        parcel: {
          include: {
            schedules: { where: { status: 'ACTIVE' }, select: { requestedById: true } },
          },
        },
      },
    });

    if (!task || task.parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Task');
    }

    if (task.executiveId !== executiveId) {
      throw Errors.FORBIDDEN();
    }

    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw Errors.INVALID_STATE('Task must be IN_PROGRESS to verify handover');
    }

    const challenge = await tx.handoverChallenge.findFirst({
      where: {
        parcelId: task.parcelId,
        status: OtpChallengeStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw Errors.VALIDATION('No active OTP found. Resident must generate an OTP.');
    }

    if (new Date() > challenge.expiresAt) {
      await tx.handoverChallenge.update({
        where: { id: challenge.id },
        data: { status: OtpChallengeStatus.EXPIRED },
      });
      throw Errors.VALIDATION('OTP has expired. Resident must generate a new OTP.');
    }

    if (challenge.attemptsUsed >= challenge.maxAttempts) {
      await tx.handoverChallenge.update({
        where: { id: challenge.id },
        data: { status: OtpChallengeStatus.LOCKED },
      });
      throw Errors.VALIDATION('OTP is locked due to too many failed attempts.');
    }

    const expectedHash = hashOtp(task.parcelId, otp);
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(challenge.hashedOtp, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      const attemptsUsed = challenge.attemptsUsed + 1;
      const isNowLocked = attemptsUsed >= challenge.maxAttempts;

      await tx.handoverChallenge.update({
        where: { id: challenge.id },
        data: {
          attemptsUsed,
          status: isNowLocked ? OtpChallengeStatus.LOCKED : OtpChallengeStatus.ACTIVE,
        },
      });

      await tx.deliveryAttempt.create({
        data: {
          taskId,
          executiveId,
          outcome: DeliveryAttemptOutcome.FAILED,
          verificationMethod: VerificationMethod.OTP,
          failureReason: FailureReason.OTP_NOT_AVAILABLE,
        },
      });

      throw Errors.VALIDATION(
        isNowLocked
          ? 'Invalid OTP. Challenge locked. Resident must generate a new code.'
          : `Invalid OTP. ${challenge.maxAttempts - attemptsUsed} attempts remaining.`
      );
    }

    // OTP Valid! Mark challenge VERIFIED
    await tx.handoverChallenge.update({
      where: { id: challenge.id },
      data: { status: OtpChallengeStatus.VERIFIED },
    });

    // Record DeliveryAttempt
    await tx.deliveryAttempt.create({
      data: {
        taskId,
        executiveId,
        outcome: DeliveryAttemptOutcome.DELIVERED,
        verificationMethod: VerificationMethod.OTP,
      },
    });

    // Update Task
    const updatedTask = await tx.deliveryTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.DONE,
        finishedAt: new Date(),
      },
    });

    // Complete Schedule
    await tx.deliverySchedule.updateMany({
      where: { parcelId: task.parcelId, status: 'ACTIVE' },
      data: { status: 'COMPLETED' },
    });

    // Update Parcel to terminal DELIVERED status
    await tx.parcel.update({
      where: { id: task.parcelId },
      data: {
        status: ParcelStatus.DELIVERED,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    await writeAuditLog({
      societyId,
      parcelId: task.parcelId,
      actorId: executiveId,
      eventType: 'DELIVERY_COMPLETED',
      previousStatus: ParcelStatus.OUT_FOR_DELIVERY,
      newStatus: ParcelStatus.DELIVERED,
      metadata: { verificationMethod: VerificationMethod.OTP },
    });

    const residentId = task.parcel.schedules[0]?.requestedById;
    if (residentId) {
      await createNotification({
        societyId,
        userId: residentId,
        type: NotificationCategory.DELIVERED,
        title: 'Parcel Delivered',
        message: `Your parcel ${task.parcel.parcelCode} has been delivered successfully.`,
        relatedParcelId: task.parcelId,
      });
    }

    return updatedTask;
  });
}

export async function failDelivery(
  societyId: string,
  taskId: string,
  executiveId: string,
  data: {
    reason: FailureReason;
    note?: string;
    storageLocationId: string;
  }
) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        parcel: {
          include: {
            schedules: { where: { status: 'ACTIVE' }, select: { requestedById: true } },
          },
        },
      },
    });

    if (!task || task.parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Task');
    }

    if (task.executiveId !== executiveId) {
      throw Errors.FORBIDDEN();
    }

    // Record DeliveryAttempt
    await tx.deliveryAttempt.create({
      data: {
        taskId,
        executiveId,
        outcome: DeliveryAttemptOutcome.FAILED,
        verificationMethod: VerificationMethod.OTP,
        failureReason: data.reason,
      },
    });

    // Update Task to FAILED
    const updatedTask = await tx.deliveryTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.FAILED,
        finishedAt: new Date(),
      },
    });

    // Cancel current active schedule
    await tx.deliverySchedule.updateMany({
      where: { parcelId: task.parcelId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    // Return parcel to RECEIVED and into storageLocation
    const updatedParcel = await tx.parcel.update({
      where: { id: task.parcelId },
      data: {
        status: ParcelStatus.RECEIVED,
        storageLocationId: data.storageLocationId,
        failedAttemptCount: { increment: 1 },
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
        notes: data.note,
      },
    });

    await writeAuditLog({
      societyId,
      parcelId: task.parcelId,
      actorId: executiveId,
      eventType: 'DELIVERY_FAILED',
      previousStatus: ParcelStatus.OUT_FOR_DELIVERY,
      newStatus: ParcelStatus.RECEIVED,
      metadata: { reason: data.reason, note: data.note, storageLocationId: data.storageLocationId },
    });

    const residentId = task.parcel.schedules[0]?.requestedById;
    if (residentId) {
      await createNotification({
        societyId,
        userId: residentId,
        type: NotificationCategory.DELIVERY_FAILED,
        title: 'Delivery Attempt Failed',
        message: `Delivery of parcel ${task.parcel.parcelCode} failed: ${data.reason}. Parcel is safely stored. Please reschedule.`,
        relatedParcelId: task.parcelId,
      });
    }

    return { task: updatedTask, parcel: updatedParcel };
  });
}

export async function overrideDelivery(
  societyId: string,
  taskId: string,
  executiveId: string,
  data: {
    reason: string;
    receiverName: string;
    relationship?: string;
    approverId?: string;
  }
) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.deliveryTask.findUnique({
      where: { id: taskId },
      include: {
        parcel: {
          include: {
            schedules: { where: { status: 'ACTIVE' }, select: { requestedById: true } },
          },
        },
      },
    });

    if (!task || task.parcel.societyId !== societyId) {
      throw Errors.NOT_FOUND('Task');
    }

    // Record DeliveryAttempt with STAFF_OVERRIDE
    await tx.deliveryAttempt.create({
      data: {
        taskId,
        executiveId,
        outcome: DeliveryAttemptOutcome.DELIVERED,
        verificationMethod: VerificationMethod.STAFF_OVERRIDE,
        overrideReason: data.reason,
        receiverName: data.receiverName,
        overrideApproverId: data.approverId,
      },
    });

    // Update Task
    const updatedTask = await tx.deliveryTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.DONE,
        finishedAt: new Date(),
      },
    });

    // Complete Schedule
    await tx.deliverySchedule.updateMany({
      where: { parcelId: task.parcelId, status: 'ACTIVE' },
      data: { status: 'COMPLETED' },
    });

    // Update Parcel to DELIVERED
    await tx.parcel.update({
      where: { id: task.parcelId },
      data: {
        status: ParcelStatus.DELIVERED,
        statusUpdatedAt: new Date(),
        version: { increment: 1 },
      },
    });

    // Audit log flagged for admin review
    await writeAuditLog({
      societyId,
      parcelId: task.parcelId,
      actorId: executiveId,
      eventType: 'DELIVERY_OVERRIDDEN',
      previousStatus: task.parcel.status,
      newStatus: ParcelStatus.DELIVERED,
      flagged: true,
      metadata: {
        reason: data.reason,
        receiverName: data.receiverName,
        relationship: data.relationship,
        approverId: data.approverId,
      },
    });

    return updatedTask;
  });
}

