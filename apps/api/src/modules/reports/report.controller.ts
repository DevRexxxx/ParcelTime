import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './report.service';

export async function getDashboardStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await service.getDashboardStats(req.user!.societyId);
    res.json(stats);
  } catch (e) {
    next(e);
  }
}

export async function getSlotUtilization(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { date } = req.query as { date: string };
    const result = await service.getSlotUtilization(
      req.user!.societyId,
      date || new Date().toISOString().slice(0, 10)
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getExecutivePerformance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await service.getExecutivePerformance(req.user!.societyId);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

