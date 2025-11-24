import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
