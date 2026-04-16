/**
 * Custom errors for SAMA business logic
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} not found: ${id}` : `${resource} not found`;
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  public readonly details: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    details: Array<{ field: string; message: string }> = []
  ) {
    super(message, 400);
    this.details = details;
    this.name = 'ValidationError';
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'BusinessRuleError';
  }
}

export class ExternalApiError extends AppError {
  public readonly originalError?: unknown;
  public readonly endpoint?: string;

  constructor(message: string, endpoint?: string, originalError?: unknown) {
    super(message, 502);
    this.endpoint = endpoint;
    this.originalError = originalError;
    this.name = 'ExternalApiError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
