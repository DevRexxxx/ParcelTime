import { Router } from 'express';
import { authRouter } from './modules/auth/auth.router';
import { societyRouter } from './modules/society/society.router';
import { parcelRouter } from './modules/parcels/parcel.router';
import { slotRouter } from './modules/slots/slot.router';
import { taskRouter } from './modules/tasks/task.router';
import { notificationRouter } from './modules/notifications/notification.router';
import { reportRouter } from './modules/reports/report.router';
import { auditRouter } from './modules/audit/audit.router';
import { healthRouter } from './modules/health/health.router';
import { authenticate } from './middleware/authenticate';

export function createRouter() {
  const router = Router();

  // Public
  router.use('/health', healthRouter);
  router.use('/auth', authRouter);

  // Authenticated
  router.use(authenticate as any);
  router.use('/society', societyRouter);
  router.use('/parcels', parcelRouter);
  router.use('/slots', slotRouter);
  router.use('/tasks', taskRouter);
  router.use('/notifications', notificationRouter);
  router.use('/reports', reportRouter);
  router.use('/audit-logs', auditRouter);

  return router;
}
