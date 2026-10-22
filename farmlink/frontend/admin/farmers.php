<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_admin();

$pageTitle = "Manage Farmers - FarmLink";
$farmers = mysqli_query($conn, "SELECT * FROM users WHERE role = 'farmer' ORDER BY FIELD(status,'pending','approved','rejected'), created_at DESC");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/admin-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <h5 class="mb-3"><i class="bi bi-people"></i> Manage Farmers</h5>
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead><tr><th>Name</th><th>Mobile</th><th>Aadhaar</th><th>Registered</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <?php if (mysqli_num_rows($farmers) === 0): ?>
                <tr><td colspan="6" class="text-center text-muted py-4">No farmers registered yet.</td></tr>
              <?php endif; ?>
              <?php while ($f = mysqli_fetch_assoc($farmers)): ?>
                <tr>
                  <td><?= htmlspecialchars($f['name']) ?></td>
                  <td><?= htmlspecialchars($f['mobile']) ?></td>
                  <td><?= htmlspecialchars($f['aadhaar']) ?></td>
                  <td><?= fdate($f['created_at']) ?></td>
                  <td><?= status_badge($f['status']) ?></td>
                  <td>
                    <?php if ($f['status'] === 'pending'): ?>
                      <a href="<?= BASE_URL ?>backend/admin/approve-farmer-process.php?id=<?= $f['id'] ?>" class="btn btn-sm btn-success">Approve</a>
                      <a href="<?= BASE_URL ?>backend/admin/reject-farmer-process.php?id=<?= $f['id'] ?>" class="btn btn-sm btn-danger" onclick="return confirmDelete('Reject this farmer application?')">Reject</a>
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
