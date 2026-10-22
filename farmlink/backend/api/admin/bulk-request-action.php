<?php
/** POST /backend/api/admin/bulk-request-action.php   Body: { id, action: "approve"|"reject", remark? } */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('admin');

$body = json_body();
$id = (int) ($body['id'] ?? 0);
$action = $body['action'] ?? '';
$remark = clean($body['remark'] ?? '');

if ($id <= 0) json_fail('Invalid request id.');
if (!in_array($action, ['approve', 'reject'], true)) json_fail('Invalid action.');

$stmt = mysqli_prepare($conn, "
    SELECT br.id, br.quantity_kg, p.name AS product_name, u.name AS buyer_name, u.email AS buyer_email
    FROM bulk_requests br
    JOIN products p ON p.id = br.product_id
    JOIN users u ON u.id = br.buyer_id
    WHERE br.id = ?
");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$reqRow = mysqli_stmt_get_result($stmt)->fetch_assoc();
if (!$reqRow) json_fail('Bulk request not found.', 404);

$newStatus = $action === 'approve' ? 'approved' : 'rejected';

$update = mysqli_prepare($conn, "UPDATE bulk_requests SET status = ?, remark = ? WHERE id = ?");
$remarkOrNull = $remark !== '' ? $remark : null;
mysqli_stmt_bind_param($update, "ssi", $newStatus, $remarkOrNull, $id);
mysqli_stmt_execute($update);

if ($reqRow['buyer_email']) {
    $qty = $reqRow['quantity_kg'];
    if ($action === 'approve') {
        $subject = 'Your bulk order request has been approved ✅';
        $body_html = "<p>Hi {$reqRow['buyer_name']},</p><p>Your bulk request for <strong>{$qty}kg</strong> of <strong>" . htmlspecialchars($reqRow['product_name']) . "</strong> has been <strong>approved</strong>. Our team will contact you to confirm delivery.</p>";
    } else {
        $subject = 'Update on your bulk order request';
        $body_html = "<p>Hi {$reqRow['buyer_name']},</p><p>Your bulk request for <strong>{$qty}kg</strong> of <strong>" . htmlspecialchars($reqRow['product_name']) . "</strong> was <strong>not approved</strong>.</p>"
            . ($remark !== '' ? "<p><strong>Reason:</strong> " . htmlspecialchars($remark) . "</p>" : "");
    }
    send_mail($reqRow['buyer_email'], $reqRow['buyer_name'], $subject, mail_template($action === 'approve' ? 'Bulk request approved' : 'Bulk request update', $body_html));
}

json_ok(['updated' => true, 'status' => $newStatus]);
