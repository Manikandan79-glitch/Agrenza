"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/app/components/AuthShell";
import "@/app/components/forms.css";
import { loginUser, ApiError, type Role } from "@/app/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pendingApproval = searchParams.get("pending_approval") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ role, email, password });
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.push(redirectUrl);
      } else if (res.user.role === "farmer") {
        router.push("/farmer/dashboard");
      } else {
        router.push("/shop");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon="🔐"
      title="Welcome back"
      subtitle="Sign in to shop or manage your farm listings"
      footer={
        <>
          New here? <Link href="/auth/buyer-register">Buyer signup</Link>
          {" · "}
          <Link href="/auth/farmer-register">Farmer signup</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {pendingApproval && (
          <div className="form-info">Your email is verified. An admin still needs to approve your farmer account.</div>
        )}
        {error && (
          <div className="form-error" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span>{error}</span>
            {error.toLowerCase().includes("pending verification") || error.toLowerCase().includes("verify your email") ? (
              <Link
                href={`/auth/email-verify?email=${encodeURIComponent(email)}`}
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
                Verify Email Now →
              </Link>
            ) : null}
          </div>
        )}

        <div className="role-toggle">
          <button type="button" className={role === "buyer" ? "active" : ""} onClick={() => setRole("buyer")}>
            Buyer
          </button>
          <button type="button" className={role === "farmer" ? "active" : ""} onClick={() => setRole("farmer")}>
            Farmer
          </button>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn-block" type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="admin-link">
        <Link href="/auth/admin-login">Admin login</Link>
      </p>

      <style jsx>{`
        .role-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
        }
        .role-toggle button {
          border: 1px solid rgba(26, 26, 21, 0.18);
          background: #fff;
          border-radius: 999px;
          padding: 9px 12px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
        }
        .role-toggle button.active {
          background: var(--soil);
          color: var(--paper, #efe8d8);
          border-color: var(--soil);
        }
        .admin-link {
          text-align: center;
          margin: 16px 0 0;
          font-size: 0.82rem;
        }
        .admin-link :global(a) {
          color: #6b6555;
        }
      `}</style>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
