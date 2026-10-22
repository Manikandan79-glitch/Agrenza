"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/app/components/AuthShell";
import "@/app/components/forms.css";
import { completeEmailVerification } from "@/app/lib/otp";
import { verifyEmailWithBackend, ApiError } from "@/app/lib/api";

type Status = "checking" | "enter_code" | "success" | "pending_approval" | "error";

function EmailVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Checking verification details…");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedRole, setVerifiedRole] = useState<string>("");

  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const urlToken = searchParams.get("token") || "";
    const urlEmail = searchParams.get("email") || "";
    const urlOtp = searchParams.get("otp") || searchParams.get("code") || "";

    if (urlEmail) setEmailInput(urlEmail);
    if (urlOtp) setOtpInput(urlOtp);

    // Case 1: One-click link with token from email
    if (urlToken && urlEmail) {
      handleTokenVerification(urlToken, urlEmail);
      return;
    }

    // Case 2: One-click link with OTP code from email
    if (urlOtp && urlEmail) {
      handleOtpVerification(urlOtp, urlEmail);
      return;
    }

    // Case 3: Firebase passwordless email link
    if (typeof window !== "undefined" && window.location.href.includes("apiKey=")) {
      handleFirebaseVerification(urlEmail);
      return;
    }

    // Otherwise: Show the code entry form
    setStatus("enter_code");
    setMessage("Enter the 6-digit verification code sent to your Gmail inbox:");
  }, [searchParams]);

  async function handleTokenVerification(token: string, email: string) {
    setLoading(true);
    setMessage("Verifying your email token…");
    try {
      const res = await verifyEmailWithBackend({ token, email });
      setVerifiedRole(res.role || "");
      if (res.requires_approval) {
        setStatus("pending_approval");
        setMessage(`${email} is verified! Your farmer account is now awaiting admin review.`);
      } else {
        setStatus("success");
        setMessage(`${email} is verified successfully! Welcome to Agrenza.`);
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerification(otp: string, email: string) {
    setLoading(true);
    setMessage("Confirming your verification code…");
    try {
      const res = await verifyEmailWithBackend({ otp, email });
      setVerifiedRole(res.role || "");
      if (res.requires_approval) {
        setStatus("pending_approval");
        setMessage(`${email} is verified! Your farmer account is now awaiting admin review.`);
      } else {
        setStatus("success");
        setMessage(`${email} is verified successfully! Welcome to Agrenza.`);
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFirebaseVerification(manualEmail?: string) {
    setLoading(true);
    try {
      const result = await completeEmailVerification(manualEmail);
      if (!result) {
        setStatus("enter_code");
        setMessage("Please confirm your email address and verification code:");
        return;
      }
      const res = await verifyEmailWithBackend({ idToken: result.idToken, email: result.email });
      setVerifiedRole(res.role || "");
      if (res.requires_approval) {
        setStatus("pending_approval");
        setMessage(`${result.email} is verified! Your farmer account is now awaiting admin review.`);
      } else {
        setStatus("success");
        setMessage(`${result.email} is verified! Redirecting to login…`);
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleError(err: any) {
    setStatus("error");
    const errMsg = err instanceof ApiError ? err.message : err?.message || "";
    if (errMsg.toLowerCase().includes("already verified") || errMsg.toLowerCase().includes("already registered")) {
      setMessage("This email has already been verified. You can log in directly.");
    } else {
      setMessage(errMsg || "Could not verify your email. The code or link may have expired.");
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return alert("Enter your email address.");
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      return alert("Enter the 6-digit numeric verification code sent to your Gmail.");
    }
    await handleOtpVerification(otpInput.trim(), emailInput.trim());
  }

  return (
    <AuthShell
      icon={
        status === "success"
          ? "✅"
          : status === "pending_approval"
          ? "⏳"
          : status === "error"
          ? "⚠️"
          : "✉️"
      }
      title="Gmail Verification"
      subtitle={message}
    >
      {/* Interactive 6-digit OTP code entry form */}
      {(status === "enter_code" || status === "error") && (
        <form onSubmit={handleManualSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label>Gmail / Email Address</label>
            <input
              type="email"
              placeholder="e.g. yourname@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>6-Digit Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              style={{ letterSpacing: "4px", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
            <small style={{ color: "#6b7280", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
              Check your Gmail inbox for the 6-digit code.
            </small>
          </div>

          <button type="submit" className="btn-block" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? "Verifying code…" : "Verify & Activate Account"}
          </button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Link href="/auth/login" style={{ fontSize: "0.86rem", color: "var(--leaf, #2e7d32)", fontWeight: 600 }}>
              Back to Login
            </Link>
          </div>
        </form>
      )}

      {/* Success or Pending Approval State */}
      {(status === "success" || status === "pending_approval") && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          {status === "success" && verifiedRole === "buyer" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px", margin: "14px 0", fontSize: "0.9rem", color: "#166534", textAlign: "left" }}>
              💡 <strong>Ready to Shop:</strong> Your account is activated in our database. You can now log in using your Gmail and the auto-generated password sent to your inbox.
            </div>
          )}

          {status === "pending_approval" && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "14px", borderRadius: "8px", margin: "14px 0", fontSize: "0.9rem", color: "#92400e", textAlign: "left" }}>
              📋 <strong>Under Review:</strong> Your email is confirmed! Our admin team has been notified and is reviewing your farmer application. You will receive an approval notification email once activated.
            </div>
          )}

          <Link href="/auth/login" className="btn-block" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
            Continue to Login →
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px", textAlign: "center" }}>Loading verification…</div>}>
      <EmailVerifyContent />
    </Suspense>
  );
}
