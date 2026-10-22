"use client";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

/**
 * ---------------------------------------------------------------------
 * Mobile OTP — real SMS via Firebase Phone Authentication
 * ---------------------------------------------------------------------
 * This is the standard way to get an actual 6-digit SMS code with
 * Firebase: an invisible reCAPTCHA (required by Firebase to rate-limit
 * SMS abuse) + signInWithPhoneNumber(). Needs the Firebase project on
 * the Blaze (pay-as-you-go) plan — see README.md "Firebase setup".
 */

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/** Call once, after the invisible reCAPTCHA container (id="recaptcha-container") is mounted. */
function ensureRecaptcha(containerId: string) {
  const auth = getFirebaseAuth();
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return recaptchaVerifier;
}

/** Sends a real SMS OTP to +91XXXXXXXXXX. Resolves once Firebase has dispatched it. */
export async function sendMobileOtp(mobile10Digit: string, containerId = "recaptcha-container") {
  const auth = getFirebaseAuth();
  const verifier = ensureRecaptcha(containerId);
  confirmationResult = await signInWithPhoneNumber(auth, `+91${mobile10Digit}`, verifier);
}

/** Confirms the 6-digit code the user typed. Returns a Firebase ID token to send to the PHP backend. */
export async function confirmMobileOtp(code: string): Promise<string> {
  if (!confirmationResult) {
    throw new Error("No OTP was sent yet — call sendMobileOtp() first (e.g. on page load).");
  }
  const cred = await confirmationResult.confirm(code);
  return cred.user.getIdToken();
}

export function resetMobileOtpState() {
  confirmationResult = null;
}

/**
 * ---------------------------------------------------------------------
 * Email verification — Firebase passwordless email link
 * ---------------------------------------------------------------------
 * Firebase Auth has no built-in numeric "email OTP code" API — the
 * closest real equivalent is a passwordless sign-in link, which Firebase
 * emails automatically and which verifies the address the moment it's
 * clicked. That's what this wraps.
 *
 * The link points at NEXT_PUBLIC_APP_URL if it's set (e.g. your LAN IP,
 * http://192.168.x.x:3000), so it also works when opened from a phone
 * on the same Wi-Fi. It falls back to window.location.origin
 * (localhost) if that env var isn't set — which only works when opened
 * on the same computer running the dev server.
 */

const EMAIL_STORAGE_KEY = "farmlink_pending_email";

function verificationBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

export async function sendEmailVerificationLink(email: string) {
  const auth = getFirebaseAuth();
  const actionCodeSettings = {
    url: `${verificationBaseUrl()}/auth/email-verify`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

export function getStoredPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_STORAGE_KEY);
}

/** Call on the /auth/email-verify landing page. Returns a Firebase ID token + email, or null if link is invalid or email is needed. */
export async function completeEmailVerification(manualEmail?: string): Promise<{ idToken: string; email: string } | null> {
  const auth = getFirebaseAuth();
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;

  let email = manualEmail || (typeof window !== "undefined" ? window.localStorage.getItem(EMAIL_STORAGE_KEY) : null);
  if (!email) {
    return null;
  }

  const cred = await signInWithEmailLink(auth, email, window.location.href);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  }
  const idToken = await cred.user.getIdToken();
  return { idToken, email };
}
