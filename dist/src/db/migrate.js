"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const index_1 = require("./index");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
async function migrate() {
    const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
    try {
        console.log('Running migrations...');
        if (isMysql) {
            // Helper to add column if not exists in MySQL
            const addColumn = async (table, column, definition) => {
                try {
                    console.log(`Checking column ${column} in table ${table}...`);
                    // Check if column exists first to avoid errors
                    const [cols] = await index_1.db.execute(drizzle_orm_1.sql.raw(`SHOW COLUMNS FROM ${table} LIKE '${column}'`));
                    if (cols && cols.length > 0) {
                        console.log(`Column ${column} already exists in ${table}.`);
                        return;
                    }
                    console.log(`Adding column ${column} to table ${table}...`);
                    await index_1.db.execute(drizzle_orm_1.sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
                    console.log(`Successfully added column ${column} to ${table}.`);
                }
                catch (e) {
                    console.error(`Failed to add column ${column} to ${table}:`, e.message);
                    // Don't throw to allow other migrations
                }
            };
            // 1. Create all tables FIRST
            console.log('Creating tables (MySQL)...');
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS users (
          id CHAR(36) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          password TEXT,
          role VARCHAR(50) DEFAULT 'user',
          permissions JSON,
          status VARCHAR(50) DEFAULT 'active',
          reset_token VARCHAR(255),
          reset_token_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS communication_providers (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          config JSON NOT NULL,
          sender_id VARCHAR(100),
          endpoint_url TEXT,
          priority INT DEFAULT 1,
          is_active BOOLEAN DEFAULT TRUE,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS communication_templates (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          language VARCHAR(10) DEFAULT 'en',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS communication_logs (
          id CHAR(36) PRIMARY KEY,
          provider_id CHAR(36),
          template_id CHAR(36),
          recipient VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          error TEXT,
          retry_count INT DEFAULT 0,
          metadata JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS orders (
          id CHAR(36) PRIMARY KEY,
          order_number VARCHAR(50) NOT NULL UNIQUE,
          customer_id CHAR(36) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          shipping_address JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS order_items (
          id CHAR(36) PRIMARY KEY,
          order_id CHAR(36) NOT NULL,
          product_id CHAR(36) NOT NULL,
          seller_id CHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS companies (
          id CHAR(36) PRIMARY KEY,
          seller_id CHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          registration_number VARCHAR(100),
          tax_id VARCHAR(100),
          address TEXT,
          phone VARCHAR(50),
          email VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS seller_applications (
          id CHAR(36) PRIMARY KEY,
          user_id CHAR(36) NOT NULL,
          business_data JSON NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          admin_notes TEXT,
          reviewed_by CHAR(36),
          reviewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS roles (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_system BOOLEAN DEFAULT FALSE,
          permissions JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS settings (
          id CHAR(36) PRIMARY KEY,
          \`key\` VARCHAR(100) NOT NULL UNIQUE,
          value JSON NOT NULL,
          description TEXT
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS tax_rules (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          rate DECIMAL(5, 2) NOT NULL,
          type VARCHAR(50) DEFAULT 'percentage',
          region VARCHAR(100),
          country VARCHAR(100) DEFAULT 'Pakistan',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS countries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) NOT NULL UNIQUE,
          currency_code VARCHAR(10) NOT NULL,
          currency_name VARCHAR(100) NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS currency_rates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          currency_code VARCHAR(10) NOT NULL,
          rate DECIMAL(18, 6) NOT NULL,
          effective_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // 2. Add missing columns
            console.log('Adding missing columns (MySQL)...');
            await addColumn('orders', 'tax_amount', 'DECIMAL(10, 2) DEFAULT 0.00');
            await addColumn('orders', 'discount_amount', 'DECIMAL(10, 2) DEFAULT 0.00');
            await addColumn('orders', 'currency', "VARCHAR(10) DEFAULT 'PKR'");
            await addColumn('orders', 'status', "VARCHAR(50) DEFAULT 'pending'");
            await addColumn('orders', 'payment_status', "VARCHAR(50) DEFAULT 'pending'");
            await addColumn('orders', 'payment_method', "VARCHAR(50)");
            await addColumn('orders', 'billing_address', 'JSON');
            await addColumn('orders', 'notes', 'TEXT');
            await addColumn('orders', 'source', "VARCHAR(50) DEFAULT 'website'");
            await addColumn('orders', 'created_by', 'CHAR(36)');
            await addColumn('order_items', 'original_price', 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00');
            await addColumn('order_items', 'shipped_quantity', 'INT DEFAULT 0');
            await addColumn('order_items', 'returned_quantity', 'INT DEFAULT 0');
            await addColumn('order_items', 'size', 'VARCHAR(50)');
            await addColumn('order_items', 'color', 'VARCHAR(50)');
            await addColumn('order_items', 'status', "VARCHAR(50) DEFAULT 'pending'");
            await addColumn('users', 'reset_token', 'VARCHAR(255)');
            await addColumn('users', 'reset_token_expires_at', 'TIMESTAMP');
            await addColumn('users', 'status', "VARCHAR(50) DEFAULT 'active'");
            await addColumn('users', 'permissions', 'JSON');
            await addColumn('users', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            await addColumn('brands', 'company_id', 'CHAR(36)');
        }
        else {
            // PostgreSQL
            const addColumnPg = async (table, column, definition) => {
                try {
                    await index_1.db.execute(drizzle_orm_1.sql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`));
                }
                catch (e) {
                    console.error(`Failed to add column ${column} to ${table}:`, e.message);
                }
            };
            // 1. Create all tables FIRST
            console.log('Creating tables (PG)...');
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          password TEXT,
          role VARCHAR(50) DEFAULT 'user',
          permissions JSONB,
          status VARCHAR(50) DEFAULT 'active',
          reset_token VARCHAR(255),
          reset_token_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS communication_providers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          config JSONB NOT NULL,
          sender_id VARCHAR(100),
          endpoint_url TEXT,
          priority INT DEFAULT 1,
          is_active BOOLEAN DEFAULT TRUE,
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS communication_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          language VARCHAR(10) DEFAULT 'en',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS communication_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          provider_id UUID,
          template_id UUID,
          recipient VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          error TEXT,
          retry_count INT DEFAULT 0,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          seller_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          registration_number VARCHAR(100),
          tax_id VARCHAR(100),
          address TEXT,
          phone VARCHAR(50),
          email VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS seller_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          business_data JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          admin_notes TEXT,
          reviewed_by UUID,
          reviewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(100) NOT NULL UNIQUE,
          value JSONB NOT NULL,
          description TEXT
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS tax_rules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          rate DECIMAL(5, 2) NOT NULL,
          type VARCHAR(50) DEFAULT 'percentage',
          region VARCHAR(100),
          country VARCHAR(100) DEFAULT 'Pakistan',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS countries (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) NOT NULL UNIQUE,
          currency_code VARCHAR(10) NOT NULL,
          currency_name VARCHAR(100) NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS currency_rates (
          id SERIAL PRIMARY KEY,
          currency_code VARCHAR(10) NOT NULL,
          rate DECIMAL(18, 6) NOT NULL,
          effective_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await index_1.db.execute((0, drizzle_orm_1.sql) `
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_system BOOLEAN DEFAULT FALSE,
          permissions JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // 2. Add missing columns
            console.log('Adding missing columns (PG)...');
            await addColumnPg('orders', 'tax_amount', 'DECIMAL(10, 2) DEFAULT 0.00');
            await addColumnPg('orders', 'discount_amount', 'DECIMAL(10, 2) DEFAULT 0.00');
            await addColumnPg('orders', 'currency', "VARCHAR(10) DEFAULT 'PKR'");
            await addColumnPg('orders', 'status', "VARCHAR(50) DEFAULT 'pending'");
            await addColumnPg('orders', 'payment_status', "VARCHAR(50) DEFAULT 'pending'");
            await addColumnPg('orders', 'payment_method', "VARCHAR(50)");
            await addColumnPg('orders', 'billing_address', 'JSONB');
            await addColumnPg('orders', 'notes', 'TEXT');
            await addColumnPg('orders', 'source', "VARCHAR(50) DEFAULT 'website'");
            await addColumnPg('orders', 'created_by', 'UUID');
            await addColumnPg('order_items', 'original_price', 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00');
            await addColumnPg('order_items', 'shipped_quantity', 'INT DEFAULT 0');
            await addColumnPg('order_items', 'returned_quantity', 'INT DEFAULT 0');
            await addColumnPg('order_items', 'size', 'VARCHAR(50)');
            await addColumnPg('order_items', 'color', 'VARCHAR(50)');
            await addColumnPg('order_items', 'status', "VARCHAR(50) DEFAULT 'pending'");
            await addColumnPg('users', 'reset_token', 'VARCHAR(255)');
            await addColumnPg('users', 'reset_token_expires_at', 'TIMESTAMP');
            await addColumnPg('brands', 'company_id', 'UUID');
        }
        console.log('Migrations completed successfully.');
        // Seed default admin user
        try {
            console.log('Seeding default admin user...');
            const adminEmail = 'tayyab786fq@gmail.com';
            const [existingAdmin] = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, adminEmail));
            const hashedPassword = await bcryptjs_1.default.hash('1234', 10);
            if (existingAdmin) {
                console.log('Updating existing user to admin...');
                await index_1.db.update(schema_1.users)
                    .set({
                    role: 'admin',
                    status: 'active',
                    password: hashedPassword,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.email, adminEmail));
            }
            else {
                console.log('Creating new default admin user...');
                await index_1.db.insert(schema_1.users).values({
                    id: (0, uuid_1.v4)(),
                    fullName: 'Tayyab Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'admin',
                    status: 'active'
                });
            }
            console.log('Default admin user seeded successfully.');
        }
        catch (seedError) {
            console.error('Failed to seed default admin user:', seedError);
        }
        // Seed default countries and rates
        try {
            console.log('Seeding default countries and rates...');
            const { countries: countriesTable, currencyRates } = await Promise.resolve().then(() => __importStar(require('./schema')));
            const defaultCountries = [
                { name: 'Pakistan', code: 'PK', currencyCode: 'PKR', currencyName: 'Pakistani Rupee', symbol: 'Rs.', isActive: true },
                { name: 'United States', code: 'US', currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', isActive: true },
                { name: 'United Arab Emirates', code: 'AE', currencyCode: 'AED', currencyName: 'UAE Dirham', symbol: 'AED', isActive: true },
                { name: 'United Kingdom', code: 'GB', currencyCode: 'GBP', currencyName: 'British Pound', symbol: '£', isActive: true },
            ];
            for (const country of defaultCountries) {
                const [existing] = await index_1.db.select().from(countriesTable).where((0, drizzle_orm_1.eq)(countriesTable.code, country.code));
                if (!existing) {
                    await index_1.db.insert(countriesTable).values(country);
                }
            }
            const defaultRates = [
                { currencyCode: 'PKR', rate: '1.000000', effectiveDate: new Date() },
                { currencyCode: 'USD', rate: '0.003600', effectiveDate: new Date() },
                { currencyCode: 'AED', rate: '0.013000', effectiveDate: new Date() },
                { currencyCode: 'GBP', rate: '0.002800', effectiveDate: new Date() },
            ];
            for (const rate of defaultRates) {
                const [existing] = await index_1.db.select().from(currencyRates)
                    .where((0, drizzle_orm_1.eq)(currencyRates.currencyCode, rate.currencyCode))
                    .orderBy((0, drizzle_orm_1.desc)(currencyRates.effectiveDate))
                    .limit(1);
                if (!existing) {
                    await index_1.db.insert(currencyRates).values(rate);
                }
            }
            console.log('Default countries and rates seeded successfully.');
        }
        catch (seedError) {
            console.error('Failed to seed default countries and rates:', seedError);
        }
    }
    catch (error) {
        console.error('Migration failed:', error);
        // Don't throw error to allow server to start even if migration fails
    }
}
