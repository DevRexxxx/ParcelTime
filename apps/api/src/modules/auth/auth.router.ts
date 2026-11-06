import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

export const authRouter = Router();

authRouter.post('/login', loginLimiter, controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', authenticate as any, controller.logout);
authRouter.post('/accept-invite', controller.acceptInvite);
authRouter.post('/forgot-password', resetLimiter, controller.forgotPassword);
authRouter.post('/reset-password', controller.resetPassword);
authRouter.post('/switch-society', authenticate as any, controller.switchSociety);
authRouter.get('/me', authenticate as any, controller.getMe);
authRouter.patch('/me', authenticate as any, controller.updateMe);
