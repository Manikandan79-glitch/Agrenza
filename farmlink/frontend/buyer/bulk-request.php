<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('buyer');

$productId = (int) ($_GET['product_id'] ?? 0);
$res = mysqli_query($conn, "SELECT * FROM products WHERE id = $productId LIMIT 1");
$product = mysqli_fetch_assoc($res);

if (!$product) {
    set_message('Product not found.', 'danger');
    redirect(BASE_URL . 'frontend/buyer/home.php');
}

$pageTitle = "Bulk Request - FarmLink";
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="card auth-card">
    <div class="card-body p-4">
      <h5 class="mb-1"><i class="bi bi-boxes"></i> Bulk Purchase Request</h5>
      <p class="text-muted small mb-4">
        Requesting <strong><?= htmlspecialchars($product['name']) ?></strong> in bulk (above 10 kg)
        requires Admin approval before you can buy it.
      </p>

      <form action="<?= BASE_URL ?>backend/buyer/bulk-request-process.php" method="POST">
        <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
        <div class="mb-3">
          <label class="form-label">Required Quantity (Kg)</label>
          <input type="number" step="1" min="11" name="quantity_kg" class="form-control" max="<?= $product['stock_kg'] ?>" required>
          <div class="form-text">Available stock: <?= $product['stock_kg'] ?> kg</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Reason for Bulk Purchase</label>
          <textarea name="reason" rows="4" class="form-control" placeholder="E.g. For restaurant supply, wholesale reselling, event catering, etc." required></textarea>
        </div>
        <button type="submit" class="btn btn-farm w-100"><i class="bi bi-send"></i> Submit Request to Admin</button>
      </form>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
