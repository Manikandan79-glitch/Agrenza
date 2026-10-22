<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('buyer');

$buyerId = (int) $_SESSION['user_id'];
$requestId = (int) ($_GET['id'] ?? 0);

$res = mysqli_query($conn, "
    SELECT br.*, p.name, p.price_per_kg, p.image, p.farmer_id, p.stock_kg
    FROM bulk_requests br
    JOIN products p ON p.id = br.product_id
    WHERE br.id = $requestId AND br.buyer_id = $buyerId AND br.status = 'approved'
    LIMIT 1
");
$bulk = mysqli_fetch_assoc($res);

if (!$bulk) {
    set_message('Approved bulk request not found.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/my-orders.php');
}

if ($bulk['stock_kg'] < $bulk['quantity_kg']) {
    set_message('Sorry, stock is no longer sufficient for this bulk quantity.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/my-orders.php');
}

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// This bypasses the normal 10kg cap since it is admin-approved
$_SESSION['cart'][$bulk['product_id']] = [
    'product_id'   => $bulk['product_id'],
    'name'         => $bulk['name'],
    'price_per_kg' => $bulk['price_per_kg'],
    'quantity_kg'  => $bulk['quantity_kg'],
    'image'        => $bulk['image'],
    'farmer_id'    => $bulk['farmer_id'],
];

set_message('Approved bulk quantity added to cart. Please proceed to checkout.', 'success');
redirect(BASE_URL . 'frontend/buyer/cart.php');
