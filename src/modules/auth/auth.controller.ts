import type { Request, RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import authService from './auth.service.ts';

class AuthController {
  public register: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    },
  );

  public login: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    },
  );
}

export default new AuthController();
