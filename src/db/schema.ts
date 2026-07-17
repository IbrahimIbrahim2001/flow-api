import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm/relations';

export const todo = pgTable('todo', {
  id: integer('id').primaryKey(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
  userId: text('userId').notNull(),
});

export const relationalSchema = defineRelations({ todo }, () => ({
  todo: {},
}));
