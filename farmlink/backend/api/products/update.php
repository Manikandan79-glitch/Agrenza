<?php
/**
 * POST /backend/api/products/update.php  (multipart/form-data)
 * Fields: id, name, category_id, price_per_kg, stock_kg, description, status,
 *         product_image (file, optional — keeps old image if omitted)
 */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('farmer');

$id = (int) ($_POST['id'] ?? 0);
$farmerId = (int) $_SESSION['user_id'];

$check = mysqli_prepare($conn, "SELECT image FROM products WHERE id = ? AND farmer_id = ?");
mysqli_stmt_bind_param($check, "ii", $id, $farmerId);
mysqli_stmt_execute($check);
$existing = mysqli_stmt_get_result($check)->fetch_assoc();
if (!$existing) json_fail('Product not found.', 404);

$name = clean($_POST['name'] ?? '');
$categoryId = (int) ($_POST['category_id'] ?? 0);
$basePrice = (float) ($_POST['base_price'] ?? ($_POST['price_per_kg'] ?? 0));
$gstPercent = isset($_POST['gst_percent']) ? (float)$_POST['gst_percent'] : 5.0;
$commissionPercent = isset($_POST['commission_percent']) ? (float)$_POST['commission_percent'] : 5.0;

$gstAmount = round($basePrice * ($gstPercent / 100), 2);
$commissionAmount = round($basePrice * ($commissionPercent / 100), 2);

$price = isset($_POST['price_per_kg']) && (float)$_POST['price_per_kg'] > 0
    ? (float)$_POST['price_per_kg']
    : round($basePrice + $gstAmount + $commissionAmount, 2);

$stock = (float) ($_POST['stock_kg'] ?? 0);
$description = clean($_POST['description'] ?? '');
$status = in_array($_POST['status'] ?? '', ['active', 'inactive'], true) ? $_POST['status'] : 'active';

$image = $existing['image'];
if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] === 0) {
    $uploaded = upload_product_image('product_image');
    if ($uploaded === false) json_fail('Invalid image file.');
    $image = $uploaded;
}

$stmt = mysqli_prepare($conn, "
    UPDATE products SET name=?, category_id=?, base_price=?, price_per_kg=?, gst_percent=?, gst_amount=?, commission_percent=?, commission_amount=?, stock_kg=?, image=?, description=?, status=?, approval_status='pending'
    WHERE id = ? AND farmer_id = ?
");
mysqli_stmt_bind_param(
    $stmt,
    "sidddddddsssii",
    $name,
    $categoryId,
    $basePrice,
    $price,
    $gstPercent,
    $gstAmount,
    $commissionPercent,
    $commissionAmount,
    $stock,
    $image,
    $description,
    $status,
    $id,
    $farmerId
);
mysqli_stmt_execute($stmt);

json_ok(['updated' => true]);
