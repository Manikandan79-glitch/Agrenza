<?php
/**
 * FarmLink JSON API bootstrap
 * -----------------------------------------------------------------
 * Standardized bootstrap for JSON API endpoints
 */
if (ob_get_level() === 0) {
    ob_start();
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';

// ---- CORS: allow the Next.js dev server to call this with cookies ----
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:80',
    'http://127.0.0.1:80',
    'http://localhost',
    'http://127.0.0.1'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
// Clean origin if from referer
if (!empty($origin) && strpos($origin, 'http') === 0) {
    $parsed = parse_url($origin);
    $originHost = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . (isset($parsed['port']) ? ':' . $parsed['port'] : '');
    if (in_array($originHost, $allowedOrigins, true) || preg_match('/^https:\/\/[a-zA-Z0-9\-_.]*\.vercel\.app$/', $originHost)) {
        header("Access-Control-Allow-Origin: $originHost");
    } else {
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

// Preflight requests end here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (ob_get_length()) ob_clean();
    http_response_code(204);
    exit;
}

/** Send a JSON success response and stop. */
function json_ok($data = [], int $code = 200) {
    if (ob_get_length()) ob_clean();
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true] + (is_array($data) ? $data : ['data' => $data]));
    exit;
}

/** Send a JSON error response and stop. */
function json_fail(string $message, int $code = 400) {
    if (ob_get_length()) ob_clean();
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

/** Decode a JSON request body into an assoc array (falls back to $_POST for multipart/form). */
function json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

/** Require an authenticated session with a specific role, or fail with 401/403. */
function require_json_role(string $role) {
    if (!is_logged_in()) json_fail("Authentication required. Please log in as a {$role} to continue.", 401);
    if (current_role() !== $role) json_fail("Access denied: Only {$role} accounts are authorized to perform this action.", 403);
}

/** Require any authenticated session. */
function require_json_login() {
    if (!is_logged_in()) json_fail('Not logged in. Please log in first.', 401);
}
