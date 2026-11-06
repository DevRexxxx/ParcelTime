import { Router } from 'express';
import * as controller from './notification.controller';

export const notificationRouter = Router();

notificationRouter.get('/', controller.listNotifications);
notificationRouter.patch('/:id/read', controller.markAsRead);
notificationRouter.post('/mark-all-read', controller.markAllAsRead);

