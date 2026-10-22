<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('buyer');

$pageTitle = "Checkout - FarmLink";
$cart = $_SESSION['cart'] ?? [];

if (empty($cart)) {
    set_message('Your cart is empty.', 'warning');
    redirect(BASE_URL . 'frontend/buyer/cart.php');
}

$total = 0;
foreach ($cart as $item) {
    $total += $item['price_per_kg'] * $item['quantity_kg'];
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <h5 class="mb-3"><i class="bi bi-bag-check"></i> Checkout</h5>
  <div class="row g-4">
    <div class="col-md-7">
      <div class="card shadow-sm">
        <div class="card-body">
          <form action="<?= BASE_URL ?>backend/buyer/place-order-process.php" method="POST">
            <div class="mb-3">
              <label class="form-label">Delivery Address</label>
              <textarea name="address" rows="4" class="form-control" placeholder="Enter your full delivery address" required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Payment Mode</label>
              <select name="payment_mode" class="form-select">
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment (Demo)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-farm w-100"><i class="bi bi-check-circle"></i> Place Order</button>
          </form>
        </div>
      </div>
    </div>
    <div class="col-md-5">
      <div class="card shadow-sm">
        <div class="card-header bg-white">Order Summary</div>
        <ul class="list-group list-group-flush">
          <?php foreach ($cart as $item): ?>
            <li class="list-group-item d-flex justify-content-between">
              <span><?= htmlspecialchars($item['name']) ?> (<?= $item['quantity_kg'] ?> kg)</span>
              <span><?= rupee($item['price_per_kg'] * $item['quantity_kg']) ?></span>
            </li>
          <?php endforeach; ?>
          <li class="list-group-item d-flex justify-content-between fw-bold">
            <span>Total</span><span><?= rupee($total) ?></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
