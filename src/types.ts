export type Action = 'view' | 'create' | 'edit' | 'delete';

export type Module = 
  | 'overview' 
  | 'products' 
  | 'orders' 
  | 'pricelist' 
  | 'promotions' 
  | 'coupons' 
  | 'discounts' 
  | 'payments' 
  | 'invoices' 
  | 'ledger' 
  | 'bulk_upload' 
  | 'users' 
  | 'analytics' 
  | 'rbac' 
  | 'system'
  | 'shipping'
  | 'settings'
  | 'blogs'
  | 'seo'
  | 'tax_rules';

export interface ModulePermission {
  module: Module;
  actions: Action[];
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: ModulePermission[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string; // Changed from enum to string to support custom roles
  permissions?: string[];
}

export interface Seller extends User {
  businessName: string;
  storeLogo?: string;
  businessAddress?: string;
  taxId?: string;
  categories: ('clothing' | 'accessories' | 'footwear')[];
}

export interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  customerEmail?: string;
  history?: {
    status: string;
    timestamp: string;
    comment?: string;
  }[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  sellerId: string;
  customerId: string;
  amount: number;
  taxAmount: number;
  status: 'unpaid' | 'paid' | 'cancelled' | 'overdue';
  dueDate?: string;
  paidAt?: string;
  date: string; // fallback for UI consistency or createdAt
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface LedgerEntry {
  id: string;
  sellerId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  balanceAfter: number;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed' | null;
  category: string;
  parentCategory?: string;
  parentCategoryId?: string;
  categoryId?: string;
  gender: 'men' | 'women' | 'kids';
  type: 'clothing' | 'accessories' | 'footwear';
  subcategory?: 'pret' | 'unstitched' | 'luxury';
  images: string[];
  description: string;
  sizes: string[];
  stock: number;
  sku?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  numReviews?: number;
  colors?: string[];
  customFields?: Record<string, string | number | boolean>;
  seo?: SEOMetadata;
  slug: string;
  dynamicFilters?: Record<string, string[]>;
  applicablePromotions?: Promotion[];
  createdAt: string;
  taxRuleId?: string;
  pricelistId?: string;
}

export interface ShippingOverride {
  id: string;
  region: string;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  overrides?: ShippingOverride[];
  carrier?: 'fedex' | 'dhl' | 'ups' | 'usps';
  serviceCode?: string;
}

export interface CarrierIntegration {
  id: string;
  carrier: 'fedex' | 'dhl' | 'ups' | 'usps';
  name: string;
  isActive: boolean;
  config: {
    apiKey?: string;
    apiSecret?: string;
    accountNumber?: string;
    testMode: boolean;
  };
}

export interface CarrierRate {
  carrier: string;
  serviceName: string;
  cost: number;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export interface ShippingZone {
  id: string;
  sellerId: string;
  name: string;
  type: 'domestic' | 'international';
  regions: string[];
  options: ShippingOption[];
  isActive: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  seo?: SEOMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  seo?: SEOMetadata;
  isActive?: boolean;
  createdAt?: string;
}

export interface Pricelist {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  currency: string;
  items: {
    productId: string;
    price: number;
  }[];
  isActive: boolean;
  isGlobal?: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y_free';
  value: number;
  minPurchase: number;
  buyQuantity?: number;
  getQuantity?: number;
  minQuantity?: number;
  applyTo?: 'all' | 'specific' | 'category';
  productIds?: string[];
  categoryId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  sellerName?: string;
}

export interface Coupon {
  id: string;
  sellerId: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Discount {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  status: 'active' | 'inactive' | 'scheduled';
  applyTo: 'all' | 'specific' | 'category';
  categoryId?: string;
  productIds?: string[];
  productId?: string; // Keep for backward compatibility if needed, but we'll use productIds
  startDate: string;
  endDate: string;
  isActive: boolean;
  sellerName?: string;
  sellerEmail?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'product' | 'pricelist' | 'promotion' | 'coupon' | 'discount' | 'system';
  entityId?: string;
  details: string;
  timestamp: string;
  ip?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type BulkUploadType = 'product' | 'pricelist' | 'promotion' | 'coupon';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  coverImage: string;
  images?: string[];
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  seo?: SEOMetadata;
  createdAt: string;
  updatedAt: string;
  readTime?: string;
}

export type SEOEntityType = 'product' | 'category' | 'brand' | 'page' | 'promotion' | 'blog';

export interface SEOEntity extends SEOMetadata {
  id: string;
  entityType: SEOEntityType;
  entityId: string;
  entityName: string;
  slug: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
  seoScore?: number;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: string; // e.g., "index, follow"
  structuredData?: string; // JSON-LD
}

export interface PageSEO extends SEOMetadata {
  id: string;
  pagePath: string; // e.g., "/", "/products", "/categories"
  pageName: string; // e.g., "Homepage", "Product Listing"
}

export interface GlobalSEOSettings {
  defaultMetadata: SEOMetadata;
  favicon?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  robotsTxt?: string;
  sitemapEnabled: boolean;
  lastSitemapUpdate?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  type: 'manual' | 'gateway';
  instructions?: string;
  icon?: string;
}

export interface TaxRule {
  id: string;
  name: string;
  country: string;
  state?: string;
  rate: number; // percentage, e.g., 15 for 15%
  pricelistId: string; // Linked pricelist
  isActive: boolean;
  createdAt: string;
}

export interface Filter {
  id: string;
  name: string;
  type: 'dropdown' | 'checkbox' | 'range' | 'multi-select';
  displayOrder: number;
  isActive: boolean;
  labels?: Record<string, string>;
  categoryId?: string | null;
  isFilterable?: boolean;
  isAttribute?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterValue {
  id: string;
  filterId: string;
  value: string;
  displayOrder: number;
  labels?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilterValue {
  productId: string;
  filterValueId: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrencyRate {
  id: number;
  currencyCode: string;
  rate: string;
  effectiveDate: string;
  createdAt?: string;
}
