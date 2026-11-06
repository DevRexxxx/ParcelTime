import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createRouter } from './router';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { logger } from './lib/logger';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(requestId);

// Routes
app.use('/api/v1', createRouter());

// Error handler
app.use(errorHandler);

const port = env.PORT || 3001;
app.listen(port, () => {
  logger.info(`ParcelTime API listening on port ${port}`);
});

export default app;
