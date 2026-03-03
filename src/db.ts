import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

console.log('DB_HOST:', process.env.DB_HOST);

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

// TEST CONNECTION
pool
  .connect()
  .then(client => {
    console.log('✅ DB CONNECTED SUCCESSFULLY');
    client.release();
  })
  .catch(err => {
    console.error('❌ DB CONNECTION ERROR:', err.message);
  });
