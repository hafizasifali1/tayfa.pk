import dotenv from 'dotenv';
dotenv.config();

import { db } from './index';
import { sql, eq, desc } from 'drizzle-orm';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function migrate() {
  const isMysql = process.env.DATABASE_URL?.startsWith('mysql');

  try {
    console.log('Running migrations...');

    if (isMysql) {
      // Helper to add column if not exists in MySQL
      const addColumn = async (table: string, column: string, definition: string) => {
        try {
          console.log(`Checking column ${column} in table ${table}...`);
          // Check if column exists first to avoid errors
          const [cols]: any = await db.execute(sql.raw(`SHOW COLUMNS FROM ${table} LIKE '${column}'`));
          if (cols && cols.length > 0) {
            console.log(`Column ${column} already exists in ${table}.`);
            return;
          }
          
          console.log(`Adding column ${column} to table ${table}...`);
          await db.execute(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
          console.log(`Successfully added column ${column} to ${table}.`);
        } catch (e: any) {
          console.error(`Failed to add column ${column} to ${table}:`, e.message);
          // Don't throw to allow other migrations
        }
      };

      // 1. Create all tables FIRST
      console.log('Creating tables (MySQL)...');
      
      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS settings (
          id CHAR(36) PRIMARY KEY,
          \`key\` VARCHAR(100) NOT NULL UNIQUE,
          value JSON NOT NULL,
          description TEXT
        )
      `);

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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
 
      await addColumn('seller_applications', 'category', 'VARCHAR(100)');
      await addColumn('seller_applications', 'custom_category', 'VARCHAR(100)');
      await addColumn('seller_applications', 'company_name', 'VARCHAR(255)');
      await addColumn('seller_applications', 'registration_number', 'VARCHAR(100)');
      await addColumn('seller_applications', 'tax_id', 'VARCHAR(100)');
      await addColumn('seller_applications', 'address_line1', 'TEXT');
      await addColumn('seller_applications', 'city', 'VARCHAR(100)');
      await addColumn('seller_applications', 'state', 'VARCHAR(100)');
      await addColumn('seller_applications', 'postal_code', 'VARCHAR(20)');
      await addColumn('seller_applications', 'country_code', 'VARCHAR(10)');
      await addColumn('seller_applications', 'company_phone', 'VARCHAR(50)');
      await addColumn('seller_applications', 'company_email', 'VARCHAR(255)');
  
      await addColumn('pricelists', 'is_global', 'BOOLEAN DEFAULT FALSE');
      await addColumn('promotions', 'buy_quantity', 'INT');
      await addColumn('promotions', 'get_quantity', 'INT');
      await addColumn('promotions', 'apply_to', "VARCHAR(50) DEFAULT 'all'");
      await addColumn('promotions', 'product_ids', 'JSON');
      await addColumn('promotions', 'category_id', 'CHAR(36)');
      await addColumn('seller_applications', 'brands', 'JSON');
      await addColumn('seller_applications', 'overview_document_url', 'VARCHAR(500)');
    } else {
      // PostgreSQL
      const addColumnPg = async (table: string, column: string, definition: string) => {
        try {
          await db.execute(sql.raw(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`));
        } catch (e: any) {
          console.error(`Failed to add column ${column} to ${table}:`, e.message);
        }
      };

      // 1. Create all tables FIRST
      console.log('Creating tables (PG)...');

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key VARCHAR(100) NOT NULL UNIQUE,
          value JSONB NOT NULL,
          description TEXT
        )
      `);

      await db.execute(sql`
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

      await db.execute(sql`
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

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS currency_rates (
          id SERIAL PRIMARY KEY,
          currency_code VARCHAR(10) NOT NULL,
          rate DECIMAL(18, 6) NOT NULL,
          effective_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
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

      await addColumnPg('users', 'reset_token_expires_at', 'TIMESTAMP');
 
      await addColumnPg('seller_applications', 'category', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'custom_category', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'company_name', 'VARCHAR(255)');
      await addColumnPg('seller_applications', 'registration_number', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'tax_id', 'VARCHAR(100)');
  
      await addColumnPg('pricelists', 'is_global', 'BOOLEAN DEFAULT FALSE');
      await addColumnPg('promotions', 'buy_quantity', 'INT');
      await addColumnPg('promotions', 'get_quantity', 'INT');
      await addColumnPg('promotions', 'apply_to', "VARCHAR(50) DEFAULT 'all'");
      await addColumnPg('promotions', 'product_ids', 'JSONB');
      await addColumnPg('promotions', 'category_id', 'UUID');
      await addColumnPg('seller_applications', 'address_line1', 'TEXT');
      await addColumnPg('seller_applications', 'city', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'state', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'postal_code', 'VARCHAR(20)');
      await addColumnPg('seller_applications', 'country_code', 'VARCHAR(10)');
      await addColumnPg('seller_applications', 'company_phone', 'VARCHAR(50)');
      await addColumnPg('seller_applications', 'company_email', 'VARCHAR(255)');
      await addColumnPg('seller_applications', 'brands', 'JSONB');
      await addColumnPg('seller_applications', 'overview_document_url', 'VARCHAR(500)');
 
      await addColumnPg('brands', 'company_id', 'UUID');
 
      await addColumnPg('seller_applications', 'category', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'custom_category', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'company_name', 'VARCHAR(255)');
      await addColumnPg('seller_applications', 'registration_number', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'tax_id', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'address_line1', 'TEXT');
      await addColumnPg('seller_applications', 'city', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'state', 'VARCHAR(100)');
      await addColumnPg('seller_applications', 'postal_code', 'VARCHAR(20)');
      await addColumnPg('seller_applications', 'country_code', 'VARCHAR(10)');
      await addColumnPg('seller_applications', 'company_phone', 'VARCHAR(50)');
      await addColumnPg('seller_applications', 'company_email', 'VARCHAR(255)');
      await addColumnPg('seller_applications', 'brands', 'JSONB');
      await addColumnPg('seller_applications', 'overview_document_url', 'VARCHAR(500)');
    }

    // Data migration for seller_applications
    try {
      console.log('Migrating existing seller_applications data...');
      const { sellerApplications } = await import('./schema');
      const apps = await db.select().from(sellerApplications);
      
      for (const app of apps) {
        if (app.businessData && typeof app.businessData === 'object' && !app.companyName) {
          console.log(`Migrating data for application ${app.id}...`);
          const bd: any = app.businessData;
          const company = bd.companies?.[0] || {};
          
          await db.update(sellerApplications)
            .set({
              category: bd.category,
              customCategory: bd.customCategory,
              companyName: company.name,
              registrationNumber: company.registrationNumber,
              taxId: company.taxId,
              addressLine1: company.addressLine1 || company.address,
              city: company.city,
              state: company.state,
              postalCode: company.postalCode,
              countryCode: company.countryCode,
              companyPhone: company.phone,
              companyEmail: company.email,
              brands: company.brands,
              overviewDocumentUrl: bd.overviewDocumentUrl || (Array.isArray(bd.overviewDocument) ? bd.overviewDocument[0]?.url : null),
              updatedAt: new Date()
            } as any)
            .where(eq(sellerApplications.id, app.id));
        }
      }
      console.log('Seller applications data migration completed.');
    } catch (migError) {
      console.error('Failed to migrate seller applications data:', migError);
    }

    // Seed/Sync roles and permissions
    try {
      console.log('Synchronizing roles and permissions...');
      const defaultRoles = [
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          isSystem: true,
          permissions: [] // Admin bypasses checks
        },
        {
          id: 'seller',
          name: 'Seller',
          description: 'Manage products and orders',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view'] },
            { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'bulk_upload', actions: ['view', 'create'] },
            { module: 'orders', actions: ['view', 'edit'] },
            { module: 'analytics', actions: ['view'] },
            { module: 'pricelist', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'promotions', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'coupons', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'discounts', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'shipping', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'invoices', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'ledger', actions: ['view'] },
            { module: 'system', actions: ['view'] },
            { module: 'settings', actions: ['view', 'edit'] }
          ]
        },
        {
          id: 'user',
          name: 'Customer',
          description: 'Standard customer access',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view'] }
          ]
        }
      ];

      const { roles } = await import('./schema');
      for (const role of defaultRoles) {
        const [existing] = await db.select().from(roles).where(eq(roles.id, role.id));
        if (!existing) {
          console.log(`Creating role: ${role.id}`);
          await db.insert(roles).values({
            ...role,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else if (role.isSystem) {
          // Force update system roles to ensure latest permissions
          console.log(`Syncing system role: ${role.id}`);
          await db.update(roles)
            .set({ 
              permissions: role.permissions,
              updatedAt: new Date()
            })
            .where(eq(roles.id, role.id));
        }
      }
      console.log('Roles synchronization completed.');
    } catch (roleError) {
      console.error('Failed to sync roles:', roleError);
    }

    console.log('Migrations completed successfully.');

    // Seed default admin user
    try {
      console.log('Seeding default admin user...');
      const adminEmail = 'tayyab786fq@gmail.com';
      const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail));
      
      const hashedPassword = await bcrypt.hash('1234', 10);
      
      if (existingAdmin) {
        console.log('Updating existing user to admin...');
        await db.update(users)
          .set({ 
            role: 'admin', 
            status: 'active',
            password: hashedPassword,
            updatedAt: new Date()
          })
          .where(eq(users.email, adminEmail));
      } else {
        console.log('Creating new default admin user...');
        await db.insert(users).values({
          id: uuidv4(),
          fullName: 'Tayyab Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          status: 'active'
        });
      }
      console.log('Default admin user seeded successfully.');
    } catch (seedError) {
      console.error('Failed to seed default admin user:', seedError);
    }

    // Seed default countries and rates
    try {
      console.log('Seeding default countries and rates...');
      const { countries: countriesTable, currencyRates } = await import('./schema');
      
      const defaultCountries = [
        { name: 'Pakistan', code: 'PK', currencyCode: 'PKR', currencyName: 'Pakistani Rupee', symbol: 'Rs.', isActive: true },
        { name: 'United States', code: 'US', currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', isActive: true },
        { name: 'United Arab Emirates', code: 'AE', currencyCode: 'AED', currencyName: 'UAE Dirham', symbol: 'AED', isActive: true },
        { name: 'United Kingdom', code: 'GB', currencyCode: 'GBP', currencyName: 'British Pound', symbol: '£', isActive: true },
      ];

      for (const country of defaultCountries) {
        const [existing] = await db.select().from(countriesTable).where(eq(countriesTable.code, country.code));
        if (!existing) {
          await db.insert(countriesTable).values(country);
        }
      }

      const defaultRates = [
        { currencyCode: 'PKR', rate: '1.000000', effectiveDate: new Date() },
        { currencyCode: 'USD', rate: '0.003600', effectiveDate: new Date() },
        { currencyCode: 'AED', rate: '0.013000', effectiveDate: new Date() },
        { currencyCode: 'GBP', rate: '0.002800', effectiveDate: new Date() },
      ];

      for (const rate of defaultRates) {
        const [existing] = await db.select().from(currencyRates)
          .where(eq(currencyRates.currencyCode, rate.currencyCode))
          .orderBy(desc(currencyRates.effectiveDate))
          .limit(1);
        
        if (!existing) {
          await db.insert(currencyRates).values(rate);
        }
      }
      console.log('Default countries and rates seeded successfully.');
    } catch (seedError) {
      console.error('Failed to seed default countries and rates:', seedError);
    }

    // Seed default email templates
    try {
      console.log('Seeding default email templates...');
      const { emailTemplates } = await import('./schema');
      
      const defaultTemplates = [
        {
          name: 'customer_welcome',
          subject: 'Welcome to TAYFA Luxury Marketplace!',
          body: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0;">
              <h1 style="color: #c5a059; text-align: center; font-size: 28px;">Welcome to TAYFA, {{name}}</h1>
              <p>We're thrilled to have you join our exclusive community of luxury enthusiasts.</p>
              <p>At TAYFA, we curate only the finest premium products to ensure you have access to the pinnacle of style and craftmanship.</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{site_url}}" style="background-color: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Start Shopping</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0;" />
              <p style="font-size: 12px; color: #666; text-align: center;">© 2026 TAYFA Luxury. All rights reserved.</p>
            </div>
          `,
          variables: 'name,site_url'
        },
        {
          name: 'seller_signup_pending',
          subject: 'Seller Account Created - Pending Approval',
          body: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0;">
              <h1 style="color: #c5a059; text-align: center; font-size: 24px;">Welcome to the TAYFA Partner Program</h1>
              <p>Hello {{name}},</p>
              <p>Thank you for choosing to partner with TAYFA. Your seller account has been successfully created and is now awaiting administrative review.</p>
              <p>Our team will review your business information and get back to you within 24-48 hours. Once approved, you will receive another email with instructions to access your dashboard.</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Status: Pending Review</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0;" />
              <p style="font-size: 12px; color: #666; text-align: center;">© 2026 TAYFA Luxury. All rights reserved.</p>
            </div>
          `,
          variables: 'name,site_url'
        },
        {
          name: 'seller_account_approved',
          subject: 'Your TAYFA Seller Account is Approved!',
          body: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0;">
              <h1 style="color: #c5a059; text-align: center; font-size: 24px;">Congratulations, {{name}}!</h1>
              <p>We are pleased to inform you that your seller application has been approved.</p>
              <p>Your portal is now fully active, and you can start listing your luxury products immediately.</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{login_url}}" style="background-color: #c5a059; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Access Seller Dashboard</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0;" />
              <p style="font-size: 12px; color: #666; text-align: center;">© 2026 TAYFA Luxury. All rights reserved.</p>
            </div>
          `,
          variables: 'name,login_url'
        }
      ];

      for (const template of defaultTemplates) {
        try {
          const [existing] = await db.select().from(emailTemplates).where(eq(emailTemplates.name, template.name));
          if (!existing) {
            await db.insert(emailTemplates).values({
              ...template,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        } catch (e: any) {
          if (e.code === 'ER_DUP_ENTRY') {
            console.log(`Template ${template.name} already exists, skipping.`);
          } else {
            throw e;
          }
        }
      }
      console.log('Default email templates seeded successfully.');
    } catch (seedError) {
      console.error('Failed to seed default email templates:', seedError);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
migrate();
