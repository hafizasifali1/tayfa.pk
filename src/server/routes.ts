import express from 'express';
import { db } from '../db';
import {
  products,
  brands,
  categories,
  promotions,
  coupons,
  invoices,
  creditNotes,
  ledgers,
  auditLogs,
  blogs,
  pages,
  settings,
  orders,
  pricelists,
  discounts,
  paymentMethods,
  notifications,
  localizations,
  paymentGateways,
  gatewayConfigs,
  users,
  roles,
  companies,
  sellerApplications,
  taxRules,
  filters,
  filterValues,
  productFilterValues,
  countries,
  currencyRates,
  alias,
  seo,
  communicationProviders,
  communicationTemplates,
  communicationLogs,
  carts,
  cartItems,
  customers,
  transactions,
  payments,
  orderItems,
  orderStatusHistory,
  shipments,
  returns,
  refunds,
  emailSettings,
  emailTemplates
} from '../db/schema';
import nodemailer from 'nodemailer';
import { CommunicationService } from './services/communication/CommunicationService';
import { encrypt } from './utils/encryption';
import { handlePatchUpdate } from './utils/updateHandler';
import { eq, desc, and, or, gte, lte, like, sql, inArray, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { SEOEntityType } from '../types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
const idType = isMysql ? 'CHAR(36)' : 'UUID';

// --- File Upload Configuration ---
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// --- Database Migration Helper ---
const runMigrations = async () => {
  if (!process.env.DATABASE_URL) return;

  console.log('Checking for missing columns in database...');
  try {
    // Brands
    try { await db.execute(sql`ALTER TABLE brands ADD COLUMN is_active BOOLEAN DEFAULT TRUE`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE brands ADD COLUMN seo JSON`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE brands ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`); } catch (e) { }

    // Categories
    try { await db.execute(sql`ALTER TABLE categories ADD COLUMN parent_id ${sql.raw(idType)}`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE categories ADD COLUMN is_featured BOOLEAN DEFAULT FALSE`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE categories ADD COLUMN seo JSON`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`); } catch (e) { }
    try {
      await db.execute(sql`ALTER TABLE categories ADD COLUMN icon TEXT`);
      // Try to migrate data from image column if it exists
      try { await db.execute(sql`UPDATE categories SET icon = image WHERE icon IS NULL`); } catch (e) { }
    } catch (e) { }

    // Products
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN parent_category_id ${sql.raw(idType)}`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN subcategory VARCHAR(100)`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN seller_id ${sql.raw(idType)}`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN sku VARCHAR(255)`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN pricelist_id ${sql.raw(idType)}`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN tax_rule_id ${sql.raw(idType)}`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE products ADD COLUMN dynamic_filters JSON`); } catch (e) { }
    // Ensure images column is large enough for Base64 (LONGTEXT for MySQL)
    if (isMysql) {
      try { await db.execute(sql`ALTER TABLE products MODIFY COLUMN images LONGTEXT`); } catch (e) { }
      try { await db.execute(sql`ALTER TABLE products MODIFY COLUMN description LONGTEXT`); } catch (e) { }
    }

    // Tax Rules
    try { await db.execute(sql`ALTER TABLE tax_rules ADD COLUMN state VARCHAR(100)`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE tax_rules ADD COLUMN pricelist_id CHAR(36)`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE tax_rules ADD COLUMN is_active BOOLEAN DEFAULT TRUE`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE tax_rules ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`); } catch (e) { }

    // Blogs
    try { await db.execute(sql`ALTER TABLE blogs ADD COLUMN status VARCHAR(50) DEFAULT 'active'`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE blogs ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE pricelists ADD COLUMN items JSON`); } catch (e) { }

    // Discounts
    console.log('[Migration] Checking discounts table...');
    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN name VARCHAR(255)`); 
      console.log('[Migration] Added name to discounts');
    } catch (e) { }
    
    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN type VARCHAR(50) DEFAULT 'percentage'`); 
      console.log('[Migration] Added type to discounts');
    } catch (e) { }

    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN value DECIMAL(10, 2) DEFAULT 0.00`); 
      console.log('[Migration] Added value to discounts');
    } catch (e) { }

    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN status VARCHAR(50) DEFAULT 'active'`); 
      console.log('[Migration] Added status to discounts');
    } catch (e) { }

    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN apply_to VARCHAR(50) DEFAULT 'all'`); 
      console.log('[Migration] Added apply_to to discounts');
    } catch (e) { }

    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN category_id ${sql.raw(idType)}`); 
      console.log('[Migration] Added category_id to discounts');
    } catch (e) { }

    try { 
      // Try JSON first, then LONGTEXT if it fails (for older MySQL)
      try { 
        await db.execute(sql`ALTER TABLE discounts ADD COLUMN product_ids JSON`); 
        console.log('[Migration] Added product_ids (JSON) to discounts');
      } catch (e) { 
        await db.execute(sql`ALTER TABLE discounts ADD COLUMN product_ids LONGTEXT`); 
        console.log('[Migration] Added product_ids (LONGTEXT fallback) to discounts');
      }
    } catch (e) { }

    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN start_date TIMESTAMP NULL`); 
      console.log('[Migration] Added start_date to discounts');
    } catch (e) { }

    try { 
      await db.execute(sql`ALTER TABLE discounts ADD COLUMN end_date TIMESTAMP NULL`); 
      console.log('[Migration] Added end_date to discounts');
    } catch (e) { }

    try { await db.execute(sql`ALTER TABLE discounts ADD COLUMN description TEXT`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE discounts ADD COLUMN min_purchase DECIMAL(10, 2) DEFAULT 0.00`); } catch (e) { }
    try { await db.execute(sql`ALTER TABLE discounts ADD COLUMN is_active BOOLEAN DEFAULT TRUE`); } catch (e) { }

    // Promote specific user to super_admin
    try {
      await db.execute(sql`UPDATE users SET role = 'super_admin' WHERE email = 'tayyab786fq@gmail.com'`);
    } catch (e) { }

    // Pages Table
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pages (
          id ${sql.raw(idType)} PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          keywords TEXT,
          robots VARCHAR(100) DEFAULT 'index, follow',
          structured_data TEXT,
          status VARCHAR(50) DEFAULT 'active',
          seo_score DECIMAL(5, 2),
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    } catch (e) { }

    // Dynamic Filters
    const idTypeFilter = isMysql ? 'CHAR(36)' : 'TEXT';
    const jsonType = isMysql ? 'JSON' : 'TEXT';

    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS filters (
        id ${sql.raw(idTypeFilter)} PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        labels ${sql.raw(jsonType)},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    } catch (e) { }

    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS filter_values (
        id ${sql.raw(idTypeFilter)} PRIMARY KEY,
        filter_id ${sql.raw(idTypeFilter)} NOT NULL,
        value VARCHAR(255) NOT NULL,
        labels ${sql.raw(jsonType)},
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    } catch (e) { }

    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS product_filter_values (
        id ${sql.raw(idTypeFilter)} PRIMARY KEY,
        product_id ${sql.raw(idTypeFilter)} NOT NULL,
        filter_id ${sql.raw(idTypeFilter)} NOT NULL,
        value_id ${sql.raw(idTypeFilter)} NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      // Ensure columns exist if table was created with old schema
      try { await db.execute(sql`ALTER TABLE product_filter_values ADD COLUMN filter_id ${sql.raw(idTypeFilter)}`); } catch (e) { }
      try { await db.execute(sql`ALTER TABLE product_filter_values ADD COLUMN value_id ${sql.raw(idTypeFilter)}`); } catch (e) { }
      try { await db.execute(sql`ALTER TABLE product_filter_values ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); } catch (e) { }
    } catch (e) { }

    // SEO
    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS seo (
        id ${sql.raw(idType)} PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id ${sql.raw(idType)} NOT NULL,
        entity_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        keywords TEXT,
        slug VARCHAR(255) NOT NULL,
        canonical_url TEXT,
        og_image TEXT,
        robots VARCHAR(100) DEFAULT 'index, follow',
        structured_data TEXT,
        status VARCHAR(50) DEFAULT 'active',
        seo_score DECIMAL(5, 2),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    } catch (e) { }
    

    // Carts
    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS carts (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        session_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    } catch (e) { }

    // Cart Items
    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS cart_items (
        id CHAR(36) PRIMARY KEY,
        cart_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        seller_id CHAR(36),
        variant_id VARCHAR(100) DEFAULT 'default',
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        qty INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    } catch (e) { }

    // Customers
    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS customers (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        gender VARCHAR(20),
        date_of_birth TIMESTAMP,
        country VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        profile_image TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    } catch (e) { }

    // Email Settings & Templates
    try {
      if (isMysql) {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS email_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            mail_driver VARCHAR(50) DEFAULT 'smtp',
            mail_host VARCHAR(255) NOT NULL,
            mail_port INT DEFAULT 587,
            mail_username VARCHAR(255) NOT NULL,
            mail_password VARCHAR(255) NOT NULL,
            mail_encryption VARCHAR(20) DEFAULT 'tls',
            from_email VARCHAR(255) NOT NULL,
            from_name VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS email_templates (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            subject VARCHAR(255) NOT NULL,
            body LONGTEXT NOT NULL,
            variables TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);

        // Check if templates exist, if not seed them
        const existingTemplates = await db.select().from(emailTemplates).limit(1);
        if (existingTemplates.length === 0) {
          await db.execute(sql`
            INSERT INTO email_templates (name, subject, body, variables) VALUES
            ('order_confirmation', 'Order Confirmed - #{{order_id}}', '<h2>Thank you {{customer_name}}!</h2><p>Your order #{{order_id}} has been confirmed.</p>', '{{customer_name}},{{order_id}},{{total_amount}}'),
            ('welcome_email', 'Welcome to TAYFA, {{customer_name}}!', '<h2>Welcome {{customer_name}}!</h2><p>Thank you for joining TAYFA.</p>', '{{customer_name}},{{email}}'),
            ('password_reset', 'Reset Your Password', '<p>Click <a href="{{reset_link}}">here</a> to reset your password.</p>', '{{customer_name}},{{reset_link}}'),
            ('seller_approved', 'Your Seller Account is Approved!', '<h2>Congratulations {{seller_name}}!</h2><p>Your seller account has been approved.</p>', '{{seller_name}},{{dashboard_link}}'),
            ('order_shipped', 'Your Order #{{order_id}} Has Been Shipped', '<p>Your order is on the way! Tracking: {{tracking_number}}</p>', '{{customer_name}},{{order_id}},{{tracking_number}}')
          `);
        }
      }
    } catch (e) {
      console.error('Error migrating email tables:', e);
    }

    console.log('Database migration check completed.');
  } catch (error) {
    console.error('Migration error (some columns might already exist):', error);
  }
};

runMigrations();

const getPagination = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const offset = (page - 1) * limit;
  return { limit, offset };
};

// Helper to ensure JSON fields are parsed correctly (handles double-stringification)
const parseJsonField = (field: any) => {
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      // If the result is still a string, it might have been double-stringified
      if (typeof parsed === 'string') return parseJsonField(parsed);
      return parsed;
    } catch (e) {
      return field;
    }
  }
  return field;
};

// --- Coupons API ---
router.get('/coupons', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { sellerId, isActive } = req.query;
    const { limit, offset } = getPagination(req.query);

    let conditions = [];
    if (sellerId) conditions.push(eq(coupons.sellerId, sellerId as string));
    if (isActive !== undefined) conditions.push(eq(coupons.isActive, isActive === 'true'));

    const result = await db.select().from(coupons)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(coupons.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

router.get('/filters', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { isActive } = req.query;
    let conditions = [];
    if (isActive !== undefined) conditions.push(eq(filters.isActive, isActive === 'true'));

    const result = await db.select().from(filters)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(filters.displayOrder);

    res.json(result);
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

router.post('/filters', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, type, displayOrder, isActive, labels } = req.body;
    await db.insert(filters).values({
      id,
      name,
      type,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      labels: labels || {}
    });
    const [newFilter] = await db.select().from(filters).where(eq(filters.id, id));
    res.status(201).json(newFilter);
  } catch (error) {
    console.error('Error creating filter:', error);
    res.status(500).json({ error: 'Failed to create filter' });
  }
});

router.patch('/filters/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: filters,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Filter',
      allowedFields: ['name', 'type', 'displayOrder', 'isActive', 'labels']
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/filters/:id', async (req, res) => {
  try {
    await db.delete(filters).where(eq(filters.id, req.params.id));

    await db.delete(filterValues).where(eq(filterValues.filterId, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete filter' });
  }
});

router.get('/filter-values', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { filterId } = req.query;
    let conditions = [];
    if (filterId) conditions.push(eq(filterValues.filterId, filterId as string));

    const result = await db.select().from(filterValues)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(filterValues.displayOrder);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch filter values' });
  }
});

router.post('/filter-values', async (req, res) => {
  try {
    const id = uuidv4();
    const { filterId, value, labels, displayOrder } = req.body;
    await db.insert(filterValues).values({
      id,
      filterId,
      value,
      labels: labels || {},
      displayOrder: displayOrder || 0
    });
    const [newValue] = await db.select().from(filterValues).where(eq(filterValues.id, id));
    res.status(201).json(newValue);
  } catch (error) {
    console.error('Error creating filter value:', error);
    res.status(500).json({ error: 'Failed to create filter value' });
  }
});

router.patch('/filter-values/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: filterValues,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'FilterValue',
      allowedFields: ['value', 'displayOrder', 'labels']
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/filter-values/:id', async (req, res) => {
  try {
    await db.delete(filterValues).where(eq(filterValues.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete filter value' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const id = uuidv4();
    const data = { ...req.body };

    // Convert date strings to Date objects
    if (data.expiryDate) {
      const d = new Date(data.expiryDate);
      data.expiryDate = isNaN(d.getTime()) ? null : d;
    }

    // Ensure numeric fields are correctly formatted
    if (data.discountValue !== undefined) data.discountValue = data.discountValue.toString();
    if (data.minSpend !== undefined) data.minSpend = data.minSpend.toString();
    if (data.maxDiscount !== undefined && data.maxDiscount !== null) data.maxDiscount = data.maxDiscount.toString();

    await db.insert(coupons).values({ ...data, id });
    const [newCoupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    res.status(201).json(newCoupon);
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon', details: error.message });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const data = { ...req.body };

    // Convert date strings to Date objects
    if (data.expiryDate) {
      const d = new Date(data.expiryDate);
      data.expiryDate = isNaN(d.getTime()) ? null : d;
    }

    // Ensure numeric fields are correctly formatted as strings for decimal columns
    if (data.discountValue !== undefined) data.discountValue = data.discountValue.toString();
    if (data.minSpend !== undefined) data.minSpend = data.minSpend.toString();
    if (data.maxDiscount !== undefined && data.maxDiscount !== null) data.maxDiscount = data.maxDiscount.toString();

    await db.update(coupons).set(data).where(eq(coupons.id, req.params.id));
    const [updatedCoupon] = await db.select().from(coupons).where(eq(coupons.id, req.params.id));
    res.json(updatedCoupon);
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Failed to update coupon', details: error.message });
  }
});

router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal, items } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required' });

    console.log(`Validating coupon: ${code} for subtotal: ${subtotal}`);

    // Try case-insensitive search
    const results = await db.select()
      .from(coupons)
      .where(sql`LOWER(${coupons.code}) = ${code.toLowerCase()}`);

    const coupon = results[0];

    if (!coupon) {
      return res.json({ valid: false, message: 'Invalid or inactive coupon code.' });
    }

    if (coupon.sellerId && coupon.sellerId !== 'admin') {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.json({ valid: false, message: 'Cart items are required for validation.' });
      }

      const allItemsMatch = items.every((item: any) => item.sellerId === coupon.sellerId);
      if (!allItemsMatch) {
        return res.json({ 
          valid: false, 
          message: 'This coupon code cannot be applied to products from another seller.' 
        });
      }
    }

    if (!coupon.isActive) {
      return res.json({ valid: false, message: 'This coupon is no longer active.' });
    }

    // Check expiry
    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate);
      const now = new Date();
      if (expiry < now) {
        return res.json({ valid: false, message: 'This coupon has expired.' });
      }
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && parseInt(coupon.usageLimit.toString()) > 0) {
      const used = coupon.usedCount || 0;
      if (used >= parseInt(coupon.usageLimit.toString())) {
        return res.json({ valid: false, message: 'Coupon usage limit has been reached.' });
      }
    }

    // Check min spend
    if (coupon.minSpend && subtotal) {
      const minVal = parseFloat(coupon.minSpend.toString());
      const currentVal = parseFloat(subtotal.toString());
      if (currentVal < minVal) {
        return res.json({ 
          valid: false, 
          message: `Minimum spend of PKR ${minVal.toLocaleString()} required for this coupon.` 
        });
      }
    }

    res.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue.toString()),
      code: coupon.code,
      message: 'Coupon complexity applied successfully!'
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Server error validating coupon',
      details: error.message 
    });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await db.delete(coupons).where(eq(coupons.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// --- Invoices API ---
router.get('/invoices', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { sellerId, status } = req.query;
    const { limit, offset } = getPagination(req.query);

    const customerTable = alias(users, 'customers');

    let conditions = [];
    if (sellerId) conditions.push(eq(invoices.sellerId, sellerId as string));
    if (status) conditions.push(eq(invoices.status, status as string));

    const result = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      orderId: invoices.orderId,
      sellerId: invoices.sellerId,
      customerId: invoices.customerId,
      amount: invoices.amount,
      taxAmount: invoices.taxAmount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      createdAt: invoices.createdAt,
      customerName: customerTable.fullName,
      customerEmail: customerTable.email
    })
    .from(invoices)
    .leftJoin(customerTable, eq(invoices.customerId, customerTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(invoices.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.patch('/invoices/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: invoices,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Invoice',
      allowedFields: ['status', 'dueDate', 'paidAt', 'amount', 'taxAmount'],
      enumValidators: {
        status: ['unpaid', 'paid', 'cancelled', 'overdue']
      }
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

// --- Credit Notes API ---
router.get('/credit-notes', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { invoiceId, status } = req.query;
    const { limit, offset } = getPagination(req.query);

    let conditions = [];
    if (invoiceId) conditions.push(eq(creditNotes.invoiceId, invoiceId as string));
    if (status) conditions.push(eq(creditNotes.status, status as string));

    const result = await db.select().from(creditNotes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(creditNotes.createdAt));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit notes' });
  }
});

router.patch('/credit-notes/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: creditNotes,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'CreditNote',
      allowedFields: ['status', 'amount', 'reason'],
      enumValidators: {
        status: ['issued', 'applied', 'cancelled']
      }
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating credit note:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

// --- Ledgers API ---
router.get('/ledgers', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { entityId, entityType } = req.query;
    const { limit, offset } = getPagination(req.query);

    let conditions = [];
    if (entityId) conditions.push(eq(ledgers.entityId, entityId as string));
    if (entityType) conditions.push(eq(ledgers.entityType, entityType as string));

    const result = await db.select().from(ledgers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(ledgers.createdAt));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

// --- Audit Logs API ---
router.get('/audit-logs', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { userId, module } = req.query;
    const { limit, offset } = getPagination(req.query);

    let conditions = [];
    if (userId) conditions.push(eq(auditLogs.userId, userId as string));
    if (module) conditions.push(eq(auditLogs.module, module as string));

    const result = await db.select().from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(auditLogs.createdAt));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// --- Products API ---
router.get('/products', async (req, res) => {
  try {
    const { category, gender, type, minPrice, maxPrice, sortBy, sellerId, status } = req.query;

    if (!process.env.DATABASE_URL) {
      return res.json([]);
    }

    const parentCategories = alias(categories, 'parent_categories');

    let dbQuery = db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: brands.slug,
      category: categories.slug,
      parentCategory: parentCategories.slug,
      parentCategoryId: products.parentCategoryId,
      categoryId: products.categoryId,
      brandId: products.brandId,
      price: products.price,
      discount: products.discount,
      description: products.description,
      images: products.images,
      sizes: products.sizes,
      colors: products.colors,
      tags: products.tags,
      stock: products.stock,
      status: products.status,
      isFeatured: products.isFeatured,
      isNew: products.isNew,
      rating: products.rating,
      numReviews: products.numReviews,
      gender: products.gender,
      type: products.type,
      subcategory: products.subcategory,
      sellerId: products.sellerId,
      sellerName: users.fullName,
      sellerEmail: users.email,
      sku: products.sku,
      pricelistId: products.pricelistId,
      currency: pricelists.currency,
      taxRuleId: products.taxRuleId,
      dynamicFilters: products.dynamicFilters,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(parentCategories, eq(products.parentCategoryId, parentCategories.id))
    .leftJoin(users, eq(products.sellerId, users.id))
    .leftJoin(pricelists, eq(products.pricelistId, pricelists.id));

    // Apply filters
    const conditions = [];
    if (sellerId) conditions.push(eq(products.sellerId, sellerId as string));
    if (status) conditions.push(eq(products.status, status as string));
    if (category) conditions.push(eq(categories.slug, category as string));
    if (gender) conditions.push(eq(products.gender, gender as string));
    if (type) conditions.push(eq(products.type, type as string));

    if (conditions.length > 0) {
      // @ts-ignore
      dbQuery = dbQuery.where(and(...conditions));
    }

    let result: any[] = [];
    try {
      result = await dbQuery.execute();
    } catch (e) {
      console.error('Error executing product query:', e);
      return res.status(500).json({ error: 'Failed to fetch products from database' });
    }

    // Group and parse results
    const productIds = result.map(p => p.id);
    if (productIds.length > 0) {
      const filterValues = await db.select().from(productFilterValues).where(inArray(productFilterValues.productId, productIds));
      const filterMap: Record<string, Record<string, string[]>> = {};
      filterValues.forEach(fv => {
        if (!filterMap[fv.productId]) filterMap[fv.productId] = {};
        if (!filterMap[fv.productId][fv.filterId]) filterMap[fv.productId][fv.filterId] = [];
        filterMap[fv.productId][fv.filterId].push(fv.valueId);
      });

      result.forEach((p: any) => {
        p.dynamicFilters = p.dynamicFilters || filterMap[p.id] || {};
        p.images = parseJsonField(p.images);
        p.sizes = parseJsonField(p.sizes);
        p.colors = parseJsonField(p.colors);
        p.tags = parseJsonField(p.tags);
        p.dynamicFilters = parseJsonField(p.dynamicFilters);
      });

      // --- Apply Active Discounts ---
      try {
        const now = new Date();
        const activeDiscounts = await db.select().from(discounts)
          .where(and(
            eq(discounts.isActive, true),
            lte(discounts.startDate, now),
            gte(discounts.endDate, now)
          ));

        result.forEach((product: any) => {
          // Find the best discount for this product
          const applicable = activeDiscounts.filter(d => {
            if (d.applyTo === 'all') return true;
            if (d.applyTo === 'category' && d.categoryId === product.categoryId) return true;
            if (d.applyTo === 'specific') {
              const pIds = parseJsonField(d.productIds);
              return Array.isArray(pIds) && pIds.includes(product.id);
            }
            return false;
          });

          if (applicable.length > 0) {
            // Pick the one that gives the lowest price
            let bestSalePrice = product.price;
            let appliedDiscountValue = 0;
            let appliedDiscountType: 'percentage' | 'fixed' | null = null;

            applicable.forEach(d => {
              let currentSalePrice = product.price;
              let currentDiscountValue = 0;
              const value = parseFloat(d.value as any);

              if (d.type === 'percentage') {
                currentSalePrice = product.price * (1 - value / 100);
                currentDiscountValue = value; 
              } else {
                currentSalePrice = Math.max(0, product.price - value);
                currentDiscountValue = value; 
              }

              if (currentSalePrice < bestSalePrice) {
                bestSalePrice = currentSalePrice;
                appliedDiscountValue = currentDiscountValue;
                appliedDiscountType = d.type as any;
              }
            });

            // If product already has a manual salePrice or discount, we respect the better one
            if (!product.salePrice || bestSalePrice < product.salePrice) {
              product.salePrice = bestSalePrice;
              product.discount = appliedDiscountValue;
              product.discountType = appliedDiscountType;
            }
          }
        });
      } catch (discountError) {
        console.error('Error applying discounts to products:', discountError);
      }
    } else {
      if (Array.isArray(result)) {
        result.forEach((p: any) => {
          p.images = parseJsonField(p.images);
          p.sizes = parseJsonField(p.sizes);
          p.colors = parseJsonField(p.colors);
          p.tags = parseJsonField(p.tags);
          p.dynamicFilters = parseJsonField(p.dynamicFilters);
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

router.post('/products', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    const slug = (req.body.name || '').toLowerCase().replace(/ /g, '-') + '-' + id.substring(0, 8);
    
    // Ensure JSON fields are properly parsed before insertion
    const data = { ...req.body };
    data.images = parseJsonField(data.images);
    data.sizes = parseJsonField(data.sizes);
    data.colors = parseJsonField(data.colors);
    data.tags = parseJsonField(data.tags);
    data.dynamicFilters = parseJsonField(data.dynamicFilters);
    
    console.log('Creating product with data:', { ...data, id, slug });
    await db.insert(products).values({ ...data, id, slug });
    const [newProduct] = await db.select().from(products).where(eq(products.id, id));
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    // Ensure JSON fields are properly parsed before update
    const data = { ...req.body };
    if (data.images) data.images = parseJsonField(data.images);
    if (data.sizes) data.sizes = parseJsonField(data.sizes);
    if (data.colors) data.colors = parseJsonField(data.colors);
    if (data.tags) data.tags = parseJsonField(data.tags);
    if (data.dynamicFilters) data.dynamicFilters = parseJsonField(data.dynamicFilters);

    await db.update(products).set(data).where(eq(products.id, req.params.id));
    const [updated] = await db.select().from(products).where(eq(products.id, req.params.id));
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.post('/products/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs must be a non-empty array' });
    }
    await db.delete(products).where(inArray(products.id, ids));
    res.json({ success: true });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ error: 'Failed to bulk delete products' });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(404).json({ error: 'Product not found' });
    const parentCategories = alias(categories, 'parent_categories');

    const [product] = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: brands.slug,
      category: categories.slug,
      parentCategory: parentCategories.slug,
      parentCategoryId: products.parentCategoryId,
      categoryId: products.categoryId,
      brandId: products.brandId,
      price: products.price,
      discount: products.discount,
      description: products.description,
      images: products.images,
      sizes: products.sizes,
      colors: products.colors,
      tags: products.tags,
      stock: products.stock,
      status: products.status,
      isFeatured: products.isFeatured,
      isNew: products.isNew,
      rating: products.rating,
      numReviews: products.numReviews,
      gender: products.gender,
      type: products.type,
      subcategory: products.subcategory,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt
    })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(parentCategories, eq(products.parentCategoryId, parentCategories.id))
      .where(eq(products.slug, req.params.slug));

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Fetch dynamic filters for this product
    const filterValues = await db.select().from(productFilterValues).where(eq(productFilterValues.productId, product.id));
    const dynamicFiltersMap: Record<string, string[]> = {};
    filterValues.forEach(fv => {
      if (!dynamicFiltersMap[fv.filterId]) dynamicFiltersMap[fv.filterId] = [];
      dynamicFiltersMap[fv.filterId].push(fv.valueId);
    });

    (product as any).dynamicFilters = dynamicFiltersMap;
    
    // Ensure JSON fields are parsed
    product.images = parseJsonField(product.images);
    product.sizes = parseJsonField(product.sizes);
    product.colors = parseJsonField(product.colors);
    product.tags = parseJsonField(product.tags);

    // --- Apply Active Discounts ---
    try {
      const now = new Date();
      const activeDiscounts = await db.select().from(discounts)
        .where(and(
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now)
        ));

      // Find best discount
      const applicable = activeDiscounts.filter(d => {
        if (d.applyTo === 'all') return true;
        if (d.applyTo === 'category' && d.categoryId === product.categoryId) return true;
        if (d.applyTo === 'specific') {
          const pIds = parseJsonField(d.productIds);
          return Array.isArray(pIds) && pIds.includes(product.id);
        }
        return false;
      });

      if (applicable.length > 0) {
        let bestSalePrice = product.price;
        let appliedDiscountValue = 0;
        let appliedDiscountType: 'percentage' | 'fixed' | null = null;

        applicable.forEach(d => {
          let currentSalePrice = product.price;
          let currentDiscountValue = 0;
          const value = parseFloat(d.value as any);

          if (d.type === 'percentage') {
            currentSalePrice = product.price * (1 - value / 100);
            currentDiscountValue = value;
          } else {
            currentSalePrice = Math.max(0, product.price - value);
            currentDiscountValue = value;
          }

          if (currentSalePrice < bestSalePrice) {
            bestSalePrice = currentSalePrice;
            appliedDiscountValue = currentDiscountValue;
            appliedDiscountType = d.type as any;
          }
        });

        if (!product.salePrice || bestSalePrice < product.salePrice) {
          product.salePrice = bestSalePrice;
          product.discount = appliedDiscountValue;
          product.discountType = appliedDiscountType;
        }
      }
    } catch (discountError) {
      console.error('Error applying discount to single product:', discountError);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// --- Brands API ---
router.get('/brands', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(brands);
    res.json(result);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// --- Admin Seller Applications ---
router.get('/admin/seller-applications', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const applications = await db.select({
      id: sellerApplications.id,
      userId: sellerApplications.userId,
      businessData: sellerApplications.businessData,
      status: sellerApplications.status,
      adminNotes: sellerApplications.adminNotes,
      createdAt: sellerApplications.createdAt,
      user: {
        fullName: users.fullName,
        email: users.email,
        phone: users.phone
      }
    })
      .from(sellerApplications)
      .innerJoin(users, eq(sellerApplications.userId, users.id))
      .orderBy(desc(sellerApplications.createdAt));

    res.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.patch('/admin/seller-applications/:id', async (req, res) => {
  try {
    const [oldApp] = await db.select().from(sellerApplications).where(eq(sellerApplications.id, req.params.id)).limit(1);
    const wasNotApproved = oldApp && oldApp.status !== 'approved';

    const updated = await handlePatchUpdate({
      table: sellerApplications,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'SellerApplication',
      allowedFields: ['status', 'adminNotes', 'reviewedBy', 'reviewedAt']
    });

    // Update user status if application status changed
    if (req.body.status) {
      const application = updated as any;
      const userStatus = req.body.status === 'approved' ? 'active' : (req.body.status === 'rejected' ? 'rejected' : 'pending');
      await db.update(users)
        .set({ status: userStatus })
        .where(eq(users.id, application.userId));

      // If approved and was not previously approved, create companies and send email
      if (req.body.status === 'approved' && wasNotApproved) {
        const data = application.businessData as any;
        
        // Send approval email
        const [sellerUser] = await db.select().from(users).where(eq(users.id, application.userId));
        if (sellerUser) {
          const siteUrl = req.get('origin') || 'http://localhost:5173';
          sendEmail({
            to: sellerUser.email,
            templateName: 'seller_account_approved',
            data: { 
              name: sellerUser.fullName, 
              login_url: `${siteUrl}` 
            }
          });
        }

        if (data.companies && Array.isArray(data.companies)) {
          for (const comp of data.companies) {
            const companyId = uuidv4();
            await db.insert(companies).values({
              id: companyId,
              sellerId: application.userId,
              name: comp.name,
              registrationNumber: comp.registrationNumber,
              taxId: comp.taxId,
              address: comp.address,
              phone: comp.phone,
              email: comp.email,
              status: 'active'
            });

            if (comp.brands && Array.isArray(comp.brands)) {
              for (const brand of comp.brands) {
                await db.insert(brands).values({
                  id: uuidv4(),
                  companyId: companyId,
                  name: brand.name,
                  slug: brand.name.toLowerCase().replace(/ /g, '-'),
                  description: brand.description
                });
              }
            }
          }
        }
      }
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Failed to update application:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});
// Helper to format blog response
const formatBlog = (blog: any) => {
  if (!blog) return null;
  let author = blog.author;
  if (author && typeof author === 'string' && author.startsWith('{')) {
    try {
      author = JSON.parse(author);
    } catch (e) { }
  } else if (author && typeof author === 'string') {
    author = { id: '', name: author };
  } else if (!author) {
    author = { id: '', name: 'Anonymous' };
  }
  return { ...blog, author };
};

// --- Blogs API ---
router.get('/blogs', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { status } = req.query;
    let conditions = [];
    if (status) conditions.push(eq(blogs.status, status as string));

    const result = await db.select().from(blogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogs.createdAt));
    res.json(result.map(formatBlog));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

router.get('/blogs/:idOrSlug', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(404).json({ error: 'Blog not found' });
    const { idOrSlug } = req.params;

    // Try by ID first
    let [blog] = await db.select().from(blogs).where(eq(blogs.id, idOrSlug));

    // If not found, try by slug
    if (!blog) {
      [blog] = await db.select().from(blogs).where(eq(blogs.slug, idOrSlug));
    }

    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(formatBlog(blog));
  } catch (error) {
    console.error(`Error fetching blog ${req.params.idOrSlug}:`, error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// --- Pages & Policies API ---
router.get('/pages/:slug', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(404).json({ error: 'Page not found' });
    const [page] = await db.select().from(pages).where(eq(pages.slug, req.params.slug));
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (error) {
    console.error(`Error fetching page ${req.params.slug}:`, error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// --- Countries API ---
router.get('/countries', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { isActive } = req.query;
    let conditions = [];
    if (isActive !== undefined) conditions.push(eq(countries.isActive, isActive === 'true'));

    const result = await db.select().from(countries)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(countries.name);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

router.post('/countries', async (req, res) => {
  try {
    const { name, code, currencyCode, currencyName, symbol, isActive } = req.body;
    await db.insert(countries).values({
      name,
      code,
      currencyCode,
      currencyName,
      symbol,
      isActive: isActive !== undefined ? isActive : true
    });
    const [newCountry] = await db.select().from(countries).where(eq(countries.code, code));
    res.status(201).json(newCountry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create country' });
  }
});

router.patch('/countries/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: countries,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Country',
      allowedFields: ['name', 'code', 'currencyCode', 'currencyName', 'symbol', 'isActive']
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/countries/:id', async (req, res) => {
  try {
    await db.delete(countries).where(eq(countries.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete country' });
  }
});

// --- Currency Rates API ---
router.get('/currency-rates', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { currencyCode } = req.query;
    let conditions = [];
    if (currencyCode) conditions.push(eq(currencyRates.currencyCode, currencyCode as string));

    const result = await db.select().from(currencyRates)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(currencyRates.effectiveDate));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch currency rates' });
  }
});

router.get('/currency-rates/latest', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({});
    const { currencyCode } = req.query;

    if (currencyCode) {
      const [latest] = await db.select().from(currencyRates)
        .where(eq(currencyRates.currencyCode, currencyCode as string))
        .orderBy(desc(currencyRates.effectiveDate))
        .limit(1);
      return res.json(latest || {});
    }

    // Get latest for all currencies
    // This is a bit tricky with Drizzle without raw SQL for complex grouping
    const allRates = await db.select().from(currencyRates).orderBy(desc(currencyRates.effectiveDate));
    const latestRates: Record<string, any> = {};
    allRates.forEach(rate => {
      if (!latestRates[rate.currencyCode]) {
        latestRates[rate.currencyCode] = rate;
      }
    });

    res.json(latestRates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest currency rates' });
  }
});

router.post('/currency-rates', async (req, res) => {
  try {
    const { currencyCode, rate, effectiveDate } = req.body;
    await db.insert(currencyRates).values({
      currencyCode,
      rate,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date()
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create currency rate' });
  }
});

// --- Settings API ---
router.get('/settings/:key', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(404).json({ error: 'Setting not found' });
    const [setting] = await db.select().from(settings).where(eq(settings.key, req.params.key));
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting.value);
  } catch (error) {
    console.error(`Error fetching setting ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// --- Centralized SEO API ---
router.get('/seo/entities', async (req, res) => {
  try {
    const { type, search } = req.query;
    let conditions = [];
    if (type) conditions.push(eq(seo.entityType, type as any));
    if (search) conditions.push(like(seo.entityName, `%${search}%`));

    const result = await db.select().from(seo)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(seo.lastUpdated));
    res.json(result);
  } catch (error) {
    console.error('Error fetching SEO entities:', error);
    res.status(500).json({ error: 'Failed to fetch SEO entities' });
  }
});

router.get('/seo/entities/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const [result] = await db.select().from(seo)
      .where(and(eq(seo.entityType, type as any), eq(seo.entityId, id)));
    res.json(result || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SEO entity' });
  }
});

router.put('/seo/entities/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const data = req.body;

    // Check if exists
    const [existing] = await db.select().from(seo)
      .where(and(eq(seo.entityType, type as any), eq(seo.entityId, id)));

    if (existing) {
      await db.update(seo).set({
        ...data,
        lastUpdated: new Date()
      }).where(eq(seo.id, existing.id));
      const [updated] = await db.select().from(seo).where(eq(seo.id, existing.id));
      res.json(updated);
    } else {
      const newId = uuidv4();
      await db.insert(seo).values({
        ...data,
        id: newId,
        entityType: type as any,
        entityId: id,
        lastUpdated: new Date()
      });
      const [created] = await db.select().from(seo).where(eq(seo.id, newId));
      res.json(created);
    }
  } catch (error) {
    console.error('Error updating SEO entity:', error);
    res.status(500).json({ error: 'Failed to update SEO entity' });
  }
});

