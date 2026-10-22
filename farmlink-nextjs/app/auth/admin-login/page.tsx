"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/components/AuthShell";
import "@/app/components/forms.css";
import { loginUser, ApiError } from "@/app/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await loginUser({ role: "admin", email, password });
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell icon="🛡️" title="Admin Login" subtitle="Agrenza administration panel">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label>Admin email</label>
          <input
            type="email"
            placeholder="admin@farmlink.com"
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
    </AuthShell>
  );
}
