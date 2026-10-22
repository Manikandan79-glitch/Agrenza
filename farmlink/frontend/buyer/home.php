<?php
require_once __DIR__ . '/../../backend/config/db.php';
require_once __DIR__ . '/../../backend/helpers/functions.php';

$pageTitle = "Shop Fresh Produce - FarmLink";

$categories = mysqli_query($conn, "SELECT * FROM categories ORDER BY name");

$categoryFilter = (int) ($_GET['category'] ?? 0);
$search = clean($_GET['search'] ?? '');

$sql = "SELECT p.*, c.name AS category_name, u.name AS farmer_name FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN users u ON u.id = p.farmer_id
        WHERE p.status = 'active' AND p.stock_kg > 0";

if ($categoryFilter > 0) {
    $sql .= " AND p.category_id = $categoryFilter";
}
if ($search !== '') {
    $sql .= " AND p.name LIKE '%$search%'";
}
$sql .= " ORDER BY p.created_at DESC";

$products = mysqli_query($conn, $sql);

require_once __DIR__ . '/../includes/header.php';
?>

<div class="hero-section-solid mb-4">
  <div class="container">
    <h1 class="fw-bold">Fresh From Farm to Your Doorstep</h1>
    <p class="lead">Buy directly from verified farmers — no middlemen, fair prices.</p>
  </div>
</div>

<div class="container mb-5">
  <form class="row g-2 mb-4" method="GET">
    <div class="col-md-5">
      <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" class="form-control" placeholder="Search products...">
    </div>
    <div class="col-md-4">
      <select name="category" class="form-select" onchange="this.form.submit()">
        <option value="0">All Categories</option>
        <?php mysqli_data_seek($categories, 0); while ($cat = mysqli_fetch_assoc($categories)): ?>
          <option value="<?= $cat['id'] ?>" <?= $categoryFilter == $cat['id'] ? 'selected':'' ?>><?= htmlspecialchars($cat['name']) ?></option>
        <?php endwhile; ?>
      </select>
    </div>
    <div class="col-md-3">
      <button class="btn btn-farm w-100" type="submit"><i class="bi bi-search"></i> Search</button>
    </div>
  </form>

  <div class="row g-4">
    <?php if (mysqli_num_rows($products) === 0): ?>
      <p class="text-center text-muted py-5">No products found.</p>
    <?php endif; ?>
    <?php while ($p = mysqli_fetch_assoc($products)): ?>
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card product-card">
          <img src="<?= UPLOAD_URL . htmlspecialchars($p['image']) ?>" alt="<?= htmlspecialchars($p['name']) ?>">
          <div class="card-body">
            <span class="badge bg-success-subtle text-success mb-1"><?= htmlspecialchars($p['category_name']) ?></span>
            <h6 class="mb-1"><?= htmlspecialchars($p['name']) ?></h6>
            <p class="small text-muted mb-1">By <?= htmlspecialchars($p['farmer_name']) ?></p>
            <p class="price-tag mb-2"><?= rupee($p['price_per_kg']) ?> / kg</p>
            <a href="<?= BASE_URL ?>frontend/buyer/product-details.php?id=<?= $p['id'] ?>" class="btn btn-farm btn-sm w-100">View Product</a>
          </div>
        </div>
      </div>
    <?php endwhile; ?>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
