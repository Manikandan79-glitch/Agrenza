<?php
/**
 * POST /backend/api/auth/verify-otp.php
 * Body: { idToken: "<Firebase ID token>", mobile: "9876543210" }
 *
 * The Next.js client already ran the real SMS-OTP challenge with Firebase
 * Phone Auth (see app/lib/otp.ts::confirmMobileOtp) and got back a signed
 * ID token — this endpoint verifies that token server-side (so a forged
 * token can't be used to fake verification), checks its phone number
 * matches the pending registration, then marks is_verified = 1 and logs
 * the user in.
 */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../config/firebase-config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
if (!isset($_SESSION['pending_user_id'])) json_fail('No pending verification. Please register again.', 400);

$body = json_body();
$idToken = trim($body['idToken'] ?? '');
$mobile = clean($body['mobile'] ?? '');

if ($idToken === '') json_fail('Missing verification token.');

$claims = verify_firebase_id_token($idToken);
if ($claims === null) json_fail('Invalid or expired OTP session. Please try again.');

// Firebase returns phone numbers as E.164 (+91XXXXXXXXXX) — compare the
// last 10 digits against what the user is registering.
$firebasePhone = $claims['phone_number'] ?? '';
$firebaseDigits = substr(preg_replace('/\D/', '', $firebasePhone), -10);
$expectedMobile = $mobile !== '' ? $mobile : ($_SESSION['pending_mobile'] ?? '');

if ($firebaseDigits === '' || $firebaseDigits !== $expectedMobile) {
    json_fail('The verified number does not match this registration.');
}

$userId = (int) $_SESSION['pending_user_id'];
$stmt = mysqli_prepare($conn, "UPDATE users SET is_verified = 1, firebase_uid = ? WHERE id = ?");
mysqli_stmt_bind_param($stmt, "si", $claims['uid'], $userId);
mysqli_stmt_execute($stmt);

$res = mysqli_prepare($conn, "SELECT id, name, role, status FROM users WHERE id = ?");
mysqli_stmt_bind_param($res, "i", $userId);
mysqli_stmt_execute($res);
$user = mysqli_stmt_get_result($res)->fetch_assoc();

unset($_SESSION['pending_user_id'], $_SESSION['pending_mobile']);

if (!$user) json_fail('User not found.', 404);

if ($user['role'] === 'farmer' && $user['status'] !== 'approved') {
    // Verified, but still needs admin approval before dashboard access.
    json_ok(['verified' => true, 'requires_approval' => true]);
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];
$_SESSION['name'] = $user['name'];

json_ok(['verified' => true, 'requires_approval' => false, 'user' => [
    'id' => $user['id'], 'name' => $user['name'], 'role' => $user['role'],
]]);
