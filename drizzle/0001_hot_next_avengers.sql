CREATE TABLE `refund_requests` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`reason` text NOT NULL,
	`proof_images` json,
	`payment_proof` text,
	`refund_method` varchar(100),
	`status` varchar(50) DEFAULT 'pending',
	`admin_note` text,
	`requested_at` timestamp DEFAULT (now()),
	`resolved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `refund_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `price_after_tax` decimal(10,2);--> statement-breakpoint
ALTER TABLE `tax_rules` ADD `tax_type` varchar(50) DEFAULT 'exclusive';