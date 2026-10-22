<?php
require_once __DIR__ . '/../helpers/functions.php';
require_role('buyer');

$productId = (int) ($_GET['id'] ?? 0);
if (isset($_SESSION['cart'][$productId])) {
    unset($_SESSION['cart'][$productId]);
    set_message('Item removed from cart.', 'success');
}
redirect(BASE_URL . 'frontend/buyer/cart.php');
