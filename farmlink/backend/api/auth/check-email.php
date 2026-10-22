<?php
/**
 * FarmLink — Real-time Email Authenticity & Original vs Fake Checker
 * POST /backend/api/auth/check-email.php
 * GET  /backend/api/auth/check-email.php?email=...
 *
 * Checks:
 * 1. RFC syntax & structure
 * 2. Provider detection (Gmail, Yahoo, Outlook, etc.)
 * 3. Gmail-specific username rules (length 6-30, no consecutive dots)
 * 4. Fake / disposable blacklist (50+ known temporary email domains)
 * 5. Active DNS MX / A records
 * 6. Duplicate check in MySQL users table
 */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../helpers/email_validator.php';

$email = '';
$role = null;
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $email = clean($_GET['email'] ?? '');
    $role = clean($_GET['role'] ?? '');
} else {
    $body = json_body();
    $email = clean($body['email'] ?? '');
    $role = clean($body['role'] ?? '');
}
if ($role === '' || !in_array($role, ['buyer', 'farmer', 'admin'], true)) {
    $role = null;
}

if ($email === '') {
    http_response_code(200);
    echo json_encode([
        'ok' => false,
        'status' => 'empty',
        'is_original' => false,
        'is_duplicate' => false,
        'provider' => null,
        'error' => 'Email address is required.',
        'message' => 'Please enter an email address.'
    ]);
    exit;
}

$res = validate_email_authenticity($email, $conn, null, $role);

http_response_code(200);
echo json_encode($res);
exit;
