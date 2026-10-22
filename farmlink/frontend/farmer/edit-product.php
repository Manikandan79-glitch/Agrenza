<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('farmer');

$farmerId  = (int) $_SESSION['user_id'];
$productId = (int) ($_GET['id'] ?? 0);

$res = mysqli_query($conn, "SELECT * FROM products WHERE id = $productId AND farmer_id = $farmerId LIMIT 1");
$product = mysqli_fetch_assoc($res);

if (!$product) {
    set_message('Product not found.', 'danger');
    redirect(BASE_URL . 'frontend/farmer/my-products.php');
}

$pageTitle = "Edit Product - FarmLink";
$categories = mysqli_query($conn, "SELECT * FROM categories ORDER BY name");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/farmer-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <div class="card shadow-sm">
        <div class="card-header bg-white"><h5 class="mb-0"><i class="bi bi-pencil-square"></i> Edit Product</h5></div>
        <div class="card-body">
          <form action="<?= BASE_URL ?>backend/farmer/update-product-process.php" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Product Name</label>
                <input type="text" name="name" class="form-control" value="<?= htmlspecialchars($product['name']) ?>" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Category</label>
                <select name="category_id" class="form-select" required>
                  <?php mysqli_data_seek($categories, 0); while ($cat = mysqli_fetch_assoc($categories)): ?>
                    <option value="<?= $cat['id'] ?>" <?= $cat['id'] == $product['category_id'] ? 'selected' : '' ?>><?= htmlspecialchars($cat['name']) ?></option>
                  <?php endwhile; ?>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Price per Kg (₹)</label>
                <input type="number" step="0.01" min="1" name="price_per_kg" class="form-control" value="<?= $product['price_per_kg'] ?>" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Available Stock (Kg)</label>
                <input type="number" step="0.01" min="0" name="stock_kg" class="form-control" value="<?= $product['stock_kg'] ?>" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <select name="status" class="form-select">
                  <option value="active" <?= $product['status']=='active'?'selected':'' ?>>Active</option>
                  <option value="inactive" <?= $product['status']=='inactive'?'selected':'' ?>>Inactive</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Replace Image (optional)</label>
                <input type="file" name="product_image" accept="image/*" class="form-control">
                <img src="<?= UPLOAD_URL . htmlspecialchars($product['image']) ?>" class="mt-2" width="70" style="border-radius:8px;">
              </div>
              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea name="description" rows="4" class="form-control"><?= htmlspecialchars($product['description']) ?></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-farm mt-4"><i class="bi bi-check-circle"></i> Update Product</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
