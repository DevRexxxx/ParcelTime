import { prisma } from '../../lib/prisma';
import { Errors } from '../../lib/errors';
import { env } from '../../config/env';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, MemberStatus } from '@parceltime/shared';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
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
