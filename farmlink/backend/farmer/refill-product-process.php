<?php
/**
 * POST /backend/farmer/refill-product-process.php
 * Form submission endpoint for PHP farmer dashboard product refill
 */
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('farmer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/farmer/my-products.php', 'Invalid request method.', 'danger');
}

$farmerId = (int) $_SESSION['user_id'];
$id = (int) ($_POST['id'] ?? 0);
$refillKg = (float) ($_POST['refill_kg'] ?? 0);

if ($id <= 0 || $refillKg <= 0) {
    redirect(BASE_URL . 'frontend/farmer/my-products.php', 'Please enter a valid refill amount.', 'warning');
}

$stmt = mysqli_prepare($conn, "SELECT id, name, stock_kg FROM products WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($stmt, "ii", $id, $farmerId);
mysqli_stmt_execute($stmt);
$product = mysqli_stmt_get_result($stmt)->fetch_assoc();

if (!$product) {
    redirect(BASE_URL . 'frontend/farmer/my-products.php', 'Product not found.', 'danger');
}

$newStock = round((float)$product['stock_kg'] + $refillKg, 2);

$update = mysqli_prepare($conn, "UPDATE products SET stock_kg = ?, status = 'active' WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($update, "dii", $newStock, $id, $farmerId);
mysqli_stmt_execute($update);

redirect(BASE_URL . 'frontend/farmer/my-products.php', "Successfully refilled {$product['name']} (+{$refillKg} kg)! New stock: {$newStock} kg.", 'success');
