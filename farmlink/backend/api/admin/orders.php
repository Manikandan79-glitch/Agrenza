<?php
/** GET /backend/api/admin/orders.php */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$sql = "SELECT o.id, o.buyer_id, o.total_amount, o.payment_mode, o.address, o.status, o.tracking_note, o.created_at,
               u.name AS buyer_name, u.mobile AS buyer_mobile, u.email AS buyer_email
        FROM orders o
        JOIN users u ON u.id = o.buyer_id
        ORDER BY o.created_at DESC";

$res = mysqli_query($conn, $sql);
$orders = [];
$totalRevenue = 0.0;

while ($row = mysqli_fetch_assoc($res)) {
    $amount = (float) $row['total_amount'];
    if ($row['status'] !== 'cancelled') {
        $totalRevenue += $amount;
    }
    $orderId = (int) $row['id'];
    
    // Fetch line items for this order including farmer name and current stock
    $itemSql = "SELECT oi.id, oi.product_id, oi.quantity_kg, oi.price_per_kg, oi.subtotal, oi.item_status,
                       p.name AS product_name, p.stock_kg AS current_stock, p.image AS product_image,
                       f.name AS farmer_name, f.mobile AS farmer_mobile
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                JOIN users f ON f.id = oi.farmer_id
                WHERE oi.order_id = $orderId";
    $itemRes = mysqli_query($conn, $itemSql);
    $items = [];
    while ($ir = mysqli_fetch_assoc($itemRes)) {
        $items[] = [
            'id' => (int) $ir['id'],
            'product_id' => (int) $ir['product_id'],
            'product_name' => $ir['product_name'],
            'product_image' => $ir['product_image'] ? UPLOAD_URL . $ir['product_image'] : null,
            'qty' => (float) $ir['quantity_kg'],
            'price_per_kg' => (float) $ir['price_per_kg'],
            'subtotal' => (float) $ir['subtotal'],
            'current_stock' => (float) $ir['current_stock'],
            'status' => $ir['item_status'],
            'farmer_name' => $ir['farmer_name'],
            'farmer_mobile' => $ir['farmer_mobile'],
        ];
    }

    $orders[] = [
        'id' => $orderId,
        'buyer_id' => (int) $row['buyer_id'],
        'buyer_name' => $row['buyer_name'],
        'buyer_mobile' => $row['buyer_mobile'],
        'buyer_email' => $row['buyer_email'],
        'total_amount' => $amount,
        'payment_mode' => $row['payment_mode'],
        'address' => $row['address'],
        'status' => $row['status'],
        'tracking_note' => $row['tracking_note'] ?? '',
        'created_at' => $row['created_at'],
        'item_count' => count($items),
        'items' => $items,
    ];
}

json_ok([
    'orders' => $orders,
    'total_revenue' => $totalRevenue,
]);
