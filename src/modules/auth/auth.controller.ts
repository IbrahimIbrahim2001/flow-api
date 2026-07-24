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

  public refresh: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.refresh(req.body);
      res.status(200).json(result);
    },
  );

  public logout: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      await authService.logout(req.body);
      res.status(200).json({ message: 'Logged out' });
    },
  );
}

export default new AuthController();
