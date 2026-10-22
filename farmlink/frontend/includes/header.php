<?php
require_once __DIR__ . '/../../backend/helpers/functions.php';
$pageTitle = $pageTitle ?? 'FarmLink - Fresh From Farm to You';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($pageTitle) ?></title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
<link rel="stylesheet" href="<?= BASE_URL ?>frontend/assets/css/style.css">
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark farmlink-navbar sticky-top">
  <div class="container">
    <a class="navbar-brand fw-bold" href="<?= BASE_URL ?>index.php">
        <i class="bi bi-flower1"></i> FarmLink
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>frontend/buyer/home.php">Shop</a></li>
      </ul>
      <ul class="navbar-nav align-items-lg-center">
        <?php if (is_logged_in()): ?>
            <?php if (current_role() === 'buyer'): ?>
                <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>frontend/buyer/cart.php"><i class="bi bi-cart3"></i> Cart
                    <?php if (!empty($_SESSION['cart'])): ?>
                        <span class="badge bg-warning text-dark"><?= count($_SESSION['cart']) ?></span>
                    <?php endif; ?>
                </a></li>
                <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>frontend/buyer/my-orders.php">My Orders</a></li>
            <?php elseif (current_role() === 'farmer'): ?>
                <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>frontend/farmer/dashboard.php">Dashboard</a></li>
            <?php elseif (current_role() === 'admin'): ?>
                <li class="nav-item"><a class="nav-link" href="<?= BASE_URL ?>frontend/admin/dashboard.php">Admin Panel</a></li>
            <?php endif; ?>
            <li class="nav-item ms-lg-2">
                <a class="btn btn-outline-light btn-sm" href="<?= BASE_URL ?>backend/auth/logout.php">
                    <i class="bi bi-box-arrow-right"></i> Logout (<?= htmlspecialchars($_SESSION['name'] ?? '') ?>)
                </a>
            </li>
        <?php else: ?>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle"></i> Login
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="<?= BASE_URL ?>frontend/auth/buyer-login.php">Buyer Login</a></li>
                    <li><a class="dropdown-item" href="<?= BASE_URL ?>frontend/auth/farmer-login.php">Farmer Login</a></li>
                    <li><a class="dropdown-item" href="<?= BASE_URL ?>frontend/auth/admin-login.php">Admin Login</a></li>
                </ul>
            </li>
            <li class="nav-item">
                <a class="btn btn-warning btn-sm ms-lg-2 fw-semibold" href="<?= BASE_URL ?>frontend/auth/buyer-register.php">Sign Up</a>
            </li>
        <?php endif; ?>
      </ul>
    </div>
  </div>
</nav>

<?php show_message(); ?>