router.post('/seo/sync', async (req, res) => {
  try {
    // Sync SEO from entities to central table
    const productsList = await db.select().from(products);
    const categoriesList = await db.select().from(categories);
    const brandsList = await db.select().from(brands);
    const blogsList = await db.select().from(blogs);

    const syncEntity = async (entity: any, type: SEOEntityType, nameField: string, slugField: string) => {
      const [existing] = await db.select().from(seo)
        .where(and(eq(seo.entityType, type as any), eq(seo.entityId, entity.id)));

      if (!existing) {
        await db.insert(seo).values({
          id: uuidv4(),
          entityType: type as any,
          entityId: entity.id,
          entityName: entity[nameField],
          title: entity[nameField],
          description: entity.description || '',
          slug: entity[slugField] || '',
          lastUpdated: new Date()
        });
      }
    };

    for (const p of productsList) await syncEntity(p, 'product', 'name', 'slug');
    for (const c of categoriesList) await syncEntity(c, 'category', 'name', 'slug');
    for (const b of brandsList) await syncEntity(b, 'brand', 'name', 'slug');
    for (const bl of blogsList) await syncEntity(bl, 'blog', 'title', 'slug');

    res.json({ success: true, message: 'SEO sync completed' });
  } catch (error) {
    console.error('Error syncing SEO:', error);
    res.status(500).json({ error: 'Failed to sync SEO' });
  }
});

