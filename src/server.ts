import 'dotenv/config';
import cors from 'cors';
import express from 'express';
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

// global error handler
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Flow API listening on http://localhost:${PORT}`);
  });
}

export default app;
