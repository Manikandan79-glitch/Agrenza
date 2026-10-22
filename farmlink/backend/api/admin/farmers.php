<?php
/** GET /backend/api/admin/farmers.php?status=pending|approved|rejected|all */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$status = clean($_GET['status'] ?? 'pending');
$allowed = ['pending', 'approved', 'rejected', 'all'];
if (!in_array($status, $allowed, true)) $status = 'pending';

$sql = "SELECT u.id, u.name, u.mobile, u.email, u.aadhaar, u.status, u.admin_remark, u.created_at,
               COUNT(DISTINCT p.id) AS total_products,
               COALESCE(SUM(oi.subtotal), 0) AS total_sales
        FROM users u
        LEFT JOIN products p ON p.farmer_id = u.id
        LEFT JOIN order_items oi ON oi.farmer_id = u.id
        WHERE u.role = 'farmer'";
if ($status !== 'all') {
    $sql .= " AND u.status = '" . mysqli_real_escape_string($conn, $status) . "'";
}
$sql .= " GROUP BY u.id ORDER BY u.created_at DESC";

$res = mysqli_query($conn, $sql);
$farmers = [];
while ($row = mysqli_fetch_assoc($res)) {
    $farmers[] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'mobile' => $row['mobile'],
        'email' => $row['email'],
        'aadhaar' => $row['aadhaar'],
        'status' => $row['status'],
        'remark' => $row['admin_remark'],
        'joined' => $row['created_at'],
        'total_products' => (int) $row['total_products'],
        'total_sales' => (float) $row['total_sales'],
    ];
}

json_ok(['farmers' => $farmers]);
