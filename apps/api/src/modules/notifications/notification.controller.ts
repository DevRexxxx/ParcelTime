import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './notification.service';

export async function listNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { unreadOnly, limit, cursor } = req.query as any;
    const result = await service.listNotifications(
      req.user!.userId,
      req.user!.societyId,
      {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit) : undefined,
        cursor,
      }
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function markAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await service.markAsRead(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function markAllAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await service.markAllAsRead(req.user!.userId, req.user!.societyId);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

