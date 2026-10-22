<?php $current = basename($_SERVER['PHP_SELF']); ?>
<div class="col-lg-3 col-xl-2 mb-4">
    <div class="list-group shadow-sm farmer-sidebar">
        <div class="list-group-item bg-dark text-white fw-bold">
            <i class="bi bi-shield-lock"></i> Admin Panel
        </div>
        <a href="<?= BASE_URL ?>frontend/admin/dashboard.php" class="list-group-item list-group-item-action <?= $current=='dashboard.php'?'active':'' ?>">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>
        <a href="<?= BASE_URL ?>frontend/admin/farmers.php" class="list-group-item list-group-item-action <?= $current=='farmers.php'?'active':'' ?>">
            <i class="bi bi-people"></i> Manage Farmers
        </a>
        <a href="<?= BASE_URL ?>frontend/admin/products.php" class="list-group-item list-group-item-action <?= $current=='products.php'?'active':'' ?>">
            <i class="bi bi-box-seam"></i> All Products
        </a>
        <a href="<?= BASE_URL ?>frontend/admin/orders.php" class="list-group-item list-group-item-action <?= $current=='orders.php'?'active':'' ?>">
            <i class="bi bi-receipt"></i> All Orders
        </a>
        <a href="<?= BASE_URL ?>frontend/admin/bulk-requests.php" class="list-group-item list-group-item-action <?= $current=='bulk-requests.php'?'active':'' ?>">
            <i class="bi bi-boxes"></i> Bulk Requests
        </a>
    </div>
</div>
