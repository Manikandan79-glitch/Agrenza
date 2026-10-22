<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('farmer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/farmer/my-products.php');
}

$farmerId   = (int) $_SESSION['user_id'];
$productId  = (int) $_POST['product_id'];
$name       = clean($_POST['name']);
$categoryId = (int) $_POST['category_id'];
$price      = (float) $_POST['price_per_kg'];
$stock      = (float) $_POST['stock_kg'];
$status     = in_array($_POST['status'], ['active','inactive']) ? $_POST['status'] : 'active';
$description= clean($_POST['description'] ?? '');

// Confirm ownership
$check = mysqli_query($conn, "SELECT id, image FROM products WHERE id = $productId AND farmer_id = $farmerId LIMIT 1");
$existing = mysqli_fetch_assoc($check);
if (!$existing) {
    set_message('Product not found or access denied.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/my-products.php');
}

$image = $existing['image'];
$newImage = upload_product_image('product_image');
if ($newImage === false) {
    set_message('Invalid image format.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/edit-product.php?id=' . $productId);
}
if ($newImage !== null) {
    // delete old image
    $oldPath = UPLOAD_DIR . $image;
    if ($image && file_exists($oldPath)) { @unlink($oldPath); }
    $image = $newImage;
}

$stmt = mysqli_prepare($conn, "UPDATE products SET name=?, category_id=?, price_per_kg=?, stock_kg=?, image=?, description=?, status=? WHERE id=? AND farmer_id=?");
mysqli_stmt_bind_param($stmt, "sidssssii", $name, $categoryId, $price, $stock, $image, $description, $status, $productId, $farmerId);

if (mysqli_stmt_execute($stmt)) {
    set_message('Product updated successfully!', 'success');
} else {
    set_message('Failed to update product.', 'danger');
}
redirect(BASE_URL . 'frontend/farmer/my-products.php');
