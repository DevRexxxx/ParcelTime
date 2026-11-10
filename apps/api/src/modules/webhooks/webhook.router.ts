import { Router } from 'express';
import * as controller from './webhook.controller';

export const webhookRouter = Router();

webhookRouter.post('/tracking/:provider', controller.handleTrackingWebhook);
