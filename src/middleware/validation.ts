import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export function validate(schema: ZodType, source: 'body' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const error = Object.assign(new Error(result.error.issues[0].message), {
        statusCode: 400,
      });
      throw error;
    }
    req[source] = result.data;
    next();
  };
}
