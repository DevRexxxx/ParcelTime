import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import * as service from './audit.service';

export async function listAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { parcelId, actorId, flagged, limit, cursor } = req.query as any;
    const result = await service.listAuditLogs(req.user!.societyId, {
      parcelId,
      actorId,
      flagged: flagged !== undefined ? flagged === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
      cursor,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

