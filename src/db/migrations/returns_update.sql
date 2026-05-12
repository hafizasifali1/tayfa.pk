-- Migration: Update returns table for simplified return request flow
-- Run this once against the tayfa database

ALTER TABLE `returns`
  MODIFY COLUMN `user_id`      CHAR(36)         NULL,
  MODIFY COLUMN `reason`       LONGTEXT         NULL,
  MODIFY COLUMN `return_method` VARCHAR(100)    NULL,
  ADD COLUMN IF NOT EXISTS `order_item_id`    CHAR(36)        NULL AFTER `order_id`,
  ADD COLUMN IF NOT EXISTS `receipt_confirmed` TINYINT(1)     NOT NULL DEFAULT 0 AFTER `return_method`;
