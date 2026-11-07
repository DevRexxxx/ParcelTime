import { Router } from 'express';
import * as controller from './society.controller';
import { requireRoles } from '../../middleware/authenticate';
import { UserRole } from '@parceltime/shared';

export const societyRouter = Router();

// Society management
societyRouter.get('/', controller.getSociety);
societyRouter.patch(
  '/settings',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.updateSettings
);

// Tower routes
societyRouter.get('/towers', controller.listTowers);
societyRouter.post(
  '/towers',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.createTower
);

// Unit routes
societyRouter.get('/units', controller.listUnits);
societyRouter.get('/units/search', controller.searchUnits);
societyRouter.post(
  '/units/import',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.bulkImportUnits
);
societyRouter.post(
  '/units',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.createUnit
);
societyRouter.get('/units/:id', controller.getUnit);

// Member routes
societyRouter.get('/members', controller.listMembers);
societyRouter.patch(
  '/members/:userId/suspend',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.suspendMember
);

// Invite routes
societyRouter.get('/invites', controller.listInvites);
societyRouter.post(
  '/invites',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.RECEPTION, UserRole.PLATFORM_ADMIN) as any,
  controller.createInvite
);
societyRouter.post(
  '/invites/:id/resend',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.resendInvite
);
societyRouter.post(
  '/invites/:id/revoke',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.revokeInvite
);
societyRouter.delete(
  '/invites/:id',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.revokeInvite
);

// Join request routes
societyRouter.get('/join-requests', controller.listJoinRequests);
societyRouter.post('/join-requests', controller.createJoinRequest);
societyRouter.patch(
  '/join-requests/:id',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.reviewJoinRequest
);

// Storage location routes
societyRouter.get('/storage-locations', controller.listStorageLocations);
societyRouter.post(
  '/storage-locations',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.createStorageLocation
);
societyRouter.patch(
  '/storage-locations/:id',
  requireRoles(UserRole.SOCIETY_ADMIN, UserRole.PLATFORM_ADMIN) as any,
  controller.updateStorageLocation
);

// Executives
societyRouter.get(
  '/executives',
  requireRoles(
    UserRole.SOCIETY_ADMIN,
    UserRole.RECEPTION,
    UserRole.PLATFORM_ADMIN
  ) as any,
  controller.listExecutives
);
