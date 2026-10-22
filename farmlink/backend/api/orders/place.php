<?php
/**
 * POST /backend/api/orders/place.php
 * Body: { address, payment_mode: "cod"|"online", items: [{ product_id, qty }] }
 * Validates stock, creates the order + order_items, and decrements stock —
 * all in one transaction (mirrors backend/buyer/place-order-process.php).
 */
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_fail('POST required.', 405);
require_json_role('buyer');

$body = json_body();
$address = clean($body['address'] ?? '');
$paymentMode = in_array($body['payment_mode'] ?? '', ['cod', 'online'], true) ? $body['payment_mode'] : 'cod';
$items = is_array($body['items'] ?? null) ? $body['items'] : [];

if ($address === '') json_fail('Delivery address is required.');
if (count($items) === 0) json_fail('Cart is empty.');

$buyerId = (int) $_SESSION['user_id'];

mysqli_begin_transaction($conn);
try {
    $total = 0;
    $lineItems = [];

    foreach ($items as $item) {
        $productId = (int) ($item['product_id'] ?? 0);
        $qty = (float) ($item['qty'] ?? 0);
        if ($productId <= 0 || $qty <= 0) throw new Exception('Invalid cart item.');
        if ($qty > 10) throw new Exception('Orders above 10kg require a bulk request approval first.');

        $stmt = mysqli_prepare($conn, "SELECT id, farmer_id, price_per_kg, stock_kg FROM products WHERE id = ? FOR UPDATE");
        mysqli_stmt_bind_param($stmt, "i", $productId);
        mysqli_stmt_execute($stmt);
        $product = mysqli_stmt_get_result($stmt)->fetch_assoc();
        if (!$product) throw new Exception("Product #$productId not found.");
        if ($product['stock_kg'] < $qty) throw new Exception('Not enough stock for one of the items.');

        $subtotal = $qty * $product['price_per_kg'];
        $total += $subtotal;
        $lineItems[] = [
            'product_id' => $productId,
            'farmer_id' => $product['farmer_id'],
            'qty' => $qty,
            'price' => $product['price_per_kg'],
            'subtotal' => $subtotal,
        ];
    }

    $orderStmt = mysqli_prepare($conn, "INSERT INTO orders (buyer_id, total_amount, payment_mode, address) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($orderStmt, "idss", $buyerId, $total, $paymentMode, $address);
    mysqli_stmt_execute($orderStmt);
    $orderId = mysqli_insert_id($conn);

    foreach ($lineItems as $li) {
        $itemStmt = mysqli_prepare($conn, "
            INSERT INTO order_items (order_id, product_id, farmer_id, quantity_kg, price_per_kg, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        mysqli_stmt_bind_param($itemStmt, "iiiddd", $orderId, $li['product_id'], $li['farmer_id'], $li['qty'], $li['price'], $li['subtotal']);
        mysqli_stmt_execute($itemStmt);

        $stockStmt = mysqli_prepare($conn, "UPDATE products SET stock_kg = stock_kg - ? WHERE id = ?");
        mysqli_stmt_bind_param($stockStmt, "di", $li['qty'], $li['product_id']);
        mysqli_stmt_execute($stockStmt);
    }

    mysqli_commit($conn);
    json_ok(['order_id' => $orderId, 'total' => $total], 201);
} catch (Exception $e) {
    mysqli_rollback($conn);
    json_fail($e->getMessage());
}
