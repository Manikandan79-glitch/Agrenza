<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('farmer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/farmer/add-product.php');
}

$farmerId    = (int) $_SESSION['user_id'];
$name        = clean($_POST['name']);
$categoryId  = (int) $_POST['category_id'];
$price       = (float) $_POST['price_per_kg'];
$stock       = (float) $_POST['stock_kg'];
$description = clean($_POST['description'] ?? '');

if ($name === '' || $categoryId <= 0 || $price <= 0 || $stock <= 0) {
    set_message('Please fill all required fields correctly.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/add-product.php');
}

$image = upload_product_image('product_image');
if ($image === false) {
    set_message('Invalid image format. Allowed: jpg, jpeg, png, webp.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/add-product.php');
}
if ($image === null) {
    set_message('Product image is required.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/add-product.php');
}

$stmt = mysqli_prepare($conn, "INSERT INTO products (farmer_id, category_id, name, price_per_kg, stock_kg, image, description) VALUES (?,?,?,?,?,?,?)");
mysqli_stmt_bind_param($stmt, "iisddss", $farmerId, $categoryId, $name, $price, $stock, $image, $description);

if (mysqli_stmt_execute($stmt)) {
    set_message('Product added successfully!', 'success');
    redirect(BASE_URL . 'frontend/farmer/my-products.php');
} else {
    set_message('Failed to add product. Please try again.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/add-product.php');
}
