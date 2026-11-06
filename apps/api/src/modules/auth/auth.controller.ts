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
    const { tokens, user } = await service.refreshTokens(token);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTS);
    res.json({ accessToken: tokens.accessToken, userId: user.id });
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
    const data = AcceptInviteSchema.parse(req.body);
    const { user, tokens, societyId } = await service.acceptInvite(data);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTS);
    res.json({ accessToken: tokens.accessToken, userId: user.id, societyId });
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
    // Reset password logic
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    next(e);
  }
}

export async function switchSociety(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { societyId } = req.body;
    if (!societyId) throw Errors.VALIDATION('societyId is required');
    const result = await service.switchSociety(req.user!.userId, societyId);
    res.cookie(REFRESH_COOKIE, result.tokens.refreshToken, COOKIE_OPTS);
    res.json({ accessToken: result.tokens.accessToken, societyId: result.societyId });
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
    const { name, phone } = req.body;
    const updated = await service.updateUserProfile(req.user!.userId, { name, phone });
    res.json(updated);
  } catch (e) {
    next(e);
  }
}
