<?php
/** GET /backend/api/farmer/dashboard-stats.php */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('farmer');

$farmerId = (int) $_SESSION['user_id'];

$q = fn($sql) => mysqli_fetch_assoc(mysqli_query($GLOBALS['conn'], $sql));

$productCount = $q("SELECT COUNT(*) c FROM products WHERE farmer_id = $farmerId")['c'];
$earnings = $q("SELECT COALESCE(SUM(subtotal),0) t FROM order_items WHERE farmer_id = $farmerId AND item_status = 'delivered'")['t'];
$pending = $q("SELECT COUNT(*) c FROM order_items WHERE farmer_id = $farmerId AND item_status IN ('pending','confirmed','shipped')")['c'];

$lowStockRes = mysqli_query($conn, "SELECT name, stock_kg FROM products WHERE farmer_id = $farmerId AND stock_kg < 5 ORDER BY stock_kg ASC");
$lowStock = [];
while ($row = mysqli_fetch_assoc($lowStockRes)) {
    $lowStock[] = ['name' => $row['name'], 'stock' => (float) $row['stock_kg']];
}

json_ok([
    'product_count' => (int) $productCount,
    'total_earnings' => (float) $earnings,
    'pending_orders' => (int) $pending,
    'low_stock' => $lowStock,
]);
