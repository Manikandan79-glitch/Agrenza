<?php
/**
 * POST /backend/api/auth/login.php
 * Body: { role: "buyer"|"farmer"|"admin", email, password }
 *
 * Login now uses EMAIL + password (mobile SMS OTP needs a paid Firebase
 * Blaze plan, so email is the primary identity/verification method).
 */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);

$body = json_body();
$role = $body['role'] ?? '';
$email = strtolower(clean($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if (!in_array($role, ['buyer', 'farmer', 'admin'], true)) json_fail('Invalid role.');
if (empty($email)) json_fail('Enter your email or mobile number.');

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE (LOWER(email) = ? OR mobile = ?) AND role = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "sss", $email, $email, $role);
mysqli_stmt_execute($stmt);
$user = mysqli_stmt_get_result($stmt)->fetch_assoc();

if (!$user) {
    $chkPending = mysqli_prepare($conn, "SELECT id, email FROM pending_registrations WHERE (LOWER(email) = ? OR mobile = ?) AND role = ? LIMIT 1");
    mysqli_stmt_bind_param($chkPending, "sss", $email, $email, $role);
    mysqli_stmt_execute($chkPending);
    $pendUser = mysqli_stmt_get_result($chkPending)->fetch_assoc();
    if ($pendUser) {
        json_fail('Your email is pending verification. Please check your Gmail for your verification code and password.', 403);
    }
    json_fail('Incorrect email or password.', 401);
}

$passwordMatches = password_verify($password, $user['password']) || ($user['password'] === $password) || (md5($password) === $user['password']);

if (!$passwordMatches) {
    json_fail('Incorrect email or password.', 401);
}

// Re-hash to strong bcrypt if plain text or md5
if ($user['password'] === $password || md5($password) === $user['password']) {
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    $upStmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?");
    mysqli_stmt_bind_param($upStmt, "si", $newHash, $user['id']);
    mysqli_stmt_execute($upStmt);
    mysqli_stmt_close($upStmt);
}

if ($role !== 'admin' && !$user['is_verified']) {
    json_fail('Please verify your email first (check your inbox for the verification link).', 403);
}
if ($role === 'farmer' && $user['status'] === 'pending') {
    json_fail('Your account is awaiting admin approval.', 403);
}
if ($role === 'farmer' && $user['status'] === 'rejected') {
    json_fail('Your farmer application was rejected. Contact support.', 403);
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];
$_SESSION['name'] = $user['name'];

json_ok(['user' => ['id' => $user['id'], 'name' => $user['name'], 'role' => $user['role']]]);
