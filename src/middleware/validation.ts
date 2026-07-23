import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = Object.assign(new Error(result.error.issues[0].message), {
        statusCode: 400,
      });
      throw error;
    }
    req.body = result.data;
    next();
  };
}
