<?php
/** GET /backend/api/orders/farmer-items.php — order items sold by the logged-in farmer */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('farmer');

$farmerId = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "
    SELECT oi.*, o.created_at AS order_date, o.address, o.payment_mode, u.name AS buyer_name, u.mobile AS buyer_mobile,
           p.id AS product_id, p.name AS product_name, p.stock_kg AS current_stock, p.image AS product_image
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN users u ON u.id = o.buyer_id
    JOIN products p ON p.id = oi.product_id
    WHERE oi.farmer_id = ?
    ORDER BY o.created_at DESC
");
mysqli_stmt_bind_param($stmt, "i", $farmerId);
mysqli_stmt_execute($stmt);
$rows = mysqli_stmt_get_result($stmt)->fetch_all(MYSQLI_ASSOC);

$items = array_map(fn($r) => [
    'item_id' => (int) $r['id'],
    'order_id' => (int) $r['order_id'],
    'order_date' => $r['order_date'],
    'product_id' => (int) $r['product_id'],
    'product_name' => $r['product_name'],
    'product_image' => $r['product_image'] ? UPLOAD_URL . $r['product_image'] : null,
    'current_stock' => (float) $r['current_stock'],
    'buyer_name' => $r['buyer_name'],
    'buyer_mobile' => $r['buyer_mobile'],
    'address' => $r['address'],
    'payment_mode' => $r['payment_mode'] ?? 'cod',
    'qty' => (float) $r['quantity_kg'],
    'price_per_kg' => (float) $r['price_per_kg'],
    'subtotal' => (float) $r['subtotal'],
    'status' => $r['item_status'],
], $rows);

json_ok(['items' => $items]);
