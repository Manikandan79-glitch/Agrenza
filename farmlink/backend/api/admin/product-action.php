<?php
/** POST /backend/api/admin/product-action.php   Body: { id, action: "approve"|"reject", remark? } */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('admin');

$body = json_body();
$id = (int) ($body['id'] ?? 0);
$action = $body['action'] ?? '';
$remark = clean($body['remark'] ?? '');

if ($id <= 0) json_fail('Invalid product id.');
if (!in_array($action, ['approve', 'reject'], true)) json_fail('Invalid action.');

$stmt = mysqli_prepare($conn, "
    SELECT p.id, p.name, u.id AS farmer_id, u.name AS farmer_name, u.email AS farmer_email
    FROM products p JOIN users u ON u.id = p.farmer_id
    WHERE p.id = ?
");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$product = mysqli_stmt_get_result($stmt)->fetch_assoc();
if (!$product) json_fail('Product not found.', 404);

$newStatus = $action === 'approve' ? 'approved' : 'rejected';

$update = mysqli_prepare($conn, "UPDATE products SET approval_status = ?, admin_remark = ? WHERE id = ?");
$remarkOrNull = $remark !== '' ? $remark : null;
mysqli_stmt_bind_param($update, "ssi", $newStatus, $remarkOrNull, $id);
mysqli_stmt_execute($update);

if ($product['farmer_email']) {
    if ($action === 'approve') {
        $subject = 'Your product "' . $product['name'] . '" is now live on FarmLink ✅';
        $body_html = "<p>Hi {$product['farmer_name']},</p><p>Your product <strong>" . htmlspecialchars($product['name']) . "</strong> has been <strong>approved</strong> and is now visible to buyers in the Shop.</p>";
    } else {
        $subject = 'Your product "' . $product['name'] . '" was not approved';
        $body_html = "<p>Hi {$product['farmer_name']},</p><p>Your product <strong>" . htmlspecialchars($product['name']) . "</strong> was <strong>not approved</strong> and will not be shown in the Shop.</p>"
            . ($remark !== '' ? "<p><strong>Reason:</strong> " . htmlspecialchars($remark) . "</p>" : "")
            . "<p>You can edit the product and it will be sent for review again.</p>";
    }
    send_mail($product['farmer_email'], $product['farmer_name'], $subject, mail_template($action === 'approve' ? 'Product approved' : 'Product update', $body_html));
}

json_ok(['updated' => true, 'approval_status' => $newStatus]);
