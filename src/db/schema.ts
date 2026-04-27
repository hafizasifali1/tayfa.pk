import dotenv from 'dotenv';
dotenv.config();

import { 
  pgTable, 
  serial as pgSerial, 
  text as pgText, 
  varchar as pgVarchar, 
  decimal as pgDecimal, 
  integer as pgInteger, 
  boolean as pgBoolean, 
  timestamp as pgTimestamp, 
  jsonb as pgJsonb,
  uuid as pgUuid,
  alias as pgAlias
} from 'drizzle-orm/pg-core';
import {
  mysqlTable,
  serial as mysqlSerial,
  text as mysqlText,
  varchar as mysqlVarchar,
  decimal as mysqlDecimal,
  int as mysqlInteger,
  boolean as mysqlBoolean,
  timestamp as mysqlTimestamp,
  json as mysqlJson,
  char as mysqlChar,
  alias as mysqlAlias
} from 'drizzle-orm/mysql-core';

const isMysql = true;

const table: any = isMysql ? mysqlTable : pgTable;
const text: any = isMysql ? mysqlText : pgText;
const varchar: any = isMysql ? mysqlVarchar : pgVarchar;
const decimal: any = isMysql ? mysqlDecimal : pgDecimal;
const integer: any = isMysql ? mysqlInteger : pgInteger;
const boolean: any = isMysql ? mysqlBoolean : pgBoolean;
const timestamp: any = isMysql ? mysqlTimestamp : pgTimestamp;
const json: any = isMysql ? mysqlJson : pgJsonb;
const char: any = isMysql ? mysqlChar : pgUuid;
export const alias: any = isMysql ? mysqlAlias : pgAlias;

