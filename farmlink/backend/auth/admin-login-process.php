<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/auth/admin-login.php');
}

$mobile   = clean($_POST['mobile']);
$password = $_POST['password'];

$stmt = mysqli_prepare($conn, "SELECT * FROM users WHERE mobile = ? AND role = 'admin' LIMIT 1");
mysqli_stmt_bind_param($stmt, "s", $mobile);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

if (!$user || !password_verify($password, $user['password'])) {
    set_message('Invalid admin credentials.', 'danger');
    redirect(BASE_URL . 'frontend/auth/admin-login.php');
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['name']    = $user['name'];
$_SESSION['role']    = 'admin';

redirect(BASE_URL . 'frontend/admin/dashboard.php');
