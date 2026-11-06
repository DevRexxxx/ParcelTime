import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Errors } from '../lib/errors';
import { UserRole } from '@parceltime/shared';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    societyId: string;
    roles: UserRole[];
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return next(Errors.UNAUTHENTICATED());
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub: string;
      societyId: string;
      roles: UserRole[];
    };
    req.user = {
      userId: payload.sub,
      societyId: payload.societyId,
      roles: payload.roles,
    };
    next();
  } catch {
    next(Errors.UNAUTHENTICATED());
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(Errors.UNAUTHENTICATED());
    const hasRole = roles.some((r) => req.user!.roles.includes(r));
    if (!hasRole) return next(Errors.FORBIDDEN());
    next();
  };
}
