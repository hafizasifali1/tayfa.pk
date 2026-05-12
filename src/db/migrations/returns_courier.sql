-- Migration: Add courier_slip and courier_id to returns table
-- Run once against the tayfa database after returns_update.sql

ALTER TABLE `returns`
  ADD COLUMN IF NOT EXISTS `courier_slip` LONGTEXT NULL AFTER `admin_note`,
  ADD COLUMN IF NOT EXISTS `courier_id`   VARCHAR(255) NULL AFTER `courier_slip`;
