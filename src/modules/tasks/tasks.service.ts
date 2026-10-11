import { randomUUID } from 'node:crypto';
import { and, count, eq, max } from 'drizzle-orm';
import { db } from '../../db/drizzle.ts';
import { tasks } from '../../db/schema.ts';
import type { CreateTaskDto, GetTasksQueryDto } from './tasks.dto.ts';
import {
  buildTasksOrderBy,
  buildTasksWhereClause,
  normalizeTasksPagination,
} from './tasks.utils.ts';

class TasksService {
  async create(input: CreateTaskDto, userId: string) {
    const [nextPosition] = await db
      .select({ value: max(tasks.position) })
      .from(tasks)
      .where(eq(tasks.user_id, userId));

    const position = (nextPosition?.value ?? 0) + 1;

    const [task] = await db
      .insert(tasks)
      .values({
        id: randomUUID(),
        title: input.title,
        description: input.description,
        completed: input.completed,
        due_date: input.due_date,
        priority: input.priority,
        progress: input.progress,
        tag_id: input.tag_id,
        project_id: input.project_id,
        user_id: userId,
        position,
      })
      .returning();

    return {
      success: true,
      message: 'Task created successfully',
      data: task,
    };
  }

  async getAll(userId: string, query: GetTasksQueryDto = {}) {
    const { page, limit, offset } = normalizeTasksPagination(
      query.page ?? 1,
      query.limit ?? 20,
    );

    const where = buildTasksWhereClause(userId, query);
    const orderBy = buildTasksOrderBy(
      query.sort_by ?? 'position',
      query.order ?? 'asc',
    );

    const [countRow] = await db
      .select({ total: count() })
      .from(tasks)
      .where(where);

    const total = countRow?.total ?? 0;

    const tasksList = await db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      message: 'Tasks fetched successfully',
      data: tasksList,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOne(id: string, userId: string) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.user_id, userId)))
      .limit(1);

    if (!task) {
      return {
        success: false,
        message: 'Task not found',
      };
    }

    return {
      success: true,
      message: 'Task fetched successfully',
      data: task,
    };
  }
}

export default new TasksService();
