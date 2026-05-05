import dotenv from 'dotenv';
dotenv.config();

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn('DATABASE_URL is not set. Database features will be disabled.');
}

// ✅ Declare dbInstance
let dbInstance: any;

export const pool = dbUrl?.startsWith('mysql')
  ? mysql.createPool({
      uri: dbUrl,
      ssl: dbUrl.includes('localhost') ? undefined : { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })
  : null;

if (pool && dbUrl?.startsWith('mysql')) {
  dbInstance = drizzleMysql(pool, { schema, mode: 'default' });
} else if (dbUrl) {
  const pgPool = new PgPool({
    connectionString: dbUrl,
    max: 10,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  dbInstance = drizzlePg(pgPool, { schema });
} else {
  dbInstance = null;
}

export const db = dbInstance;