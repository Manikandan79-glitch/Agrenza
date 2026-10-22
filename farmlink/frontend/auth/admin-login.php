<?php
$pageTitle = "Admin Login - FarmLink";
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container">
  <div class="card auth-card">
    <div class="card-body p-4">
      <h4 class="text-center mb-1"><i class="bi bi-shield-lock"></i> Admin Login</h4>
      <p class="text-center text-muted small mb-4">Restricted access for FarmLink administrators</p>

      <form action="<?= BASE_URL ?>backend/auth/admin-login-process.php" method="POST">
        <div class="mb-3">
          <label class="form-label">Mobile Number</label>
          <input type="text" name="mobile" class="form-control" maxlength="10" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-dark w-100">Login</button>
      </form>
      <p class="text-center mt-3 small text-muted">Default: 9999999999 / admin123</p>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
