<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('farmer');

$farmerId = (int) $_SESSION['user_id'];
$pageTitle = "Orders - FarmLink";

$items = mysqli_query($conn, "
    SELECT oi.*, o.created_at AS order_date, o.address, u.name AS buyer_name, u.mobile AS buyer_mobile, p.name AS product_name
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN users u ON u.id = o.buyer_id
    JOIN products p ON p.id = oi.product_id
    WHERE oi.farmer_id = $farmerId
    ORDER BY o.created_at DESC
");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/farmer-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h5 class="mb-3"><i class="bi bi-receipt"></i> Orders Received</h5>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table mb-0 align-middle">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Buyer</th><th>Qty (Kg)</th><th>Subtotal</th><th>Status</th><th>Update</th></tr>
            </thead>
            <tbody>
              <?php if (mysqli_num_rows($items) === 0): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">No orders yet.</td></tr>
              <?php endif; ?>
              <?php while ($row = mysqli_fetch_assoc($items)): ?>
                <tr>
                  <td><?= fdate($row['order_date']) ?></td>
                  <td><?= htmlspecialchars($row['product_name']) ?></td>
                  <td><?= htmlspecialchars($row['buyer_name']) ?><br><small class="text-muted"><?= htmlspecialchars($row['buyer_mobile']) ?></small></td>
                  <td><?= $row['quantity_kg'] ?></td>
                  <td><?= rupee($row['subtotal']) ?></td>
                  <td><?= status_badge($row['item_status']) ?></td>
                  <td>
                    <?php if (!in_array($row['item_status'], ['delivered','cancelled'])): ?>
                    <form action="<?= BASE_URL ?>backend/farmer/update-order-status-process.php" method="POST" class="d-flex gap-1">
                      <input type="hidden" name="item_id" value="<?= $row['id'] ?>">
                      <select name="status" class="form-select form-select-sm">
                        <option value="pending" <?= $row['item_status']=='pending'?'selected':'' ?>>Pending</option>
                        <option value="confirmed" <?= $row['item_status']=='confirmed'?'selected':'' ?>>Confirmed</option>
                        <option value="shipped" <?= $row['item_status']=='shipped'?'selected':'' ?>>Shipped</option>
                        <option value="delivered" <?= $row['item_status']=='delivered'?'selected':'' ?>>Delivered</option>
                        <option value="cancelled" <?= $row['item_status']=='cancelled'?'selected':'' ?>>Cancelled</option>
                      </select>
                      <button class="btn btn-sm btn-farm"><i class="bi bi-check"></i></button>
                    </form>
                    <?php else: ?>
                        <span class="text-muted small">Final</span>
                    <?php endif; ?>
                  </td>
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
