import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ name: 'flow-api', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Flow API listening on http://localhost:${PORT}`);
});
