<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('farmer');

$farmerId  = (int) $_SESSION['user_id'];
$productId = (int) ($_GET['id'] ?? 0);

$res = mysqli_query($conn, "SELECT image FROM products WHERE id = $productId AND farmer_id = $farmerId LIMIT 1");
$product = mysqli_fetch_assoc($res);

if ($product) {
    mysqli_query($conn, "DELETE FROM products WHERE id = $productId AND farmer_id = $farmerId");
    $path = UPLOAD_DIR . $product['image'];
    if ($product['image'] && file_exists($path)) { @unlink($path); }
    set_message('Product deleted successfully.', 'success');
} else {
    set_message('Product not found or access denied.', 'danger');
}

redirect(BASE_URL . 'frontend/farmer/my-products.php');
