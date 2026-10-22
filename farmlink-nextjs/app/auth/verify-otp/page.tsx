"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/components/AuthShell";
import "@/app/components/forms.css";
import { sendMobileOtp, confirmMobileOtp, resetMobileOtpState } from "@/app/lib/otp";
import { verifyMobileWithBackend, ApiError } from "@/app/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("Sending OTP…");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(true);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingMobile = useRef<string>("");

  useEffect(() => {
    const m = sessionStorage.getItem("pending_mobile") || "";
    setMobile(m);
    pendingMobile.current = m;
    if (m) sendOtp(m);
    else {
      setSending(false);
      setInfo("");
      setError("No pending registration found. Please register again.");
    }
    return () => resetMobileOtpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function sendOtp(m: string) {
    setSending(true);
    setError("");
    try {
      // sendMobileOtp mounts an invisible reCAPTCHA against
      // #recaptcha-container and triggers Firebase's real SMS OTP.
      await sendMobileOtp(m);
      setInfo("OTP sent. Enter the 6-digit code below.");
      setSeconds(30);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not send OTP: ${err.message}`
          : "Could not send OTP. Check your Firebase phone-auth setup."
      );
    } finally {
      setSending(false);
    }
  }

  function handleChange(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  async function handleVerify() {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // 1. Confirm the code with Firebase — this proves the user really
      //    received the SMS and returns a signed ID token.
      const idToken = await confirmMobileOtp(code);
      // 2. Hand that token to the PHP backend, which verifies its
      //    signature server-side and flips is_verified = 1 for this user.
      const result = await verifyMobileWithBackend(idToken, pendingMobile.current);
      sessionStorage.removeItem("pending_mobile");
      if (result.requires_approval) {
        router.push("/auth/login?pending_approval=1");
      } else {
        router.push("/shop");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setDigits(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
    if (pendingMobile.current) sendOtp(pendingMobile.current);
  }

  return (
    <AuthShell
      icon="🛡️"
      title="Mobile Verification"
      subtitle={mobile ? `Verifying +91 ${mobile}` : "Verifying your mobile number"}
    >
      {error && <div className="form-error">{error}</div>}
      {!error && info && <div className="form-info">{info}</div>}

      <div className="otp-row">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            disabled={sending}
            className="otp-box"
          />
        ))}
      </div>

      <button className="btn-block" onClick={handleVerify} disabled={loading || sending}>
        {loading ? "Verifying…" : "Verify & continue"}
      </button>

      <button type="button" className="resend" onClick={handleResend} disabled={seconds > 0 || sending}>
        {sending ? "Sending…" : seconds > 0 ? `Resend OTP in ${seconds}s` : "Resend OTP"}
      </button>

      {/* Required, invisible container Firebase's reCAPTCHA attaches to. */}
      <div id="recaptcha-container" />

      <style jsx>{`
        .otp-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 22px; }
        .otp-box {
          width: 44px;
          height: 52px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 1.3rem;
          border: 1px solid rgba(26, 26, 21, 0.2);
          border-radius: 9px;
          background: #fff;
        }
        .otp-box:focus {
          outline: 2px solid var(--turmeric);
          outline-offset: 1px;
          border-color: var(--turmeric);
        }
        .resend {
          display: block;
          width: 100%;
          background: none;
          border: none;
          text-align: center;
          margin-top: 14px;
          font-size: 0.85rem;
          color: var(--rust);
          font-weight: 600;
        }
        .resend:disabled { color: #a39c88; font-weight: 400; }
      `}</style>
    </AuthShell>
  );
}
