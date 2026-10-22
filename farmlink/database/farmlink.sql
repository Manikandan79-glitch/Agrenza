-- =========================================================
-- FarmLink Database Schema
-- Import this file in phpMyAdmin (WAMP) to create the DB
-- =========================================================

CREATE DATABASE IF NOT EXISTS farmlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmlink;

-- ---------------------------------------------------------
-- Table: users  (Farmers, Buyers, Admin all stored here)
-- ---------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    aadhaar VARCHAR(20) DEFAULT NULL,
    role ENUM('farmer','buyer','admin') NOT NULL,
    is_verified TINYINT(1) DEFAULT 0,        -- OTP verified
    status ENUM('pending','approved','rejected') DEFAULT 'pending', -- admin approval (farmers)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table: categories
-- ---------------------------------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

INSERT INTO categories (name) VALUES
('Vegetables'), ('Fruits'), ('Grains & Cereals'), ('Pulses'), ('Spices'), ('Dairy');

-- ---------------------------------------------------------
-- Table: products
-- ---------------------------------------------------------
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    stock_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    image VARCHAR(255) DEFAULT NULL,
    description TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table: orders
-- ---------------------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_mode ENUM('cod','online') DEFAULT 'cod',
    status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table: order_items
-- ---------------------------------------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    farmer_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    item_status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (farmer_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table: bulk_requests
-- ---------------------------------------------------------
CREATE TABLE bulk_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    remark VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Default Admin account
-- Mobile: 9999999999   Password: admin123
-- The admin account is auto-created by PHP (backend/config/db.php)
-- the first time the app runs, using password_hash() so the hash is
-- always valid for the PHP version on your machine. No manual
-- INSERT is needed here.
-- ---------------------------------------------------------
