import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.json({ status: 'ok', db: 'disconnected' });
  }
});

app.get('/message', async (req, res) => {
  try {
    const result = await pool.query("SELECT 'Hello from AWS RDS!' as message");
    res.json({ message: result.rows[0].message });
  } catch {
    res.json({ message: 'DB not connected' });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
