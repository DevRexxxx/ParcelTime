import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './parcel.service';
import * as slotService from '../slots/slot.service';
import * as taskService from '../tasks/task.service';
import {
  RegisterParcelSchema,
  MoveStorageSchema,
  ReturnToCourierSchema,
  BookSlotSchema,
  PickupRequestSchema,
  CompletePickupSchema,
} from '@parceltime/shared';
import { Errors } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

export async function registerParcel(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = RegisterParcelSchema.parse(req.body);
    const parcel = await service.registerParcel(data, req.user!.societyId, req.user!.userId);
    res.status(201).json(parcel);
  } catch (e) {
    next(e);
  }
}

export async function listParcels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, unitId, cursor, limit } = req.query as any;
    const result = await service.listParcels(req.user!.societyId, {
      status,
      unitId,
      cursor,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getParcel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const parcel = await service.getParcelById(req.params.id, req.user!.societyId);
    res.json(parcel);
  } catch (e) {
    next(e);
  }
}

export async function getParcelTimeline(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const timeline = await service.getParcelTimeline(req.params.id, req.user!.societyId);
    res.json(timeline);
  } catch (e) {
    next(e);
  }
}

export async function getPhotoUploadUrl(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // TODO: Generate presigned S3/R2 upload URL
    res.json({ uploadUrl: 'https://storage.example.com/upload', key: `parcels/${req.params.id}` });
  } catch (e) {
    next(e);
  }
}

export async function confirmPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { key } = req.body;
    await prisma.parcel.updateMany({
      where: { id: req.params.id, societyId: req.user!.societyId },
      data: { photoRef: key },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function resolveQr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { qrToken } = req.body;
    if (!qrToken) throw Errors.VALIDATION('qrToken is required');
    const parcel = await service.getParcelByQrToken(qrToken, req.user!.societyId);
    res.json(parcel);
  } catch (e) {
    next(e);
  }
}

export async function moveStorage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { storageLocationId } = MoveStorageSchema.parse(req.body);
    const parcel = await service.moveParcelStorage(
      req.params.id,
      req.user!.societyId,
      storageLocationId,
      req.user!.userId
    );
    res.json(parcel);
  } catch (e) {
    next(e);
  }
}

export async function returnToCourier(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { reason } = ReturnToCourierSchema.parse(req.body);
    const parcel = await service.returnToCourier(
      req.params.id,
      req.user!.societyId,
      reason,
      req.user!.userId
    );
    res.json(parcel);
  } catch (e) {
    next(e);
  }
}

export async function scheduleParcel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = BookSlotSchema.parse(req.body);
    const result = await slotService.bookSlot(
      req.user!.societyId,
      req.params.id,
      req.user!.userId,
      data
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function requestPickup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = PickupRequestSchema.parse(req.body);
    const request = await prisma.pickupRequest.create({
      data: {
        parcelId: req.params.id,
        requestedById: req.user!.userId,
        note: data.note,
      },
    });
    res.status(201).json(request);
  } catch (e) {
    next(e);
  }
}

export async function cancelPickup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.pickupRequest.updateMany({
      where: {
        parcelId: req.params.id,
        requestedById: req.user!.userId,
        status: 'REQUESTED',
      },
      data: { status: 'CANCELLED' as any },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function completePickup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = CompletePickupSchema.parse(req.body);
    // TODO: OTP verification logic
    await prisma.pickupRequest.updateMany({
      where: { parcelId: req.params.id, status: 'REQUESTED' },
      data: {
        status: 'COMPLETED' as any,
        verifiedById: req.user!.userId,
        verificationMethod: data.verificationMethod,
        completedAt: new Date(),
      },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function generateOtp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await taskService.generateHandoverOtp(
      req.user!.societyId,
      req.params.id,
      req.user!.userId
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}
