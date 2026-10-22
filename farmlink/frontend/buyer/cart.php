<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('buyer');

$pageTitle = "My Cart - FarmLink";
$cart = $_SESSION['cart'] ?? [];
$total = 0;
foreach ($cart as $item) {
    $total += $item['price_per_kg'] * $item['quantity_kg'];
}

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <h5 class="mb-3"><i class="bi bi-cart3"></i> My Cart</h5>

  <?php if (empty($cart)): ?>
    <div class="card shadow-sm">
      <div class="card-body text-center py-5">
        <p class="text-muted">Your cart is empty.</p>
        <a href="<?= BASE_URL ?>frontend/buyer/home.php" class="btn btn-farm">Browse Products</a>
      </div>
    </div>
  <?php else: ?>
    <div class="card shadow-sm mb-3">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead><tr><th>Product</th><th>Price/Kg</th><th>Qty (Kg)</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>
            <?php foreach ($cart as $item): ?>
              <tr>
                <td class="d-flex align-items-center gap-2">
                  <img src="<?= UPLOAD_URL . htmlspecialchars($item['image']) ?>" width="50" height="50" style="object-fit:cover;border-radius:8px;">
                  <?= htmlspecialchars($item['name']) ?>
                </td>
                <td><?= rupee($item['price_per_kg']) ?></td>
                <td><?= $item['quantity_kg'] ?></td>
                <td><?= rupee($item['price_per_kg'] * $item['quantity_kg']) ?></td>
                <td>
                  <a href="<?= BASE_URL ?>backend/buyer/remove-from-cart-process.php?id=<?= $item['product_id'] ?>"
                     class="btn btn-sm btn-outline-danger" onclick="return confirmDelete('Remove this item?')">
                     <i class="bi bi-trash"></i>
                  </a>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card shadow-sm">
      <div class="card-body d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Total: <?= rupee($total) ?></h5>
        <a href="<?= BASE_URL ?>frontend/buyer/checkout.php" class="btn btn-farm btn-lg"><i class="bi bi-bag-check"></i> Proceed to Checkout</a>
      </div>
    </div>
  <?php endif; ?>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
