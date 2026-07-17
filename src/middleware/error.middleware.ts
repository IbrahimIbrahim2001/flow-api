import type { NextFunction, Request, Response } from 'express';

interface AppError extends Error {
  statusCode?: number;
  success?: boolean;
}

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
