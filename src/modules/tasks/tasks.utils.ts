import { and, asc, desc, eq, gte, ilike, lte, or } from 'drizzle-orm';
import { tasks } from '../../db/schema.ts';
import type { GetTasksQueryDto, TasksOrder, TasksSortBy } from './tasks.dto.ts';

export function buildTasksWhereClause(userId: string, query: GetTasksQueryDto) {
  const conditions = [eq(tasks.user_id, userId)];

  if (query.completed !== undefined) {
    conditions.push(eq(tasks.completed, query.completed));
  }

  if (query.priority) {
    conditions.push(eq(tasks.priority, query.priority));
  }

  if (query.project_id) {
    conditions.push(eq(tasks.project_id, query.project_id));
  }

  if (query.tag_id) {
    conditions.push(eq(tasks.tag_id, query.tag_id));
  }

  if (query.search) {
    const pattern = `%${query.search}%`;
    const searchCondition = or(
      ilike(tasks.title, pattern),
      ilike(tasks.description, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.due_before) {
    conditions.push(lte(tasks.due_date, query.due_before));
  }

  if (query.due_after) {
    conditions.push(gte(tasks.due_date, query.due_after));
  }

  return and(...conditions);
}

const sortColumns = {
  position: tasks.position,
  created_at: tasks.created_at,
  due_date: tasks.due_date,
  priority: tasks.priority,
  title: tasks.title,
} as const;

export function buildTasksOrderBy(
  sortBy: TasksSortBy = 'position',
  order: TasksOrder = 'asc',
) {
  return order === 'desc'
    ? desc(sortColumns[sortBy])
    : asc(sortColumns[sortBy]);
}

const MAX_LIMIT = 100;

export function normalizeTasksPagination(page = 1, limit = 20) {
  const safeLimit = Math.min(limit, MAX_LIMIT);
  return { page, limit: safeLimit, offset: (page - 1) * safeLimit };
}
