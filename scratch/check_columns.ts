import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    const results = await db.execute(sql`DESCRIBE order_status_history`);
    console.log('Columns in order_status_history:');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Failed to describe table:', error);
    process.exit(1);
  }
}

check();
