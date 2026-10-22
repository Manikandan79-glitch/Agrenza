<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_admin();

$pageTitle = "All Orders - FarmLink";

$orders = mysqli_query($conn, "
    SELECT o.*, u.name AS buyer_name, u.mobile AS buyer_mobile
    FROM orders o
    JOIN users u ON u.id = o.buyer_id
    ORDER BY o.created_at DESC
");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/admin-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h5 class="mb-3"><i class="bi bi-receipt"></i> All Orders</h5>

      <?php if (mysqli_num_rows($orders) === 0): ?>
        <div class="card shadow-sm"><div class="card-body text-center py-5 text-muted">No orders placed yet.</div></div>
      <?php endif; ?>

      <?php while ($order = mysqli_fetch_assoc($orders)): ?>
        <?php
        $items = mysqli_query($conn, "
            SELECT oi.*, p.name AS product_name, f.name AS farmer_name
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            JOIN users f ON f.id = oi.farmer_id
            WHERE oi.order_id = " . $order['id']
        );
        ?>
        <div class="card shadow-sm mb-3">
          <div class="card-header bg-white d-flex justify-content-between flex-wrap">
            <span>Order #<?= $order['id'] ?> &bull; <?= htmlspecialchars($order['buyer_name']) ?> (<?= htmlspecialchars($order['buyer_mobile']) ?>)</span>
            <span><?= fdate($order['created_at']) ?> &nbsp; <?= status_badge($order['status']) ?></span>
          </div>
          <ul class="list-group list-group-flush">
            <?php while ($item = mysqli_fetch_assoc($items)): ?>
              <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                <span><?= htmlspecialchars($item['product_name']) ?> (<?= $item['quantity_kg'] ?> kg) &mdash; Farmer: <?= htmlspecialchars($item['farmer_name']) ?></span>
                <span><?= rupee($item['subtotal']) ?> <?= status_badge($item['item_status']) ?></span>
              </li>
            <?php endwhile; ?>
          </ul>
          <div class="card-footer bg-white d-flex justify-content-between">
            <span class="text-muted small">Address: <?= htmlspecialchars($order['address']) ?></span>
            <strong>Total: <?= rupee($order['total_amount']) ?></strong>
          </div>
        </div>
      <?php endwhile; ?>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
