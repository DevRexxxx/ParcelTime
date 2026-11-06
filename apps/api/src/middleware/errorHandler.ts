import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      fieldErrors: err.fieldErrors,
      requestId,
    });
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join('.');
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(e.message);
    });
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      fieldErrors,
      requestId,
    });
  }

  logger.error('Unhandled error', { error: err, requestId, path: req.path });
  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
    requestId,
  });
}
