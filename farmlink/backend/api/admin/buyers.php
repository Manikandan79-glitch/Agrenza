<?php
/** GET /backend/api/admin/buyers.php */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$sql = "SELECT u.id, u.name, u.mobile, u.email, u.status, u.created_at,
               COUNT(DISTINCT o.id) AS total_orders,
               COALESCE(SUM(o.total_amount), 0) AS total_spent
        FROM users u
        LEFT JOIN orders o ON o.buyer_id = u.id
        WHERE u.role = 'buyer'
        GROUP BY u.id
        ORDER BY u.created_at DESC";

$res = mysqli_query($conn, $sql);
$buyers = [];
while ($row = mysqli_fetch_assoc($res)) {
    $buyers[] = [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'mobile' => $row['mobile'],
        'email' => $row['email'],
        'status' => $row['status'] ?: 'active',
        'joined' => $row['created_at'],
        'total_orders' => (int) $row['total_orders'],
        'total_spent' => (float) $row['total_spent'],
    ];
}

json_ok(['buyers' => $buyers]);
