import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './slot.service';
import {
  SlotTemplateSchema,
  BookSlotSchema,
  RescheduleSchema,
  UpdateSlotTemplateSchema,
  UpdateSlotInstanceSchema,
} from '@parceltime/shared';

export async function createTemplate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = SlotTemplateSchema.parse(req.body);
    const template = await service.createTemplate(req.user!.societyId, data);
    res.status(201).json(template);
  } catch (e) {
    next(e);
  }
}

export async function listTemplates(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const templates = await service.listTemplates(req.user!.societyId);
    res.json(templates);
  } catch (e) {
    next(e);
  }
}

export async function listAvailableSlots(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { date } = req.query as { date: string };
    if (!date) {
      res.status(400).json({ error: 'Date query param (YYYY-MM-DD) is required' });
      return;
    }
    const slots = await service.listAvailableSlots(req.user!.societyId, date);
    res.json(slots);
  } catch (e) {
    next(e);
  }
}

export async function bookSlot(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = BookSlotSchema.parse(req.body);
    const result = await service.bookSlot(
      req.user!.societyId,
      req.params.parcelId,
      req.user!.userId,
      data
    );
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function rescheduleSlot(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = RescheduleSchema.parse(req.body);
    const result = await service.rescheduleSlot(
      req.user!.societyId,
      req.params.parcelId,
      req.user!.userId,
      data
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function cancelSchedule(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { reason } = req.body;
    const result = await service.cancelSchedule(
      req.user!.societyId,
      req.params.parcelId,
      req.user!.userId,
      reason
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function updateTemplate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = UpdateSlotTemplateSchema.parse(req.body);
    const template = await service.updateTemplate(
      req.user!.societyId,
      req.params.id,
      data
    );
    res.json(template);
  } catch (e) {
    next(e);
  }
}

export async function updateSlotInstance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = UpdateSlotInstanceSchema.parse(req.body);
    const instance = await service.updateSlotInstance(
      req.user!.societyId,
      req.params.id,
      data,
      req.user!.userId
    );
    res.json(instance);
  } catch (e) {
    next(e);
  }
}


