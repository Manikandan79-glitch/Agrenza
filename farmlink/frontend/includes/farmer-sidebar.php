<?php $current = basename($_SERVER['PHP_SELF']); ?>
<div class="col-lg-3 col-xl-2 mb-4">
    <div class="list-group shadow-sm farmer-sidebar">
        <div class="list-group-item bg-success text-white fw-bold">
            <i class="bi bi-person-badge"></i> Farmer Panel
        </div>
        <a href="<?= BASE_URL ?>frontend/farmer/dashboard.php" class="list-group-item list-group-item-action <?= $current=='dashboard.php'?'active':'' ?>">
            <i class="bi bi-speedometer2"></i> Dashboard
        </a>
        <a href="<?= BASE_URL ?>frontend/farmer/add-product.php" class="list-group-item list-group-item-action <?= $current=='add-product.php'?'active':'' ?>">
            <i class="bi bi-plus-circle"></i> Add Product
        </a>
        <a href="<?= BASE_URL ?>frontend/farmer/my-products.php" class="list-group-item list-group-item-action <?= $current=='my-products.php'?'active':'' ?>">
            <i class="bi bi-box-seam"></i> My Products
        </a>
        <a href="<?= BASE_URL ?>frontend/farmer/orders.php" class="list-group-item list-group-item-action <?= $current=='orders.php'?'active':'' ?>">
            <i class="bi bi-receipt"></i> Orders
        </a>
        <a href="<?= BASE_URL ?>frontend/farmer/earnings.php" class="list-group-item list-group-item-action <?= $current=='earnings.php'?'active':'' ?>">
            <i class="bi bi-cash-coin"></i> Earnings
        </a>
    </div>
</div>
