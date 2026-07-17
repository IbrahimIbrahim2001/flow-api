import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { db } from './db/drizzle.js';
import { todo } from './db/schema.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.get('/', (_req, res) => {
  res.json({ name: 'flow-api', status: 'ok' });
});

app.get('/todos', async (_req, res) => {
  const todos_ = await db.select().from(todo);
  const todos = await db.query.todo.findMany();
  res.json({ todos_: todos_, todos: todos });
});

// global error handler
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Flow API listening on http://localhost:${PORT}`);
  });
}

export default app;