// --- SEO API (Convenience routes for useSEO hook) ---
router.get('/seo/global', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({});
    const [setting] = await db.select().from(settings).where(eq(settings.key, 'seo_global'));
    let value = setting?.value || {};
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.error('Failed to parse seo_global:', e);
      }
    }
    res.json(value);
  } catch (error) {
    console.error('Error fetching global SEO:', error);
    res.status(500).json({ error: 'Failed to fetch global SEO' });
  }
});

router.post('/seo/global', async (req, res) => {
  try {
    const { value } = req.body;
    const [existing] = await db.select().from(settings).where(eq(settings.key, 'seo_global'));

    if (existing) {
      await db.update(settings)
        .set({ value })
        .where(eq(settings.key, 'seo_global'));
    } else {
      await db.insert(settings).values({
        id: uuidv4(),
        key: 'seo_global',
        value,
        description: 'Global SEO settings'
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating global SEO:', error);
    res.status(500).json({ error: 'Failed to update global SEO' });
  }
});

router.get('/seo/pages', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const [setting] = await db.select().from(settings).where(eq(settings.key, 'seo_pages'));
    let value = setting?.value || [];
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.error('Failed to parse seo_pages:', e);
      }
    }
    res.json(Array.isArray(value) ? value : []);
  } catch (error) {
    console.error('Error fetching page SEO:', error);
    res.status(500).json({ error: 'Failed to fetch page SEO' });
  }
});

