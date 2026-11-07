import { Router } from 'express';
import * as controller from './slot.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

export const slotRouter = Router();

slotRouter.get('/templates', controller.listTemplates);
slotRouter.post(
  '/templates',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.createTemplate
);
slotRouter.patch(
  '/templates/:id',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.updateTemplate
);

slotRouter.get('/available', controller.listAvailableSlots);
slotRouter.get('/availability', controller.listAvailableSlots);

slotRouter.patch(
  '/instances/:id',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.updateSlotInstance
);
slotRouter.patch(
  '/slot-instances/:id',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.updateSlotInstance
);

slotRouter.post('/:parcelId/book', controller.bookSlot);
slotRouter.post('/:parcelId/reschedule', controller.rescheduleSlot);
slotRouter.post('/:parcelId/cancel', controller.cancelSchedule);

