<?php
/** GET /backend/api/admin/bulk-requests.php?status=pending|approved|rejected|all */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('admin');

$status = clean($_GET['status'] ?? 'pending');
$allowed = ['pending', 'approved', 'rejected', 'all'];
if (!in_array($status, $allowed, true)) $status = 'pending';

$sql = "SELECT br.id, br.quantity_kg, br.reason, br.status, br.remark, br.created_at,
               p.name AS product_name,
               b.id AS buyer_id, b.name AS buyer_name, b.email AS buyer_email, b.mobile AS buyer_mobile
        FROM bulk_requests br
        JOIN products p ON p.id = br.product_id
        JOIN users b ON b.id = br.buyer_id
        WHERE 1=1";
if ($status !== 'all') {
    $sql .= " AND br.status = '" . mysqli_real_escape_string($conn, $status) . "'";
}
$sql .= " ORDER BY br.created_at DESC";

$res = mysqli_query($conn, $sql);
$requests = [];
while ($row = mysqli_fetch_assoc($res)) {
    $requests[] = [
        'id' => (int) $row['id'],
        'product_name' => $row['product_name'],
        'qty' => (float) $row['quantity_kg'],
        'reason' => $row['reason'],
        'status' => $row['status'],
        'remark' => $row['remark'],
        'buyer_name' => $row['buyer_name'],
        'buyer_email' => $row['buyer_email'],
        'buyer_mobile' => $row['buyer_mobile'],
        'created_at' => $row['created_at'],
    ];
}

json_ok(['requests' => $requests]);