router.post('/seo/pages', async (req, res) => {
  try {
    const { value } = req.body;
    const [existing] = await db.select().from(settings).where(eq(settings.key, 'seo_pages'));

    if (existing) {
      await db.update(settings)
        .set({ value })
        .where(eq(settings.key, 'seo_pages'));
    } else {
      await db.insert(settings).values({
        id: uuidv4(),
        key: 'seo_pages',
        value,
        description: 'Page-specific SEO settings'
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating page SEO:', error);
    res.status(500).json({ error: 'Failed to update page SEO' });
  }
});

router.put('/seo/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPage = req.body;

    const [setting] = await db.select().from(settings).where(eq(settings.key, 'seo_pages'));
    let value = setting?.value || [];
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        value = [];
      }
    }

    if (Array.isArray(value)) {
      const index = value.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        value[index] = { ...value[index], ...updatedPage };
      } else {
        value.push(updatedPage);
      }

      await db.update(settings)
        .set({ value: JSON.stringify(value) })
        .where(eq(settings.key, 'seo_pages'));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating individual page SEO:', error);
    res.status(500).json({ error: 'Failed to update page SEO' });
  }
});

// --- Tax Rules ---
router.get('/tax-rules', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const rules = await db.select().from(taxRules).orderBy(desc(taxRules.createdAt));
    res.json(rules);
  } catch (error) {
    console.error('Error fetching tax rules:', error);
    res.status(500).json({ error: 'Failed to fetch tax rules' });
  }
});

