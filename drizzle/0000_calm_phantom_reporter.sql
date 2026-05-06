CREATE TABLE `attribute_values` (
	`id` char(36) NOT NULL,
	`attribute_id` char(36) NOT NULL,
	`value` varchar(255) NOT NULL,
	`color_code` varchar(50),
	`display_order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `attribute_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`display_type` varchar(50) DEFAULT 'default',
	`display_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `attributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`user_role` varchar(50),
	`action` varchar(100) NOT NULL,
	`module` varchar(50) NOT NULL,
	`details` json,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogs` (
	`id` char(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`author` varchar(255),
	`cover_image` text,
	`category` varchar(100),
	`tags` json,
	`status` varchar(50) DEFAULT 'published',
	`seo` json,
	`published_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `blogs_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` char(36) NOT NULL,
	`company_id` char(36),
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logo` text,
	`description` text,
	`is_active` boolean DEFAULT true,
	`seo` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` char(36) NOT NULL,
	`cart_id` char(36) NOT NULL,
	`product_id` char(36) NOT NULL,
	`seller_id` char(36),
	`variant_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`image` varchar(2048),
	`qty` int DEFAULT 1,
	`attributes` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` char(36) NOT NULL,
	`user_id` char(36),
	`session_id` varchar(100),
	`status` varchar(20) DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`parent_id` char(36),
	`icon` text,
	`description` text,
	`display_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`is_featured` boolean DEFAULT false,
	`seo` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `communication_logs` (
	`id` char(36) NOT NULL,
	`provider_id` char(36),
	`template_id` char(36),
	`recipient` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`error` text,
	`retry_count` int DEFAULT 0,
	`metadata` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `communication_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_providers` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`config` json NOT NULL,
	`sender_id` varchar(100),
	`endpoint_url` text,
	`priority` int DEFAULT 1,
	`is_active` boolean DEFAULT true,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `communication_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_templates` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`language` varchar(10) DEFAULT 'en',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `communication_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` char(36) NOT NULL,
	`seller_id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`registration_number` varchar(100),
	`tax_id` varchar(100),
	`address` text,
	`phone` varchar(50),
	`email` varchar(255),
	`status` varchar(50) DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(10) NOT NULL,
	`currency_code` varchar(10) NOT NULL,
	`currency_name` varchar(100) NOT NULL,
	`symbol` varchar(10) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `countries_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` char(36) NOT NULL,
	`seller_id` char(36),
	`code` varchar(50) NOT NULL,
	`discount_type` varchar(50) NOT NULL,
	`discount_value` decimal(10,2) NOT NULL,
	`min_spend` decimal(10,2) DEFAULT '0.00',
	`max_discount` decimal(10,2),
	`usage_limit` int,
	`used_count` int DEFAULT 0,
	`expiry_date` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `credit_notes` (
	`id` char(36) NOT NULL,
	`note_number` varchar(50) NOT NULL,
	`invoice_id` char(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`reason` text,
	`status` varchar(50) DEFAULT 'issued',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `credit_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_notes_note_number_unique` UNIQUE(`note_number`)
);
--> statement-breakpoint
CREATE TABLE `currency_rates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`currency_code` varchar(10) NOT NULL,
	`rate` decimal(18,6) NOT NULL,
	`effective_date` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `currency_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` char(36) NOT NULL,
	`user_id` char(36),
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100),
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`gender` varchar(20),
	`date_of_birth` timestamp,
	`country` varchar(100),
	`city` varchar(100),
	`address` text,
	`profile_image` text,
	`status` varchar(20) DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` char(36) NOT NULL,
	`seller_id` char(36),
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`min_purchase` decimal(10,2) DEFAULT '0.00',
	`status` varchar(50) DEFAULT 'active',
	`apply_to` varchar(50) DEFAULT 'all',
	`category_id` char(36),
	`product_ids` json,
	`start_date` timestamp,
	`end_date` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `discounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`mail_driver` varchar(50) DEFAULT 'smtp',
	`mail_host` varchar(255) NOT NULL,
	`mail_port` int DEFAULT 587,
	`mail_username` varchar(255) NOT NULL,
	`mail_password` varchar(255) NOT NULL,
	`mail_encryption` varchar(20) DEFAULT 'tls',
	`from_email` varchar(255) NOT NULL,
	`from_name` varchar(255) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `email_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`variables` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_templates_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `filter_values` (
	`id` char(36) NOT NULL,
	`filter_id` char(36) NOT NULL,
	`value` varchar(255) NOT NULL,
	`labels` json,
	`display_order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `filter_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `filters` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`display_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`labels` json,
	`category_id` char(36),
	`is_filterable` boolean DEFAULT false,
	`is_attribute` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `filters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gateway_configs` (
	`id` char(36) NOT NULL,
	`gateway_id` char(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`environment` varchar(20) DEFAULT 'sandbox',
	CONSTRAINT `gateway_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gateway_rules` (
	`id` char(36) NOT NULL,
	`gateway_id` char(36) NOT NULL,
	`region` varchar(10),
	`currency` varchar(10),
	`user_type` varchar(20),
	CONSTRAINT `gateway_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` char(36) NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`order_id` char(36) NOT NULL,
	`seller_id` char(36) NOT NULL,
	`customer_id` char(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`tax_amount` decimal(10,2) DEFAULT '0.00',
	`status` varchar(50) DEFAULT 'unpaid',
	`due_date` timestamp,
	`paid_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` char(36) NOT NULL,
	`entity_id` char(36) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`transaction_type` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`balance` decimal(10,2) NOT NULL,
	`reference_id` char(36),
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ledgers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `localizations` (
	`id` char(36) NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`translations` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `localizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `localizations_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` char(36) NOT NULL,
	`user_id` char(36),
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) DEFAULT 'info',
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`product_id` char(36) NOT NULL,
	`seller_id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`original_price` decimal(10,2) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	`shipped_quantity` int DEFAULT 0,
	`returned_quantity` int DEFAULT 0,
	`size` varchar(50),
	`color` varchar(50),
	`status` varchar(50) DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`status` varchar(50) NOT NULL,
	`comment` text,
	`changed_by` char(36),
	`processed_by_role` varchar(50),
	`processed_by_name` varchar(255),
	`processed_by_id` char(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `order_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` char(36) NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`customer_id` char(36) NOT NULL,
	`customer_email` varchar(255) NOT NULL,
	`total_amount` decimal(10,2) NOT NULL,
	`tax_amount` decimal(10,2) DEFAULT '0.00',
	`discount_amount` decimal(10,2) DEFAULT '0.00',
	`currency` varchar(10) DEFAULT 'PKR',
	`status` varchar(50) DEFAULT 'pending',
	`payment_status` varchar(50) DEFAULT 'pending',
	`payment_method` varchar(50),
	`shipping_address` json NOT NULL,
	`billing_address` json,
	`notes` text,
	`source` varchar(50) DEFAULT 'website',
	`created_by` char(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` char(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `payment_gateways` (
	`id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(50) NOT NULL,
	`type` varchar(50) NOT NULL,
	`status` boolean DEFAULT true,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payment_gateways_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_gateways_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` char(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`instructions` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` char(36) NOT NULL,
	`transaction_id` char(36) NOT NULL,
	`gateway_response` json,
	`payment_status` varchar(50),
	`payment_method` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricelists` (
	`id` char(36) NOT NULL,
	`seller_id` char(36),
	`name` varchar(255) NOT NULL,
	`description` text,
	`currency` varchar(10) DEFAULT 'PKR',
	`items` json,
	`is_active` boolean DEFAULT true,
	`is_global` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `pricelists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_attributes` (
	`id` char(36) NOT NULL,
	`product_id` char(36) NOT NULL,
	`attribute_id` char(36) NOT NULL,
	`value_id` char(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `product_attributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_filter_values` (
	`id` char(36) NOT NULL,
	`product_id` char(36) NOT NULL,
	`filter_id` char(36) NOT NULL,
	`value_id` char(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `product_filter_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`brand_id` char(36),
	`parent_category_id` char(36),
	`category_id` char(36),
	`seller_id` char(36),
	`sku` varchar(255),
	`pricelist_id` char(36),
	`tax_rule_id` char(36),
	`price` decimal(10,2) NOT NULL,
	`discount` int DEFAULT 0,
	`description` text,
	`images` json NOT NULL,
	`sizes` json,
	`colors` json,
	`tags` json,
	`dynamic_filters` json,
	`attributes` json,
	`stock` int DEFAULT 0,
	`status` varchar(50) DEFAULT 'published',
	`is_featured` boolean DEFAULT false,
	`is_new` boolean DEFAULT true,
	`rating` decimal(2,1) DEFAULT '0.0',
	`num_reviews` int DEFAULT 0,
	`gender` varchar(50),
	`type` varchar(50),
	`subcategory` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` char(36) NOT NULL,
	`seller_id` char(36),
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`min_purchase` decimal(10,2) DEFAULT '0.00',
	`buy_quantity` int,
	`get_quantity` int,
	`min_quantity` int DEFAULT 1,
	`apply_to` varchar(50) DEFAULT 'all',
	`product_ids` json,
	`category_id` char(36),
	`start_date` timestamp,
	`end_date` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`return_id` char(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`order_item_id` char(36) NOT NULL,
	`reason` text NOT NULL,
	`status` varchar(50) DEFAULT 'requested',
	`refund_amount` decimal(10,2),
	`images` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`is_system` boolean DEFAULT false,
	`permissions` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seller_applications` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`business_data` json NOT NULL,
	`category` varchar(100),
	`custom_category` varchar(100),
	`company_name` varchar(255),
	`registration_number` varchar(100),
	`tax_id` varchar(100),
	`address_line1` text,
	`city` varchar(100),
	`state` varchar(100),
	`postal_code` varchar(20),
	`country_code` varchar(10),
	`company_phone` varchar(50),
	`company_email` varchar(255),
	`brands` json,
	`overview_document_url` varchar(500),
	`status` varchar(50) DEFAULT 'pending',
	`admin_notes` text,
	`reviewed_by` char(36),
	`reviewed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `seller_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seo` (
	`id` char(36) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` char(36) NOT NULL,
	`entity_name` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`keywords` text,
	`slug` varchar(255) NOT NULL,
	`canonical_url` text,
	`og_image` text,
	`robots` varchar(100) DEFAULT 'index, follow',
	`structured_data` text,
	`status` varchar(50) DEFAULT 'active',
	`seo_score` decimal(5,2),
	`last_updated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `seo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` char(36) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` json NOT NULL,
	`description` text,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`seller_id` char(36),
	`carrier` varchar(100),
	`tracking_number` varchar(100),
	`tracking_url` text,
	`estimated_delivery` timestamp,
	`status` varchar(50) DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_rules` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`rate` decimal(5,2) NOT NULL,
	`type` varchar(50) DEFAULT 'percentage',
	`state` varchar(100),
	`country` varchar(100) DEFAULT 'Pakistan',
	`pricelist_id` char,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `tax_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` char(36) NOT NULL,
	`order_id` varchar(100) NOT NULL,
	`gateway_id` char(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'PKR',
	`status` varchar(50) DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`password` text,
	`role` varchar(50) DEFAULT 'user',
	`permissions` json,
	`status` varchar(50) DEFAULT 'active',
	`reset_token` varchar(255),
	`reset_token_expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
