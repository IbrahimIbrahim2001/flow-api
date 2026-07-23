import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.ts';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Math.round(performance.now() - start),
    });
  });

  next();
}
