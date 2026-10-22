<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('buyer');

$buyerId = (int) $_SESSION['user_id'];
$pageTitle = "My Orders - FarmLink";

$orders = mysqli_query($conn, "SELECT * FROM orders WHERE buyer_id = $buyerId ORDER BY created_at DESC");

$bulkRequests = mysqli_query($conn, "
    SELECT br.*, p.name AS product_name FROM bulk_requests br
    JOIN products p ON p.id = br.product_id
    WHERE br.buyer_id = $buyerId ORDER BY br.created_at DESC
");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <ul class="nav nav-tabs mb-3">
    <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#ordersTab">My Orders</a></li>
    <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#bulkTab">My Bulk Requests</a></li>
  </ul>

  <div class="tab-content">
    <div class="tab-pane fade show active" id="ordersTab">
      <?php if (mysqli_num_rows($orders) === 0): ?>
        <div class="card shadow-sm"><div class="card-body text-center py-5 text-muted">No orders placed yet.</div></div>
      <?php endif; ?>
      <?php while ($order = mysqli_fetch_assoc($orders)): ?>
        <?php
        $items = mysqli_query($conn, "
            SELECT oi.*, p.name AS product_name, p.image FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = " . $order['id']
        );
        ?>
        <div class="card shadow-sm mb-3">
          <div class="card-header bg-white d-flex justify-content-between">
            <span>Order #<?= $order['id'] ?> &bull; <?= fdate($order['created_at']) ?></span>
            <span><?= status_badge($order['status']) ?></span>
          </div>
          <ul class="list-group list-group-flush">
            <?php while ($item = mysqli_fetch_assoc($items)): ?>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><?= htmlspecialchars($item['product_name']) ?> (<?= $item['quantity_kg'] ?> kg)</span>
                <span><?= rupee($item['subtotal']) ?> <?= status_badge($item['item_status']) ?></span>
              </li>
            <?php endwhile; ?>
          </ul>
          <div class="card-footer bg-white d-flex justify-content-between">
            <span class="text-muted small">Payment: <?= strtoupper($order['payment_mode']) ?></span>
            <strong>Total: <?= rupee($order['total_amount']) ?></strong>
          </div>
        </div>
      <?php endwhile; ?>
    </div>

    <div class="tab-pane fade" id="bulkTab">
      <?php if (mysqli_num_rows($bulkRequests) === 0): ?>
        <div class="card shadow-sm"><div class="card-body text-center py-5 text-muted">No bulk requests submitted yet.</div></div>
      <?php endif; ?>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table mb-0 align-middle">
            <thead><tr><th>Product</th><th>Qty (Kg)</th><th>Reason</th><th>Status</th><th>Remark</th><th>Action</th></tr></thead>
            <tbody>
              <?php while ($req = mysqli_fetch_assoc($bulkRequests)): ?>
                <tr>
                  <td><?= htmlspecialchars($req['product_name']) ?></td>
                  <td><?= $req['quantity_kg'] ?></td>
                  <td class="small"><?= htmlspecialchars($req['reason']) ?></td>
                  <td><?= status_badge($req['status']) ?></td>
                  <td class="small text-muted"><?= htmlspecialchars($req['remark'] ?? '-') ?></td>
                  <td>
                    <?php if ($req['status'] === 'approved'): ?>
                      <a href="<?= BASE_URL ?>backend/buyer/buy-bulk-approved-process.php?id=<?= $req['id'] ?>" class="btn btn-sm btn-farm">Buy Now</a>
                    <?php else: ?>
                      <span class="text-muted small">-</span>
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
