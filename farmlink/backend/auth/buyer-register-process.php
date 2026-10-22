<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_once __DIR__ . '/../helpers/otp.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/auth/buyer-register.php');
}

$name     = clean($_POST['name']);
$mobile   = clean($_POST['mobile']);
$email    = clean($_POST['email'] ?? '');
$password = $_POST['password'];
$confirm  = $_POST['confirm_password'];

if (strlen($mobile) !== 10 || !ctype_digit($mobile)) {
    set_message('Please enter a valid 10 digit mobile number.', 'danger');
    redirect(BASE_URL . 'frontend/auth/buyer-register.php');
}
if ($password !== $confirm) {
    set_message('Passwords do not match.', 'danger');
    redirect(BASE_URL . 'frontend/auth/buyer-register.php');
}

$check = mysqli_query($conn, "SELECT id FROM users WHERE mobile = '$mobile'");
if (mysqli_num_rows($check) > 0) {
    set_message('This mobile number is already registered.', 'danger');
    redirect(BASE_URL . 'frontend/auth/buyer-register.php');
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = mysqli_prepare($conn, "INSERT INTO users (name, mobile, email, password, role, is_verified, status) VALUES (?, ?, ?, ?, 'buyer', 0, 'approved')");
mysqli_stmt_bind_param($stmt, "ssss", $name, $mobile, $email, $hashedPassword);

if (mysqli_stmt_execute($stmt)) {
    $userId = mysqli_insert_id($conn);
    $_SESSION['pending_user_id'] = $userId;
    $_SESSION['pending_role'] = 'buyer';

    $otp = generate_otp($mobile);
    $_SESSION['demo_otp_display'] = $otp;

    redirect(BASE_URL . 'frontend/auth/verify-otp.php');
} else {
    set_message('Registration failed. Please try again.', 'danger');
    redirect(BASE_URL . 'frontend/auth/buyer-register.php');
}
