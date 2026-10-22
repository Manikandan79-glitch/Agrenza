<?php
/** POST /backend/api/admin/farmer-action.php   Body: { id, action: "approve"|"reject", remark? } */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('admin');

$body = json_body();
$id = (int) ($body['id'] ?? 0);
$action = $body['action'] ?? '';
$remark = clean($body['remark'] ?? '');

if ($id <= 0) json_fail('Invalid farmer id.');
if (!in_array($action, ['approve', 'reject'], true)) json_fail('Invalid action.');

$stmt = mysqli_prepare($conn, "SELECT id, name, email, mobile, role FROM users WHERE id = ? AND role = 'farmer'");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$farmer = mysqli_stmt_get_result($stmt)->fetch_assoc();
if (!$farmer) json_fail('Farmer not found.', 404);

$newStatus = $action === 'approve' ? 'approved' : 'rejected';

$update = mysqli_prepare($conn, "UPDATE users SET status = ?, admin_remark = ? WHERE id = ?");
$remarkOrNull = $remark !== '' ? $remark : null;
mysqli_stmt_bind_param($update, "ssi", $newStatus, $remarkOrNull, $id);
mysqli_stmt_execute($update);

// Send notifications to BOTH Farmer's Gmail and Admin's Gmail
send_farmer_decision_notifications($farmer, $action, $remark);

json_ok(['updated' => true, 'status' => $newStatus]);