// --- Users ---
export const users = table('users', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  password: text('password'), 
  role: varchar('role', { length: 50 }).default('user'), 
  permissions: json('permissions'),
  status: varchar('status', { length: 50 }).default('active'),
  resetToken: varchar('reset_token', { length: 255 }),
  resetTokenExpiresAt: timestamp('reset_token_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Roles & Permissions ---
export interface ModulePermission {
  module: string;
  actions: string[];
}

export const roles = table('roles', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  permissions: json('permissions').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Brands ---
export const brands = table('brands', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  companyId: isMysql ? char('company_id', { length: 36 }) : char('company_id'),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logo: text('logo'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  seo: json('seo'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Companies ---
export const companies = table('companies', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  sellerId: isMysql ? char('seller_id', { length: 36 }).notNull() : char('seller_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }),
  taxId: varchar('tax_id', { length: 100 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Seller Applications ---
export const sellerApplications = table('seller_applications', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  userId: isMysql ? char('user_id', { length: 36 }).notNull() : char('user_id').notNull(),
  businessData: json('business_data').notNull(), // Keep for backup
  
  // New separate columns for easier querying
  category: varchar('category', { length: 100 }),
  customCategory: varchar('custom_category', { length: 100 }),
  companyName: varchar('company_name', { length: 255 }),
  registrationNumber: varchar('registration_number', { length: 100 }),
  taxId: varchar('tax_id', { length: 100 }),
  addressLine1: text('address_line1'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  countryCode: varchar('country_code', { length: 10 }),
  companyPhone: varchar('company_phone', { length: 50 }),
  companyEmail: varchar('company_email', { length: 255 }),
  brands: json('brands'),
  overviewDocumentUrl: varchar('overview_document_url', { length: 500 }),

  status: varchar('status', { length: 50 }).default('pending'), // pending, approved, rejected, more_info_requested
  adminNotes: text('admin_notes'),
  reviewedBy: isMysql ? char('reviewed_by', { length: 36 }) : char('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Categories ---
export const categories = table('categories', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  parentId: isMysql ? char('parent_id', { length: 36 }) : char('parent_id'),
  icon: text('icon'),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  seo: json('seo'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Products ---
export const products = table('products', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  brandId: isMysql ? char('brand_id', { length: 36 }) : char('brand_id'),
  parentCategoryId: isMysql ? char('parent_category_id', { length: 36 }) : char('parent_category_id'),
  categoryId: isMysql ? char('category_id', { length: 36 }) : char('category_id'),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),
  sku: varchar('sku', { length: 255 }),
  pricelistId: isMysql ? char('pricelist_id', { length: 36 }) : char('pricelist_id'),
  taxRuleId: isMysql ? char('tax_rule_id', { length: 36 }) : char('tax_rule_id'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  discount: integer('discount').default(0),
  description: text('description'),
  images: json('images').notNull(),
  sizes: json('sizes'),
  colors: json('colors'),
  tags: json('tags'),
  dynamicFilters: json('dynamic_filters'),
  stock: integer('stock').default(0),
  status: varchar('status', { length: 50 }).default('published'),
  isFeatured: boolean('is_featured').default(false),
  isNew: boolean('is_new').default(true),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('0.0'),
  numReviews: integer('num_reviews').default(0),
  gender: varchar('gender', { length: 50 }),
  type: varchar('type', { length: 50 }),
  subcategory: varchar('subcategory', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Dynamic Filters ---
export const filters = table('filters', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // dropdown, checkbox, range, multi-select
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  labels: json('labels'), // For multi-language support
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const filterValues = table('filter_values', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  filterId: isMysql ? char('filter_id', { length: 36 }).notNull() : char('filter_id').notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  labels: json('labels'), // For multi-language support
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productFilterValues = table('product_filter_values', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  productId: isMysql ? char('product_id', { length: 36 }).notNull() : char('product_id').notNull(),
  filterId: isMysql ? char('filter_id', { length: 36 }).notNull() : char('filter_id').notNull(),
  valueId: isMysql ? char('value_id', { length: 36 }).notNull() : char('value_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Promotions, Coupons & Discounts ---
export const promotions = table('promotions', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal('min_purchase', { precision: 10, scale: 2 }).default('0.00'),
  buyQuantity: integer('buy_quantity'),
  getQuantity: integer('get_quantity'),
  minQuantity: integer('min_quantity').default(1),
  applyTo: varchar('apply_to', { length: 50 }).default('all'),
  productIds: json('product_ids'),
  categoryId: isMysql ? char('category_id', { length: 36 }) : char('category_id'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coupons = table('coupons', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: varchar('discount_type', { length: 50 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minSpend: decimal('min_spend', { precision: 10, scale: 2 }).default('0.00'),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  expiryDate: timestamp('expiry_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pricelists = table('pricelists', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  currency: varchar('currency', { length: 10 }).default('PKR'),
  items: json('items'),
  isActive: boolean('is_active').default(true),
  isGlobal: boolean('is_global').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const discounts = table('discounts', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // percentage, fixed
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal('min_purchase', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 50 }).default('active'), // active, inactive, scheduled
  applyTo: varchar('apply_to', { length: 50 }).default('all'), // all, specific, category
  categoryId: isMysql ? char('category_id', { length: 36 }) : char('category_id'),
  productIds: json('product_ids'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Invoices & Credit Notes ---
export const invoices = table('invoices', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
  sellerId: isMysql ? char('seller_id', { length: 36 }).notNull() : char('seller_id').notNull(),
  customerId: isMysql ? char('customer_id', { length: 36 }).notNull() : char('customer_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 50 }).default('unpaid'),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const creditNotes = table('credit_notes', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  noteNumber: varchar('note_number', { length: 50 }).notNull().unique(),
  invoiceId: isMysql ? char('invoice_id', { length: 36 }).notNull() : char('invoice_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).default('issued'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Ledgers & Audit Logs ---
export const ledgers = table('ledgers', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  entityId: isMysql ? char('entity_id', { length: 36 }).notNull() : char('entity_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull(),
  referenceId: isMysql ? char('reference_id', { length: 36 }) : char('reference_id'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = table('audit_logs', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  userId: isMysql ? char('user_id', { length: 36 }).notNull() : char('user_id').notNull(),
  userRole: varchar('user_role', { length: 50 }),
  action: varchar('action', { length: 100 }).notNull(),
  module: varchar('module', { length: 50 }).notNull(),
  details: json('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Blogs ---
export const blogs = table('blogs', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  author: varchar('author', { length: 255 }), // Can be a name or JSON string of author object
  coverImage: text('cover_image'), // Featured image
  category: varchar('category', { length: 100 }),
  tags: json('tags'),
  status: varchar('status', { length: 50 }).default('published'), // draft, published
  seo: json('seo'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Pages & Policies ---
export const pages = table('pages', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- SEO ---
export const seo = table('seo', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // product, category, brand, page, promotion, blog
  entityId: isMysql ? char('entity_id', { length: 36 }).notNull() : char('entity_id').notNull(),
  entityName: varchar('entity_name', { length: 255 }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  keywords: text('keywords'),
  slug: varchar('slug', { length: 255 }).notNull(),
  canonicalUrl: text('canonical_url'),
  ogImage: text('og_image'),
  robots: varchar('robots', { length: 100 }).default('index, follow'),
  structuredData: text('structured_data'),
  status: varchar('status', { length: 50 }).default('active'),
  seoScore: decimal('seo_score', { precision: 5, scale: 2 }),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Settings ---
export const settings = table('settings', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: json('value').notNull(),
  description: text('description'),
});

// --- Tax Rules ---
export const taxRules = table('tax_rules', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull(),
  type: varchar('type', { length: 50 }).default('percentage'), // percentage, fixed
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }).default('Pakistan'),
  pricelistId: char('pricelist_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Payment Gateways & Methods ---
export const paymentGateways = table('payment_gateways', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  status: boolean('status').default(true),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentMethods = table('payment_methods', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  instructions: text('instructions'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gatewayConfigs = table('gateway_configs', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  gatewayId: isMysql ? char('gateway_id', { length: 36 }).notNull() : char('gateway_id').notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value').notNull(),
  environment: varchar('environment', { length: 20 }).default('sandbox'),
});

export const gatewayRules = table('gateway_rules', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  gatewayId: isMysql ? char('gateway_id', { length: 36 }).notNull() : char('gateway_id').notNull(),
  region: varchar('region', { length: 10 }),
  currency: varchar('currency', { length: 10 }),
  userType: varchar('user_type', { length: 20 }),
});

// --- Notifications & Localizations ---
export const notifications = table('notifications', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  userId: isMysql ? char('user_id', { length: 36 }) : char('user_id'),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).default('info'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const localizations = table('localizations', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(), // e.g., 'en', 'ur'
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  translations: json('translations'), // Store key-value pairs
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Orders & Fulfillment ---
export const orders = table('orders', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: isMysql ? char('customer_id', { length: 36 }).notNull() : char('customer_id').notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 10 }).default('PKR'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, returned
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'), // pending, partial, paid, failed, refunded
  paymentMethod: varchar('payment_method', { length: 50 }),
  shippingAddress: json('shipping_address').notNull(),
  billingAddress: json('billing_address'),
  notes: text('notes'),
  source: varchar('source', { length: 50 }).default('website'), // website, manual
  createdBy: isMysql ? char('created_by', { length: 36 }) : char('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = table('order_items', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
  productId: isMysql ? char('product_id', { length: 36 }).notNull() : char('product_id').notNull(),
  sellerId: isMysql ? char('seller_id', { length: 36 }).notNull() : char('seller_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  shippedQuantity: integer('shipped_quantity').default(0),
  returnedQuantity: integer('returned_quantity').default(0),
  size: varchar('size', { length: 50 }),
  color: varchar('color', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderStatusHistory = table('order_status_history', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  comment: text('comment'),
  changedBy: isMysql ? char('changed_by', { length: 36 }) : char('changed_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shipments = table('shipments', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),
  carrier: varchar('carrier', { length: 100 }),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  trackingUrl: text('tracking_url'),
  estimatedDelivery: timestamp('estimated_delivery'),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const returns = table('returns', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
  orderItemId: isMysql ? char('order_item_id', { length: 36 }).notNull() : char('order_item_id').notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 50 }).default('requested'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  images: json('images'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Countries & Currencies ---
export const countries = table('countries', {
  id: isMysql ? mysqlSerial('id').primaryKey() : pgSerial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  currencyCode: varchar('currency_code', { length: 10 }).notNull(),
  currencyName: varchar('currency_name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const currencyRates = table('currency_rates', {
  id: isMysql ? mysqlSerial('id').primaryKey() : pgSerial('id').primaryKey(),
  currencyCode: varchar('currency_code', { length: 10 }).notNull(),
  rate: decimal('rate', { precision: 18, scale: 6 }).notNull(),
  effectiveDate: timestamp('effective_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Communication System ---
export const communicationProviders = table('communication_providers', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., Twilio, WhatsApp Cloud API
  type: varchar('type', { length: 50 }).notNull(), // sms, whatsapp
  config: json('config').notNull(), // Encrypted API Key, SID, Token, etc.
  senderId: varchar('sender_id', { length: 100 }),
  endpointUrl: text('endpoint_url'),
  priority: integer('priority').default(1), // For failover
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const communicationTemplates = table('communication_templates', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., order_confirmation
  type: varchar('type', { length: 50 }).notNull(), // sms, whatsapp
  content: text('content').notNull(), // Template with variables like {name}
  language: varchar('language', { length: 10 }).default('en'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const communicationLogs = table('communication_logs', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  providerId: isMysql ? char('provider_id', { length: 36 }) : char('provider_id'),
  templateId: isMysql ? char('template_id', { length: 36 }) : char('template_id'),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, sent, failed, delivered
  error: text('error'),
  retryCount: integer('retry_count').default(0),
  metadata: json('metadata'), // API response details
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Transactions & Payments ---
export const transactions = table('transactions', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderId: varchar('order_id', { length: 100 }).notNull(),
  gatewayId: isMysql ? char('gateway_id', { length: 36 }).notNull() : char('gateway_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('PKR'),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payments = table('payments', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  transactionId: isMysql ? char('transaction_id', { length: 36 }).notNull() : char('transaction_id').notNull(),
  gatewayResponse: json('gateway_response'),
  paymentStatus: varchar('payment_status', { length: 50 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const refunds = table('refunds', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
  returnId: isMysql ? char('return_id', { length: 36 }).notNull() : char('return_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Carts & Cart Items ---
export const carts = table('carts', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  userId: isMysql ? char('user_id', { length: 36 }) : char('user_id'),           // null = guest cart
  sessionId: varchar('session_id', { length: 100 }),                              // guest session identifier
  status: varchar('status', { length: 20 }).default('active'),                    // active | merged | abandoned
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cartItems = table('cart_items', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  cartId: isMysql ? char('cart_id', { length: 36 }).notNull() : char('cart_id').notNull(),
  productId: isMysql ? char('product_id', { length: 36 }).notNull() : char('product_id').notNull(),
  sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'),      // for multi-seller routing
  variantId: varchar('variant_id', { length: 100 }),                              // size-color variant key e.g. "M-Red"
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image: varchar('image', { length: 2048 }),
  qty: integer('qty').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Customers ---
export const customers = table('customers', {
  id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
  userId: isMysql ? char('user_id', { length: 36 }) : char('user_id'),          
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  gender: varchar('gender', { length: 20 }),
  dateOfBirth: timestamp('date_of_birth'),
  country: varchar('country', { length: 100 }),
  city: varchar('city', { length: 100 }),
  address: text('address'),
  profileImage: text('profile_image'),
  status: varchar('status', { length: 20 }).default('active'),                   
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- Email Settings & Templates ---
export const emailSettings = table('email_settings', {
  id: mysqlSerial('id').primaryKey(),
  mailDriver: varchar('mail_driver', { length: 50 }).default('smtp'),
  mailHost: varchar('mail_host', { length: 255 }).notNull(),
  mailPort: integer('mail_port').default(587),
  mailUsername: varchar('mail_username', { length: 255 }).notNull(),
  mailPassword: varchar('mail_password', { length: 255 }).notNull(),
  mailEncryption: varchar('mail_encryption', { length: 20 }).default('tls'),
  fromEmail: varchar('from_email', { length: 255 }).notNull(),
  fromName: varchar('from_name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const emailTemplates = table('email_templates', {
  id: mysqlSerial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  variables: text('variables'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

