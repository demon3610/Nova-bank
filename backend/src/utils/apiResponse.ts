import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

export function success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    errors: null,
  };
  res.status(statusCode).json(response);
}

export function paginated<T>(
  res: Response,
  items: T[],
  pagination: { page: number; limit: number; total: number },
  message: string = 'Success'
): void {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const response: PaginatedResponse<T> = {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
  res.status(200).json({
    success: true,
    message,
    data: response,
    errors: null,
  });
}

export function error(res: Response, message: string, statusCode: number = 400, errors: string[] | null = null): void {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    errors,
  };
  res.status(statusCode).json(response);
}
