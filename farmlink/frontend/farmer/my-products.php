<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';
require_role('farmer');

$farmerId = (int) $_SESSION['user_id'];
$pageTitle = "My Products - FarmLink";

$products = mysqli_query($conn, "SELECT p.*, c.name AS category_name FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.farmer_id = $farmerId ORDER BY p.created_at DESC");

require_once __DIR__ . '/../includes/header.php';
?>
<div class="container my-4">
  <div class="row">
    <?php require __DIR__ . '/../includes/farmer-sidebar.php'; ?>
    <div class="col-lg-9 col-xl-10">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0"><i class="bi bi-box-seam"></i> My Products &amp; Stock</h5>
        <a href="<?= BASE_URL ?>frontend/farmer/add-product.php" class="btn btn-farm btn-sm"><i class="bi bi-plus-circle"></i> Add Product</a>
      </div>

      <?php flash(); ?>

      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Image</th><th>Name</th><th>Category</th><th>Price/Kg</th><th>Stock (Kg)</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php if (mysqli_num_rows($products) === 0): ?>
                <tr><td colspan="7" class="text-center text-muted py-4">No products added yet.</td></tr>
              <?php endif; ?>
              <?php while ($p = mysqli_fetch_assoc($products)): ?>
                <tr>
                  <td><img src="<?= UPLOAD_URL . htmlspecialchars($p['image']) ?>" width="55" height="55" style="object-fit:cover;border-radius:8px;"></td>
                  <td><strong><?= htmlspecialchars($p['name']) ?></strong></td>
                  <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($p['category_name']) ?></span></td>
                  <td><?= rupee($p['price_per_kg']) ?></td>
                  <td>
                    <?php if ((float)$p['stock_kg'] <= 0): ?>
                      <span class="badge bg-danger">0 kg (Out of Stock)</span>
                    <?php elseif ((float)$p['stock_kg'] <= 15): ?>
                      <span class="badge bg-warning text-dark"><?= $p['stock_kg'] ?> kg (Low)</span>
                    <?php else: ?>
                      <span class="badge bg-success"><?= $p['stock_kg'] ?> kg</span>
                    <?php endif; ?>
                    <button type="button" class="btn btn-sm btn-outline-success ms-1 py-0 px-2"
                            data-bs-toggle="modal" data-bs-target="#refillModal"
                            data-id="<?= $p['id'] ?>"
                            data-name="<?= htmlspecialchars($p['name']) ?>"
                            data-stock="<?= $p['stock_kg'] ?>">
                      <i class="bi bi-plus-lg"></i> Refill
                    </button>
                  </td>
                  <td><?= status_badge($p['status']) ?></td>
                  <td>
                    <button type="button" class="btn btn-sm btn-success text-white me-1"
                            data-bs-toggle="modal" data-bs-target="#refillModal"
                            data-id="<?= $p['id'] ?>"
                            data-name="<?= htmlspecialchars($p['name']) ?>"
                            data-stock="<?= $p['stock_kg'] ?>" title="Refill Stock">
                      <i class="bi bi-arrow-repeat"></i> Refill
                    </button>
                    <a href="<?= BASE_URL ?>frontend/farmer/edit-product.php?id=<?= $p['id'] ?>" class="btn btn-sm btn-outline-primary" title="Edit Product"><i class="bi bi-pencil"></i></a>
                    <a href="<?= BASE_URL ?>backend/farmer/delete-product-process.php?id=<?= $p['id'] ?>"
                       class="btn btn-sm btn-outline-danger"
                       onclick="return confirmDelete('Delete this product?')"><i class="bi bi-trash"></i></a>
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

<!-- Refill Stock Modal -->
<div class="modal fade" id="refillModal" tabindex="-1" aria-labelledby="refillModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <form action="<?= BASE_URL ?>backend/farmer/refill-product-process.php" method="POST">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title" id="refillModalLabel"><i class="bi bi-box-arrow-in-down"></i> Refill Product Stock</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" name="id" id="refillProductId" value="">
          
          <div class="mb-3 p-3 bg-light rounded border">
            <h6 class="mb-1 text-success fw-bold" id="refillProductName">Product Name</h6>
            <div class="text-muted small">Current In-Stock: <strong id="refillCurrentStock">0</strong> kg</div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Quantity to Add (Kg) <span class="text-danger">*</span></label>
            <div class="input-group">
              <input type="number" step="0.5" min="0.1" name="refill_kg" id="refillInputKg" class="form-control" placeholder="e.g. 50" required value="50">
              <span class="input-group-text">kg</span>
            </div>
            <div class="form-text">Choose a quick preset or type custom quantity:</div>
            <div class="d-flex gap-2 mt-2 flex-wrap">
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setRefillPreset(10)">+10 kg</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setRefillPreset(25)">+25 kg</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setRefillPreset(50)">+50 kg</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setRefillPreset(100)">+100 kg</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="setRefillPreset(250)">+250 kg</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-success"><i class="bi bi-check-circle"></i> Confirm Refill</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  var refillModal = document.getElementById('refillModal');
  if (refillModal) {
    refillModal.addEventListener('show.bs.modal', function (event) {
      var button = event.relatedTarget;
      var id = button.getAttribute('data-id');
      var name = button.getAttribute('data-name');
      var stock = button.getAttribute('data-stock');

      document.getElementById('refillProductId').value = id;
      document.getElementById('refillProductName').textContent = name;
      document.getElementById('refillCurrentStock').textContent = stock;
    });
  }
});

function setRefillPreset(val) {
  var input = document.getElementById('refillInputKg');
  if (input) input.value = val;
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
