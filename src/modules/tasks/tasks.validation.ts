import z from 'zod';
import { priorityEnum } from '../../db/schema.ts';
import { taskOrderValues, taskSortByValues } from './tasks.dto.ts';

const priorityValues = priorityEnum.enumValues;

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  completed: z.boolean().default(false).optional(),
  due_date: z.date().optional(),
  priority: z.enum(priorityValues).default('medium').optional(),
  progress: z.number().int().min(0).max(100).default(0).optional(),
  tag_id: z.string().optional(),
  project_id: z.string().optional(),
});

export const getTasksQuerySchema = z.object({
  completed: z.stringbool().optional(),
  priority: z.enum(priorityValues).optional(),
  project_id: z.string().min(1).optional(),
  tag_id: z.string().min(1).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  due_before: z.coerce.date().optional(),
  due_after: z.coerce.date().optional(),
  sort_by: z.enum(taskSortByValues).default('position'),
  order: z.enum(taskOrderValues).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
