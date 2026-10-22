"use client";

import { useEffect, useState } from "react";

export default function PageLoader() {
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 800);
    const removeTimer = setTimeout(() => setActive(false), 1050);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!active) return null;

  return (
    <div className={`pl-backdrop ${fading ? "pl-fade" : ""}`}>
      <div className="pl-box">

        {/* Spinning ring around circle logo */}
        <div className="pl-ring-outer">
          <div className="pl-spinner" />
          <div className="pl-logo-circle">
            <img
              src="/agrenza-logo-small.jpg"
              alt="Agrenza"
              width={72}
              height={72}
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="pl-text">
          <span className="pl-brand">Agren<span>za</span></span>
          <span className="pl-sub">Farm to Doorstep</span>
        </div>

      </div>

      <style jsx>{`
        /* ── Backdrop ── */
        .pl-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #0f2314;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          visibility: visible;
          will-change: opacity;
          transform: translateZ(0);
          transition: opacity 0.25s ease, visibility 0.25s linear;
          pointer-events: none;
        }
        .pl-backdrop.pl-fade {
          opacity: 0;
          visibility: hidden;
        }

        /* ── Content box ── */
        .pl-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        /* ── Spinning ring wrapper ── */
        .pl-ring-outer {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Spinning coloured ring */
        .pl-spinner {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #22c55e;
          border-right-color: #eab308;
          animation: pl-spin 0.9s linear infinite;
          will-change: transform;
        }

        @keyframes pl-spin {
          to { transform: rotate(360deg); }
        }

        /* Circle logo inside ring */
        .pl-logo-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: #fff;
          border: 2px solid rgba(34, 197, 94, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Brand text ── */
        .pl-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .pl-brand {
          font-family: var(--font-display, sans-serif);
          font-weight: 900;
          font-size: 1.7rem;
          color: #efe8d8;
          letter-spacing: -0.02em;
        }

        .pl-brand span {
          color: #4ade80;
        }

        .pl-sub {
          font-size: 0.73rem;
          color: #a7f3d0;
          font-weight: 500;
          opacity: 0.85;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
