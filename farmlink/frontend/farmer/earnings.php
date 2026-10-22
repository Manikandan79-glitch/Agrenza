<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('farmer');

$farmerId = (int) $_SESSION['user_id'];
$pageTitle = "Earnings - FarmLink";

$totalRow = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COALESCE(SUM(subtotal),0) t FROM order_items WHERE farmer_id = $farmerId AND item_status = 'delivered'"));
$total = $totalRow['t'];

$pendingRow = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COALESCE(SUM(subtotal),0) t FROM order_items WHERE farmer_id = $farmerId AND item_status IN ('pending','confirmed','shipped')"));
$pendingAmount = $pendingRow['t'];

$history = mysqli_query($conn, "
    SELECT oi.*, o.created_at AS order_date, p.name AS product_name
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE oi.farmer_id = $farmerId AND oi.item_status = 'delivered'
    ORDER BY o.created_at DESC
");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/farmer-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h5 class="mb-3"><i class="bi bi-cash-coin"></i> My Earnings</h5>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card stat-card bg-green p-3">
            <p class="mb-0 small">Total Earned (Delivered Orders)</p>
            <h3 class="mb-0"><?= rupee($total) ?></h3>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card stat-card bg-gold p-3">
            <p class="mb-0 small">Pending Amount (In Progress Orders)</p>
            <h3 class="mb-0"><?= rupee($pendingAmount) ?></h3>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header bg-white">Earnings History</div>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Date</th><th>Product</th><th>Qty (Kg)</th><th>Amount</th></tr></thead>
            <tbody>
              <?php if (mysqli_num_rows($history) === 0): ?>
                <tr><td colspan="4" class="text-center text-muted py-4">No delivered orders yet.</td></tr>
              <?php endif; ?>
              <?php while ($row = mysqli_fetch_assoc($history)): ?>
                <tr>
                  <td><?= fdate($row['order_date']) ?></td>
                  <td><?= htmlspecialchars($row['product_name']) ?></td>
                  <td><?= $row['quantity_kg'] ?></td>
                  <td class="text-success fw-semibold"><?= rupee($row['subtotal']) ?></td>
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
