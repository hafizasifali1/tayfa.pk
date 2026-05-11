import dotenv from 'dotenv';
dotenv.config();
import { db } from '../src/db/index';
import { sql } from 'drizzle-orm';

async function fix() {
  const queries = [
    "ALTER TABLE returns ADD COLUMN user_id CHAR(36) NOT NULL AFTER order_id",
    "ALTER TABLE returns ADD COLUMN proof_images JSON AFTER reason",
    "ALTER TABLE returns ADD COLUMN payment_proof LONGTEXT AFTER proof_images",
    "ALTER TABLE returns ADD COLUMN return_method VARCHAR(100) NOT NULL AFTER payment_proof",
    "ALTER TABLE returns ADD COLUMN admin_note LONGTEXT AFTER status",
    "ALTER TABLE returns ADD COLUMN requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER admin_note"
  ];

  for (const q of queries) {
    try {
      console.log(`Running: ${q}`);
      await db.execute(sql.raw(q));
      console.log("Success!");
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
    }
  }
  process.exit(0);
}
fix();
