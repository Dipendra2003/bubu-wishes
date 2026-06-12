import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

// Parse DATABASE_URL and ensure proper SSL mode
const databaseUrl = process.env.DATABASE_URL || '';
const connectionString = databaseUrl.includes('sslmode=require') 
  ? databaseUrl.replace('sslmode=require', 'sslmode=verify-full')
  : databaseUrl;

const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
