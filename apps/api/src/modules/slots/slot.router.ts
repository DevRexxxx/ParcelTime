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

slotRouter.get('/available', controller.listAvailableSlots);

slotRouter.post('/:parcelId/book', controller.bookSlot);
slotRouter.post('/:parcelId/reschedule', controller.rescheduleSlot);
slotRouter.post('/:parcelId/cancel', controller.cancelSchedule);

