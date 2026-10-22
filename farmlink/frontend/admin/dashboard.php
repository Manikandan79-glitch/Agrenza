<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_admin();

$pageTitle = "Admin Dashboard - FarmLink";

$totalFarmers = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM users WHERE role='farmer' AND status='approved'"))['c'];
$pendingFarmers = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM users WHERE role='farmer' AND status='pending'"))['c'];
$totalBuyers = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM users WHERE role='buyer'"))['c'];
$totalProducts = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM products"))['c'];
$totalOrders = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM orders"))['c'];
$pendingBulk = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(*) c FROM bulk_requests WHERE status='pending'"))['c'];
$totalRevenue = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COALESCE(SUM(total_amount),0) t FROM orders WHERE status != 'cancelled'"))['t'];

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/admin-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h4 class="mb-4"><i class="bi bi-speedometer2"></i> Admin Dashboard</h4>
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="card stat-card bg-green p-3">
            <p class="mb-0 small">Approved Farmers</p><h3 class="mb-0"><?= $totalFarmers ?></h3>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="card stat-card bg-gold p-3">
            <p class="mb-0 small">Pending Farmer Approvals</p><h3 class="mb-0"><?= $pendingFarmers ?></h3>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="card stat-card bg-blue p-3">
            <p class="mb-0 small">Total Buyers</p><h3 class="mb-0"><?= $totalBuyers ?></h3>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="card stat-card bg-red p-3">
            <p class="mb-0 small">Pending Bulk Requests</p><h3 class="mb-0"><?= $pendingBulk ?></h3>
          </div>
        </div>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm p-3">
            <p class="mb-0 small text-muted">Total Products</p><h4><?= $totalProducts ?></h4>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm p-3">
            <p class="mb-0 small text-muted">Total Orders</p><h4><?= $totalOrders ?></h4>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card shadow-sm p-3">
            <p class="mb-0 small text-muted">Total Revenue</p><h4><?= rupee($totalRevenue) ?></h4>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <h6>Quick Actions</h6>
          <a href="<?= BASE_URL ?>frontend/admin/farmers.php" class="btn btn-outline-success me-2">Review Farmer Approvals</a>
          <a href="<?= BASE_URL ?>frontend/admin/bulk-requests.php" class="btn btn-outline-warning">Review Bulk Requests</a>
        </div>
      </div>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
