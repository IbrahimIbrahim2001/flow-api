import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
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
  password_hash: text('password_hash').notNull(),
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
    position: integer('position').notNull(),
    tag_id: text('tag_id').references(() => tags.id, { onDelete: 'set null' }),
    project_id: text('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
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
    index('title_idx').on(table.title),
    index('tag_idx').on(table.tag_id),
    index('project_idx').on(table.project_id),
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

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .defaultNow()
    .notNull(),
});

export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  task_id: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  remind_at: timestamp('remind_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .defaultNow()
    .notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token_hash: text('token_hash').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const relationalSchema = defineRelations(
  { users, tasks, tags, projects, reminders, refreshTokens },
  (r) => ({
    users: {
      tasks: r.many.tasks(),
      projects: r.many.projects(),
      refreshTokens: r.many.refreshTokens(),
    },
    tasks: {
      assignedTo: r.one.users({
        from: r.tasks.user_id,
        to: r.users.id,
      }),
      tag: r.one.tags({
        from: r.tasks.tag_id,
        to: r.tags.id,
      }),
      project: r.one.projects({
        from: r.tasks.project_id,
        to: r.projects.id,
      }),
      reminders: r.many.reminders(),
    },
    tags: {
      tasks: r.many.tasks(),
    },
    projects: {
      tasks: r.many.tasks(),
      user: r.one.users({
        from: r.projects.user_id,
        to: r.users.id,
      }),
    },
    reminders: {
      task: r.one.tasks({
        from: r.reminders.task_id,
        to: r.tasks.id,
      }),
    },
    refreshTokens: {
      user: r.one.users({
        from: r.refreshTokens.user_id,
        to: r.users.id,
      }),
    },
  }),
);
