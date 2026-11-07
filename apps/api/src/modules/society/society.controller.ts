import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import {
  CreateSocietySchema,
  UpdateSocietySettingsSchema,
  CreateTowerSchema,
  CreateUnitSchema,
  CreateInviteSchema,
  JoinRequestSchema,
  StorageLocationSchema,
  BulkImportUnitsSchema,
  UserRole,
} from '@parceltime/shared';

export async function getSociety(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const society = await prisma.society.findUnique({ where: { id: req.user!.societyId } });
    if (!society) throw Errors.NOT_FOUND('Society');
    res.json(society);
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = UpdateSocietySettingsSchema.parse(req.body);
    const society = await prisma.society.update({
      where: { id: req.user!.societyId },
      data,
    });
    res.json(society);
  } catch (e) {
    next(e);
  }
}

export async function listTowers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const towers = await prisma.tower.findMany({
      where: { societyId: req.user!.societyId },
      include: { units: true },
    });
    res.json(towers);
  } catch (e) {
    next(e);
  }
}

export async function createTower(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = CreateTowerSchema.parse(req.body);
    const tower = await prisma.tower.create({
      data: { ...data, societyId: req.user!.societyId },
    });
    res.status(201).json(tower);
  } catch (e) {
    next(e);
  }
}

export async function listUnits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const units = await prisma.unit.findMany({
      where: { societyId: req.user!.societyId },
      include: { tower: true, members: { include: { user: true } } },
    });
    res.json(units);
  } catch (e) {
    next(e);
  }
}

export async function createUnit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = CreateUnitSchema.parse(req.body);
    const unit = await prisma.unit.create({
      data: { ...data, societyId: req.user!.societyId },
      include: { tower: true },
    });
    res.status(201).json(unit);
  } catch (e) {
    next(e);
  }
}

export async function getUnit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const unit = await prisma.unit.findFirst({
      where: { id: req.params.id, societyId: req.user!.societyId },
      include: { tower: true, members: { include: { user: true } } },
    });
    if (!unit) throw Errors.NOT_FOUND('Unit');
    res.json(unit);
  } catch (e) {
    next(e);
  }
}

export async function searchUnits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = ((req.query.q as string) || '').trim();
    if (!query) {
      const units = await prisma.unit.findMany({
        where: { societyId: req.user!.societyId },
        take: 20,
        include: { tower: true, members: { include: { user: true } } },
        orderBy: [{ tower: { name: 'asc' } }, { unitNumber: 'asc' }],
      });
      res.json(units);
      return;
    }

    const units = await prisma.unit.findMany({
      where: {
        societyId: req.user!.societyId,
        OR: [
          { unitNumber: { contains: query, mode: 'insensitive' } },
          { tower: { name: { contains: query, mode: 'insensitive' } } },
          {
            members: {
              some: {
                user: {
                  OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      },
      take: 20,
      include: { tower: true, members: { include: { user: true } } },
      orderBy: [{ tower: { name: 'asc' } }, { unitNumber: 'asc' }],
    });
    res.json(units);
  } catch (e) {
    next(e);
  }
}

export async function bulkImportUnits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = BulkImportUnitsSchema.parse(req.body);
    const societyId = req.user!.societyId;
    let imported = 0;
    const errors: Array<{ row: number; unitNumber: string; error: string }> = [];

    // Cache towers by name
    const existingTowers = await prisma.tower.findMany({
      where: { societyId },
    });
    const towerMap = new Map<string, string>();
    existingTowers.forEach((t) => towerMap.set(t.name.toLowerCase().trim(), t.id));

    for (let i = 0; i < data.units.length; i++) {
      const row = data.units[i];
      try {
        const normalizedTower = row.towerName.trim();
        let towerId = towerMap.get(normalizedTower.toLowerCase());
        if (!towerId) {
          const createdTower = await prisma.tower.create({
            data: { societyId, name: normalizedTower },
          });
          towerId = createdTower.id;
          towerMap.set(normalizedTower.toLowerCase(), towerId);
        }

        await prisma.unit.upsert({
          where: {
            societyId_towerId_unitNumber: {
              societyId,
              towerId,
              unitNumber: row.unitNumber.trim(),
            },
          },
          create: {
            societyId,
            towerId,
            unitNumber: row.unitNumber.trim(),
            floor: row.floor,
          },
          update: {
            floor: row.floor,
          },
        });
        imported++;
      } catch (err: any) {
        errors.push({
          row: i + 1,
          unitNumber: row.unitNumber,
          error: err.message || 'Failed to import unit',
        });
      }
    }

    res.status(201).json({
      total: data.units.length,
      imported,
      failed: errors.length,
      errors,
    });
  } catch (e) {
    next(e);
  }
}


export async function listMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const members = await prisma.societyMember.findMany({
      where: { societyId: req.user!.societyId },
      include: { user: true },
    });
    res.json(members);
  } catch (e) {
    next(e);
  }
}

