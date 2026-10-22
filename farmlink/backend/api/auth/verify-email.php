<?php
/**
 * POST /backend/api/auth/verify-email.php
 * Body: { token?, otp?, email, idToken? }
 *
 * Verifies email via:
 * 1. FarmLink 1-click token (from email link)
 * 2. FarmLink 6-digit OTP code
 * 3. Firebase ID token (legacy fallback)
 *
 * UPON SUCCESSFUL VERIFICATION:
 * Moves record from pending_registrations into users table (email_verified=1, is_verified=1).
 * Only verified emails are stored in the users database.
 */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../config/firebase-config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);

$body = json_body();
$email = clean($body['email'] ?? '');
$token = trim($body['token'] ?? '');
$otp = trim($body['otp'] ?? '');
$idToken = trim($body['idToken'] ?? '');

if ($email === '') {
    json_fail('Email address is required.');
}

$pending = null;

// Case 1: Verification using FarmLink Token (from emailed link)
if ($token !== '') {
    $stmt = mysqli_prepare($conn, "
        SELECT * FROM pending_registrations 
        WHERE token = ? AND LOWER(email) = LOWER(?) AND status = 'pending' AND expires_at > NOW() 
        LIMIT 1
    ");
    mysqli_stmt_bind_param($stmt, "ss", $token, $email);
    mysqli_stmt_execute($stmt);
    $pending = mysqli_stmt_get_result($stmt)->fetch_assoc();
}

// Case 2: Verification using 6-Digit OTP Code
if (!$pending && $otp !== '') {
    $stmt = mysqli_prepare($conn, "
        SELECT * FROM pending_registrations 
        WHERE otp_code = ? AND LOWER(email) = LOWER(?) AND status = 'pending' AND expires_at > NOW() 
        LIMIT 1
    ");
    mysqli_stmt_bind_param($stmt, "ss", $otp, $email);
    mysqli_stmt_execute($stmt);
    $pending = mysqli_stmt_get_result($stmt)->fetch_assoc();
}

// Case 3: Legacy Firebase ID Token
if (!$pending && $idToken !== '') {
    $claims = verify_firebase_id_token($idToken);
    if ($claims !== null) {
        $firebaseEmail = strtolower($claims['email'] ?? '');
        if ($firebaseEmail !== '' && $firebaseEmail === strtolower($email)) {
            // Check pending registrations first
            $stmt = mysqli_prepare($conn, "
                SELECT * FROM pending_registrations 
                WHERE LOWER(email) = LOWER(?) AND status = 'pending' 
                LIMIT 1
            ");
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            $pending = mysqli_stmt_get_result($stmt)->fetch_assoc();
        }
    }
}

// If no pending registration record matched
if (!$pending) {
    // Check if account already exists and is already verified in users
    $chkUser = mysqli_prepare($conn, "SELECT id, name, role, email_verified, status FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
    mysqli_stmt_bind_param($chkUser, "s", $email);
    mysqli_stmt_execute($chkUser);
    $alreadyUser = mysqli_stmt_get_result($chkUser)->fetch_assoc();

    if ($alreadyUser && $alreadyUser['email_verified']) {
        json_fail('This email is already verified. Please log in.', 409);
    }

    json_fail('Invalid or expired verification code / link. Please check your code or register again.', 400);
}

// 5. ONLY VERIFIED GMAIL IS STORED TO DATABASE (users table)
$role = $pending['role'];
$name = $pending['name'];
$mobile = $pending['mobile'];
$emailVal = $pending['email'];
$hash = $pending['password_hash'];
$aadhaar = $pending['aadhaar'];

// Farmers require admin approval; buyers are auto-approved upon email verification
$userStatus = ($role === 'farmer') ? 'pending' : 'approved';

$insertUser = mysqli_prepare($conn, "
    INSERT INTO users (name, mobile, email, password, aadhaar, role, is_verified, email_verified, status)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
");
mysqli_stmt_bind_param(
    $insertUser,
    "sssssss",
    $name,
    $mobile,
    $emailVal,
    $hash,
    $aadhaar,
    $role,
    $userStatus
);

if (!mysqli_stmt_execute($insertUser)) {
    $err = mysqli_error($conn);
    if (strpos($err, 'Duplicate') !== false) {
        json_fail('This email or mobile is already registered in FarmLink. Please log in.', 409);
    }
    json_fail('Failed to activate account in database. Please try again.', 500);
}

$newUserId = mysqli_insert_id($conn);

// Clean up pending registration
$delPending = mysqli_prepare($conn, "DELETE FROM pending_registrations WHERE id = ?");
mysqli_stmt_bind_param($delPending, "i", $pending['id']);
mysqli_stmt_execute($delPending);

unset($_SESSION['pending_registration_id'], $_SESSION['pending_email'], $_SESSION['pending_token']);

// If farmer, they need admin approval before logging in
if ($role === 'farmer') {
    json_ok([
        'email_verified' => true,
        'verified' => true,
        'requires_approval' => true,
        'role' => 'farmer',
        'message' => 'Email verified successfully! Your farmer application is now submitted for admin review.',
    ]);
}

// If buyer, log in automatically
$_SESSION['user_id'] = $newUserId;
$_SESSION['role'] = 'buyer';
$_SESSION['name'] = $name;

json_ok([
    'email_verified' => true,
    'verified' => true,
    'requires_approval' => false,
    'role' => 'buyer',
    'user' => [
        'id' => $newUserId,
        'name' => $name,
        'role' => 'buyer',
    ],
    'message' => 'Email verified successfully! Welcome to FarmLink.',
]);
