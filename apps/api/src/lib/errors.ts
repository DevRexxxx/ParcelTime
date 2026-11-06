export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  UNAUTHENTICATED: () => new AppError('UNAUTHENTICATED', 'Authentication required', 401),
  FORBIDDEN: () => new AppError('FORBIDDEN', 'You do not have permission for this action', 403),
  NOT_FOUND: (resource = 'Resource') => new AppError('NOT_FOUND', `${resource} not found`, 404),
  CONFLICT: (msg: string) => new AppError('CONFLICT', msg, 409),
  VALIDATION: (msg: string, fields?: Record<string, string[]>) =>
    new AppError('VALIDATION_ERROR', msg, 422, fields),
  RATE_LIMITED: () =>
    new AppError('RATE_LIMITED', 'Too many requests. Please try again later.', 429),
  INVALID_STATE: (msg: string) => new AppError('INVALID_STATE', msg, 409),
  SLOT_FULL: () => new AppError('SLOT_FULL', 'This delivery slot is no longer available.', 409),
  SLOT_CUTOFF: () =>
    new AppError('SLOT_CUTOFF', 'Booking cutoff has passed for this slot.', 409),
  INTERNAL: () => new AppError('INTERNAL_ERROR', 'An unexpected error occurred.', 500),
};
