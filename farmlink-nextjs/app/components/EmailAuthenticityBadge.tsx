"use client";

import Link from "next/link";
import { EmailAuthenticityResult } from "@/app/lib/api";

interface Props {
  email: string;
  result: EmailAuthenticityResult | null;
  checking: boolean;
}

export default function EmailAuthenticityBadge({ email, result, checking }: Props) {
  if (!email.trim()) return null;

  if (checking) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "6px",
          padding: "6px 10px",
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "6px",
          fontSize: "0.78rem",
          color: "#0369a1",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            border: "2px solid #0284c7",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span>Checking email authenticity & MX records...</span>
      </div>
    );
  }

  if (!result) return null;

  // 1. Original / Authentic
  if (result.is_original && !result.is_duplicate && result.ok) {
    return (
      <div
        style={{
          marginTop: "6px",
          padding: "8px 12px",
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "7px",
          fontSize: "0.8rem",
          color: "#166534",
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "1rem", lineHeight: 1 }}>🟢</span>
        <div>
          <strong style={{ display: "block", color: "#14532d" }}>
            Authentic {result.provider || "Email"} Confirmed
          </strong>
          <span style={{ color: "#166534", fontSize: "0.76rem" }}>
            ✓ Real mailbox ready for verification code & credentials.
          </span>
        </div>
      </div>
    );
  }

  // 2. Duplicate Email (Already Registered)
  if (result.is_duplicate || result.status === "duplicate") {
    return (
      <div
        style={{
          marginTop: "6px",
          padding: "10px 12px",
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "7px",
          fontSize: "0.8rem",
          color: "#92400e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#b45309" }}>
          <span>⚠️</span>
          <span>This email is already registered!</span>
        </div>
        <p style={{ margin: "4px 0 8px", fontSize: "0.76rem", color: "#78350f" }}>
          An account with this email already exists on Agrenza for this role.
        </p>
        <Link
          href="/auth/login"
          style={{
            display: "inline-block",
            background: "#d97706",
            color: "#ffffff",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to Login Instead →
        </Link>
      </div>
    );
  }

  // 3. Fake / Disposable temporary email
  if (result.status === "disposable") {
    return (
      <div
        style={{
          marginTop: "6px",
          padding: "10px 12px",
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "7px",
          fontSize: "0.8rem",
          color: "#991b1b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#b91c1c" }}>
          <span>🚫</span>
          <span>Fake / Disposable Email Detected</span>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#7f1d1d" }}>
          Temporary or throwaway fake email domains are blocked. Please provide your real, authentic personal Gmail ID.
        </p>
      </div>
    );
  }

  // 4. Invalid Gmail rules (length or consecutive dots)
  if (result.status === "invalid_gmail") {
    return (
      <div
        style={{
          marginTop: "6px",
          padding: "8px 12px",
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "7px",
          fontSize: "0.8rem",
          color: "#991b1b",
        }}
      >
        <div style={{ fontWeight: 700, color: "#b91c1c" }}>
          ✕ Invalid Gmail Username
        </div>
        <span style={{ fontSize: "0.76rem", color: "#7f1d1d" }}>
          {result.error || "Gmail usernames must be 6 to 30 characters without consecutive dots."}
        </span>
      </div>
    );
  }

  // 5. Non-existent domain / no MX records
  if (result.status === "invalid_domain") {
    return (
      <div
        style={{
          marginTop: "6px",
          padding: "8px 12px",
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "7px",
          fontSize: "0.8rem",
          color: "#991b1b",
        }}
      >
        <div style={{ fontWeight: 700, color: "#b91c1c" }}>
          ✕ Mail Domain Does Not Exist
        </div>
        <span style={{ fontSize: "0.76rem", color: "#7f1d1d" }}>
          {result.error || "This domain cannot receive emails. Please check for spelling mistakes."}
        </span>
      </div>
    );
  }

  // 6. Generic invalid format (if email has @ but not finished)
  if (result.status === "invalid_format" && email.includes("@")) {
    return (
      <div
        style={{
          marginTop: "4px",
          fontSize: "0.75rem",
          color: "#dc2626",
        }}
      >
        {result.error || "Please enter a valid email address (e.g. name@gmail.com)"}
      </div>
    );
  }

  return null;
}