router.post('/tax-rules', async (req, res) => {
  try {
    const rule = req.body;
    const id = uuidv4();
    await db.insert(taxRules).values({
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const [newRule] = await db.select().from(taxRules).where(eq(taxRules.id, id));
    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating tax rule:', error);
    res.status(500).json({ error: 'Failed to create tax rule' });
  }
});

router.patch('/tax-rules/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: taxRules,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'TaxRule',
      allowedFields: ['name', 'country', 'state', 'rate', 'pricelistId', 'isActive']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating tax rule:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/tax-rules/:id', async (req, res) => {
  try {
    await db.delete(taxRules).where(eq(taxRules.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tax rule:', error);
    res.status(500).json({ error: 'Failed to delete tax rule' });
  }
});

// --- Bulk Upload API ---
router.post('/bulk-upload', async (req, res) => {
  const { type, data, sellerId } = req.body;
  try {
    let count = 0;
    if (type === 'product') {
      for (const item of data) {
        console.log(`Inserting product in bulk. sellerId: ${sellerId}, name: ${item.name}`);
        await db.insert(products).values({
          id: uuidv4(),
          sellerId,
          name: item.name,
          slug: (item.name || '').toLowerCase().replace(/ /g, '-'),
          brandId: item.brandId || item.brand || null,
          parentCategoryId: item.parentCategoryId || null,
          categoryId: item.categoryId || null,
          price: (item.price || 0).toString(),
          description: item.description || '',
          images: [],
          stock: parseInt(item.stock) || 0,
          status: 'draft', // Default to draft for moderation
          isFeatured: false,
          isNew: true,
          gender: item.gender || 'women',
          type: item.type || 'clothing',
          subcategory: item.subcategory || ''
        });
        count++;
      }
    } else if (type === 'pricelist') {
      for (const item of data) {
        await db.insert(pricelists).values({
          id: uuidv4(),
          name: item.name,
          description: item.description || '',
          currency: item.currency || 'USD',
          productId: item.productId || null,
          price: (item.price || 0).toString(),
          isActive: true
        });
        count++;
      }
    } else if (type === 'promotion') {
      for (const item of data) {
        await db.insert(promotions).values({
          id: uuidv4(),
          sellerId,
          name: item.name,
          description: item.description || '',
          type: item.type || 'percentage',
          value: (item.value || 0).toString(),
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
          isActive: true
        });
        count++;
      }
    } else if (type === 'coupon') {
      for (const item of data) {
        await db.insert(coupons).values({
          id: uuidv4(),
          sellerId,
          code: item.code,
          description: item.description || '',
          discountType: item.discountType || 'percentage',
          discountValue: (item.discountValue || 0).toString(),
          minSpend: (item.minSpend || 0).toString(),
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          usageLimit: parseInt(item.usageLimit) || 0,
          isActive: true
        });
        count++;
      }
    }
    res.json({ success: true, count });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// --- Roles & RBAC API ---
router.get('/roles', async (req, res) => {
  try {
    const defaultRoles = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        isSystem: true,
        permissions: []
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

    if (!process.env.DATABASE_URL) return res.json(defaultRoles);

    // Fetch from DB
    const dbRoles = await db.select().from(roles);

    // If empty, seed default roles
    if (dbRoles.length === 0) {
      for (const role of defaultRoles) {
        await db.insert(roles).values(role);
      }
      return res.json(defaultRoles);
    }

    res.json(dbRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// --- Seller Analytics API ---
router.get('/seller/analytics', async (req, res) => {
  try {
    const { sellerId } = req.query;

    // Mock analytics data
    const mockAnalytics = {
      totalRevenue: 125400,
      totalOrders: 45,
      activeProducts: 12,
      recentOrders: [
        { id: 'ORD-001', customer: 'John Doe', total: 12500, items: 2, time: '2 hours ago', status: 'Shipped' },
        { id: 'ORD-002', customer: 'Jane Smith', total: 8400, items: 1, time: '5 hours ago', status: 'Pending' },
        { id: 'ORD-003', customer: 'Mike Johnson', total: 21000, items: 3, time: '1 day ago', status: 'Delivered' }
      ]
    };

    res.json(mockAnalytics);
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// --- Pricelists API ---
router.get('/pricelists', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { sellerId, isActive, isGlobal } = req.query;
    const { limit, offset } = getPagination(req.query);

    let conditions = [];
    if (sellerId) {
      conditions.push(or(eq(pricelists.sellerId, sellerId as string), eq(pricelists.isGlobal, true)));
    } else if (isGlobal === 'true') {
      conditions.push(eq(pricelists.isGlobal, true));
    }
    
    if (isActive !== undefined) conditions.push(eq(pricelists.isActive, isActive === 'true'));

    const result = await db.select().from(pricelists)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(pricelists.createdAt));

    // Parse items JSON field
    const parsedResult = result.map(pl => ({
      ...pl,
      items: parseJsonField(pl.items) || []
    }));

    res.json(parsedResult);
  } catch (error) {
    console.error('Error fetching pricelists:', error);
    res.status(500).json({ error: 'Failed to fetch pricelists' });
  }
});

router.post('/pricelists', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const id = uuidv4();
    const data = { ...req.body };
    data.items = parseJsonField(data.items);
    await db.insert(pricelists).values({ ...data, id });
    const [newPricelist] = await db.select().from(pricelists).where(eq(pricelists.id, id));
    res.status(201).json({
      ...newPricelist,
      items: parseJsonField(newPricelist.items) || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pricelist' });
  }
});

router.put('/pricelists/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.items) data.items = parseJsonField(data.items);
    await db.update(pricelists).set(data).where(eq(pricelists.id, req.params.id));
    const [updated] = await db.select().from(pricelists).where(eq(pricelists.id, req.params.id));
    res.json({
      ...updated,
      items: parseJsonField(updated.items) || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricelist' });
  }
});

router.delete('/pricelists/:id', async (req, res) => {
  try {
    await db.delete(pricelists).where(eq(pricelists.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pricelist' });
  }
});

// --- Discounts API ---
router.get('/discounts', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { sellerId, isActive } = req.query;
    const { limit, offset } = getPagination(req.query);

    let conditions = [];
    if (sellerId) conditions.push(eq(discounts.sellerId, sellerId as string));
    if (isActive !== undefined) conditions.push(eq(discounts.isActive, isActive === 'true'));

    const u = alias(users, 'u');
    const result = await db.select({
      id: discounts.id,
      sellerId: discounts.sellerId,
      name: discounts.name,
      description: discounts.description,
      type: discounts.type,
      value: discounts.value,
      minPurchase: discounts.minPurchase,
      status: discounts.status,
      applyTo: discounts.applyTo,
      categoryId: discounts.categoryId,
      productIds: discounts.productIds,
      startDate: discounts.startDate,
      endDate: discounts.endDate,
      isActive: discounts.isActive,
      createdAt: discounts.createdAt,
      sellerName: u.fullName,
      sellerEmail: u.email
    })
      .from(discounts)
      .leftJoin(u, eq(discounts.sellerId, u.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(discounts.createdAt));

    const parsedResult = result.map(d => ({
      ...d,
      productIds: parseJsonField(d.productIds)
    }));

    res.json(parsedResult);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

router.post('/discounts', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const id = uuidv4();
    const data = { ...req.body };
    
    // Sanitize and convert fields
    if (data.productIds) data.productIds = parseJsonField(data.productIds);
    if (data.startDate) {
      const d = new Date(data.startDate);
      data.startDate = isNaN(d.getTime()) ? null : d;
    }
    if (data.endDate) {
      const d = new Date(data.endDate);
      data.endDate = isNaN(d.getTime()) ? null : d;
    }

    // Force values to numbers for decimal columns
    if (data.value !== undefined) data.value = parseFloat(data.value.toString()) || 0;
    if (data.minPurchase !== undefined) data.minPurchase = parseFloat(data.minPurchase.toString()) || 0;

    // Handle createdAt: If string, convert to Date. If missing, let DB handle it.
    if (data.createdAt) {
      const cd = new Date(data.createdAt);
      data.createdAt = isNaN(cd.getTime()) ? new Date() : cd;
    }

    await db.insert(discounts).values({ ...data, id });
    const [newDiscount] = await db.select().from(discounts).where(eq(discounts.id, id));
    res.status(201).json({
      ...newDiscount,
      productIds: parseJsonField(newDiscount.productIds)
    });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    res.status(500).json({ error: 'Failed to create discount', details: error.message });
  }
});

router.put('/discounts/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Sanitize and convert fields
    if (data.productIds) data.productIds = parseJsonField(data.productIds);
    if (data.startDate) {
      const d = new Date(data.startDate);
      data.startDate = isNaN(d.getTime()) ? null : d;
    }
    if (data.endDate) {
      const d = new Date(data.endDate);
      data.endDate = isNaN(d.getTime()) ? null : d;
    }

    if (data.value !== undefined) data.value = parseFloat(data.value.toString()) || 0;
    if (data.minPurchase !== undefined) data.minPurchase = parseFloat(data.minPurchase.toString()) || 0;

    // Clean up internal/read-only fields if they crept in
    delete (data as any).id;
    delete (data as any).createdAt;

    await db.update(discounts).set(data).where(eq(discounts.id, req.params.id));
    const [updated] = await db.select().from(discounts).where(eq(discounts.id, req.params.id));
    res.json({
      ...updated,
      productIds: parseJsonField(updated.productIds)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update discount' });
  }
});

router.delete('/discounts/:id', async (req, res) => {
  try {
    await db.delete(discounts).where(eq(discounts.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

// --- Promotions API ---
router.get('/promotions', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { sellerId, isActive } = req.query;
    const { limit, offset } = getPagination(req.query);

    const promoTable = alias(promotions, 'p');
    const sellerTable = alias(users, 's');

    let conditions = [];
    if (sellerId) conditions.push(eq(promoTable.sellerId, sellerId as string));
    if (isActive !== undefined) conditions.push(eq(promoTable.isActive, isActive === 'true'));

    const result = await db.select({
      id: promoTable.id,
      sellerId: promoTable.sellerId,
      name: promoTable.name,
      description: promoTable.description,
      type: promoTable.type,
      value: promoTable.value,
      minPurchase: promoTable.minPurchase,
      buyQuantity: promoTable.buyQuantity,
      getQuantity: promoTable.getQuantity,
      applyTo: promoTable.applyTo,
      productIds: promoTable.productIds,
      categoryId: promoTable.categoryId,
      startDate: promoTable.startDate,
      endDate: promoTable.endDate,
      isActive: promoTable.isActive,
      createdAt: promoTable.createdAt,
      sellerName: sellerTable.fullName
    })
    .from(promoTable)
    .leftJoin(sellerTable, eq(promoTable.sellerId, sellerTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(promoTable.createdAt));

    const parsedResult = result.map(p => ({
      ...p,
      productIds: parseJsonField(p.productIds) || []
    }));

    res.json(parsedResult);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

router.post('/promotions', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const id = uuidv4();
    const {
      sellerId, name, description, type, value, minPurchase,
      buyQuantity, getQuantity, applyTo, productIds, categoryId,
      startDate, endDate, isActive
    } = req.body;

    await db.insert(promotions).values({
      id, sellerId, name, description, type,
      value: value?.toString() || '0',
      minPurchase: minPurchase?.toString() || '0.00',
      buyQuantity: buyQuantity ?? null,
      getQuantity: getQuantity ?? null,
      applyTo: applyTo || 'all',
      productIds: productIds || [],
      categoryId: categoryId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== undefined ? isActive : true,
    } as any);

    const [newPromotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    res.status(201).json({
      ...newPromotion,
      productIds: parseJsonField(newPromotion.productIds) || []
    });
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion', details: error.message });
  }
});

router.put('/promotions/:id', async (req, res) => {
  try {
    const {
      name, description, type, value, minPurchase,
      buyQuantity, getQuantity, applyTo, productIds, categoryId,
      startDate, endDate, isActive
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value?.toString();
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase?.toString();
    if (buyQuantity !== undefined) updateData.buyQuantity = buyQuantity;
    if (getQuantity !== undefined) updateData.getQuantity = getQuantity;
    if (applyTo !== undefined) updateData.applyTo = applyTo;
    if (productIds !== undefined) updateData.productIds = productIds;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(promotions).set(updateData).where(eq(promotions.id, req.params.id));
    const [updated] = await db.select().from(promotions).where(eq(promotions.id, req.params.id));
    res.json({
      ...(updated || {}),
      productIds: updated ? (parseJsonField(updated.productIds) || []) : []
    });
  } catch (error: any) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion', details: error.message });
  }
});

router.delete('/promotions/:id', async (req, res) => {
  try {
    await db.delete(promotions).where(eq(promotions.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// --- Dashboard API ---
router.get('/dashboard', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        recentOrders: [],
        revenueByDay: []
      });
    }

    // This is a simplified dashboard query
    const [ordersCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [productsCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [revenueSum] = await db.select({ sum: sql<string>`sum(total_amount)` }).from(orders);

    const recentOrders = await db.select().from(orders).limit(5).orderBy(desc(orders.createdAt));

    res.json({
      totalRevenue: parseFloat(revenueSum?.sum || '0'),
      totalOrders: ordersCount?.count || 0,
      totalProducts: productsCount?.count || 0,
      totalCustomers: 0, // Placeholder
      recentOrders,
      revenueByDay: [] // Placeholder
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/dashboard/seller/stats', async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) return res.status(400).json({ error: 'Seller ID is required' });
    if (!process.env.DATABASE_URL) return res.json({});

    // Get seller products count
    let productsCountValue = 0;
    try {
      const pCountRes: any[] = await db
        .select({ count: sql`count(*)` })
        .from(products)
        .where(eq(products.sellerId, sellerId as string));
      productsCountValue = Number(pCountRes[0]?.count) || 0;
    } catch (e) {
      console.error('Error counting products:', e);
    }

    // Get seller orders and revenue via orderItems
    let sellerOrders: any[] = [];
    try {
      sellerOrders = await db
        .select({
          id: orders.id,
          total: orderItems.price, // Using the item price as the seller's portion
          status: orders.status,
          customer: orders.customerEmail,
          createdAt: orders.createdAt
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orderItems.sellerId, sellerId as string));
    } catch (e) {
      console.error('Error fetching seller orders:', e);
    }

    const totalOrders = new Set(sellerOrders.map(o => o.id)).size;
    const totalRevenue = sellerOrders.reduce((sum, o) => sum + parseFloat(o.total || '0'), 0);

    // Get orders distribution
    const statusCounts: Record<string, number> = {};
    sellerOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      products: productsCountValue,
      recentOrders: Array.isArray(sellerOrders) ? sellerOrders.slice(0, 5) : [],
      ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      salesOverTime: [] // Placeholder
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ error: 'Failed to fetch seller statistics' });
  }
});

// --- Admin Portal APIs (POST, PUT, DELETE) ---
// Note: In a real app, these would be protected by auth middleware
router.post('/admin/products', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(products).values({ ...req.body, id });
    const [newProduct] = await db.select().from(products).where(eq(products.id, id));
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.patch('/admin/products/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: products,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Product',
      allowedFields: ['name', 'slug', 'description', 'price', 'salePrice', 'stock', 'sku', 'categoryId', 'brandId', 'images', 'specifications', 'seo', 'status']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.post('/admin/brands', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(brands).values({ ...req.body, id });
    const [newBrand] = await db.select().from(brands).where(eq(brands.id, id));
    res.status(201).json(newBrand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

router.post('/admin/categories', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(categories).values({ ...req.body, id });
    const [newCategory] = await db.select().from(categories).where(eq(categories.id, id));
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.post('/admin/blogs', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    const { title, slug, content, excerpt, author, coverImage, category, tags, status, seo, publishedAt } = req.body;
    const blogSlug = slug || (title || '').toLowerCase().replace(/ /g, '-') + '-' + id.substring(0, 8);

    await db.insert(blogs).values({
      id,
      title,
      slug: blogSlug,
      content,
      excerpt,
      author: typeof author === 'string' ? author : JSON.stringify(author),
      coverImage,
      category,
      tags: tags || [],
      status: status || 'published',
      seo: seo || {},
      publishedAt: publishedAt ? new Date(publishedAt) : null
    });
    const [newBlog] = await db.select().from(blogs).where(eq(blogs.id, id));
    res.status(201).json(formatBlog(newBlog));
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

router.patch('/admin/blogs/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.author && typeof data.author !== 'string') {
      data.author = JSON.stringify(data.author);
    }
    if (data.publishedAt) {
      data.publishedAt = new Date(data.publishedAt);
    }

    const updated = await handlePatchUpdate({
      table: blogs,
      id: req.params.id,
      data: data,
      userId: req.body.adminId || 'system',
      module: 'Blog',
      allowedFields: ['title', 'slug', 'content', 'excerpt', 'author', 'coverImage', 'category', 'tags', 'status', 'seo', 'publishedAt']
    });
    res.json(formatBlog(updated));
  } catch (error: any) {
    console.error('Error updating blog:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/admin/blogs/:id', async (req, res) => {
  try {
    await db.delete(blogs).where(eq(blogs.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

router.get('/admin/settings', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(settings);
    res.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/admin/settings', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const { key, value, description } = req.body;

    // Check if exists
    const [existing] = await db.select().from(settings).where(eq(settings.key, key));

    if (existing) {
      await db.update(settings).set({ value, description }).where(eq(settings.key, key));
    } else {
      const id = uuidv4();
      await db.insert(settings).values({ id, key, value, description });
    }

    const [updated] = await db.select().from(settings).where(eq(settings.key, key));
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Email Settings & Templates API ---
router.get('/admin/email-settings', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({});
    const [config] = await db.select().from(emailSettings).limit(1);
    res.json(config || {});
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

router.post('/admin/email-settings', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const [existing] = await db.select().from(emailSettings).limit(1);
    const { id, createdAt, updatedAt, ...saveData } = req.body;
    
    if (existing) {
      await db.update(emailSettings)
        .set({ ...saveData, updatedAt: new Date() })
        .where(eq(emailSettings.id, existing.id));
    } else {
      await db.insert(emailSettings).values(saveData);
    }
    
    const [updated] = await db.select().from(emailSettings).limit(1);
    res.json(updated);
  } catch (error: any) {
    console.error('Error saving email settings:', error);
    res.status(500).json({ error: error.message || 'Failed to save email settings' });
  }
});

router.post('/admin/email-settings/test', async (req, res) => {
  try {
    const { toEmail, config: providedConfig } = req.body;
    let config = providedConfig;

    if (!config) {
      const [dbConfig] = await db.select().from(emailSettings).limit(1);
      config = dbConfig;
    }
    
    if (!config || !config.mailHost) {
      return res.status(400).json({ error: 'Email configuration not found' });
    }

    const transporter = nodemailer.createTransport({
      host: config.mailHost,
      port: parseInt(config.mailPort as any),
      secure: config.mailEncryption?.toLowerCase() === 'ssl',
      auth: {
        user: config.mailUsername,
        pass: config.mailPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: toEmail,
      subject: 'Test Email - TAYFA',
      html: `<h3>Email Configuration Test</h3><p>If you're reading this, your SMTP settings are working correctly!</p>`,
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: error.message || 'Failed to send test email' });
  }
});

router.get('/admin/email-templates', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

router.put('/admin/email-templates/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(emailTemplates).set({ ...req.body, updatedAt: new Date() }).where(eq(emailTemplates.id, id));
    const [updated] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    res.json(updated);
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

async function sendEmail({ to, templateName, data }: { to: string, templateName: string, data: Record<string, any> }) {
  try {
    const [config] = await db.select().from(emailSettings).where(eq(emailSettings.isActive, true)).limit(1);
    if (!config) {
      console.warn('Email settings not configured or inactive. Skipping email send.');
      return;
    }

    const [template] = await db.select().from(emailTemplates)
      .where(and(eq(emailTemplates.name, templateName), eq(emailTemplates.isActive, true)))
      .limit(1);
    
    if (!template) {
      console.warn(`Email template "${templateName}" not found or inactive. Skipping email send.`);
      return;
    }

    let body = template.body;
    let subject = template.subject;

    // Replace variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, data[key]);
      subject = subject.replace(regex, data[key]);
    });

    const transporter = nodemailer.createTransport({
      host: config.mailHost,
      port: parseInt(config.mailPort as any),
      secure: config.mailEncryption?.toLowerCase() === 'ssl',
      auth: {
        user: config.mailUsername,
        pass: config.mailPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html: body,
    });

    console.log(`Email "${templateName}" sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email "${templateName}" to ${to}:`, error);
  }
}

router.post('/admin/email-settings/send', async (req, res) => {
  try {
    const { to, templateName, data } = req.body;
    await sendEmail({ to, templateName, data });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});


router.get('/brands', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(brands);
    res.json(result);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

router.post('/brands', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(brands).values({ ...req.body, id });
    const [newBrand] = await db.select().from(brands).where(eq(brands.id, id));
    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

router.patch('/brands/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: brands,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Brand',
      allowedFields: ['name', 'slug', 'logo', 'description', 'seo', 'isActive']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating brand:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/brands/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    await db.delete(brands).where(eq(brands.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(categories).orderBy(categories.displayOrder);
    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    const data = { ...req.body, id };
    // Ensure numeric fields are numbers
    if (data.displayOrder) data.displayOrder = parseInt(data.displayOrder);

    await db.insert(categories).values(data);
    const [newCategory] = await db.select().from(categories).where(eq(categories.id, id));
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.patch('/categories/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: categories,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Category',
      allowedFields: ['name', 'slug', 'icon', 'description', 'seo', 'isActive', 'isFeatured', 'parentId', 'displayOrder']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    await db.delete(categories).where(eq(categories.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// --- Payment Methods API ---
router.get('/payment-methods', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(paymentMethods);
    res.json(result);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

router.post('/payment-methods', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(paymentMethods).values({ ...req.body, id });
    const [newMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    res.status(201).json(newMethod);
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ error: 'Failed to create payment method' });
  }
});

router.patch('/payment-methods/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: paymentMethods,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'PaymentMethod',
      allowedFields: ['name', 'provider', 'isActive', 'config', 'isDefault']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating payment method:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/payment-methods/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    await db.delete(paymentMethods).where(eq(paymentMethods.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

// --- Notifications API ---
router.get('/notifications', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(notifications).values({ ...req.body, id });
    const [newNotification] = await db.select().from(notifications).where(eq(notifications.id, id));
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.patch('/notifications/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: notifications,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Notification',
      allowedFields: ['title', 'message', 'type', 'isRead', 'userId']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating notification:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

// --- Localizations API ---
router.get('/localizations', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(localizations);
    res.json(result);
  } catch (error) {
    console.error('Error fetching localizations:', error);
    res.status(500).json({ error: 'Failed to fetch localizations' });
  }
});

router.post('/localizations', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(localizations).values({ ...req.body, id });
    const [newLocalization] = await db.select().from(localizations).where(eq(localizations.id, id));
    res.status(201).json(newLocalization);
  } catch (error) {
    console.error('Error creating localization:', error);
    res.status(500).json({ error: 'Failed to create localization' });
  }
});

router.patch('/localizations/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: localizations,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'Localization',
      allowedFields: ['locale', 'key', 'value', 'group']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating localization:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/localizations/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    await db.delete(localizations).where(eq(localizations.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting localization:', error);
    res.status(500).json({ error: 'Failed to delete localization' });
  }
});

// --- Payment Gateways Admin API ---
router.get('/payments/admin/gateways', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(paymentGateways);
    res.json(result);
  } catch (error) {
    console.error('Error fetching gateways:', error);
    res.status(500).json({ error: 'Failed to fetch gateways' });
  }
});

router.get('/payments/admin/gateways/:id/config', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(gatewayConfigs).where(eq(gatewayConfigs.gatewayId, req.params.id));
    res.json(result);
  } catch (error) {
    console.error('Error fetching gateway configs:', error);
    res.status(500).json({ error: 'Failed to fetch gateway configs' });
  }
});

router.post('/payments/admin/gateways', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(paymentGateways).values({ ...req.body, id });
    const [newGateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    res.status(201).json(newGateway);
  } catch (error) {
    console.error('Error creating gateway:', error);
    res.status(500).json({ error: 'Failed to create gateway' });
  }
});

router.post('/payments/admin/gateways/:id/config', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    const id = uuidv4();
    await db.insert(gatewayConfigs).values({ ...req.body, id, gatewayId: req.params.id });
    const [newConfig] = await db.select().from(gatewayConfigs).where(eq(gatewayConfigs.id, id));
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error creating gateway config:', error);
    res.status(500).json({ error: 'Failed to create gateway config' });
  }
});

router.patch('/payments/admin/gateways/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: paymentGateways,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'PaymentGateway',
      allowedFields: ['name', 'code', 'type', 'status', 'isDefault']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating gateway:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/payments/admin/gateways/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not connected' });
    // Also delete associated configs
    await db.delete(gatewayConfigs).where(eq(gatewayConfigs.gatewayId, req.params.id));
    await db.delete(paymentGateways).where(eq(paymentGateways.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting gateway:', error);
    res.status(500).json({ error: 'Failed to delete gateway' });
  }
});

// --- Transactions & Payments Admin API ---
router.get('/admin/payments', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { status, sellerId } = req.query;
    const { limit, offset } = getPagination(req.query);

    const customerTable = alias(users, 'customers');
    const sellerTable = alias(users, 'sellers');

    let conditions = [];
    if (status) conditions.push(eq(transactions.status, status as string));
    
    // If we want to filter by seller, we need to join with order_items or similar
    // For now, let's just fetch all transactions with user names

    const result = await db.select({
      id: transactions.id,
      orderId: transactions.orderId,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      paymentMethod: payments.paymentMethod,
    })
    .from(transactions)
    .leftJoin(payments, eq(transactions.id, payments.transactionId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(transactions.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    res.status(500).json({ error: 'Failed to fetch global transactions' });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const { sellerId, status } = req.query;
    
    // In a production app, we would join with order_items to filter by sellerId
    // For now, we return all or mock filter by sellerId if it was in the tx table
    
    let conditions = [];
    if (status) conditions.push(eq(transactions.status, status as string));

    const result = await db.select({
      id: transactions.id,
      orderId: transactions.orderId,
      amount: transactions.amount,
      currency: transactions.currency,
      status: transactions.status,
      createdAt: transactions.createdAt,
      gateway: payments.paymentMethod, // mapping paymentMethod to gateway for consistent UI
    })
    .from(transactions)
    .leftJoin(payments, eq(transactions.id, payments.transactionId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// --- Roles API ---
router.get('/roles', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json([
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
          ]
        },
        {
          id: 'seller',
          name: 'Seller',
          description: 'Store management access',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view'] },
            { module: 'orders', actions: ['view', 'update'] },
            { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
          ]
        }
      ]);
    }
    let result = await db.select().from(roles).orderBy(desc(roles.createdAt));
    if (result.length === 0) {
      // Seed default roles if empty
      const defaultRoles = [
        {
          id: 'super_admin',
          name: 'Super Administrator',
          description: 'Highest level system access with role management capabilities',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'rbac', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
          ]
        },
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
            { module: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
          ]
        },
        {
          id: 'seller',
          name: 'Seller',
          description: 'Store management access',
          isSystem: true,
          permissions: [
            { module: 'overview', actions: ['view'] },
            { module: 'orders', actions: ['view', 'edit'] },
            { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
          ]
        }
      ];
      
      for (const role of defaultRoles) {
        try {
          await db.insert(roles).values(role);
        } catch (e) {
          console.error(`Failed to seed role ${role.id}:`, e);
        }
      }
      
      result = await db.select().from(roles).orderBy(desc(roles.createdAt));
    }
    
    // Ensure permissions are clean JSON objects
    const cleanedResult = result.map(role => ({
      ...role,
      permissions: parseJsonField(role.permissions)
    }));
    
    res.json(cleanedResult);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

router.post('/roles', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const id = uuidv4();
    const data = { ...req.body, id };
    
    // Ensure permissions is a clean object
    if (data.permissions) {
      data.permissions = parseJsonField(data.permissions);
    }
    
    await db.insert(roles).values(data);
    const [newRole] = await db.select().from(roles).where(eq(roles.id, id));
    res.status(201).json({
      ...newRole,
      permissions: parseJsonField(newRole.permissions)
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

router.patch('/roles/:id', async (req, res) => {
  try {
    const adminId = req.body.adminId;
    const targetRoleId = req.params.id;

    if (!idType) { // redundant but safe
        // No checks needed if DB not used, though it currently always is
    }

    if (process.env.DATABASE_URL) {
      // 1. Fetch requester
      const [requester] = await db.select().from(users).where(eq(users.id, adminId));
      if (!requester) {
        console.error('UpdateRole: Requester not found', { adminId });
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }

      // 2. Enforce hierarchy
      if (targetRoleId === 'super_admin') {
        return res.status(403).json({ error: 'Super Administrator role cannot be modified via API for safety.' });
      }

      const isAdmin = requester.role === 'admin' || requester.role === 'super_admin';
      const isSuperAdmin = requester.role === 'super_admin';

      if (targetRoleId === 'admin' && !isSuperAdmin) {
        return res.status(403).json({ error: 'Only a Super Administrator can modify the Administrator role.' });
      }

      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges to modify roles.' });
      }
    }

    const updateData = { ...req.body };
    if (updateData.permissions) {
      updateData.permissions = parseJsonField(updateData.permissions);
    }

    const updated = await handlePatchUpdate({
      table: roles,
      id: targetRoleId,
      data: updateData,
      userId: adminId || 'system',
      module: 'Role',
      allowedFields: ['name', 'description', 'permissions', 'isSystem']
    });
    
    res.json({
      ...updated,
      permissions: parseJsonField(updated.permissions)
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    await db.delete(roles).where(eq(roles.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// --- Users API ---
router.get('/users', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json([
        { id: 'admin-id', fullName: 'System Admin', email: 'admin@tayfa.com', phone: '1234567890', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
        { id: 'seller-id', fullName: 'Premium Seller', email: 'seller@tayfa.com', phone: '0987654321', role: 'seller', status: 'active', createdAt: new Date().toISOString() },
        { id: 'customer-id', fullName: 'John Doe', email: 'john@example.com', phone: '5555555555', role: 'user', status: 'active', createdAt: new Date().toISOString() },
      ]);
    }
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    if (result.length === 0) {
      return res.json([
        { id: 'admin-id', fullName: 'System Admin', email: 'admin@tayfa.com', phone: '1234567890', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
        { id: 'seller-id', fullName: 'Premium Seller', email: 'seller@tayfa.com', phone: '0987654321', role: 'seller', status: 'active', createdAt: new Date().toISOString() },
        { id: 'customer-id', fullName: 'John Doe', email: 'john@example.com', phone: '5555555555', role: 'user', status: 'active', createdAt: new Date().toISOString() },
      ]);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- Admin Users API ---
router.get('/admin/users', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/admin/users/:id', async (req, res) => {
  try {
    // Check old status for transition detection
    const [oldUser] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
    const wasNotActive = oldUser && oldUser.status !== 'active';
    const isNowActive = req.body.status === 'active';
    const isActivating = wasNotActive && isNowActive;

    const updated: any = await handlePatchUpdate({
      table: users,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'User',
      allowedFields: ['fullName', 'email', 'phone', 'role', 'status'],
      enumValidators: {
        role: ['admin', 'seller', 'user', 'delivery_agent'],
        status: ['active', 'inactive', 'pending']
      }
    });

    // If a seller is being activated (changed from pending/inactive to active)
    if (updated && updated.role === 'seller' && isActivating) {
      const siteUrl = req.get('origin') || 'http://localhost:5173';
      sendEmail({
        to: updated.email,
        templateName: 'seller_account_approved',
        data: { 
          name: updated.fullName, 
          login_url: `${siteUrl}` 
        }
      });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.post('/admin/users/:id/reset-password', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const { newPassword, adminId } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, req.params.id));

    // Audit Log
    await db.insert(auditLogs).values({
      id: uuidv4(),
      userId: adminId || 'system',
      action: 'reset_password',
      module: 'users',
      details: { targetUserId: req.params.id },
      createdAt: sql`CURRENT_TIMESTAMP`
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.delete('/admin/users/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });

    const userId = req.params.id;

    // 1. Delete dependent notifications
    await db.delete(notifications).where(eq(notifications.userId, userId));

    // 2. Delete seller applications
    await db.delete(sellerApplications).where(eq(sellerApplications.userId, userId));

    // 3. Delete linked companies (if seller)
    await db.delete(companies).where(eq(companies.sellerId, userId));

    // 4. Delete the user
    await db.delete(users).where(eq(users.id, userId));

    // 5. Audit Log (use a system ID if the user record is gone, but we try to log before delete if possible)
    // Actually log after is fine if we use the ID string
    try {
      await db.insert(auditLogs).values({
        id: uuidv4(),
        userId: req.body.adminId || 'system',
        action: 'delete_user',
        module: 'users',
        details: { targetUserId: userId },
        createdAt: sql`CURRENT_TIMESTAMP`
      });
    } catch (e) {
      console.warn('Failed to create audit log for deletion:', e);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user. The user may have existing orders or financial records that prevent deletion.' });
  }
});

// --- Admin Seller Details API ---
router.get('/admin/sellers/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const sellerId = req.params.id;

    const [user] = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
    if (!user) return res.status(404).json({ error: 'Seller not found' });

    const [application] = await db.select().from(sellerApplications).where(eq(sellerApplications.userId, sellerId)).limit(1);
    const sellerCompanies = await db.select().from(companies).where(eq(companies.sellerId, sellerId));
    
    // Fetch brands for each company
    const companiesWithBrands = await Promise.all(sellerCompanies.map(async (company: any) => {
      const companyBrands = await db.select().from(brands).where(eq(brands.companyId, company.id));
      return { ...company, brands: companyBrands };
    }));

    // Quick Stats (if approved)
    let stats = null;
    if (user.role === 'seller' || user.role === 'admin') {
      const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.sellerId, sellerId));
      const [orderCount] = await db.select({ count: sql<number>`count(distinct ${orderItems.orderId})` }).from(orderItems).where(eq(orderItems.sellerId, sellerId));
      const [revenue] = await db.select({ total: sql<string>`sum(${orderItems.price} * ${orderItems.quantity})` }).from(orderItems).where(eq(orderItems.sellerId, sellerId));

      stats = {
        totalProducts: productCount?.count || 0,
        totalOrders: orderCount?.count || 0,
        totalRevenue: parseFloat(revenue?.total || '0')
      };
    }

    // Reconstruct businessData structure from separate columns to ensure new columns are the source of truth
    const formattedApplication = application ? {
      ...application,
      businessData: {
        ...(application.businessData as any || {}),
        category: application.category,
        customCategory: application.customCategory,
        overviewDocumentUrl: application.overviewDocumentUrl,
        companies: application.companyName ? [{
            ...((application.businessData as any)?.companies?.[0] || {}),
            name: application.companyName,
            registrationNumber: application.registrationNumber,
            taxId: application.taxId,
            address: application.addressLine1,
            addressLine1: application.addressLine1,
            city: application.city,
            state: application.state,
            postalCode: application.postalCode,
            countryCode: application.countryCode,
            phone: application.companyPhone,
            email: application.companyEmail,
            brands: application.brands || []
        }] : ((application.businessData as any)?.companies || [])
      }
    } : null;

    res.json({
      user,
      application: formattedApplication,
      companies: companiesWithBrands,
      stats
    });
  } catch (error) {
    console.error('Error fetching seller details:', error);
    res.status(500).json({ error: 'Failed to fetch seller details' });
  }
});

router.patch('/admin/sellers/:id/approve', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const sellerId = req.params.id;
    const { adminId } = req.body;

    await db.update(users).set({ status: 'active', role: 'seller' }).where(eq(users.id, sellerId));
    await db.update(sellerApplications).set({ 
      status: 'approved', 
      reviewedBy: adminId, 
      reviewedAt: new Date() 
    }).where(eq(sellerApplications.userId, sellerId));

    const [user] = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);
    
    // Audit Log
    await db.insert(auditLogs).values({
      id: uuidv4(),
      userId: adminId || 'system',
      action: 'approve_seller',
      module: 'sellers',
      details: { targetUserId: sellerId },
      createdAt: sql`CURRENT_TIMESTAMP`
    });

    // Send Email
    if (user) {
      const siteUrl = req.get('origin') || 'http://localhost:5173';
      sendEmail({
        to: user.email,
        templateName: 'seller_account_approved',
        data: { name: user.fullName, login_url: `${siteUrl}` }
      });
    }

    res.json({ success: true, status: 'active' });
  } catch (error) {
    console.error('Error approving seller:', error);
    res.status(500).json({ error: 'Failed to approve seller' });
  }
});

router.patch('/admin/sellers/:id/reject', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const sellerId = req.params.id;
    const { reason, adminId } = req.body;

    await db.update(users).set({ status: 'rejected' }).where(eq(users.id, sellerId));
    await db.update(sellerApplications).set({ 
      status: 'rejected', 
      adminNotes: reason,
      reviewedBy: adminId, 
      reviewedAt: new Date() 
    }).where(eq(sellerApplications.userId, sellerId));

    // Audit Log
    await db.insert(auditLogs).values({
      id: uuidv4(),
      userId: adminId || 'system',
      action: 'reject_seller',
      module: 'sellers',
      details: { targetUserId: sellerId, reason },
      createdAt: sql`CURRENT_TIMESTAMP`
    });

    res.json({ success: true, status: 'rejected' });
  } catch (error) {
    console.error('Error rejecting seller:', error);
    res.status(500).json({ error: 'Failed to reject seller' });
  }
});


router.post('/users', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const id = uuidv4();
    await db.insert(users).values({ ...req.body, id });
    const [newUser] = await db.select().from(users).where(eq(users.id, id));
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: users,
      id: req.params.id,
      data: req.body,
      userId: req.body.adminId || 'system',
      module: 'User',
      allowedFields: ['fullName', 'email', 'phone', 'role', 'status']
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Auth API ---
router.post('/auth/register', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DB not connected' });
    const { email, password, fullName, phone, role, businessData } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin registration is not allowed' });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const status = role === 'seller' ? 'pending' : 'active';

    await db.insert(users).values({
      id,
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: role || 'user',
      status
    });

    if (role === 'seller' && businessData) {
      const bd = businessData as any;
      console.log('Registering seller with businessData keys:', Object.keys(bd));
      console.log('Overview Document URL received:', bd.overviewDocumentUrl);
      const firstCompany = bd.companies?.[0] || {};
      
      await db.insert(sellerApplications).values({
        id: uuidv4(),
        userId: id,
        businessData, // Keep for backup
        
        // New separate columns
        category: bd.category,
        customCategory: bd.customCategory,
        companyName: firstCompany.name,
        registrationNumber: firstCompany.registrationNumber,
        taxId: firstCompany.taxId,
        addressLine1: firstCompany.addressLine1 || firstCompany.address,
        city: firstCompany.city,
        state: firstCompany.state,
        postalCode: firstCompany.postalCode,
        countryCode: firstCompany.countryCode,
        companyPhone: firstCompany.phone,
        companyEmail: firstCompany.email,
        brands: firstCompany.brands,
        overviewDocumentUrl: bd.overviewDocumentUrl || (Array.isArray(bd.overviewDocument) ? bd.overviewDocument[0]?.url : null),
        
        status: 'pending'
      } as any);
    }

    const [newUser] = await db.select().from(users).where(eq(users.id, id));
    const { password: _, ...userWithoutPassword } = newUser;

    // Send Welcome Email asynchronously
    const siteUrl = req.get('origin') || 'http://localhost:5173';
    if (role === 'seller') {
      sendEmail({
        to: email,
        templateName: 'seller_signup_pending',
        data: { name: fullName, site_url: siteUrl }
      });
    } else {
      sendEmail({
        to: email,
        templateName: 'customer_welcome',
        data: { name: fullName, site_url: siteUrl }
      });
    }

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!process.env.DATABASE_URL) {
      // Mock login for development
      if (email === 'admin@tayfa.com' || email === 'tayyab786fq@gmail.com') {
        return res.json({
          id: 'admin-id',
          fullName: email === 'tayyab786fq@gmail.com' ? 'Tayyab' : 'System Admin',
          email,
          role: 'admin'
        });
      }
      return res.status(401).json({ error: 'Invalid credentials (MOCK)' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: `This account is not registered as a ${role}` });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending approval. Please wait for an admin to review your application.' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account application has been rejected. Please contact support for more information.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account is inactive.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

router.post('/auth/google', async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DB not connected' });
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid token');

    const email = payload.email!;
    const fullName = payload.name || 'Google User';

    let [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // Register user
      const id = uuidv4();
      const status = role === 'seller' ? 'pending' : 'active';
      // Generate a random password since they logged in with Google
      const randomPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

      await db.insert(users).values({
        id,
        email,
        password: randomPassword,
        fullName,
        phone: '',
        role: role || 'user',
        status
      });

      const [newUser] = await db.select().from(users).where(eq(users.id, id));
      user = newUser;
    } else {
      // Existing user checks
      if (role && user.role !== role) {
        return res.status(403).json({ error: `This account is already registered as a ${user.role}.` });
      }
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Your account is pending approval.' });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({ error: 'Your account application has been rejected.' });
      }
      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'Your account is inactive.' });
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!process.env.DATABASE_URL) {
      console.log(`[MOCK EMAIL] Reset password link for ${email}: http://localhost:3000/reset-password?token=mock-token`);
      return res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' ');

    await db.update(users)
      .set({ resetToken: token, resetTokenExpiresAt: expiresAt })
      .where(eq(users.id, user.id));

    // In a real app, send email here
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    console.log(`[EMAIL] Reset password link for ${email}: ${resetUrl}`);

    res.json({ message: 'If an account with that email exists, we have sent a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!process.env.DATABASE_URL) {
      return res.json({ success: true, message: 'Password reset successfully (MOCK)' });
    }

    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.resetToken, token),
        gte(users.resetTokenExpiresAt, new Date())
      ));

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password and clear token
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// --- Communication Routes ---
router.get('/communication/providers', async (req, res) => {
  try {
    const providers = await db.select().from(communicationProviders);
    res.json(providers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/communication/providers', async (req, res) => {
  try {
    const { name, type, config, senderId, endpointUrl, priority, isActive, isDefault } = req.body;

    // Encrypt sensitive config fields
    const encryptedConfig = { ...config };
    for (const key in encryptedConfig) {
      if (typeof encryptedConfig[key] === 'string' && encryptedConfig[key].length > 0) {
        encryptedConfig[key] = encrypt(encryptedConfig[key]);
      }
    }

    const id = uuidv4();
    await db.insert(communicationProviders).values({
      id,
      name,
      type,
      config: encryptedConfig,
      senderId,
      endpointUrl,
      priority,
      isActive,
      isDefault
    });
    const [newProvider] = await db.select().from(communicationProviders).where(eq(communicationProviders.id, id));
    res.json(newProvider);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/communication/providers/:id', async (req, res) => {
  try {
    const { config, ...rest } = req.body;
    const updateData: any = { ...rest };

    if (config) {
      const encryptedConfig = { ...config };
      for (const key in encryptedConfig) {
        if (typeof encryptedConfig[key] === 'string' && encryptedConfig[key].length > 0 && !encryptedConfig[key].includes(':')) {
          encryptedConfig[key] = encrypt(encryptedConfig[key]);
        }
      }
      updateData.config = encryptedConfig;
    }

    const updated = await handlePatchUpdate({
      table: communicationProviders,
      id: req.params.id,
      data: req.body,
      userId: 'system',
      module: 'CommunicationProvider',
      allowedFields: ['name', 'type', 'config', 'senderId', 'endpointUrl', 'priority', 'isActive', 'isDefault']
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/communication/providers/:id', async (req, res) => {
  try {
    await db.delete(communicationProviders).where(eq(communicationProviders.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/communication/templates', async (req, res) => {
  try {
    const templates = await db.select().from(communicationTemplates);
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/communication/templates', async (req, res) => {
  try {
    const id = uuidv4();
    await db.insert(communicationTemplates).values({ ...req.body, id });
    const [newTemplate] = await db.select().from(communicationTemplates).where(eq(communicationTemplates.id, id));
    res.json(newTemplate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/communication/templates/:id', async (req, res) => {
  try {
    const updated = await handlePatchUpdate({
      table: communicationTemplates,
      id: req.params.id,
      data: req.body,
      userId: 'system',
      module: 'CommunicationTemplate',
      allowedFields: ['name', 'type', 'content', 'language', 'isActive']
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/communication/templates/:id', async (req, res) => {
  try {
    await db.delete(communicationTemplates).where(eq(communicationTemplates.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/communication/logs', async (req, res) => {
  try {
    const logs = await db.select().from(communicationLogs).orderBy(desc(communicationLogs.createdAt)).limit(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/communication/send-test', async (req, res) => {
  try {
    const { type, recipient, message } = req.body;
    const response = await CommunicationService.sendMessage(type, { recipient, message });
    res.json(response);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// --- Cart API --- 
// ============================================================

/** Helper: get or create the active cart for a user */
const getOrCreateUserCart = async (userId: string) => {
  const existing = await db.select().from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const id = uuidv4();
  await db.insert(carts).values({ id, userId, status: 'active' });
  return { id, userId, status: 'active' };
};

/** Helper: load all items for a cart with formatted shape */
const loadCartItems = async (cartId: string) => {
  const rows = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  return rows.map((r: any) => ({
    cartItemId: r.id,
    cartId: r.cartId,
    id: r.productId,
    sellerId: r.sellerId,
    name: r.name,
    price: parseFloat(r.price),
    imageUrl: r.image,
    qty: r.qty,
    variantId: r.variantId || 'default',
    size: r.variantId?.split('-')[0] || '',
    color: r.variantId?.split('-')[1] || '',
  }));
};

// GET /api/cart?userId=xxx  — fetch cart for logged-in user
router.get('/cart', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!process.env.DATABASE_URL) return res.json({ items: [] });

    const cart = await getOrCreateUserCart(userId as string);
    const items = await loadCartItems(cart.id);
    res.json({ cartId: cart.id, items });
  } catch (error: any) {
    console.error('Cart GET error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/items  — add item to cart (idempotent: merges qty if same variant)
router.post('/cart/items', async (req, res) => {
  try {
    const { userId, id: productId, sellerId, name, price, image, imageUrl, qty = 1, variantId = 'default' } = req.body;
    if (!userId || !productId || !name || price === undefined) {
      return res.status(400).json({ error: 'userId, id, name, price are required' });
    }

    const finalImage = imageUrl || image;
    // Extra safety: reject if it's still base64
    if (finalImage && finalImage.startsWith('data:image')) {
       return res.status(400).json({ error: 'Image must be a URL, base64 data is too large.' });
    }
    if (!process.env.DATABASE_URL) return res.json({ items: [] });

    const cart = await getOrCreateUserCart(userId);

    // Check if same product+variant already in cart
    const existing = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, productId),
        eq(cartItems.variantId, variantId)
      )).limit(1);

    if (existing.length > 0) {
      // Merge: add quantities
      const newQty = existing[0].qty + qty;
      await db.update(cartItems)
        .set({ qty: newQty })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      // Insert new item
      await db.insert(cartItems).values({
        id: uuidv4(),
        cartId: cart.id,
        productId,
        sellerId: sellerId || null,
        variantId,
        name,
        price: price.toString(),
        image: finalImage || null,
        qty,
      });
    }

    const items = await loadCartItems(cart.id);
    res.json({ cartId: cart.id, items });
  } catch (error: any) {
    console.error('Cart add error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/items/:id  — update quantity
router.put('/cart/items/:id', async (req, res) => {
  try {
    const { userId, qty } = req.body;
    const cartItemId = req.params.id;
    if (!userId || qty === undefined) return res.status(400).json({ error: 'userId and qty required' });
    if (!process.env.DATABASE_URL) return res.json({ items: [] });

    if (qty < 1) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    } else {
      await db.update(cartItems).set({ qty }).where(eq(cartItems.id, cartItemId));
    }

    const cart = await getOrCreateUserCart(userId);
    const items = await loadCartItems(cart.id);
    res.json({ cartId: cart.id, items });
  } catch (error: any) {
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/items/:id  — remove a cart item
router.delete('/cart/items/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const cartItemId = req.params.id;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!process.env.DATABASE_URL) return res.json({ items: [] });

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    const cart = await getOrCreateUserCart(userId as string);
    const items = await loadCartItems(cart.id);
    res.json({ cartId: cart.id, items });
  } catch (error: any) {
    console.error('Cart delete error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// POST /api/cart/merge  — merge guest items into logged-in user cart (idempotent)
router.post('/cart/merge', async (req, res) => {
  try {
    const { userId, guestItems } = req.body;
    if (!userId || !Array.isArray(guestItems)) {
      return res.status(400).json({ error: 'userId and guestItems array required' });
    }
    if (!process.env.DATABASE_URL) return res.json({ items: guestItems });

    const cart = await getOrCreateUserCart(userId);

    for (const item of guestItems) {
      const { id: productId, sellerId, name, price, image, qty = 1, variantId = 'default' } = item;
      if (!productId || !name || price === undefined) continue;

      // Check if already exists in DB cart
      const existing = await db.select().from(cartItems)
        .where(and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          eq(cartItems.variantId, variantId)
        )).limit(1);

      if (existing.length > 0) {
        // Merge quantities (don't duplicate)
        const merged = existing[0].qty + qty;
        await db.update(cartItems).set({ qty: merged }).where(eq(cartItems.id, existing[0].id));
      } else {
        await db.insert(cartItems).values({
          id: uuidv4(),
          cartId: cart.id,
          productId,
          sellerId: sellerId || null,
          variantId,
          name,
          price: price.toString(),
          image: image || null,
          qty,
        });
      }
    }

    const items = await loadCartItems(cart.id);
    res.json({ cartId: cart.id, items, merged: guestItems.length });
  } catch (error: any) {
    console.error('Cart merge error:', error);
    res.status(500).json({ error: 'Failed to merge cart' });
  }
});

// DELETE /api/cart  — clear entire cart for user
router.delete('/cart', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!process.env.DATABASE_URL) return res.json({ success: true });

    const userCarts = await db.select().from(carts)
      .where(and(eq(carts.userId, userId as string), eq(carts.status, 'active')));

    for (const c of userCarts) {
      await db.delete(cartItems).where(eq(cartItems.cartId, c.id));
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Cart clear error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// ============================================================
// --- Customers API ---
// ============================================================

// GET /api/customers  — list all customers (admin)
router.get('/customers', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json([]);
    const all = await db.select().from(customers).orderBy(desc(customers.createdAt));
    res.json(all);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/by-user/:userId  — get customer profile linked to a user
router.get('/customers/by-user/:userId', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json(null);
    const [customer] = await db.select().from(customers)
      .where(eq(customers.userId, req.params.userId)).limit(1);
    res.json(customer || null);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST /api/customers  — create customer
router.post('/customers', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'DB unavailable' });
    const id = uuidv4();
    const { userId, firstName, lastName, email, phone, gender, dateOfBirth, country, city, address, profileImage } = req.body;
    await db.insert(customers).values({
      id, userId, firstName, lastName, email, phone, gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      country, city, address, profileImage, status: 'active'
    });
    const [created] = await db.select().from(customers).where(eq(customers.id, id));
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create customer' });
  }
});

// PUT /api/customers/:id  — update customer
router.put('/customers/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'DB unavailable' });
    const { firstName, lastName, email, phone, gender, dateOfBirth, country, city, address, profileImage, status } = req.body;
    await db.update(customers).set({
      firstName, lastName, email, phone, gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      country, city, address, profileImage, status
    }).where(eq(customers.id, req.params.id));
    const [updated] = await db.select().from(customers).where(eq(customers.id, req.params.id));
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update customer' });
  }
});

export default router;

