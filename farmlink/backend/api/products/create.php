<?php
/**
 * POST /backend/api/products/create.php  (multipart/form-data — send as FormData, not JSON)
 * Fields: name, category_id, price_per_kg, stock_kg, description, product_image (file)
 */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('farmer');

$name = clean($_POST['name'] ?? '');
$categoryId = (int) ($_POST['category_id'] ?? 0);
$basePrice = (float) ($_POST['base_price'] ?? ($_POST['price_per_kg'] ?? 0));
$gstPercent = isset($_POST['gst_percent']) ? (float)$_POST['gst_percent'] : 5.0;
$commissionPercent = isset($_POST['commission_percent']) ? (float)$_POST['commission_percent'] : 5.0;

$gstAmount = round($basePrice * ($gstPercent / 100), 2);
$commissionAmount = round($basePrice * ($commissionPercent / 100), 2);

// Final selling price per kg = base price + commission + gst
$price = isset($_POST['price_per_kg']) && (float)$_POST['price_per_kg'] > 0
    ? (float)$_POST['price_per_kg']
    : round($basePrice + $gstAmount + $commissionAmount, 2);

$stock = (float) ($_POST['stock_kg'] ?? 0);
$description = clean($_POST['description'] ?? '');

if ($name === '') json_fail('Product name is required.');
if ($categoryId <= 0) json_fail('Select a category.');
if ($basePrice <= 0) json_fail('Base price must be greater than 0.');
if ($price <= 0) json_fail('Selling price must be greater than 0.');
if ($stock <= 0) json_fail('Stock must be greater than 0.');

$image = upload_product_image('product_image');
if ($image === false) json_fail('Invalid image file. Use jpg, jpeg, png or webp.');

$farmerId = (int) $_SESSION['user_id'];
$stmt = mysqli_prepare($conn, "
    INSERT INTO products (farmer_id, category_id, name, base_price, price_per_kg, gst_percent, gst_amount, commission_percent, commission_amount, stock_kg, image, description, status, approval_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'pending')
");
mysqli_stmt_bind_param(
    $stmt,
    "iisdddddddss",
    $farmerId,
    $categoryId,
    $name,
    $basePrice,
    $price,
    $gstPercent,
    $gstAmount,
    $commissionPercent,
    $commissionAmount,
    $stock,
    $image,
    $description
);
mysqli_stmt_execute($stmt);

json_ok(['product_id' => mysqli_insert_id($conn)], 201);
