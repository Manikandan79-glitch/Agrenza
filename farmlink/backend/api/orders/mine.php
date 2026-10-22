<?php
/** GET /backend/api/orders/mine.php — the logged-in buyer's orders */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('buyer');

$buyerId = (int) $_SESSION['user_id'];

$ordersRes = mysqli_prepare($conn, "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC");
mysqli_stmt_bind_param($ordersRes, "i", $buyerId);
mysqli_stmt_execute($ordersRes);
$orders = mysqli_stmt_get_result($ordersRes)->fetch_all(MYSQLI_ASSOC);

$out = [];
foreach ($orders as $o) {
    $itemsStmt = mysqli_prepare($conn, "
        SELECT oi.*, p.name AS product_name FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
    ");
    mysqli_stmt_bind_param($itemsStmt, "i", $o['id']);
    mysqli_stmt_execute($itemsStmt);
    $items = mysqli_stmt_get_result($itemsStmt)->fetch_all(MYSQLI_ASSOC);

    $out[] = [
        'id' => (int) $o['id'],
        'date' => $o['created_at'],
        'total' => (float) $o['total_amount'],
        'payment_mode' => $o['payment_mode'],
        'status' => $o['status'],
        'tracking_note' => $o['tracking_note'] ?? '',
        'address' => $o['address'],
        'items' => array_map(fn($i) => [
            'product_id' => (int) $i['product_id'],
            'name' => $i['product_name'],
            'qty' => (float) $i['quantity_kg'],
            'price' => (float) $i['price_per_kg'],
            'subtotal' => (float) $i['subtotal'],
            'status' => $i['item_status'],
        ], $items),
    ];
}

json_ok(['orders' => $out]);
