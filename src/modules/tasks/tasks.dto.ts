import type { priorityEnum } from '../../db/schema.ts';

export type TaskPriority = (typeof priorityEnum.enumValues)[number];

export interface CreateTaskDto {
  title: string;
  description?: string;
  completed?: boolean;
  due_date?: Date;
  priority?: TaskPriority;
  progress?: number;
  tag_id?: string;
  project_id?: string;
}

export interface GetTasksQueryDto {
  completed?: boolean;
  priority?: TaskPriority;
  project_id?: string;
  tag_id?: string;
  search?: string;
  due_before?: Date;
  due_after?: Date;
  sort_by?: TasksSortBy;
  order?: TasksOrder;
  page?: number;
  limit?: number;
}

export const taskSortByValues = [
  'position',
  'created_at',
  'due_date',
  'priority',
  'title',
] as const;

export type TasksSortBy = (typeof taskSortByValues)[number];

export const taskOrderValues = ['asc', 'desc'] as const;

export type TasksOrder = (typeof taskOrderValues)[number];
