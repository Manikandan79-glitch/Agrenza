<?php
/**
 * POST /backend/api/admin/update-order-status.php
 * Admin Master Order Lifecycle Control.
 * Only Admin can update shipping, packing, travel/transit, and delivery stages.
 * Body: { order_id: int, status: string, tracking_note?: string }
 */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$body = json_body();
$orderId = (int) ($body['order_id'] ?? 0);
$status = clean($body['status'] ?? '');
$trackingNote = clean($body['tracking_note'] ?? '');

$allowed = ['pending', 'packing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
if (!in_array($status, $allowed, true)) {
    json_fail('Invalid order status.', 422);
}

if ($orderId <= 0) {
    json_fail('Invalid order ID.', 422);
}

// Check order exists
$check = mysqli_prepare($conn, "SELECT id, buyer_id, status FROM orders WHERE id = ?");
mysqli_stmt_bind_param($check, "i", $orderId);
mysqli_stmt_execute($check);
$order = mysqli_stmt_get_result($check)->fetch_assoc();

if (!$order) {
    json_fail('Order not found.', 404);
}

// Update order status and tracking note
if ($trackingNote !== '') {
    $stmt = mysqli_prepare($conn, "UPDATE orders SET status = ?, tracking_note = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "ssi", $status, $trackingNote, $orderId);
} else {
    $stmt = mysqli_prepare($conn, "UPDATE orders SET status = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $status, $orderId);
}
mysqli_stmt_execute($stmt);

// Also sync item_status on order_items
$itemStmt = mysqli_prepare($conn, "UPDATE order_items SET item_status = ? WHERE order_id = ?");
mysqli_stmt_bind_param($itemStmt, "si", $status, $orderId);
mysqli_stmt_execute($itemStmt);

json_ok([
    'updated' => true,
    'order_id' => $orderId,
    'status' => $status,
    'tracking_note' => $trackingNote,
    'message' => "Order #{$orderId} status successfully updated to " . strtoupper(str_replace('_', ' ', $status)),
]);
