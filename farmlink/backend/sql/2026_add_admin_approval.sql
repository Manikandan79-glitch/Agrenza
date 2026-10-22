-- ============================================================
-- FarmLink — Admin approval workflow migration
-- Run this ONCE against your existing `farmlink` database
-- (phpMyAdmin -> farmlink -> SQL tab -> paste -> Go).
-- ============================================================

USE farmlink;

-- Products now need admin approval before they show up in the public
-- Shop. Farmers can still see their own products (any status) on the
-- "My Products" page.
ALTER TABLE products
  ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER status,
  ADD COLUMN admin_remark VARCHAR(255) NULL DEFAULT NULL AFTER approval_status;

-- Existing products (added before this migration) are auto-approved so
-- your current Shop listing doesn't go empty after you run this.
UPDATE products SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Optional remark for why a farmer signup was rejected (shown to admin later).
ALTER TABLE users
  ADD COLUMN admin_remark VARCHAR(255) NULL DEFAULT NULL AFTER status;
