<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';

$productId = (int) ($_GET['id'] ?? 0);
$res = mysqli_query($conn, "
    SELECT p.*, c.name AS category_name, u.name AS farmer_name FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN users u ON u.id = p.farmer_id
    WHERE p.id = $productId LIMIT 1
");
$product = mysqli_fetch_assoc($res);

if (!$product) {
    set_message('Product not found.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/home.php');
}

$pageTitle = htmlspecialchars($product['name']) . " - FarmLink";
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row g-4">
    <div class="col-md-5">
      <img src="<?= UPLOAD_URL . htmlspecialchars($product['image']) ?>" class="img-fluid rounded shadow-sm" style="width:100%;height:380px;object-fit:cover;">
    </div>
    <div class="col-md-7">
      <span class="badge bg-success-subtle text-success mb-2"><?= htmlspecialchars($product['category_name']) ?></span>
      <h3><?= htmlspecialchars($product['name']) ?></h3>
      <p class="text-muted">Sold by <strong><?= htmlspecialchars($product['farmer_name']) ?></strong></p>
      <h4 class="price-tag"><?= rupee($product['price_per_kg']) ?> / kg</h4>
      <p><?= nl2br(htmlspecialchars($product['description'])) ?></p>
      <p class="small text-muted">Available Stock: <?= $product['stock_kg'] ?> kg</p>

      <?php if ($product['stock_kg'] <= 0): ?>
        <div class="alert alert-danger">Out of stock.</div>
      <?php else: ?>

      <?php if (!is_logged_in() || current_role() !== 'buyer'): ?>
        <div class="alert alert-warning">Please <a href="<?= BASE_URL ?>frontend/auth/buyer-login.php">login as a buyer</a> to purchase this product.</div>
      <?php else: ?>

      <form action="<?= BASE_URL ?>backend/buyer/add-to-cart-process.php" method="POST" class="mt-3">
        <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
        <div class="mb-2" style="max-width:220px;">
          <label class="form-label">Quantity (Kg)</label>
          <input type="number" step="0.5" min="0.5" max="<?= $product['stock_kg'] ?>" name="quantity_kg" id="qtyInput"
                 class="form-control" value="1" oninput="checkBulkQuantity(this, document.getElementById('bulkWarning'), 10)" required>
        </div>
        <div id="bulkWarning" class="alert alert-info small d-none">
          Orders above <strong>10 kg</strong> require Admin approval via a
          <a href="<?= BASE_URL ?>frontend/buyer/bulk-request.php?product_id=<?= $product['id'] ?>">Bulk Request</a>.
        </div>
        <button type="submit" class="btn btn-farm"><i class="bi bi-cart-plus"></i> Add to Cart</button>
        <a href="<?= BASE_URL ?>frontend/buyer/bulk-request.php?product_id=<?= $product['id'] ?>" class="btn btn-outline-secondary">
          <i class="bi bi-boxes"></i> Need More Than 10 Kg?
        </a>
      </form>

      <?php endif; ?>
      <?php endif; ?>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
