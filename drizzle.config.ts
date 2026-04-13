import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const isMysql = process.env.DATABASE_URL?.startsWith('mysql');

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: isMysql ? 'mysql' : 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  },
});
