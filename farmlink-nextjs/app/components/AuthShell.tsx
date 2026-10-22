"use client";

import Link from "next/link";

export default function AuthShell({
  icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="scene" aria-hidden="true">
        <div className="cube c1"><span /><span /><span /><span /><span /><span /></div>
        <div className="cube c2"><span /><span /><span /><span /><span /><span /></div>
        <div className="cube c3"><span /><span /><span /><span /><span /><span /></div>
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
      </div>

      <Link href="/" className="auth-logo">Farm<span>Link</span></Link>
      <div className="auth-card">
        <p className="auth-icon">{icon}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>

      <style jsx>{`
        .auth-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(120% 100% at 80% 0%, #223326 0%, var(--soil) 55%, var(--soil-deep) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        /* ---------------- 3D floating scene ---------------- */
        .scene {
          position: absolute;
          inset: 0;
          perspective: 1200px;
          overflow: hidden;
          z-index: 0;
        }
        .cube {
          position: absolute;
          transform-style: preserve-3d;
          animation: float-rotate 16s ease-in-out infinite;
          opacity: 0.5;
        }
        .cube span {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(233, 178, 74, 0.35), rgba(122, 61, 26, 0.25));
          border: 1px solid rgba(239, 232, 216, 0.25);
          backdrop-filter: blur(1px);
        }
        .c1 { width: 90px; height: 90px; top: 10%; left: 8%; animation-duration: 18s; }
        .c1 span:nth-child(1) { transform: translateZ(45px); }
        .c1 span:nth-child(2) { transform: rotateY(180deg) translateZ(45px); }
        .c1 span:nth-child(3) { transform: rotateY(90deg) translateZ(45px); }
        .c1 span:nth-child(4) { transform: rotateY(-90deg) translateZ(45px); }
        .c1 span:nth-child(5) { transform: rotateX(90deg) translateZ(45px); }
        .c1 span:nth-child(6) { transform: rotateX(-90deg) translateZ(45px); }

        .c2 { width: 60px; height: 60px; top: 65%; left: 14%; animation-duration: 13s; animation-delay: -3s; }
        .c2 span:nth-child(1) { transform: translateZ(30px); }
        .c2 span:nth-child(2) { transform: rotateY(180deg) translateZ(30px); }
        .c2 span:nth-child(3) { transform: rotateY(90deg) translateZ(30px); }
        .c2 span:nth-child(4) { transform: rotateY(-90deg) translateZ(30px); }
        .c2 span:nth-child(5) { transform: rotateX(90deg) translateZ(30px); }
        .c2 span:nth-child(6) { transform: rotateX(-90deg) translateZ(30px); }

        .c3 { width: 110px; height: 110px; top: 20%; right: 6%; animation-duration: 22s; animation-delay: -8s; }
        .c3 span:nth-child(1) { transform: translateZ(55px); }
        .c3 span:nth-child(2) { transform: rotateY(180deg) translateZ(55px); }
        .c3 span:nth-child(3) { transform: rotateY(90deg) translateZ(55px); }
        .c3 span:nth-child(4) { transform: rotateY(-90deg) translateZ(55px); }
        .c3 span:nth-child(5) { transform: rotateX(90deg) translateZ(55px); }
        .c3 span:nth-child(6) { transform: rotateX(-90deg) translateZ(55px); }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
          animation: drift 20s ease-in-out infinite;
        }
        .o1 {
          width: 46px; height: 46px; bottom: 14%; right: 12%;
          background: radial-gradient(circle at 35% 30%, #e9b24a, #a9631f);
          animation-duration: 14s;
        }
        .o2 {
          width: 26px; height: 26px; top: 30%; right: 22%;
          background: radial-gradient(circle at 35% 30%, #9fd18a, #4c7a3a);
          animation-duration: 11s; animation-delay: -4s;
        }
        .o3 {
          width: 34px; height: 34px; bottom: 30%; left: 6%;
          background: radial-gradient(circle at 35% 30%, #f2d3a3, #b5762f);
          animation-duration: 17s; animation-delay: -6s;
        }

        @keyframes float-rotate {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
          50%  { transform: translateY(-30px) rotateX(180deg) rotateY(180deg); }
          100% { transform: translateY(0px) rotateX(360deg) rotateY(360deg); }
        }
        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(18px, -24px) scale(1.15); }
          100% { transform: translate(0, 0) scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cube, .orb { animation: none; }
        }

        /* ---------------- card content (kept above the scene) ---------------- */
        .auth-logo {
          position: relative;
          z-index: 1;
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.5rem;
          color: #efe8d8;
          margin-bottom: 26px;
        }
        .auth-logo span { color: var(--turmeric); }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: linear-gradient(160deg, #f7f2e6, #ede4cd);
          border-radius: 18px;
          padding: 36px 32px;
          box-shadow: 0 30px 60px rgba(14, 23, 18, 0.5);
        }
        .auth-icon { font-size: 1.8rem; margin: 0 0 6px; text-align: center; }
        h1 {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.5rem;
          text-align: center;
          margin: 0 0 6px;
          color: var(--ink);
        }
        .subtitle {
          text-align: center;
          color: #6b6555;
          font-size: 0.88rem;
          margin: 0 0 26px;
        }
        .auth-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.85rem;
          color: #6b6555;
        }
        .auth-footer :global(a) { color: var(--rust); font-weight: 600; }
      `}</style>
    </div>
  );
}
