<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_admin();

$pageTitle = "All Products - FarmLink";

$products = mysqli_query($conn, "
    SELECT p.*, c.name AS category_name, u.name AS farmer_name, u.mobile AS farmer_mobile
    FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN users u ON u.id = p.farmer_id
    ORDER BY p.created_at DESC
");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/admin-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h5 class="mb-3"><i class="bi bi-box-seam"></i> All Products</h5>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Farmer</th><th>Price/Kg</th><th>Stock (Kg)</th><th>Status</th></tr>
            </thead>
            <tbody>
              <?php if (mysqli_num_rows($products) === 0): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">No products listed yet.</td></tr>
              <?php endif; ?>
              <?php while ($p = mysqli_fetch_assoc($products)): ?>
                <tr>
                  <td><img src="<?= UPLOAD_URL . htmlspecialchars($p['image']) ?>" width="55" height="55" style="object-fit:cover;border-radius:8px;"></td>
                  <td><?= htmlspecialchars($p['name']) ?></td>
                  <td><?= htmlspecialchars($p['category_name']) ?></td>
                  <td><?= htmlspecialchars($p['farmer_name']) ?><br><small class="text-muted"><?= htmlspecialchars($p['farmer_mobile']) ?></small></td>
                  <td><?= rupee($p['price_per_kg']) ?></td>
                  <td><?= $p['stock_kg'] ?></td>
                  <td><?= status_badge($p['status']) ?></td>
                </tr>
              <?php endwhile; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
