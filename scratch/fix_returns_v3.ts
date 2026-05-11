import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

async function fix() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(url);

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
      await connection.query(q);
      console.log("Success!");
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
    }
  }
  await connection.end();
  process.exit(0);
}
fix();
