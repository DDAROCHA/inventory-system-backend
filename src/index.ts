import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  res.json({ status: 'I am Ilive!' });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
    });
  }
});

app.get('/message', async (req, res) => {
  try {
    console.log('Attempting to connect to the database...');
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
