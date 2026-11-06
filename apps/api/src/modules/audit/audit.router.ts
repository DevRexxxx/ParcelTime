import { Router } from 'express';
import * as controller from './audit.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

export const auditRouter = Router();

auditRouter.get(
  '/',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.listAuditLogs
);

