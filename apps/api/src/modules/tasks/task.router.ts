import { Router } from 'express';
import * as controller from './task.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

export const taskRouter = Router();

taskRouter.get('/', controller.listTasks);

taskRouter.post(
  '/:id/assign',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.RECEPTION) as any,
  controller.assignTask
);

taskRouter.post(
  '/:id/claim',
  requireRoles(UserRole.DELIVERY_EXECUTIVE) as any,
  controller.claimTask
);

taskRouter.post(
  '/:id/start',
  requireRoles(UserRole.DELIVERY_EXECUTIVE) as any,
  controller.startDelivery
);

taskRouter.post(
  '/:id/verify-otp',
  requireRoles(UserRole.DELIVERY_EXECUTIVE) as any,
  controller.verifyOtp
);

taskRouter.post(
  '/:id/fail',
  requireRoles(UserRole.DELIVERY_EXECUTIVE) as any,
  controller.failDelivery
);

taskRouter.post(
  '/:id/override',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.RECEPTION) as any,
  controller.overrideDelivery
);

