<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('farmer');

$farmerId = (int) $_SESSION['user_id'];
$pageTitle = "Farmer Dashboard - FarmLink";

// Total products
$productCount = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM products WHERE farmer_id = $farmerId"))['c'];

// Total earnings (delivered items only)
$earningsRow = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COALESCE(SUM(subtotal),0) t FROM order_items WHERE farmer_id = $farmerId AND item_status = 'delivered'"));
$totalEarnings = $earningsRow['t'];

// Pending orders (items not yet delivered/cancelled)
$pendingRow = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM order_items WHERE farmer_id = $farmerId AND item_status IN ('pending','confirmed','shipped')"));
$pendingOrders = $pendingRow['c'];

// Low stock alert
$lowStockRes = mysqli_query($conn, "SELECT name, stock_kg FROM products WHERE farmer_id = $farmerId AND stock_kg < 5 ORDER BY stock_kg ASC");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/farmer-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h4 class="mb-4"><i class="bi bi-speedometer2"></i> Welcome, <?= htmlspecialchars($_SESSION['name']) ?></h4>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card stat-card bg-green p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-0 small">Total Products</p>
                <h3 class="mb-0"><?= $productCount ?></h3>
              </div>
              <i class="bi bi-box-seam fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card bg-gold p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-0 small">Total Earnings</p>
                <h3 class="mb-0"><?= rupee($totalEarnings) ?></h3>
              </div>
              <i class="bi bi-cash-coin fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card bg-blue p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="mb-0 small">Pending Orders</p>
                <h3 class="mb-0"><?= $pendingOrders ?></h3>
              </div>
              <i class="bi bi-receipt fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>

      <?php if (mysqli_num_rows($lowStockRes) > 0): ?>
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-warning-subtle fw-semibold"><i class="bi bi-exclamation-triangle"></i> Low Stock Alert</div>
        <ul class="list-group list-group-flush">
          <?php while ($row = mysqli_fetch_assoc($lowStockRes)): ?>
            <li class="list-group-item d-flex justify-content-between">
                <span><?= htmlspecialchars($row['name']) ?></span>
                <span class="text-danger fw-semibold"><?= $row['stock_kg'] ?> kg left</span>
            </li>
          <?php endwhile; ?>
        </ul>
      </div>
      <?php endif; ?>

      <div class="card shadow-sm">
        <div class="card-body">
          <h6 class="mb-3">Quick Actions</h6>
          <a href="<?= BASE_URL ?>frontend/farmer/add-product.php" class="btn btn-farm me-2"><i class="bi bi-plus-circle"></i> Add New Product</a>
          <a href="<?= BASE_URL ?>frontend/farmer/orders.php" class="btn btn-outline-secondary"><i class="bi bi-receipt"></i> View Orders</a>
        </div>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
