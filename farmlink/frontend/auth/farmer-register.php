<?php
$pageTitle = "Farmer Registration - FarmLink";
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container">
  <div class="card auth-card">
    <div class="card-body p-4">
      <h4 class="text-center mb-1"><i class="bi bi-person-plus"></i> Farmer Registration</h4>
      <p class="text-center text-muted small mb-4">Join FarmLink and sell your produce directly to buyers</p>

      <form action="<?= BASE_URL ?>backend/auth/farmer-register-process.php" method="POST">
        <div class="mb-3">
          <label class="form-label">Full Name</label>
          <input type="text" name="name" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Mobile Number</label>
          <input type="text" name="mobile" class="form-control" pattern="[0-9]{10}" maxlength="10" placeholder="10 digit mobile number" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Aadhaar Number</label>
          <input type="text" name="aadhaar" class="form-control" pattern="[0-9]{12}" maxlength="12" placeholder="12 digit Aadhaar number" required>
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
        <a href="<?= BASE_URL ?>frontend/auth/farmer-login.php">Login here</a>
      </p>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