export async function suspendMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const member = await prisma.societyMember.updateMany({
      where: { userId: req.params.userId, societyId: req.user!.societyId },
      data: { status: 'SUSPENDED' as any },
    });
    res.json(member);
  } catch (e) {
    next(e);
  }
}

export async function listInvites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const invites = await prisma.invite.findMany({
      where: { societyId: req.user!.societyId },
    });
    res.json(invites);
  } catch (e) {
    next(e);
  }
}

export async function createInvite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = CreateInviteSchema.parse(req.body);
    const crypto = await import('crypto');
    const tokenRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.invite.create({
      data: {
        societyId: req.user!.societyId,
        targetEmail: data.targetEmail,
        targetPhone: data.targetPhone,
        roles: data.roles,
        unitId: data.unitId,
        tokenHash,
        expiresAt,
        createdById: req.user!.userId,
      },
    });
    res.status(201).json({ ...invite, token: tokenRaw });
  } catch (e) {
    next(e);
  }
}

export async function revokeInvite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.invite.updateMany({
      where: { id: req.params.id, societyId: req.user!.societyId },
      data: { status: 'REVOKED' as any },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function resendInvite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const invite = await prisma.invite.findFirst({
      where: { id: req.params.id, societyId: req.user!.societyId },
    });
    if (!invite) throw Errors.NOT_FOUND('Invite');

    const crypto = await import('crypto');
    const tokenRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const updated = await prisma.invite.update({
      where: { id: req.params.id },
      data: {
        tokenHash,
        expiresAt,
        status: 'PENDING' as any,
      },
    });

    res.json({ ...updated, token: tokenRaw });
  } catch (e) {
    next(e);
  }
}


export async function listJoinRequests(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const requests = await prisma.joinRequest.findMany({
      where: { societyId: req.user!.societyId },
    });
    res.json(requests);
  } catch (e) {
    next(e);
  }
}

export async function createJoinRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = JoinRequestSchema.parse(req.body);
    const joinRequest = await prisma.joinRequest.create({
      data: {
        societyId: req.user!.societyId,
        userId: req.user!.userId,
        unitId: data.unitId,
        relationship: data.relationship,
      },
    });
    res.status(201).json(joinRequest);
  } catch (e) {
    next(e);
  }
}

export async function reviewJoinRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updated = await prisma.joinRequest.updateMany({
      where: { id: req.params.id, societyId: req.user!.societyId },
      data: { status: status as any, reviewedById: req.user!.userId, reviewedAt: new Date() },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function listStorageLocations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const locations = await prisma.storageLocation.findMany({
      where: { societyId: req.user!.societyId },
    });
    res.json(locations);
  } catch (e) {
    next(e);
  }
}

export async function createStorageLocation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = StorageLocationSchema.parse(req.body);
    const location = await prisma.storageLocation.create({
      data: { ...data, societyId: req.user!.societyId },
    });
    res.status(201).json(location);
  } catch (e) {
    next(e);
  }
}

export async function updateStorageLocation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = StorageLocationSchema.partial().parse(req.body);
    const location = await prisma.storageLocation.updateMany({
      where: { id: req.params.id, societyId: req.user!.societyId },
      data,
    });
    res.json(location);
  } catch (e) {
    next(e);
  }
}

export async function listExecutives(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const executives = await prisma.societyMember.findMany({
      where: {
        societyId: req.user!.societyId,
        roles: { has: UserRole.DELIVERY_EXECUTIVE as any },
        status: 'ACTIVE' as any,
      },
      include: { user: true },
    });
    res.json(executives);
  } catch (e) {
    next(e);
  }
}
