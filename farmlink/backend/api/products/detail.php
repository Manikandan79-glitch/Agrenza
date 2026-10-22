<?php
/** GET /backend/api/products/detail.php?id=5 */
require_once __DIR__ . '/../_bootstrap.php';

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) json_fail('Invalid product id.');

$stmt = mysqli_prepare($conn, "
    SELECT p.*, c.name AS category_name, u.name AS farmer_name, u.mobile AS farmer_mobile
    FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN users u ON u.id = p.farmer_id
    WHERE p.id = ?
");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$row = mysqli_stmt_get_result($stmt)->fetch_assoc();

if (!$row) json_fail('Product not found.', 404);

json_ok(['product' => [
    'id' => (int) $row['id'],
    'name' => $row['name'],
    'category' => $row['category_name'],
    'category_id' => (int) $row['category_id'],
    'price' => (float) $row['price_per_kg'],
    'base_price' => (float) ($row['base_price'] ?? $row['price_per_kg']),
    'gst_percent' => (float) ($row['gst_percent'] ?? 5.0),
    'gst_amount' => (float) ($row['gst_amount'] ?? 0.0),
    'commission_percent' => (float) ($row['commission_percent'] ?? 5.0),
    'commission_amount' => (float) ($row['commission_amount'] ?? 0.0),
    'stock' => (float) $row['stock_kg'],
    'image' => $row['image'] ? UPLOAD_URL . $row['image'] : null,
    'description' => $row['description'],
    'status' => $row['status'],
    'approval_status' => $row['approval_status'] ?? 'pending',
    'farmer' => $row['farmer_name'],
    'farmer_mobile' => $row['farmer_mobile'],
]]);
