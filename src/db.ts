import { Pool } from 'pg';

export const pool = new Pool({
  host: 'database-1.c83oo2g6aliw.us-east-1.rds.amazonaws.com',
  user: 'postgres',
  password: 'postgres-ddr-346',
  database: 'database-1',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});
