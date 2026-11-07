import { Router } from 'express';
import * as controller from './notification.controller';

export const notificationRouter = Router();

notificationRouter.get('/', controller.listNotifications);
notificationRouter.patch('/:id/read', controller.markAsRead);
notificationRouter.post('/:id/read', controller.markAsRead);
notificationRouter.post('/read-all', controller.markAllAsRead);
notificationRouter.post('/mark-all-read', controller.markAllAsRead);

// Device token registration
notificationRouter.post('/devices', controller.registerDevice);
notificationRouter.delete('/devices/:token', controller.unregisterDevice);

// Notification preferences
notificationRouter.get('/preferences', controller.getPreferences);
notificationRouter.patch('/preferences', controller.updatePreferences);


