-- Run once against your existing FarmLink database before deploying the
-- Firebase-backed OTP/email verification flow.

ALTER TABLE users
  ADD COLUMN firebase_uid VARCHAR(128) NULL DEFAULT NULL AFTER password,
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER is_verified,
  ADD UNIQUE KEY uniq_firebase_uid (firebase_uid);
