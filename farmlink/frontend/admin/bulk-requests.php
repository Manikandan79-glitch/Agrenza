<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_admin();

$pageTitle = "Bulk Requests - FarmLink";

$requests = mysqli_query($conn, "
    SELECT br.*, p.name AS product_name, p.stock_kg, u.name AS buyer_name, u.mobile AS buyer_mobile
    FROM bulk_requests br
    JOIN products p ON p.id = br.product_id
    JOIN users u ON u.id = br.buyer_id
    ORDER BY FIELD(br.status,'pending','approved','rejected'), br.created_at DESC
");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/admin-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h5 class="mb-3"><i class="bi bi-boxes"></i> Bulk Purchase Requests</h5>

      <?php if (mysqli_num_rows($requests) === 0): ?>
        <div class="card shadow-sm"><div class="card-body text-center py-5 text-muted">No bulk requests submitted yet.</div></div>
      <?php endif; ?>

      <?php while ($r = mysqli_fetch_assoc($requests)): ?>
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between flex-wrap mb-2">
              <h6 class="mb-0"><?= htmlspecialchars($r['product_name']) ?> &mdash; <?= $r['quantity_kg'] ?> kg requested</h6>
              <?= status_badge($r['status']) ?>
            </div>
            <p class="mb-1 small text-muted">Buyer: <?= htmlspecialchars($r['buyer_name']) ?> (<?= htmlspecialchars($r['buyer_mobile']) ?>)</p>
            <p class="mb-1 small text-muted">Current Stock Available: <?= $r['stock_kg'] ?> kg</p>
            <p class="mb-2"><strong>Reason:</strong> <?= htmlspecialchars($r['reason']) ?></p>
            <?php if ($r['remark']): ?>
              <p class="small text-muted mb-2"><strong>Admin Remark:</strong> <?= htmlspecialchars($r['remark']) ?></p>
            <?php endif; ?>

            <?php if ($r['status'] === 'pending'): ?>
              <div class="row g-2">
                <div class="col-md-8">
                  <form action="<?= BASE_URL ?>backend/admin/approve-bulk-request-process.php" method="POST" class="d-flex gap-2">
                    <input type="hidden" name="request_id" value="<?= $r['id'] ?>">
                    <input type="text" name="remark" class="form-control form-control-sm" placeholder="Optional remark">
                    <button class="btn btn-sm btn-success text-nowrap">Approve</button>
                  </form>
                </div>
                <div class="col-md-4">
                  <form action="<?= BASE_URL ?>backend/admin/reject-bulk-request-process.php" method="POST" class="d-flex gap-2">
                    <input type="hidden" name="request_id" value="<?= $r['id'] ?>">
                    <input type="text" name="remark" class="form-control form-control-sm" placeholder="Reason (optional)">
                    <button class="btn btn-sm btn-danger text-nowrap">Reject</button>
                  </form>
                </div>
              </div>
            <?php endif; ?>
          </div>
        </div>
      <?php endwhile; ?>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
