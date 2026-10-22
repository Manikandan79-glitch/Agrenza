<?php
/** GET /backend/api/admin/products.php?status=pending|approved|rejected|all */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$status = clean($_GET['status'] ?? 'pending');
$allowed = ['pending', 'approved', 'rejected', 'all'];
if (!in_array($status, $allowed, true)) $status = 'pending';

$sql = "SELECT p.id, p.name, p.base_price, p.price_per_kg, p.gst_percent, p.gst_amount, p.commission_percent, p.commission_amount, p.stock_kg, p.image, p.description,
               p.status, p.approval_status, p.admin_remark, p.created_at,
               c.name AS category_name,
               u.id AS farmer_id, u.name AS farmer_name, u.email AS farmer_email, u.mobile AS farmer_mobile
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN users u ON u.id = p.farmer_id
        WHERE 1=1";
if ($status !== 'all') {
    $sql .= " AND p.approval_status = '" . mysqli_real_escape_string($conn, $status) . "'";
}
$sql .= " ORDER BY p.created_at DESC";

$res = mysqli_query($conn, $sql);
$products = [];
while ($row = mysqli_fetch_assoc($res)) {
    $products[] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'category' => $row['category_name'],
        'base_price' => (float) ($row['base_price'] ?? $row['price_per_kg']),
        'price' => (float) $row['price_per_kg'],
        'gst_percent' => (float) ($row['gst_percent'] ?? 5.0),
        'gst_amount' => (float) ($row['gst_amount'] ?? 0.0),
        'commission_percent' => (float) ($row['commission_percent'] ?? 5.0),
        'commission_amount' => (float) ($row['commission_amount'] ?? 0.0),
        'stock' => (float) $row['stock_kg'],
        'image' => $row['image'] ? UPLOAD_URL . $row['image'] : null,
        'description' => $row['description'],
        'status' => $row['status'],
        'approval_status' => $row['approval_status'],
        'remark' => $row['admin_remark'],
        'farmer_id' => (int) $row['farmer_id'],
        'farmer_name' => $row['farmer_name'],
        'farmer_email' => $row['farmer_email'],
        'farmer_mobile' => $row['farmer_mobile'],
        'created_at' => $row['created_at'],
    ];
}

json_ok(['products' => $products]);
