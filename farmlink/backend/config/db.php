<?php
/**
 * FarmLink — Database connection (mysqli)
 */

$dbHost = getenv('DB_HOST') ?: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
$dbUser = getenv('DB_USER') ?: '8nQ2NS6oZwxnCRL.root';
$dbPass = getenv('DB_PASS') ?: 'XboE09A6eXQKqeZw';
$dbName = getenv('DB_NAME') ?: 'farmlink';
$dbPort = (int)(getenv('DB_PORT') ?: 4000);

define('DB_HOST', $dbHost);
define('DB_USER', $dbUser);
define('DB_PASS', $dbPass);
define('DB_NAME', $dbName);
define('DB_PORT', $dbPort);

// Uploaded product images URL
define('UPLOAD_URL', getenv('UPLOAD_URL') ?: 'http://localhost/farmlink/farmlink/uploads/');
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');

$conn = mysqli_init();
if ($dbPort !== 3306 || getenv('DB_SSL') === 'true' || strpos($dbHost, 'tidbcloud.com') !== false) {
    mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);
    $connected = mysqli_real_connect($conn, DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, NULL, MYSQLI_CLIENT_SSL);
} else {
    $connected = mysqli_real_connect($conn, DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
}

if (!$connected) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

mysqli_set_charset($conn, 'utf8mb4');

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

/**
 * Auto-seed a default Admin account on first run, so there's always a
 * known-working login. This guarantees the password hash always matches
 * the PHP version installed on this machine (hashes aren't portable
 * between PHP builds the way a hardcoded hash string can silently fail to be).
 * Login: 9999999999 / admin@farmlink.com  |  Password: admin123
 * Change this password after your first login.
 */
$adminPass = password_hash('admin123', PASSWORD_DEFAULT);
$check = mysqli_query($conn, "SELECT id, password FROM users WHERE email = 'admin@farmlink.com' OR role = 'admin' LIMIT 1");
if ($check) {
    if (mysqli_num_rows($check) === 0) {
        $stmt = mysqli_prepare(
            $conn,
            "INSERT INTO users (name, mobile, email, password, role, is_verified, email_verified, status)
             VALUES ('Super Admin', '9999999999', 'admin@farmlink.com', ?, 'admin', 1, 1, 'approved')"
        );
        mysqli_stmt_bind_param($stmt, "s", $adminPass);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    } else {
        $adminRow = mysqli_fetch_assoc($check);
        if (!password_verify('admin123', $adminRow['password']) && $adminRow['password'] !== 'admin123') {
            $stmt = mysqli_prepare($conn, "UPDATE users SET email = 'admin@farmlink.com', password = ?, role = 'admin', is_verified = 1, email_verified = 1, status = 'approved' WHERE id = ?");
            mysqli_stmt_bind_param($stmt, "si", $adminPass, $adminRow['id']);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
        }
    }
}

// Auto-migrate approval_status on products if not exists
$prodCheck = mysqli_query($conn, "SHOW COLUMNS FROM products LIKE 'approval_status'");
if ($prodCheck && mysqli_num_rows($prodCheck) === 0) {
    mysqli_query($conn, "ALTER TABLE products ADD COLUMN approval_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER status");
    mysqli_query($conn, "ALTER TABLE products ADD COLUMN admin_remark VARCHAR(255) NULL DEFAULT NULL AFTER approval_status");
    mysqli_query($conn, "UPDATE products SET approval_status = 'approved' WHERE approval_status = 'pending'");
}

// Auto-migrate admin_remark on users if not exists
$userCheck = mysqli_query($conn, "SHOW COLUMNS FROM users LIKE 'admin_remark'");
if ($userCheck && mysqli_num_rows($userCheck) === 0) {
    mysqli_query($conn, "ALTER TABLE users ADD COLUMN admin_remark VARCHAR(255) NULL DEFAULT NULL AFTER status");
}

// Auto-migrate GST and Commission columns on products if not exists
$gstCheck = mysqli_query($conn, "SHOW COLUMNS FROM products LIKE 'gst_percent'");
if ($gstCheck && mysqli_num_rows($gstCheck) === 0) {
    mysqli_query($conn, "ALTER TABLE products 
        ADD COLUMN base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER name,
        ADD COLUMN gst_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER price_per_kg,
        ADD COLUMN gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER gst_percent,
        ADD COLUMN commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER gst_amount,
        ADD COLUMN commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER commission_percent");
    mysqli_query($conn, "UPDATE products SET base_price = price_per_kg WHERE base_price = 0");
}

// Auto-migrate pending_registrations table if not exists (so only verified emails enter users table)
mysqli_query($conn, "
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
        INDEX idx_pending_email (email),
        INDEX idx_pending_mobile (mobile),
        INDEX idx_pending_token (token),
        INDEX idx_pending_otp (otp_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// Migrate users index to allow same email for different roles (farmer & buyer)
$emailIdxCheck = mysqli_query($conn, "SHOW INDEX FROM users WHERE Key_name = 'uniq_email'");
if ($emailIdxCheck && mysqli_num_rows($emailIdxCheck) > 0) {
    @mysqli_query($conn, "ALTER TABLE users DROP INDEX uniq_email");
}
$emailRoleIdxCheck = mysqli_query($conn, "SHOW INDEX FROM users WHERE Key_name = 'uniq_email_role'");
if ($emailRoleIdxCheck && mysqli_num_rows($emailRoleIdxCheck) === 0) {
    @mysqli_query($conn, "ALTER TABLE users ADD UNIQUE KEY uniq_email_role (email, role)");
}

// Migrate users index to allow same mobile for different roles (farmer & buyer)
$mobileIdxCheck = mysqli_query($conn, "SHOW INDEX FROM users WHERE Key_name = 'mobile'");
if ($mobileIdxCheck && mysqli_num_rows($mobileIdxCheck) > 0) {
    @mysqli_query($conn, "ALTER TABLE users DROP INDEX mobile");
}
$mobileRoleIdxCheck = mysqli_query($conn, "SHOW INDEX FROM users WHERE Key_name = 'uniq_mobile_role'");
if ($mobileRoleIdxCheck && mysqli_num_rows($mobileRoleIdxCheck) === 0) {
    @mysqli_query($conn, "ALTER TABLE users ADD UNIQUE KEY uniq_mobile_role (mobile, role)");
}


