import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './task.service';
import {
  AssignTaskSchema,
  FailDeliverySchema,
  OverrideHandoverSchema,
  VerifyOtpSchema,
} from '@parceltime/shared';

export async function listTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, executiveId, limit, cursor } = req.query as any;
    const result = await service.listTasks(req.user!.societyId, {
      status,
      executiveId,
      limit: limit ? parseInt(limit) : undefined,
      cursor,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function assignTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { executiveId } = AssignTaskSchema.parse(req.body);
    const task = await service.assignTask(
      req.user!.societyId,
      req.params.id,
      executiveId,
      req.user!.userId
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
}

export async function claimTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const task = await service.claimTask(
      req.user!.societyId,
      req.params.id,
      req.user!.userId
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
}

export async function startDelivery(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { qrToken } = req.body;
    if (!qrToken) {
      res.status(400).json({ error: 'qrToken is required' });
      return;
    }
    const task = await service.startDelivery(
      req.user!.societyId,
      req.params.id,
      req.user!.userId,
      qrToken
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
}

export async function verifyOtp(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = VerifyOtpSchema.parse(req.body);
    const task = await service.verifyOtpAndComplete(
      req.user!.societyId,
      req.params.id,
      req.user!.userId,
      data.otp
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
}

export async function failDelivery(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = FailDeliverySchema.parse(req.body);
    const result = await service.failDelivery(
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

export async function overrideDelivery(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = OverrideHandoverSchema.parse(req.body);
    const task = await service.overrideDelivery(
      req.user!.societyId,
      req.params.id,
      req.user!.userId,
      {
        ...data,
        approverId: req.user!.userId,
      }
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
}

