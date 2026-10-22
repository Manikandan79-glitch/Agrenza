<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('buyer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/buyer/home.php');
}

$buyerId   = (int) $_SESSION['user_id'];
$productId = (int) $_POST['product_id'];
$qty       = (float) $_POST['quantity_kg'];
$reason    = clean($_POST['reason']);

if ($qty < 11) {
    set_message('Bulk requests must be for more than 10 kg.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/bulk-request.php?product_id=' . $productId);
}
if ($reason === '') {
    set_message('Please provide a reason for the bulk request.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/bulk-request.php?product_id=' . $productId);
}

$stmt = mysqli_prepare($conn, "INSERT INTO bulk_requests (buyer_id, product_id, quantity_kg, reason, status) VALUES (?,?,?,?, 'pending')");
mysqli_stmt_bind_param($stmt, "iids", $buyerId, $productId, $qty, $reason);

if (mysqli_stmt_execute($stmt)) {
    set_message('Bulk request submitted! You will be notified once Admin reviews it.', 'success');
} else {
    set_message('Failed to submit bulk request.', 'danger');
}
redirect(BASE_URL . 'frontend/buyer/my-orders.php');
