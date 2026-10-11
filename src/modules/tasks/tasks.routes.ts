import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.ts';
import { validate } from '../../middleware/validation.ts';
import tasksController from './tasks.controller.ts';
import { createTaskSchema, getTasksQuerySchema } from './tasks.validation.ts';

const router: Router = Router();

/**
 * @method POST
 * @route /tasks/create
 * @description Create a new task for the authenticated user
 */
router.post(
  '/create',
  authenticate,
  validate(createTaskSchema),
  tasksController.create,
);

/**
 * @method GET
 * @route /tasks
 * @description Get all tasks for the authenticated user
 */
router.get(
  '/',
  authenticate,
  validate(getTasksQuerySchema, 'query'),
  tasksController.getAll,
);

/**
 * @method GET
 * @route /tasks/:id
 * @description Get a single task by id for the authenticated user
 */
router.get('/:id', authenticate, tasksController.getOne);

export const tasksRouter = router;
