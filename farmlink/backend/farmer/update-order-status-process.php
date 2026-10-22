<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('farmer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/farmer/orders.php');
}

$farmerId = (int) $_SESSION['user_id'];
$itemId   = (int) $_POST['item_id'];
$allowedStatus = ['pending','confirmed','shipped','delivered','cancelled'];
$status   = in_array($_POST['status'], $allowedStatus) ? $_POST['status'] : 'pending';

// Ensure this order item belongs to the logged in farmer
$check = mysqli_query($conn, "SELECT id FROM order_items WHERE id = $itemId AND farmer_id = $farmerId LIMIT 1");
if (mysqli_num_rows($check) === 0) {
    set_message('Order item not found or access denied.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/orders.php');
}

$stmt = mysqli_prepare($conn, "UPDATE order_items SET item_status = ? WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($stmt, "sii", $status, $itemId, $farmerId);

if (mysqli_stmt_execute($stmt)) {
    set_message('Order status updated.', 'success');
} else {
    set_message('Failed to update status.', 'danger');
}
redirect(BASE_URL . 'frontend/farmer/orders.php');
