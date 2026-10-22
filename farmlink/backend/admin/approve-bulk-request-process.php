<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/admin/bulk-requests.php');
}

$requestId = (int) $_POST['request_id'];
$remark = clean($_POST['remark'] ?? 'Approved');
if ($remark === '') { $remark = 'Approved'; }

$check = mysqli_query($conn, "SELECT id FROM bulk_requests WHERE id = $requestId AND status = 'pending' LIMIT 1");
if (mysqli_num_rows($check) === 0) {
    set_message('Bulk request not found or already processed.', 'danger');
    redirect(BASE_URL . 'frontend/admin/bulk-requests.php');
}

$stmt = mysqli_prepare($conn, "UPDATE bulk_requests SET status = 'approved', remark = ? WHERE id = ?");
mysqli_stmt_bind_param($stmt, "si", $remark, $requestId);

if (mysqli_stmt_execute($stmt)) {
    set_message('Bulk request approved. The buyer can now purchase this quantity.', 'success');
} else {
    set_message('Failed to approve request.', 'danger');
}
redirect(BASE_URL . 'frontend/admin/bulk-requests.php');
