import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './notification.service';
import {
  RegisterDeviceSchema,
  UpdateNotificationPreferencesSchema,
} from '@parceltime/shared';

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

export async function registerDevice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = RegisterDeviceSchema.parse(req.body);
    const device = await service.registerDevice(
      req.user!.userId,
      data.platform,
      data.token
    );
    res.status(201).json(device);
  } catch (e) {
    next(e);
  }
}

export async function unregisterDevice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params;
    await service.unregisterDevice(req.user!.userId, token);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function getPreferences(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const preferences = await service.getNotificationPreferences(req.user!.userId);
    res.json(preferences);
  } catch (e) {
    next(e);
  }
}

export async function updatePreferences(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = UpdateNotificationPreferencesSchema.parse(req.body);
    const preference = await service.updateNotificationPreference(
      req.user!.userId,
      data.category,
      data.enabled
    );
    res.json(preference);
  } catch (e) {
    next(e);
  }
}


