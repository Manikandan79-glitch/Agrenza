"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthShell from "@/app/components/AuthShell";
import EmailAuthenticityBadge from "@/app/components/EmailAuthenticityBadge";
import "@/app/components/forms.css";
import { registerUser, checkEmailAuthenticity, EmailAuthenticityResult, ApiError } from "@/app/lib/api";

export default function BuyerRegisterPage() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", pincode: "" });
  const ALLOWED_PINCODES = ["629001", "629401"];
  const [error, setError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Real-time Email Authenticity & Original vs Fake detection
  const [emailCheck, setEmailCheck] = useState<EmailAuthenticityResult | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

  useEffect(() => {
    const trimmed = form.email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailCheck(null);
      setEmailChecking(false);
      return;
    }

    setEmailChecking(true);
    const timer = setTimeout(async () => {
      const res = await checkEmailAuthenticity(trimmed, "buyer");
      setEmailCheck(res);
      setEmailChecking(false);

      if (res.is_duplicate) {
        setIsDuplicate(true);
      } else {
        setIsDuplicate(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [form.email]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (error) {
      setError("");
      setIsDuplicate(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[A-Za-z ]+$/.test(form.name.trim())) return setError("Name should contain letters only.");
    if (!/^[0-9]{10}$/.test(form.mobile.trim())) return setError("Enter a valid 10-digit mobile number.");
    if (!/^[0-9]{6}$/.test(form.pincode.trim())) return setError("Enter a valid 6-digit pincode.");
    if (!ALLOWED_PINCODES.includes(form.pincode.trim())) return setError("Sorry, delivery is currently available only in pincodes 629001 and 629401 (Nagercoil area). Registration is restricted to these locations.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email address format.");

    // Validate email authenticity state
    if (emailCheck) {
      if (emailCheck.status === "disposable") {
        return setError("Fake / temporary email detected. Please use your authentic personal Gmail address.");
      }
      if (emailCheck.is_duplicate) {
        setIsDuplicate(true);
        return setError("This email is already registered. Please log in.");
      }
      if (!emailCheck.ok && emailCheck.error) {
        return setError(emailCheck.error);
      }
    }

    setError("");
    setIsDuplicate(false);
    setLoading(true);

    try {
      // Staged in pending_registrations only — user is NOT in users table until verified
      const res = await registerUser({
        role: "buyer",
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
      });
      setSent(true);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Could not reach the server. Try again.";
      setError(msg);
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        setIsDuplicate(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const isEmailInvalid = Boolean(emailCheck && (!emailCheck.ok || emailCheck.is_duplicate));

  if (sent) {
    return (
      <AuthShell
        icon="📧"
        title="Check your Gmail"
        subtitle={`We sent a verification link and login password to ${form.email}.`}
      >
        <div style={{ textAlign: "center", margin: "16px 0" }}>
          <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.5 }}>
            Open your Gmail inbox to verify your account. Your account is only activated after email verification.
          </p>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", margin: "16px 0", textAlign: "left" }}>
            <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: 700, display: "block" }}>
              🔑 Your login password has been sent to your Gmail
            </span>
            <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "#15803d" }}>
              Check your inbox at <strong>{form.email}</strong> for your login password and verification code. The password is also attached as a file for safekeeping.
            </p>
          </div>

          <Link
            href={`/auth/email-verify?email=${encodeURIComponent(form.email)}`}
            className="btn-block"
            style={{ display: "block", textAlign: "center", marginTop: 20 }}
          >
            Enter Verification Code
          </Link>

          <Link
            href="/auth/login"
            style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: "0.88rem", color: "var(--leaf, #2e7d32)", fontWeight: 600 }}
          >
            Already verified? Go to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      icon="🛍️"
      title="Buyer Registration"
      subtitle="Create an account to shop fresh farm produce directly from verified farmers"
      footer={<>Already have an account? <Link href="/auth/login" style={{ fontWeight: 600 }}>Login here</Link></>}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span>{error}</span>
            {isDuplicate && (
              <Link
                href="/auth/login"
                style={{
                  color: "#ffffff",
                  background: "#b91c1c",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  textAlign: "center",
                  marginTop: "4px"
                }}
              >
                Go to Login Page →
              </Link>
            )}
          </div>
        )}

        <div className="field">
          <label>Full name</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Priya Raman"
            required
          />
        </div>

        <div className="field">
          <label>Mobile number</label>
          <div className="prefix-group">
            <span>+91</span>
            <input
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Delivery Pincode</label>
          <input
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="e.g. 629001"
            required
            style={{
              borderColor:
                form.pincode.length === 6
                  ? ALLOWED_PINCODES.includes(form.pincode)
                    ? "#22c55e"
                    : "#ef4444"
                  : undefined,
            }}
          />
          {form.pincode.length === 6 && ALLOWED_PINCODES.includes(form.pincode) && (
            <small style={{ color: "#16a34a", fontSize: "0.76rem", marginTop: "4px", display: "block" }}>
              ✅ Delivery available in your area!
            </small>
          )}
          {form.pincode.length === 6 && !ALLOWED_PINCODES.includes(form.pincode) && (
            <small style={{ color: "#dc2626", fontSize: "0.76rem", marginTop: "4px", display: "block" }}>
              ❌ Sorry, we currently deliver only to pincodes <strong>629001</strong> and <strong>629401</strong>.
            </small>
          )}
          {form.pincode.length < 6 && (
            <small style={{ color: "#6b7280", fontSize: "0.76rem", marginTop: "4px", display: "block" }}>
              Currently serving: 629001 (Nagercoil) &amp; 629401 only.
            </small>
          )}
        </div>

        <div className="field">
          <label>Gmail / Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="e.g. priya@gmail.com"
            style={{
              borderColor: emailCheck?.ok
                ? "#22c55e"
                : isEmailInvalid
                ? "#ef4444"
                : undefined,
            }}
            required
          />
          <EmailAuthenticityBadge
            email={form.email}
            result={emailCheck}
            checking={emailChecking}
          />
          {!emailCheck && (
            <small style={{ color: "#6b7280", fontSize: "0.76rem", marginTop: "4px", display: "block" }}>
              Must be an original email. Disposable / fake emails will be rejected.
            </small>
          )}
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", margin: "14px 0", fontSize: "0.82rem", color: "#166534" }}>
          ✨ <strong>Auto-Generated Password:</strong> A secure password will be automatically generated and emailed to your Gmail along with your verification code.
        </div>

        <button className="btn-block" type="submit" disabled={loading || emailChecking || isEmailInvalid}>
          {loading
            ? "Verifying & sending email…"
            : emailChecking
            ? "Checking email authenticity…"
            : isEmailInvalid
            ? "Fix Email to Continue"
            : "Register & Send Verification Email"}
        </button>
      </form>
    </AuthShell>
  );
}
