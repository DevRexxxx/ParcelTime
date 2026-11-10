import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { ConnectIntegrationSchema, DisconnectIntegrationSchema } from '@parceltime/shared';
import { GmailAdapter } from '../../integrations/gmail/gmail.adapter';
import { prisma } from '../../lib/prisma';

export async function listIntegrations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const integrations = await prisma.externalIntegration.findMany({
      where: {
        societyId: req.user!.societyId,
        userId: req.user!.userId,
      },
      select: {
        id: true,
        provider: true,
        status: true,
        grantedScopes: true,
        watchExpiresAt: true,
        lastSyncedAt: true,
        createdAt: true,
      },
    });
    res.json(integrations);
  } catch (e) {
    next(e);
  }
}

export async function connectGmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = ConnectIntegrationSchema.parse(req.body);
    const result = await GmailAdapter.connect({
      societyId: req.user!.societyId,
      userId: req.user!.userId,
      authCode: data.authCode,
      redirectUri: data.redirectUri,
    });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function disconnectIntegration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = DisconnectIntegrationSchema.parse(req.body);
    const result = await GmailAdapter.disconnect({
      societyId: req.user!.societyId,
      userId: req.user!.userId,
      deleteData: data.deleteData,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}
