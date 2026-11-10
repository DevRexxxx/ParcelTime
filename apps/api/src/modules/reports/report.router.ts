import { Router } from 'express';
import * as controller from './report.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

export const reportRouter = Router();

reportRouter.get(
  '/dashboard',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.RECEPTION, UserRole.PLATFORM_ADMIN) as any,
  controller.getDashboardStats
);

reportRouter.get(
  '/slot-utilization',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.getSlotUtilization
);

reportRouter.get(
  '/executives',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.getExecutivePerformance
);

reportRouter.get(
  '/pilot-kpis',
  requireRoles(
    UserRole.SOCIETY_ADMIN,
    UserRole.RECEPTION,
    UserRole.PLATFORM_ADMIN,
    UserRole.RESIDENT
  ) as any,
  controller.getPilotKpis
);

reportRouter.get(
  '/ageing-parcels',
  requireRoles(
    UserRole.SOCIETY_ADMIN,
    UserRole.RECEPTION,
    UserRole.PLATFORM_ADMIN
  ) as any,
  controller.getAgeingParcels
);


