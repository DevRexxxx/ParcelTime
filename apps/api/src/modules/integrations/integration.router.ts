import { Router } from 'express';
import * as controller from './integration.controller';

export const integrationRouter = Router();

integrationRouter.get('/', controller.listIntegrations);
integrationRouter.post('/gmail/connect', controller.connectGmail);
integrationRouter.post('/disconnect', controller.disconnectIntegration);

