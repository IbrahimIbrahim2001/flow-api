import z from 'zod';
import { priorityEnum } from '../../db/schema.ts';

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
