<?php
require_once __DIR__ . '/backend/config/db.php';
require_once __DIR__ . '/backend/helpers/functions.php';

// If already logged in, send to the right dashboard
if (is_logged_in()) {
    switch (current_role()) {
        case 'farmer': redirect(BASE_URL . 'frontend/farmer/dashboard.php');
        case 'buyer':  redirect(BASE_URL . 'frontend/buyer/home.php');
        case 'admin':  redirect(BASE_URL . 'frontend/admin/dashboard.php');
    }
}

$pageTitle = "FarmLink - Fresh From Farm to You";

// Show a few featured products on the landing page
$featured = mysqli_query($conn, "
    SELECT p.*, u.name AS farmer_name FROM products p
    JOIN users u ON u.id = p.farmer_id
    WHERE p.status = 'active' AND p.stock_kg > 0
    ORDER BY p.created_at DESC LIMIT 8
");

require_once __DIR__ . '/frontend/includes/header.php';
?>

<!--<div class="hero-section">
  <div class="container">
    <h1 class="display-5 fw-bold">Welcome to FarmLink</h1>
    <p class="lead">Connecting farmers directly with buyers &mdash; fresh produce, fair prices, no middlemen.</p>
    <div class="mt-4">
      <a href="<?= BASE_URL ?>frontend/buyer/home.php" class="btn btn-warning btn-lg fw-semibold me-2">
        <i class="bi bi-basket"></i> Shop Now
      </a>
      <a href="<?= BASE_URL ?>frontend/auth/farmer-register.php" class="btn btn-outline-light btn-lg">
        <i class="bi bi-person-plus"></i> Become a Farmer Partner
      </a>
    </div>
  </div>
</div>-->
<div class="hero-overlay"></div>   

<div class="hero-section">
  <video class="hero-video-bg" autoplay muted loop playsinline>
    <source src="<?= BASE_URL ?>frontend/assets/video/farmer.mp4" type="video/mp4">
  </video>
  <div class="hero-overlay"></div>
  <div class="container hero-content">
    <h1 class="display-5 fw-bold">Welcome to FarmLink</h1>
    <p class="lead">Connecting farmers directly with buyers &mdash; fresh produce, fair prices, no middlemen.</p>
    <div class="mt-4">
      <a href="<?= BASE_URL ?>frontend/buyer/home.php" class="btn btn-warning btn-lg fw-semibold me-2">
        <i class="bi bi-basket"></i> Shop Now
      </a>
      <a href="<?= BASE_URL ?>frontend/auth/farmer-register.php" class="btn btn-outline-light btn-lg">
        <i class="bi bi-person-plus"></i> Become a Farmer Partner
      </a>
    </div>
  </div>
</div>

<div class="container my-5">
  <div class="row text-center g-4 mb-5">
    <div class="col-md-4">
      <i class="bi bi-truck fs-1 text-success"></i>
      <h5 class="mt-2">Direct From Farm</h5>
      <p class="text-muted small">Produce comes straight from the farmer, ensuring freshness and fair pricing.</p>
    </div>
    <div class="col-md-4">
      <i class="bi bi-shield-check fs-1 text-success"></i>
      <h5 class="mt-2">Verified Farmers</h5>
      <p class="text-muted small">Every farmer is verified with Aadhaar and approved by our admin team.</p>
    </div>
    <div class="col-md-4">
      <i class="bi bi-boxes fs-1 text-success"></i>
      <h5 class="mt-2">Bulk Orders Supported</h5>
      <p class="text-muted small">Need large quantities? Submit a bulk request and get admin-approved pricing.</p>
    </div>
  </div>

  <h4 class="mb-3">Featured Products</h4>
  <div class="row g-4">
    <?php if (mysqli_num_rows($featured) === 0): ?>
      <p class="text-muted">No products available right now. Please check back soon.</p>
    <?php endif; ?>
    <?php while ($p = mysqli_fetch_assoc($featured)): ?>
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="card product-card">
          <img src="<?= UPLOAD_URL . htmlspecialchars($p['image']) ?>" alt="<?= htmlspecialchars($p['name']) ?>">
          <div class="card-body">
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

<?php require_once __DIR__ . '/frontend/includes/footer.php'; ?>
