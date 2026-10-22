<?php
$pageTitle = "Verify OTP - FarmLink";
require_once __DIR__ . '/../includes/header.php';

if (!isset($_SESSION['pending_user_id'])) {
    redirect(BASE_URL . 'index.php');
}
?>
<div class="container">
  <div class="card auth-card">
    <div class="card-body p-4 text-center">
      <h4 class="mb-1"><i class="bi bi-shield-check"></i> Mobile Verification</h4>
      <p class="text-muted small">Enter the 4-digit OTP sent to your mobile number</p>

      <?php if (isset($_SESSION['demo_otp_display'])): ?>
        <div class="alert alert-info small">
          <strong>Demo Mode:</strong> Your OTP is <strong><?= htmlspecialchars($_SESSION['demo_otp_display']) ?></strong>
          (In production this would be sent via SMS.)
        </div>
      <?php endif; ?>

      <form action="<?= BASE_URL ?>backend/auth/verify-otp-process.php" method="POST">
        <div class="mb-3">
          <input type="text" name="otp" maxlength="4" class="form-control text-center fs-3" placeholder="----" required>
        </div>
        <button type="submit" class="btn btn-farm w-100">Verify &amp; Continue</button>
      </form>
    </div>
  </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
