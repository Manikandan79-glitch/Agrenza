<?php
$pageTitle = "Buyer Login - FarmLink";
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container">
  <div class="card auth-card">
    <div class="card-body p-4">
      <h4 class="text-center mb-1"><i class="bi bi-bag-check"></i> Buyer Login</h4>
      <p class="text-center text-muted small mb-4">Login to shop fresh produce</p>

      <form action="<?= BASE_URL ?>backend/auth/buyer-login-process.php" method="POST">
        <div class="mb-3">
          <label class="form-label">Mobile Number</label>
          <input type="text" name="mobile" class="form-control" maxlength="10" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-farm w-100">Login</button>
      </form>
      <p class="text-center mt-3 small">New here?
        <a href="<?= BASE_URL ?>frontend/auth/buyer-register.php">Create an account</a>
      </p>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
