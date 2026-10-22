<?php
/** POST /backend/api/orders/update-item-status.php   Body: { item_id, status } */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('farmer');

$body = json_body();
$itemId = (int) ($body['item_id'] ?? 0);
$status = $body['status'] ?? '';
$farmerId = (int) $_SESSION['user_id'];

$allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
if (!in_array($status, $allowed, true)) json_fail('Invalid status.');

$stmt = mysqli_prepare($conn, "UPDATE order_items SET item_status = ? WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($stmt, "sii", $status, $itemId, $farmerId);
mysqli_stmt_execute($stmt);

if (mysqli_stmt_affected_rows($stmt) === 0) json_fail('Order item not found.', 404);

json_ok(['updated' => true]);
