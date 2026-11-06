import { Request, Response, NextFunction } from 'express';
import {
  LoginSchema,
  AcceptInviteSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@parceltime/shared';
import * as service from './auth.service';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { Errors } from '../../lib/errors';
import { env } from '../../config/env';

const REFRESH_COOKIE = 'pt_refresh';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = LoginSchema.parse(req.body);
    const { user, tokens, societyId } = await service.loginUser(identifier, password);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTS);
    res.json({ accessToken: tokens.accessToken, userId: user.id, societyId });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) throw Errors.UNAUTHENTICATED();
    // TODO: Validate refresh token from DB, rotate
    res.json({ message: 'Refresh endpoint - implement token rotation' });
  } catch (e) {
    next(e);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    res.clearCookie(REFRESH_COOKIE);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

export async function acceptInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const _data = AcceptInviteSchema.parse(req.body);
    // TODO: Implement invite acceptance
    res.json({ message: 'Invite accepted' });
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    ForgotPasswordSchema.parse(req.body);
    // Always return success to prevent user enumeration
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const _data = ResetPasswordSchema.parse(req.body);
    // TODO: Implement password reset
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    next(e);
  }
}

export async function switchSociety(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { societyId: _societyId } = req.body;
    // TODO: Validate membership and issue new tokens
    res.json({ message: 'Society switched' });
  } catch (e) {
    next(e);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await service.getUserById(req.user!.userId);
    if (!user) throw Errors.NOT_FOUND('User');
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // TODO: Implement profile update
    res.json({ message: 'Profile updated' });
  } catch (e) {
    next(e);
  }
}
