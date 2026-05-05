"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSettings = exports.customers = exports.cartItems = exports.carts = exports.refunds = exports.payments = exports.transactions = exports.communicationLogs = exports.communicationTemplates = exports.communicationProviders = exports.currencyRates = exports.countries = exports.returns = exports.shipments = exports.orderStatusHistory = exports.orderItems = exports.orders = exports.localizations = exports.notifications = exports.gatewayRules = exports.gatewayConfigs = exports.paymentMethods = exports.paymentGateways = exports.taxRules = exports.settings = exports.seo = exports.pages = exports.blogs = exports.auditLogs = exports.ledgers = exports.creditNotes = exports.invoices = exports.discounts = exports.pricelists = exports.coupons = exports.promotions = exports.productAttributes = exports.attributeValues = exports.attributes = exports.productFilterValues = exports.filterValues = exports.filters = exports.products = exports.categories = exports.sellerApplications = exports.companies = exports.brands = exports.roles = exports.users = exports.alias = void 0;
exports.emailTemplates = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_core_1 = require("drizzle-orm/pg-core");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const isMysql = true;
const table = isMysql ? mysql_core_1.mysqlTable : pg_core_1.pgTable;
const text = isMysql ? mysql_core_1.text : pg_core_1.text;
const varchar = isMysql ? mysql_core_1.varchar : pg_core_1.varchar;
const decimal = isMysql ? mysql_core_1.decimal : pg_core_1.decimal;
const integer = isMysql ? mysql_core_1.int : pg_core_1.integer;
const boolean = isMysql ? mysql_core_1.boolean : pg_core_1.boolean;
const timestamp = isMysql ? mysql_core_1.timestamp : pg_core_1.timestamp;
const json = isMysql ? mysql_core_1.json : pg_core_1.jsonb;
const char = isMysql ? mysql_core_1.char : pg_core_1.uuid;
exports.alias = isMysql ? mysql_core_1.alias : pg_core_1.alias;
// --- Users ---
exports.users = table('users', {
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
exports.roles = table('roles', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    isSystem: boolean('is_system').default(false),
    permissions: json('permissions').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// --- Brands ---
exports.brands = table('brands', {
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
exports.companies = table('companies', {
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
exports.sellerApplications = table('seller_applications', {
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
exports.categories = table('categories', {
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
exports.products = table('products', {
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
    attributes: json('attributes'), // { "attributeId": ["valueId1", "valueId2"] }
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
exports.filters = table('filters', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // dropdown, checkbox, range, multi-select
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true),
    labels: json('labels'), // For multi-language support
    categoryId: isMysql ? char('category_id', { length: 36 }) : char('category_id'), // FK to parent categories (parent_id IS NULL)
    isFilterable: boolean('is_filterable').default(false), // show in shop sidebar
    isAttribute: boolean('is_attribute').default(false), // show on product detail page
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.filterValues = table('filter_values', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    filterId: isMysql ? char('filter_id', { length: 36 }).notNull() : char('filter_id').notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    labels: json('labels'), // For multi-language support
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.productFilterValues = table('product_filter_values', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    productId: isMysql ? char('product_id', { length: 36 }).notNull() : char('product_id').notNull(),
    filterId: isMysql ? char('filter_id', { length: 36 }).notNull() : char('filter_id').notNull(),
    valueId: isMysql ? char('value_id', { length: 36 }).notNull() : char('value_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
// --- PDP Attributes Module ---
exports.attributes = table('attributes', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    displayType: varchar('display_type', { length: 50 }).default('default'), // color_swatch, dropdown, default
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.attributeValues = table('attribute_values', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    attributeId: isMysql ? char('attribute_id', { length: 36 }).notNull() : char('attribute_id').notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    colorCode: varchar('color_code', { length: 50 }), // For color_swatch display
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.productAttributes = table('product_attributes', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    productId: isMysql ? char('product_id', { length: 36 }).notNull() : char('product_id').notNull(),
    attributeId: isMysql ? char('attribute_id', { length: 36 }).notNull() : char('attribute_id').notNull(),
    valueId: isMysql ? char('value_id', { length: 36 }).notNull() : char('value_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
// --- Promotions, Coupons & Discounts ---
exports.promotions = table('promotions', {
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
exports.coupons = table('coupons', {
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
exports.pricelists = table('pricelists', {
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
exports.discounts = table('discounts', {
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
exports.invoices = table('invoices', {
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
exports.creditNotes = table('credit_notes', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    noteNumber: varchar('note_number', { length: 50 }).notNull().unique(),
    invoiceId: isMysql ? char('invoice_id', { length: 36 }).notNull() : char('invoice_id').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    reason: text('reason'),
    status: varchar('status', { length: 50 }).default('issued'),
    createdAt: timestamp('created_at').defaultNow(),
});
// --- Ledgers & Audit Logs ---
exports.ledgers = table('ledgers', {
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
exports.auditLogs = table('audit_logs', {
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
exports.blogs = table('blogs', {
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
exports.pages = table('pages', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// --- SEO ---
exports.seo = table('seo', {
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
exports.settings = table('settings', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: json('value').notNull(),
    description: text('description'),
});
// --- Tax Rules ---
exports.taxRules = table('tax_rules', {
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
exports.paymentGateways = table('payment_gateways', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(),
    status: boolean('status').default(true),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});
exports.paymentMethods = table('payment_methods', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    instructions: text('instructions'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});
exports.gatewayConfigs = table('gateway_configs', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    gatewayId: isMysql ? char('gateway_id', { length: 36 }).notNull() : char('gateway_id').notNull(),
    key: varchar('key', { length: 100 }).notNull(),
    value: text('value').notNull(),
    environment: varchar('environment', { length: 20 }).default('sandbox'),
});
exports.gatewayRules = table('gateway_rules', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    gatewayId: isMysql ? char('gateway_id', { length: 36 }).notNull() : char('gateway_id').notNull(),
    region: varchar('region', { length: 10 }),
    currency: varchar('currency', { length: 10 }),
    userType: varchar('user_type', { length: 20 }),
});
// --- Notifications & Localizations ---
exports.notifications = table('notifications', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    userId: isMysql ? char('user_id', { length: 36 }) : char('user_id'),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    type: varchar('type', { length: 50 }).default('info'),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});
exports.localizations = table('localizations', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 10 }).notNull().unique(), // e.g., 'en', 'ur'
    name: varchar('name', { length: 100 }).notNull(),
    isDefault: boolean('is_default').default(false),
    isActive: boolean('is_active').default(true),
    translations: json('translations'), // Store key-value pairs
    createdAt: timestamp('created_at').defaultNow(),
});
// --- Orders & Fulfillment ---
exports.orders = table('orders', {
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
exports.orderItems = table('order_items', {
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
exports.orderStatusHistory = table('order_status_history', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    comment: text('comment'),
    changedBy: isMysql ? char('changed_by', { length: 36 }) : char('changed_by'),
    createdAt: timestamp('created_at').defaultNow(),
});
exports.shipments = table('shipments', {
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
exports.returns = table('returns', {
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
exports.countries = table('countries', {
    id: isMysql ? (0, mysql_core_1.serial)('id').primaryKey() : (0, pg_core_1.serial)('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 10 }).notNull().unique(),
    currencyCode: varchar('currency_code', { length: 10 }).notNull(),
    currencyName: varchar('currency_name', { length: 100 }).notNull(),
    symbol: varchar('symbol', { length: 10 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.currencyRates = table('currency_rates', {
    id: isMysql ? (0, mysql_core_1.serial)('id').primaryKey() : (0, pg_core_1.serial)('id').primaryKey(),
    currencyCode: varchar('currency_code', { length: 10 }).notNull(),
    rate: decimal('rate', { precision: 18, scale: 6 }).notNull(),
    effectiveDate: timestamp('effective_date').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
// --- Communication System ---
exports.communicationProviders = table('communication_providers', {
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
exports.communicationTemplates = table('communication_templates', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(), // e.g., order_confirmation
    type: varchar('type', { length: 50 }).notNull(), // sms, whatsapp
    content: text('content').notNull(), // Template with variables like {name}
    language: varchar('language', { length: 10 }).default('en'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.communicationLogs = table('communication_logs', {
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
exports.transactions = table('transactions', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    orderId: varchar('order_id', { length: 100 }).notNull(),
    gatewayId: isMysql ? char('gateway_id', { length: 36 }).notNull() : char('gateway_id').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('PKR'),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.payments = table('payments', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    transactionId: isMysql ? char('transaction_id', { length: 36 }).notNull() : char('transaction_id').notNull(),
    gatewayResponse: json('gateway_response'),
    paymentStatus: varchar('payment_status', { length: 50 }),
    paymentMethod: varchar('payment_method', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
});
exports.refunds = table('refunds', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    orderId: isMysql ? char('order_id', { length: 36 }).notNull() : char('order_id').notNull(),
    returnId: isMysql ? char('return_id', { length: 36 }).notNull() : char('return_id').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
});
// --- Carts & Cart Items ---
exports.carts = table('carts', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    userId: isMysql ? char('user_id', { length: 36 }) : char('user_id'), // null = guest cart
    sessionId: varchar('session_id', { length: 100 }), // guest session identifier
    status: varchar('status', { length: 20 }).default('active'), // active | merged | abandoned
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
exports.cartItems = table('cart_items', {
    id: isMysql ? char('id', { length: 36 }).primaryKey() : char('id').defaultRandom().primaryKey(),
    cartId: isMysql ? char('cart_id', { length: 36 }).notNull() : char('cart_id').notNull(),
    productId: isMysql ? char('product_id', { length: 36 }).notNull() : char('product_id').notNull(),
    sellerId: isMysql ? char('seller_id', { length: 36 }) : char('seller_id'), // for multi-seller routing
    variantId: varchar('variant_id', { length: 255 }), // encodes all selected attribute values
    name: varchar('name', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    image: varchar('image', { length: 2048 }),
    qty: integer('qty').default(1),
    attributes: json('attributes'), // { "Color": "Green", "Fabric": "Cotton" }
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// --- Customers ---
exports.customers = table('customers', {
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
exports.emailSettings = table('email_settings', {
    id: (0, mysql_core_1.serial)('id').primaryKey(),
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
exports.emailTemplates = table('email_templates', {
    id: (0, mysql_core_1.serial)('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    subject: varchar('subject', { length: 255 }).notNull(),
    body: text('body').notNull(),
    variables: text('variables'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
