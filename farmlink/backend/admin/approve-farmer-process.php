<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_admin();

$farmerId = (int) ($_GET['id'] ?? 0);

$check = mysqli_query($conn, "SELECT id FROM users WHERE id = $farmerId AND role = 'farmer' LIMIT 1");
if (mysqli_num_rows($check) === 0) {
    set_message('Farmer not found.', 'danger');
    redirect(BASE_URL . 'frontend/admin/farmers.php');
}

mysqli_query($conn, "UPDATE users SET status = 'approved' WHERE id = $farmerId AND role = 'farmer'");
set_message('Farmer approved successfully. They can now login and start selling.', 'success');
redirect(BASE_URL . 'frontend/admin/farmers.php');
