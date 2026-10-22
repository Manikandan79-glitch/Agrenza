<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_once __DIR__ . '/../helpers/otp.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/auth/farmer-register.php');
}

$name     = clean($_POST['name']);
$mobile   = clean($_POST['mobile']);
$aadhaar  = clean($_POST['aadhaar']);
$password = $_POST['password'];
$confirm  = $_POST['confirm_password'];

if (strlen($mobile) !== 10 || !ctype_digit($mobile)) {
    set_message('Please enter a valid 10 digit mobile number.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-register.php');
}
if (strlen($aadhaar) !== 12 || !ctype_digit($aadhaar)) {
    set_message('Please enter a valid 12 digit Aadhaar number.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-register.php');
}
if ($password !== $confirm) {
    set_message('Passwords do not match.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-register.php');
}

// Check duplicate mobile
$check = mysqli_query($conn, "SELECT id FROM users WHERE mobile = '$mobile'");
if (mysqli_num_rows($check) > 0) {
    set_message('This mobile number is already registered.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-register.php');
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conn, "INSERT INTO users (name, mobile, aadhaar, password, role, is_verified, status) VALUES (?, ?, ?, ?, 'farmer', 0, 'pending')");
mysqli_stmt_bind_param($stmt, "ssss", $name, $mobile, $aadhaar, $hashedPassword);

if (mysqli_stmt_execute($stmt)) {
    $userId = mysqli_insert_id($conn);
    $_SESSION['pending_user_id'] = $userId;
    $_SESSION['pending_role'] = 'farmer';

    // Generate dummy OTP (simulated SMS)
    $otp = generate_otp($mobile);
    $_SESSION['demo_otp_display'] = $otp; // shown on screen for demo purposes only

    redirect(BASE_URL . 'frontend/auth/verify-otp.php');
} else {
    set_message('Registration failed. Please try again.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-register.php');
}
