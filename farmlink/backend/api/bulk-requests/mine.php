<?php
/** GET /backend/api/bulk-requests/mine.php */
require_once __DIR__ . '/../_bootstrap.php';
require_json_role('buyer');

$buyerId = (int) $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "
    SELECT br.*, p.name AS product_name FROM bulk_requests br
    JOIN products p ON p.id = br.product_id
    WHERE br.buyer_id = ? ORDER BY br.created_at DESC
");
mysqli_stmt_bind_param($stmt, "i", $buyerId);
mysqli_stmt_execute($stmt);
$rows = mysqli_stmt_get_result($stmt)->fetch_all(MYSQLI_ASSOC);

$requests = array_map(fn($r) => [
    'id' => (int) $r['id'],
    'product_name' => $r['product_name'],
    'qty' => (float) $r['quantity_kg'],
    'reason' => $r['reason'],
    'status' => $r['status'],
    'remark' => $r['remark'],
    'date' => $r['created_at'],
], $rows);

json_ok(['requests' => $requests]);
