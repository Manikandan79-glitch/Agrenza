<?php
/**
 * POST /backend/api/products/refill.php
 * Quick stock refill / restock for farmers.
 * Payload: { id: int, refill_kg: float, action?: 'add' | 'set', note?: string }
 */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('farmer');

$body = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$id = (int) ($body['id'] ?? 0);
$refillKg = (float) ($body['refill_kg'] ?? 0);
$action = ($body['action'] ?? 'add') === 'set' ? 'set' : 'add';
$farmerId = (int) $_SESSION['user_id'];

if ($id <= 0) {
    json_fail('Invalid product ID.', 422);
}

if ($refillKg <= 0 && $action === 'add') {
    json_fail('Please enter a valid refill quantity greater than 0 kg.', 422);
}

if ($refillKg < 0 && $action === 'set') {
    json_fail('Stock cannot be negative.', 422);
}

// Check product exists and belongs to this farmer
$check = mysqli_prepare($conn, "SELECT id, name, stock_kg, status, approval_status FROM products WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($check, "ii", $id, $farmerId);
mysqli_stmt_execute($check);
$product = mysqli_stmt_get_result($check)->fetch_assoc();

if (!$product) {
    json_fail('Product not found or access denied.', 404);
}

$oldStock = (float) $product['stock_kg'];
$newStock = ($action === 'set') ? $refillKg : round($oldStock + $refillKg, 2);

// If stock is added and product was inactive or out of stock, activate it
$newStatus = ($newStock > 0) ? 'active' : $product['status'];

$update = mysqli_prepare($conn, "UPDATE products SET stock_kg = ?, status = ? WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($update, "dsii", $newStock, $newStatus, $id, $farmerId);
mysqli_stmt_execute($update);

json_ok([
    'refilled' => true,
    'product_id' => $id,
    'product_name' => $product['name'],
    'old_stock' => $oldStock,
    'refill_amount' => ($action === 'set') ? ($newStock - $oldStock) : $refillKg,
    'new_stock' => $newStock,
    'status' => $newStatus,
    'message' => "Successfully refilled {$product['name']}! New stock is {$newStock} kg.",
]);
