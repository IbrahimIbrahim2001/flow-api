import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm/relations';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  email_verified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const priorityEnum = pgEnum('priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const tasks = pgTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    completed: boolean('completed').default(false).notNull(),
    due_date: timestamp('due_date', { withTimezone: true }),
    priority: priorityEnum('priority').default('medium').notNull(),
    progress: integer('progress').default(0).notNull(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tag_id: text('tag_id').references(() => tags.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .defaultNow()
      .notNull(),
  },
  (table) => [
    {
      progressRange: check(
        'progress_range',
        sql`${table.progress} >= 0 AND ${table.progress} <= 100`,
      ),
    },
  ],
);

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .defaultNow()
    .notNull(),
});

export const relationalSchema = defineRelations(
  { users, tasks, tags },
  (r) => ({
    users: {
      tasks: r.many.tasks(),
    },
    tasks: {
      assignedTo: r.one.users({
        from: r.users.id,
        to: r.tasks.user_id,
      }),
      tag: r.one.tags({
        from: r.tasks.tag_id,
        to: r.tags.id,
      }),
    },
    tags: {
      tasks: r.many.tasks(),
    },
  }),
);
