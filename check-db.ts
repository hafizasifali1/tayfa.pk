import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function checkAndCreateTables() {
  try {
    const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
    
    if (isMysql) {
      console.log('Checking and creating tables for MySQL...');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pricelists (
          id CHAR(36) PRIMARY KEY,
          seller_id CHAR(36),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          currency VARCHAR(10) DEFAULT 'PKR',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS discounts (
          id CHAR(36) PRIMARY KEY,
          seller_id CHAR(36),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          value DECIMAL(10, 2) NOT NULL,
          min_purchase DECIMAL(10, 2) DEFAULT 0.00,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS payment_methods (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          instructions TEXT,
          icon VARCHAR(255),
          type VARCHAR(50) DEFAULT 'manual',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS payment_gateways (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50) NOT NULL UNIQUE,
          type VARCHAR(50) NOT NULL,
          status BOOLEAN DEFAULT TRUE,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS gateway_configs (
          id CHAR(36) PRIMARY KEY,
          gateway_id CHAR(36) NOT NULL,
          \`key\` VARCHAR(255) NOT NULL,
          value TEXT NOT NULL,
          environment VARCHAR(50) DEFAULT 'sandbox',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id CHAR(36) PRIMARY KEY,
          user_id CHAR(36),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS localizations (
          id CHAR(36) PRIMARY KEY,
          code VARCHAR(10) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          is_default BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          translations JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      const [rows] = await db.execute(sql`SHOW TABLES`);
      console.log('Tables:', rows);
    } else {
      console.log('PostgreSQL detected, skipping manual creation for now.');
    }
  } catch (error) {
    console.error('Error checking/creating tables:', error);
  } finally {
    process.exit(0);
  }
}

checkAndCreateTables();
