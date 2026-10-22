-- ============================================================
-- FarmLink — Full Database Schema
-- Reconstructed from backend/api/**/*.php (schema.sql was missing
-- from the project). Includes the Firebase columns from
-- 2026_add_firebase_columns.sql already merged in, so you do NOT
-- need to run that migration file separately after this.
-- ============================================================

CREATE DATABASE IF NOT EXISTS farmlink
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE farmlink;

-- ------------------------------------------------------------
-- users
-- role: buyer | farmer | admin
-- status: pending | approved | rejected  (farmers need approval)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    mobile          VARCHAR(10)     NOT NULL,
    email           VARCHAR(150)    NULL,
    password        VARCHAR(255)    NOT NULL,
    firebase_uid    VARCHAR(128)    NULL DEFAULT NULL,
    aadhaar         VARCHAR(20)     NULL,
    role            ENUM('buyer','farmer','admin') NOT NULL DEFAULT 'buyer',
    is_verified     TINYINT(1)      NOT NULL DEFAULT 0,
    email_verified  TINYINT(1)      NOT NULL DEFAULT 0,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
    admin_remark    VARCHAR(255)    NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_mobile (mobile),
    UNIQUE KEY uniq_email (email),
    UNIQUE KEY uniq_firebase_uid (firebase_uid)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- pending_registrations (staging table: only verified emails enter users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pending_registrations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    mobile          VARCHAR(10)     NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    auto_password   VARCHAR(50)     NULL,
    role            ENUM('buyer','farmer') NOT NULL,
    aadhaar         VARCHAR(20)     NULL,
    token           VARCHAR(64)     NOT NULL UNIQUE,
    otp_code        VARCHAR(6)      NOT NULL,
    status          ENUM('pending','verified','expired') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP       NOT NULL,
    INDEX (email),
    INDEX (mobile),
    INDEX (token),
    INDEX (otp_code)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO categories (name) VALUES
    ('Vegetables'),
    ('Fruits'),
    ('Grains'),
    ('Dairy'),
    ('Spices')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ------------------------------------------------------------
-- products
-- status: active | inactive
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id       INT UNSIGNED NOT NULL,
    category_id     INT UNSIGNED NOT NULL,
    name            VARCHAR(150) NOT NULL,
    base_price      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_per_kg    DECIMAL(10,2) NOT NULL,
    gst_percent     DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    gst_amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    commission_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_kg        DECIMAL(10,2) NOT NULL DEFAULT 0,
    image           VARCHAR(255) NULL,
    description     TEXT NULL,
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    admin_remark    VARCHAR(255) NULL DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_farmer  FOREIGN KEY (farmer_id)   REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- orders
-- payment_mode: cod | online
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id        INT UNSIGNED NOT NULL,
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_mode    ENUM('cod','online') NOT NULL DEFAULT 'cod',
    address         TEXT NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'placed',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- order_items
-- item_status: pending | confirmed | shipped | delivered | cancelled
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED NOT NULL,
    product_id      INT UNSIGNED NOT NULL,
    farmer_id       INT UNSIGNED NOT NULL,
    quantity_kg     DECIMAL(10,2) NOT NULL,
    price_per_kg    DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    item_status     ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_items_farmer  FOREIGN KEY (farmer_id)  REFERENCES users(id)    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bulk_requests
-- status: pending | approved | rejected
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bulk_requests (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id        INT UNSIGNED NOT NULL,
    product_id      INT UNSIGNED NOT NULL,
    quantity_kg     DECIMAL(10,2) NOT NULL,
    reason          TEXT NOT NULL,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    remark          TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bulk_buyer   FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_bulk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;
