<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('buyer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/buyer/home.php');
}

$productId = (int) $_POST['product_id'];
$qty       = (float) $_POST['quantity_kg'];

$res = mysqli_query($conn, "SELECT * FROM products WHERE id = $productId AND status = 'active' LIMIT 1");
$product = mysqli_fetch_assoc($res);

if (!$product) {
    set_message('Product not found.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/home.php');
}

if ($qty <= 0) {
    set_message('Please enter a valid quantity.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/product-details.php?id=' . $productId);
}

// BUSINESS RULE: Normal purchase max 10kg. Above that -> Bulk Request required.
if ($qty > 10) {
    set_message('Quantities above 10 kg require a Bulk Request approved by Admin.', 'warning');
    redirect(BASE_URL . 'frontend/buyer/bulk-request.php?product_id=' . $productId);
}

if ($qty > (float) $product['stock_kg']) {
    set_message('Requested quantity exceeds available stock.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/product-details.php?id=' . $productId);
}

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// If product already in cart, update quantity (capped at 10kg total)
if (isset($_SESSION['cart'][$productId])) {
    $newQty = $_SESSION['cart'][$productId]['quantity_kg'] + $qty;
    if ($newQty > 10) {
        set_message('Cart quantity for this product cannot exceed 10 kg (normal purchase limit). Use Bulk Request for more.', 'warning');
        redirect(BASE_URL . 'frontend/buyer/cart.php');
    }
    $_SESSION['cart'][$productId]['quantity_kg'] = $newQty;
} else {
    $_SESSION['cart'][$productId] = [
        'product_id'   => $productId,
        'name'         => $product['name'],
        'price_per_kg' => $product['price_per_kg'],
        'quantity_kg'  => $qty,
        'image'        => $product['image'],
        'farmer_id'    => $product['farmer_id'],
    ];
}

set_message('Product added to cart.', 'success');
redirect(BASE_URL . 'frontend/buyer/cart.php');
