import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './parcel.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

const registerLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

export const parcelRouter = Router();

parcelRouter.post(
  '/',
  registerLimiter,
  requireRoles(
    UserRole.RECEPTION,
    UserRole.SOCIETY_ADMIN,
    UserRole.PLATFORM_ADMIN
  ) as any,
  controller.registerParcel
);
parcelRouter.get('/', controller.listParcels);
parcelRouter.get('/:id', controller.getParcel);
parcelRouter.get('/:id/timeline', controller.getParcelTimeline);
parcelRouter.post(
  '/:id/photo-upload-url',
  requireRoles(
    UserRole.RECEPTION,
    UserRole.DELIVERY_EXECUTIVE,
    UserRole.SOCIETY_ADMIN
  ) as any,
  controller.getPhotoUploadUrl
);
parcelRouter.post(
  '/:id/photo-confirm',
  requireRoles(
    UserRole.RECEPTION,
    UserRole.DELIVERY_EXECUTIVE,
    UserRole.SOCIETY_ADMIN
  ) as any,
  controller.confirmPhoto
);
parcelRouter.post('/resolve-qr', controller.resolveQr);
parcelRouter.post(
  '/:id/move-storage',
  requireRoles(UserRole.RECEPTION, UserRole.SOCIETY_ADMIN) as any,
  controller.moveStorage
);
parcelRouter.post(
  '/:id/return-to-courier',
  requireRoles(UserRole.RECEPTION, UserRole.SOCIETY_ADMIN) as any,
  controller.returnToCourier
);
parcelRouter.post('/:id/schedule', controller.scheduleParcel);
parcelRouter.post(
  '/:id/pickup-request',
  requireRoles(UserRole.RESIDENT) as any,
  controller.requestPickup
);
parcelRouter.delete('/:id/pickup-request', controller.cancelPickup);
parcelRouter.post(
  '/:id/pickup-complete',
  requireRoles(UserRole.RECEPTION, UserRole.SOCIETY_ADMIN) as any,
  controller.completePickup
);
parcelRouter.post(
  '/:id/handover-otp',
  requireRoles(UserRole.RESIDENT) as any,
  controller.generateOtp
);
