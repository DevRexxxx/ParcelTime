import { Router } from 'express';
import * as controller from './shipment.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

export const shipmentRouter = Router();

shipmentRouter.get('/', controller.listResidentShipments);
shipmentRouter.post('/manual', controller.createManualShipment);
shipmentRouter.get(
  '/expected',
  requireRoles(UserRole.RECEPTION, UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.getExpectedShipments
);
shipmentRouter.post(
  '/match-parcel',
  requireRoles(UserRole.RECEPTION, UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.matchShipmentToParcel
);
