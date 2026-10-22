<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/auth/farmer-login.php');
}

$mobile   = clean($_POST['mobile']);
$password = $_POST['password'];

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE mobile = ? AND role = 'farmer' LIMIT 1");
mysqli_stmt_bind_param($stmt, "s", $mobile);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

if (!$user || !password_verify($password, $user['password'])) {
    set_message('Invalid mobile number or password.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-login.php');
}

if ((int)$user['is_verified'] !== 1) {
    set_message('Please verify your mobile number via OTP before logging in.', 'warning');
    redirect(BASE_URL . 'frontend/auth/farmer-login.php');
}

if ($user['status'] === 'pending') {
    set_message('Your account is awaiting Admin approval. Please check back later.', 'warning');
    redirect(BASE_URL . 'frontend/auth/farmer-login.php');
}

if ($user['status'] === 'rejected') {
    set_message('Your farmer application was rejected by Admin. Please contact support.', 'danger');
    redirect(BASE_URL . 'frontend/auth/farmer-login.php');
}

// Login success
$_SESSION['user_id'] = $user['id'];
$_SESSION['name']    = $user['name'];
$_SESSION['role']    = 'farmer';

redirect(BASE_URL . 'frontend/farmer/dashboard.php');
