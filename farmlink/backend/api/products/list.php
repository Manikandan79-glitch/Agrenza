<?php
/**
 * GET /backend/api/products/list.php?search=&category=&farmer_mine=1
 * Public listing (Shop page). Pass farmer_mine=1 while logged in as a
 * farmer to get only that farmer's own products (My Products page).
 */
require_once __DIR__ . '/../_bootstrap.php';

$search = clean($_GET['search'] ?? '');
$category = clean($_GET['category'] ?? '');
$mineOnly = ($_GET['farmer_mine'] ?? '') === '1';

$sql = "SELECT p.*, c.name AS category_name, u.name AS farmer_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN users u ON u.id = p.farmer_id
        WHERE 1=1";
$types = "";
$params = [];

if ($mineOnly) {
    require_json_role('farmer');
    $sql .= " AND p.farmer_id = ?";
    $types .= "i";
    $params[] = $_SESSION['user_id'];
} else {
    $sql .= " AND p.status = 'active' AND p.approval_status = 'approved'";
}

if ($search !== '') {
    $sql .= " AND p.name LIKE ?";
    $types .= "s";
    $params[] = "%$search%";
}
if ($category !== '' && $category !== 'All') {
    $sql .= " AND c.name = ?";
    $types .= "s";
    $params[] = $category;
}

$sql .= " ORDER BY p.created_at DESC";

$stmt = mysqli_prepare($conn, $sql);
if ($types !== "") {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$products = [];
while ($row = mysqli_fetch_assoc($result)) {
    $products[] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'category' => $row['category_name'],
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
        'approval_status' => $row['approval_status'] ?? null,
        'admin_remark' => $row['admin_remark'] ?? null,
        'farmer' => $row['farmer_name'],
    ];
}

json_ok(['products' => $products]);
