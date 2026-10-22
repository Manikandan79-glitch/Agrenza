<?php
/**
 * Dummy OTP System - FarmLink
 * In production, integrate an SMS gateway (e.g. Twilio, MSG91).
 * For this project, OTP is generated and simply shown on screen
 * (simulating an SMS) so the flow can be tested without a gateway.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** Generate and store a 4-digit OTP in session, tied to a mobile number */
function generate_otp($mobile) {
    $otp = rand(1000, 9999);
    $_SESSION['otp_code'] = $otp;
    $_SESSION['otp_mobile'] = $mobile;
    $_SESSION['otp_time'] = time();
    return $otp;
}

/** Verify submitted OTP against session value (valid for 5 minutes) */
function verify_otp($mobile, $enteredOtp) {
    if (!isset($_SESSION['otp_code'], $_SESSION['otp_mobile'], $_SESSION['otp_time'])) {
        return false;
    }
    $expired = (time() - $_SESSION['otp_time']) > 300;
    if ($expired) return false;

    if ($_SESSION['otp_mobile'] === $mobile && (string)$_SESSION['otp_code'] === (string)$enteredOtp) {
        unset($_SESSION['otp_code'], $_SESSION['otp_mobile'], $_SESSION['otp_time']);
        return true;
    }
    return false;
}
