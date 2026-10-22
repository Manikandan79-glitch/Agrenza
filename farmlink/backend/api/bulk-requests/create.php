<?php
/** POST /backend/api/bulk-requests/create.php   Body: { product_id, qty, reason } */
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('buyer');

$body = json_body();
$productId = (int) ($body['product_id'] ?? 0);
$qty = (float) ($body['qty'] ?? 0);
$reason = clean($body['reason'] ?? '');
$buyerId = (int) $_SESSION['user_id'];

if ($productId <= 0) json_fail('Invalid product.');
if ($qty <= 10) json_fail('Bulk requests are for quantities above 10kg.');
if ($reason === '') json_fail('Please provide a reason.');

// Fetch buyer info for the notification email
$buyerRow = null;
$bStmt = mysqli_prepare($conn, "SELECT name, email, mobile FROM users WHERE id = ? LIMIT 1");
mysqli_stmt_bind_param($bStmt, "i", $buyerId);
mysqli_stmt_execute($bStmt);
$buyerRow = mysqli_stmt_get_result($bStmt)->fetch_assoc();

// Fetch product name
$productRow = null;
$pStmt = mysqli_prepare($conn, "SELECT name FROM products WHERE id = ? LIMIT 1");
mysqli_stmt_bind_param($pStmt, "i", $productId);
mysqli_stmt_execute($pStmt);
$productRow = mysqli_stmt_get_result($pStmt)->fetch_assoc();

// Insert the bulk request
$stmt = mysqli_prepare($conn, "
    INSERT INTO bulk_requests (buyer_id, product_id, quantity_kg, reason, status)
    VALUES (?, ?, ?, ?, 'pending')
");
mysqli_stmt_bind_param($stmt, "iids", $buyerId, $productId, $qty, $reason);
mysqli_stmt_execute($stmt);
$requestId = mysqli_insert_id($conn);

// Send admin notification email
$adminEmail = (defined('ADMIN_NOTIFY_EMAIL') && ADMIN_NOTIFY_EMAIL !== '') ? ADMIN_NOTIFY_EMAIL : SMTP_USER;
if ($adminEmail !== '' && $adminEmail !== 'youraddress@gmail.com') {
    $buyerName   = $buyerRow['name']   ?? 'Unknown Buyer';
    $buyerEmail  = $buyerRow['email']  ?? '';
    $buyerMobile = $buyerRow['mobile'] ?? '';
    $productName = $productRow['name'] ?? "Product #$productId";
    $reasonHtml  = htmlspecialchars($reason);

    $adminSubject = "[Agrenza] New Bulk Order Request — {$productName} ({$qty} kg)";
    $adminBody = <<<HTML
<p>A buyer has submitted a <strong>bulk purchase request</strong> on Agrenza. Please review it in the admin panel.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;width:160px;">Request ID:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">#$requestId</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Product:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">$productName</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Quantity (kg):</td><td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:bold;color:#15803d;">$qty kg</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Buyer Name:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">$buyerName</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Buyer Email:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">$buyerEmail</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Buyer Mobile:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">$buyerMobile</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Reason:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">$reasonHtml</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:bold;">Submitted At:</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">{$_SERVER['REQUEST_TIME']}</td></tr>
</table>
<div style="text-align:center;margin:24px 0;">
  <a href="http://localhost:3000/admin/bulk-requests" style="background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;font-size:15px;display:inline-block;">
    Review in Admin Panel →
  </a>
</div>
HTML;
    send_mail($adminEmail, 'Agrenza Admin', $adminSubject, mail_template('New Bulk Order Request', $adminBody));
}

json_ok(['request_id' => $requestId], 201);
