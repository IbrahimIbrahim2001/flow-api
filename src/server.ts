import 'dotenv/config';
import cors from 'cors';
import { sql } from 'drizzle-orm';
import type { Express } from 'express';
import express from 'express';
import { db } from './db/drizzle.ts';
import { logger } from './lib/logger.ts';
import { errorMiddleware } from './middleware/error.middleware.ts';
import { requestLogger } from './middleware/request-logger.ts';
import { authRouter } from './modules/auth/auth.routes.ts';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(requestLogger);

/**
 * @method GET
 * @route /health
 * @description Health check endpoint to verify the server and database are connected
 */
app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'healthy', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// routes
app.use('/auth', authRouter);

// global error handler
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`Flow API listening on http://localhost:${PORT}`);
  });
}

export default app;
