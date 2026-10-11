import type { Request, RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import type { GetTasksQueryDto } from './tasks.dto.ts';
import tasksService from './tasks.service.ts';

class TasksController {
  public create: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await tasksService.create(req.body, req.userId as string);
      res.status(201).json(result);
    },
  );

  public getAll: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await tasksService.getAll(
        req.userId as string,
        req.query as unknown as GetTasksQueryDto,
      );
      res.status(200).json(result);
    },
  );

  public getOne: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await tasksService.getOne(
        req.params.id as string,
        req.userId as string,
      );
      res.status(200).json(result);
    },
  );
}

export default new TasksController();
