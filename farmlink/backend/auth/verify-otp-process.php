<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_once __DIR__ . '/../helpers/otp.php';

if (!isset($_SESSION['pending_user_id'])) {
    redirect(BASE_URL . 'index.php');
}

$userId = (int) $_SESSION['pending_user_id'];
$role   = $_SESSION['pending_role'] ?? 'buyer';
$entered = clean($_POST['otp'] ?? '');

$res = mysqli_query($conn, "SELECT * FROM users WHERE id = $userId LIMIT 1");
$user = mysqli_fetch_assoc($res);

if (!$user) {
    redirect(BASE_URL . 'index.php');
}

if (verify_otp($user['mobile'], $entered)) {
    mysqli_query($conn, "UPDATE users SET is_verified = 1 WHERE id = $userId");
    unset($_SESSION['pending_user_id'], $_SESSION['pending_role'], $_SESSION['demo_otp_display']);

    if ($role === 'farmer') {
        set_message('Mobile verified successfully! Your account is now pending Admin approval. You will be able to login once approved.', 'success');
        redirect(BASE_URL . 'frontend/auth/farmer-login.php');
    } else {
        set_message('Mobile verified successfully! You can now login.', 'success');
        redirect(BASE_URL . 'frontend/auth/buyer-login.php');
    }
} else {
    set_message('Invalid or expired OTP. Please try again.', 'danger');
    redirect(BASE_URL . 'frontend/auth/verify-otp.php');
}
