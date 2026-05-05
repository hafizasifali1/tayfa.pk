import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  CreditCard,
  Tag,
  Ticket,
  Sparkles,
  BookOpen,
  Package,
  Upload,
  BarChart3,
  Activity,
  Globe,
  ListOrdered,
  Truck,
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Module } from '../types';

export type ModuleSection = 'Operations' | 'Reporting' | 'Configurations' | 'Settings';

export interface ModuleConfig {
  key: Module;
  label: string;
  adminLabel: string;
  icon: LucideIcon;
  sellerPath: string;
  adminPath: string;
  section: ModuleSection;
}

// Single source of truth for every RBAC-managed module.
// Why: prior to this file the seller sidebar, the admin sidebar, and the
// Access Control admin UI each kept their own list of modules. New modules
// (attributes, tax_rules, seo, blogs) were added to one list but not the
// others, so permissions could be granted but never rendered.
// How to apply: any new module must be added here once and only here.
export const MODULES_CONFIG: ModuleConfig[] = [
  { key: 'overview',    label: 'Overview',        adminLabel: 'Overview & Analytics',                                              icon: LayoutDashboard, sellerPath: '/seller/dashboard',   adminPath: '/admin/dashboard',     section: 'Operations'     },
  { key: 'orders',      label: 'Orders',          adminLabel: 'Orders Management',                                                 icon: ShoppingBag,     sellerPath: '/seller/orders',      adminPath: '/admin/orders',        section: 'Operations'     },
  { key: 'invoices',    label: 'Invoices',        adminLabel: 'Invoices',                                                          icon: FileText,        sellerPath: '/seller/invoices',    adminPath: '/admin/invoices',      section: 'Operations'     },
  { key: 'payments',    label: 'Payments',        adminLabel: 'Payments',                                                          icon: CreditCard,      sellerPath: '/seller/payments',    adminPath: '/admin/payments',      section: 'Operations'     },
  { key: 'pricelist',   label: 'Pricelists',      adminLabel: 'Pricelists',                                                        icon: FileText,        sellerPath: '/seller/pricelists',  adminPath: '/admin/pricelists',    section: 'Operations'     },
  { key: 'promotions',  label: 'Promotions',      adminLabel: 'Promotions',                                                        icon: Sparkles,        sellerPath: '/seller/promotions',  adminPath: '/admin/promotions',    section: 'Operations'     },
  { key: 'coupons',     label: 'Coupons',         adminLabel: 'Coupons',                                                           icon: Ticket,          sellerPath: '/seller/coupons',     adminPath: '/admin/coupons',       section: 'Operations'     },
  { key: 'discounts',   label: 'Discounts',       adminLabel: 'Discounts',                                                         icon: Tag,             sellerPath: '/seller/discounts',   adminPath: '/admin/discounts',     section: 'Operations'     },
  { key: 'blogs',       label: 'Journal',         adminLabel: 'Journal / Blogs',                                                   icon: BookOpen,        sellerPath: '/seller/blogs',       adminPath: '/admin/blogs',         section: 'Operations'     },
  { key: 'products',    label: 'Products',        adminLabel: 'Product Management (Brands, Categories, Filters)',                  icon: Package,         sellerPath: '/seller/products',    adminPath: '/admin/products',      section: 'Operations'     },
  { key: 'bulk_upload', label: 'Bulk Upload',     adminLabel: 'Bulk Product Upload',                                               icon: Upload,          sellerPath: '/seller/bulk-upload', adminPath: '/admin/bulk-upload',   section: 'Operations'     },

  { key: 'analytics',   label: 'Sales Analytics', adminLabel: 'Sales Analytics',                                                   icon: BarChart3,       sellerPath: '/seller/analytics',   adminPath: '/admin/analytics',     section: 'Reporting'      },
  { key: 'ledger',      label: 'Ledger',          adminLabel: 'Financial Ledger',                                                  icon: BookOpen,        sellerPath: '/seller/ledger',      adminPath: '/admin/ledger',        section: 'Reporting'      },
  { key: 'system',      label: 'Activity Logs',   adminLabel: 'System Logs',                                                       icon: Activity,        sellerPath: '/seller/logs',        adminPath: '/admin/logs',          section: 'Reporting'      },

  { key: 'seo',         label: 'SEO Manager',     adminLabel: 'SEO Manager',                                                       icon: Globe,           sellerPath: '/seller/seo',         adminPath: '/admin/seo',           section: 'Configurations' },
  { key: 'attributes',  label: 'Attributes',      adminLabel: 'Attributes Manager',                                                icon: ListOrdered,     sellerPath: '/seller/attributes',  adminPath: '/admin/attributes',    section: 'Configurations' },
  { key: 'tax_rules',   label: 'Tax Rules',       adminLabel: 'Tax Management',                                                    icon: FileText,        sellerPath: '/seller/taxes',       adminPath: '/admin/taxes',         section: 'Configurations' },
  { key: 'shipping',    label: 'Shipping',        adminLabel: 'Shipping',                                                          icon: Truck,           sellerPath: '/seller/shipping',    adminPath: '/admin/shipping',      section: 'Configurations' },

  { key: 'users',       label: 'Users',           adminLabel: 'Users & Seller Applications',                                       icon: Users,           sellerPath: '/seller/users',       adminPath: '/admin/users',         section: 'Settings'       },
  { key: 'rbac',        label: 'Access Control',  adminLabel: 'Access Control (RBAC)',                                             icon: ShieldCheck,     sellerPath: '/seller/access',      adminPath: '/admin/access',        section: 'Settings'       },
  { key: 'settings',    label: 'Account Settings',adminLabel: 'System Settings (Countries, Notifications, Localization, Communication, Email)', icon: SettingsIcon, sellerPath: '/account-settings', adminPath: '/admin/settings',    section: 'Settings'       },
];

export const MODULES_BY_KEY: Record<string, ModuleConfig> = MODULES_CONFIG.reduce(
  (acc, m) => ({ ...acc, [m.key]: m }),
  {},
);

export const SECTION_ORDER: ModuleSection[] = ['Operations', 'Reporting', 'Configurations', 'Settings'];
