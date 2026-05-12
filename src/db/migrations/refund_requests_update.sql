ALTER TABLE `refund_requests`
  ADD COLUMN IF NOT EXISTS `confirmation_receipt` LONGTEXT NULL AFTER `admin_note`;
