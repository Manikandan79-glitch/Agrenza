<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/functions.php';
require_role('buyer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect(BASE_URL . 'frontend/buyer/cart.php');
}

$buyerId = (int) $_SESSION['user_id'];
$address = clean($_POST['address']);
$paymentMode = in_array($_POST['payment_mode'], ['cod','online']) ? $_POST['payment_mode'] : 'cod';

$cart = $_SESSION['cart'] ?? [];
if (empty($cart)) {
    set_message('Your cart is empty.', 'warning');
    redirect(BASE_URL . 'frontend/buyer/cart.php');
}

mysqli_begin_transaction($conn);

try {
    $total = 0;
    foreach ($cart as $item) {
        $total += $item['price_per_kg'] * $item['quantity_kg'];
    }

    $stmt = mysqli_prepare($conn, "INSERT INTO orders (buyer_id, total_amount, payment_mode, status, address) VALUES (?, ?, ?, 'pending', ?)");
    mysqli_stmt_bind_param($stmt, "idss", $buyerId, $total, $paymentMode, $address);
    mysqli_stmt_execute($stmt);
    $orderId = mysqli_insert_id($conn);

    foreach ($cart as $item) {
        // Re-check stock at order time
        $res = mysqli_query($conn, "SELECT stock_kg FROM products WHERE id = " . (int)$item['product_id'] . " FOR UPDATE");
        $prod = mysqli_fetch_assoc($res);
        if (!$prod || $prod['stock_kg'] < $item['quantity_kg']) {
            throw new Exception('Insufficient stock for ' . $item['name']);
        }

        $subtotal = $item['price_per_kg'] * $item['quantity_kg'];
        $itemStmt = mysqli_prepare($conn, "INSERT INTO order_items (order_id, product_id, farmer_id, quantity_kg, price_per_kg, subtotal, item_status) VALUES (?,?,?,?,?,?, 'pending')");
        mysqli_stmt_bind_param($itemStmt, "iiiddd", $orderId, $item['product_id'], $item['farmer_id'], $item['quantity_kg'], $item['price_per_kg'], $subtotal);
        mysqli_stmt_execute($itemStmt);

        // Deduct stock
        mysqli_query($conn, "UPDATE products SET stock_kg = stock_kg - " . (float)$item['quantity_kg'] . " WHERE id = " . (int)$item['product_id']);
    }

    mysqli_commit($conn);
    unset($_SESSION['cart']);
    set_message('Order placed successfully! Order #' . $orderId, 'success');
    redirect(BASE_URL . 'frontend/buyer/my-orders.php');

} catch (Exception $e) {
    mysqli_rollback($conn);
    set_message('Order failed: ' . $e->getMessage(), 'danger');
    redirect(BASE_URL . 'frontend/buyer/cart.php');
}
