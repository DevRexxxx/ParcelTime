import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import { env } from '../../config/env';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, MemberStatus, InviteStatus, UnitMembershipType } from '@parceltime/shared';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateTokens(userId: string, societyId: string, roles: UserRole[]): TokenPair {
  const accessToken = jwt.sign(
    { sub: userId, societyId, roles },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as any
  );
  const refreshToken = jwt.sign(
    { sub: userId, societyId, roles, jti: uuidv4() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as any
  );
  return { accessToken, refreshToken };
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ user: any; tokens: TokenPair; societyId: string }> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
      status: 'ACTIVE',
    },
    include: {
      memberships: {
        where: { status: MemberStatus.ACTIVE },
        include: { society: { select: { id: true, name: true, status: true } } },
      },
      unitMemberships: {
        where: { status: 'ACTIVE' },
        include: { unit: { include: { tower: true } } },
      },
    },
  });

  if (!user) throw Errors.UNAUTHENTICATED();

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw Errors.UNAUTHENTICATED();

  // Update last login
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const activeMembership = user.memberships.find((m: any) => m.society.status === 'ACTIVE');
  if (!activeMembership) throw Errors.FORBIDDEN();

  const tokens = generateTokens(
    user.id,
    activeMembership.societyId,
    activeMembership.roles as UserRole[]
  );

  return { user, tokens, societyId: activeMembership.societyId };
}

export async function refreshTokens(refreshToken: string): Promise<{ tokens: TokenPair; user: any }> {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, status: 'ACTIVE' },
      include: {
        memberships: {
          where: { societyId: payload.societyId, status: MemberStatus.ACTIVE },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw Errors.UNAUTHENTICATED();
    }

    const membership = user.memberships[0];
    const newTokens = generateTokens(
      user.id,
      membership.societyId,
      membership.roles as UserRole[]
    );

    return { tokens: newTokens, user };
  } catch (error) {
    throw Errors.UNAUTHENTICATED();
  }
}

export async function acceptInvite(data: {
  token: string;
  name: string;
  password: string;
  phone?: string;
}) {
  const tokenHash = hashToken(data.token);

  const invite = await prisma.invite.findFirst({
    where: {
      tokenHash,
      status: InviteStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
    include: { society: true },
  });

  if (!invite) {
    throw Errors.VALIDATION('Invalid or expired invitation token');
  }

  const passwordHash = await hashPassword(data.password);

  return await prisma.$transaction(async (tx) => {
    // Check if user exists by email or phone
    let user = await tx.user.findFirst({
      where: {
        OR: [
          ...(invite.targetEmail ? [{ email: invite.targetEmail }] : []),
          ...(invite.targetPhone || data.phone ? [{ phone: invite.targetPhone || data.phone }] : []),
        ],
      },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          name: data.name,
          email: invite.targetEmail,
          phone: invite.targetPhone || data.phone,
          passwordHash,
          status: 'ACTIVE',
        },
      });
    } else {
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          name: data.name,
          passwordHash,
          status: 'ACTIVE',
        },
      });
    }

    // Add or update society membership
    await tx.societyMember.upsert({
      where: {
        userId_societyId: {
          userId: user.id,
          societyId: invite.societyId,
        },
      },
      update: {
        roles: invite.roles,
        status: MemberStatus.ACTIVE,
      },
      create: {
        userId: user.id,
        societyId: invite.societyId,
        roles: invite.roles,
        status: MemberStatus.ACTIVE,
      },
    });

    // If unit invite, create UnitMembership
    if (invite.unitId) {
      await tx.unitMembership.upsert({
        where: {
          unitId_userId: {
            unitId: invite.unitId,
            userId: user.id,
          },
        },
        update: {
          status: 'ACTIVE',
          approvedById: invite.createdById,
          approvedAt: new Date(),
        },
        create: {
          unitId: invite.unitId,
          userId: user.id,
          type: UnitMembershipType.OWNER,
          status: 'ACTIVE',
          approvedById: invite.createdById,
          approvedAt: new Date(),
        },
      });
    }

    // Mark invite as accepted
    await tx.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    const tokens = generateTokens(user.id, invite.societyId, invite.roles as UserRole[]);
    return { user, tokens, societyId: invite.societyId };
  });
}

export async function switchSociety(userId: string, targetSocietyId: string) {
  const membership = await prisma.societyMember.findUnique({
    where: {
      userId_societyId: {
        userId,
        societyId: targetSocietyId,
      },
      status: MemberStatus.ACTIVE,
    },
    include: { society: true },
  });

  if (!membership || membership.society.status !== 'ACTIVE') {
    throw Errors.FORBIDDEN();
  }

  const tokens = generateTokens(userId, targetSocietyId, membership.roles as UserRole[]);
  return { tokens, societyId: targetSocietyId };
}

export async function updateUserProfile(userId: string, data: { name?: string; phone?: string }) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          society: { select: { id: true, name: true } },
        },
      },
      unitMemberships: {
        where: { status: 'ACTIVE' },
        include: { unit: { include: { tower: true } } },
      },
    },
  });
}
