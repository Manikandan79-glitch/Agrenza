<?php
$pageTitle = "Buyer Registration - FarmLink";
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container">
  <div class="card auth-card">
    <div class="card-body p-4">
      <h4 class="text-center mb-1"><i class="bi bi-bag-plus"></i> Buyer Registration</h4>
      <p class="text-center text-muted small mb-4">Create an account to shop fresh produce directly from farmers</p>

      <form action="<?= BASE_URL ?>backend/auth/buyer-register-process.php" method="POST">
        <div class="mb-3">
          <label class="form-label">Full Name</label>
          <input type="text" name="name" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Mobile Number</label>
          <input type="text" name="mobile" class="form-control" pattern="[0-9]{10}" maxlength="10" placeholder="10 digit mobile number" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email (optional)</label>
          <input type="email" name="email" class="form-control">
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-control" minlength="6" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Confirm Password</label>
          <input type="password" name="confirm_password" class="form-control" minlength="6" required>
        </div>
        <button type="submit" class="btn btn-farm w-100">Register &amp; Send OTP</button>
      </form>
      <p class="text-center mt-3 small">Already have an account?
        <a href="<?= BASE_URL ?>frontend/auth/buyer-login.php">Login here</a>
      </p>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
