<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('farmer');

$pageTitle = "Add Product - FarmLink";
$categories = mysqli_query($conn, "SELECT * FROM categories ORDER BY name");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/farmer-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <div class="card shadow-sm">
        <div class="card-header bg-white"><h5 class="mb-0"><i class="bi bi-plus-circle"></i> Add New Product</h5></div>
        <div class="card-body">
          <form action="<?= BASE_URL ?>backend/farmer/add-product-process.php" method="POST" enctype="multipart/form-data">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Product Name</label>
                <input type="text" name="name" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Category</label>
                <select name="category_id" class="form-select" required>
                  <option value="" selected disabled>Select category</option>
                  <?php while ($cat = mysqli_fetch_assoc($categories)): ?>
                    <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></option>
                  <?php endwhile; ?>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Price per Kg (₹)</label>
                <input type="number" step="0.01" min="1" name="price_per_kg" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Available Stock (Kg)</label>
                <input type="number" step="0.01" min="1" name="stock_kg" class="form-control" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Product Image</label>
                <input type="file" name="product_image" accept="image/*" class="form-control" required>
              </div>
              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea name="description" rows="4" class="form-control" placeholder="Describe quality, freshness, farming method etc."></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-farm mt-4"><i class="bi bi-check-circle"></i> Add Product</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
