import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '@/types';
import { logger } from '@/config/logger';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorResponse {
  success: false;
  message: string;
  data: null;
  errors: string[] | null;
  stack?: string;
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const reqUser = (req as RequestWithUser).user;

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: reqUser?.userId,
    requestId: (req as RequestWithUser).requestId,
  });

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      data: null,
      errors: [err.code],
      stack: err.stack,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const messages = Object.values(mongooseErr.errors || {}).map((e: any) => e.message);
    const response: ErrorResponse = {
      success: false,
      message: 'Validation failed',
      data: null,
      errors: messages,
    };
    res.status(400).json(response);
    return;
  }

  if (err.name === 'CastError') {
    const response: ErrorResponse = {
      success: false,
      message: 'Invalid resource ID',
      data: null,
      errors: ['The provided ID is invalid'],
    };
    res.status(400).json(response);
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const response: ErrorResponse = {
      success: false,
      message: 'Invalid or expired token',
      data: null,
      errors: [err.message],
    };
    res.status(401).json(response);
    return;
  }

  if ((err as any).code === 11000) {
    const keyValue = (err as any).keyValue || {};
    const fields = Object.keys(keyValue).join(', ');
    const response: ErrorResponse = {
      success: false,
      message: 'Duplicate field value',
      data: null,
      errors: [`${fields} already exists`],
    };
    res.status(409).json(response);
    return;
  }

  const response: ErrorResponse = {
    success: false,
    message: err.message,
    data: null,
    errors: ['INTERNAL_SERVER_ERROR'],
    stack: err.stack,
  };
  res.status(500).json(response);
}
